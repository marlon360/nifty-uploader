import { NiftyChunk } from "./NiftyChunk";
import { INiftyOptions, INiftyOptionsParameter } from "./NiftyOptions";
import { NiftyStatus } from "./NiftyStatus";
import { NiftyUploader } from "./NiftyUploader";
import { UploadElement } from "./UploadElement";
import { Validator } from "./utils/Validator";

export class NiftyFile extends UploadElement {

    public options: INiftyOptions;

    public name: string;
    public size: number;
    public content: Blob;

    public status: NiftyStatus;
    public uniqueIdentifier: string;

    public chunks: NiftyChunk[] = new Array<NiftyChunk>();

    constructor(param: {
        uploader: NiftyUploader,
        file: File,
        options?: INiftyOptionsParameter
    }) {
        super();
        this.uploader = param.uploader;
        this.name = param.file.name;
        this.size = param.file.size;
        this.content = param.file;

        this.status = NiftyStatus.QUEUED;

        // set options to uploader options
        this.options = this.uploader.options;
        if (param.options) {
            // override options with file options
            this.options = { ...this.options, ...param.options };
        }

    }

    /**
     * Processes this file.
     *
     * @returns {Promise} Returns a Promise for the processing
     */
    public processFile(): Promise<any> {
        // array of all processing tasks
        const tasks = new Array<any>();

        // add task for file size validation
        tasks.push(Validator.validateFileSize(
            this.content.size,
            this.options.minFileSize,
            this.options.fileTooSmallError,
            this.options.maxFileSize,
            this.options.fileTooBigError
        ));
        // if total file size limit enabled
        if (this.options.totalFileSizeLimit) {
            // add task for total file size validation
            tasks.push(Validator.validateTotalFileSize(
                this.size,
                this.uploader.getTotalFileSize(),
                this.options.totalFileSizeLimit,
                this.options.totalFileSizeLimitError
            ));
        }
        // add task for file type validation
        tasks.push(Validator.validateFileType(
            this.content,
            this.name,
            this.options.allowedFileTypes,
            this.options.fileTypeError
        ));
        // add task for custom validation
        tasks.push(this.customValidation());

        // create task for generation of unique identifier
        const uniqueIdentifierTask = this.generateUniqueIdentifier().then((identifier) => {
            this.uniqueIdentifier = identifier;
        });
        // add task for generation of unique identifier
        tasks.push(uniqueIdentifierTask);

        // add task for creating chunks if chunking is enabled
        if (this.options.chunking) {
            tasks.push(this.createChunks());
        }

        // run all tasks
        return Promise.all<any>(tasks);

    }

    /**
     * Start the upload for this file.
     *
     * @returns {boolean} A boolean, which indicates wether the upload started or not
     */
    public upload(): boolean {
        // if chunking is enabled, upload next queued chunk
        if (this.options.chunking) {
            const chunkCount = this.chunks.length;
            for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
                // get chunk
                const chunk = this.chunks[chunkIndex];
                // upload chunk if chunk is queued
                if (chunk.status === NiftyStatus.QUEUED) {
                    chunk.upload().then(() => {
                        this.chunkUploadSuccessful(chunk);
                    }).catch((error) => {
                        this.chunkUploadFailed(chunk, error);
                    });
                    // set status to uploading if this is the first chunk, which is uploading
                    if (this.status !== NiftyStatus.UPLOADING) {
                        this.status = NiftyStatus.UPLOADING;
                        // trigger fileUploadStartedEvent
                        this.uploader.emit("file-upload-started", { file: this });
                    }
                    // an upload started, so return true
                    return true;
                }
            }
        } else {
            // if chunking disabled, upload whole file
            this.uploadData(this.content)
                .then(() => {
                    // file successfully uploaded
                    this.fileUploadSuccessful();
                }).catch(() => {
                    // file upload failed
                    this.fileUploadFailed();
                });
            this.status = NiftyStatus.UPLOADING;
            this.uploader.emit("file-upload-started", { file: this });
            // an upload started, so return true
            return true;
        }
        // cannot start upload for this file, so return false
        return false;
    }

    /**
     * Cancels the upload of this file.
     *
     * @param {boolean} remove If enabled, the file will be removed from the list of the uploader
     * @returns {boolean} A boolean, which indicates wether canceling was successful
     */
    public cancel(remove: boolean = true): boolean {
        // cancel all chunks that are not completed
        for (const chunk of this.chunks) {
            chunk.cancel();
        }
        // try to cancel file
        if (super.cancel()) {
            // if successfully canceled file, trigger event
            this.uploader.emit("file-canceled", { file: this });
            // remove from list if enabled
            if (remove) {
                this.remove();
            }
            return true;
        }
        return false;
    }

    public remove(): void {
        const index = this.uploader.files.indexOf(this);
        // check if this file exists in list
        if (index > -1) {
            this.uploader.files.splice(index);
        }
    }

    public getProgress(): number {
        if (this.options.chunking && this.chunks.length !== 0) {
            let totalProgress = 0;
            for (const chunk of this.chunks) {
                totalProgress += chunk.getProgress();
            }
            return totalProgress / this.chunks.length;
        } else {
            return super.getProgress();
        }
    }

    // override method
    protected getRequestParameter(): { [key: string]: string | number } {
        const params = {
            filename: this.name,
            identifier: this.uniqueIdentifier
        };
        // merge params
        return { ...super.getRequestParameter(), ...params };
    }

    protected triggerRetryEvent() {
        this.uploader.emit("file-retry", { file: this });
    }

    protected triggerProgressEvent(): void {
        this.uploader.emit("file-progress", { file: this, progress: this.getProgress() });
    }

    private generateUniqueIdentifier(): Promise<string> {
        if (this.options.generateUniqueIdentifier) {
            return Promise.resolve(this.options.generateUniqueIdentifier(this));
        } else {
            const defaultUniqueIdentifier = this.size + "-" + this.name.replace(/[^0-9a-zA-Z_-]/igm, "");
            return Promise.resolve(defaultUniqueIdentifier);
        }
    }

    private customValidation(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.options.customValidation) {
                const validation = this.options.customValidation(this);
                Promise.resolve(validation).then((valid) => {
                    if (valid === undefined || valid) {
                        resolve();
                    } else {
                        reject();
                    }
                }).catch(() => {
                    reject();
                });
            } else {
                resolve(true);
            }
        });
    }

    private fileUploadSuccessful() {
        // change status
        this.status = NiftyStatus.SUCCESS;
        // trigger event
        this.uploader.emit("file-success", { file: this });
    }

    private fileUploadFailed() {
        // change status
        this.status = NiftyStatus.ERROR;
        // trigger event
        this.uploader.emit("file-failed", { file: this });
    }

    private chunkUploadSuccessful(chunk: NiftyChunk) {
        // trigger event
        this.uploader.emit("chunk-success", { chunk });
        // if all chunks uploaded, file success
        if (this.areAllChunksUploaded()) {
            this.fileUploadSuccessful();
        }
    }
    private chunkUploadFailed(chunk: NiftyChunk, error: string | Error) {
        // trigger event
        this.uploader.emit("chunk-failed", { chunk, error });
        // if one chunk fails, file fails
        this.fileUploadFailed();
    }

    private areAllChunksUploaded(): boolean {
        const chunkCount = this.chunks.length;
        for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
            const chunk = this.chunks[chunkIndex];
            if (chunk.status !== NiftyStatus.SUCCESS) {
                return false;
            }
        }
        return true;
    }

    private createChunks() {
        // clear array of chunks
        this.chunks = [];
        // count of chunks with size equal or less to specified chunkSize
        const chunkCount = Math.ceil(this.size / this.uploader.options.chunkSize);
        // create chunks
        for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
            // calculate start byte of chunk
            const startByte = chunkIndex * this.uploader.options.chunkSize;
            // calculate end byte of chunk
            const endByte = Math.min(this.size, (chunkIndex + 1) * this.uploader.options.chunkSize);
            // create chunk object and add to array
            this.chunks.push(new NiftyChunk({
                chunkIndex,
                endByte,
                file: this,
                startByte,
            }));
        }
    }

}
