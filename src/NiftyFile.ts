import { NiftyChunk } from "./NiftyChunk";
import { INiftyOptions, INiftyOptionsParameter } from "./NiftyOptions";
import { NiftyStatus } from "./NiftyStatus";
import { NiftyUploader } from "./NiftyUploader";
import { UploadElement } from "./UploadElement";

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

    public processFile(): Promise<any> {
        const tasks = new Array<any>();

        tasks.push(this.validateFileSize());
        tasks.push(this.validateFileType());
        tasks.push(this.customValidation());

        const uniqueIdentifierTask = this.generateUniqueIdentifier().then((identifier) => {
            this.uniqueIdentifier = identifier;
        });
        tasks.push(uniqueIdentifierTask);
        if (this.options.chunking) {
            tasks.push(this.createChunks());
        }
        return Promise.all<any>(tasks);

    }
    // returns true when an upload started
    public upload(): boolean {
        // if chunking is enabled, upload next queued chunk
        if (this.options.chunking) {
            const chunkCount = this.chunks.length;
            for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
                const chunk = this.chunks[chunkIndex];
                if (chunk.status === NiftyStatus.QUEUED) {
                    chunk.upload().then(() => {
                        this.chunkUploadSucessful(chunk);
                    }).catch((error) => {
                        this.chunkUploadFailed(chunk, error);
                    });
                    if (this.status !== NiftyStatus.UPLOADING) {
                        this.status = NiftyStatus.UPLOADING;
                        this.uploader.fileUploadStartedEvent.trigger({ file: this });
                    }
                    // just upload one chunk
                    return true;
                }
            }
        } else {
            // if chunking diabled, upload whole file
            this.uploadData(this.content)
                .then(() => {
                    // file sucessfully uploaded
                    this.fileUploadSucessful();
                }).catch(() => {
                    // file upload failed
                    this.fileUploadFailed();
                });
            this.status = NiftyStatus.UPLOADING;
            this.uploader.fileUploadStartedEvent.trigger({ file: this });
            return true;
        }
        return false;
    }

    // override
    public cancel(): boolean {
        // cancel all chunks that are not completed
        for (const chunk of this.chunks) {
            chunk.cancel();
        }
        // try to cancel file
        if (super.cancel()) {
            // if sucessfully canceld file, trigger event
            this.uploader.fileCanceledEvent.trigger({ file: this });
            return true;
        }
        return false;
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
        this.uploader.fileRetryEvent.trigger({ file: this });
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

    private validateFileSize(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (this.size < this.options.minFileSize) {
                reject("File is too small. File has to be at least " + this.options.minFileSize + " Bytes.");
            }
            if (this.options.maxFileSize) {
                if (this.size > this.options.maxFileSize) {
                    reject("File is too big. Maximum file size is " + this.options.maxFileSize + " Bytes");
                }
            }
            resolve();
        });
    }

    private validateFileType(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            // If no extensions specified, allow every file
            if (this.options.allowedFileTypes.length === 0) {
                resolve();
            }
            // file type can be an empty string, also check filename extension
            const actualType = this.content.type;

            for (let allowedType of this.options.allowedFileTypes) {
                // remove whitespace and lowercase every type
                allowedType = allowedType.replace(/\s/g, "").toLowerCase();
                // check if mime-type else it is extension
                if (allowedType.indexOf("/") !== -1) {
                    // check if wildcard
                    if (allowedType.indexOf("*") !== -1) {
                        // genaral type is for example "image" in "image/png"
                        const allowedGeneralType = allowedType.slice(0, allowedType.indexOf("*"));
                        // compare allowed genaral type with actual general type
                        if (allowedGeneralType === actualType.slice(0, allowedType.indexOf("*"))) {
                            resolve();
                        }
                    } else {
                        if (allowedType === actualType) {
                            resolve();
                        }
                    }
                } else {
                    // add dot to extension if not already
                    const allowedExtension = ((allowedType.match(/^[^.][^/]+$/)) ? "." : "") + allowedType;
                    // if filename contains allowed extension
                    if (this.name.slice(this.name.indexOf(".")) === allowedExtension) {
                        resolve();
                    }
                    // subtype of mime ("image/png" -> "png")
                    const actualSubtype = actualType.slice(actualType.indexOf("/") + 1);
                    if ("." + actualSubtype === allowedExtension) {
                        resolve();
                    }
                }
            }
            reject("Filetype is not allowed.");
        });
    }

    private fileUploadSucessful() {
        // change status
        this.status = NiftyStatus.SUCCESSFUL;
        // trigger event
        this.uploader.fileSucsessEvent.trigger({ file: this });
    }

    private fileUploadFailed() {
        // change status
        this.status = NiftyStatus.FAILED;
        // trigger event
        this.uploader.fileFailEvent.trigger({ file: this });
    }

    private chunkUploadSucessful(chunk: NiftyChunk) {
        // trigger event
        this.uploader.chunkSucsessEvent.trigger({ chunk });
        // if all chunks uploaded, file success
        if (this.areAllChunksUploaded()) {
            this.fileUploadSucessful();
        }
    }
    private chunkUploadFailed(chunk: NiftyChunk, error: string | Error) {
        // trigger event
        this.uploader.chunkFailEvent.trigger({ chunk, error });
        // if one chunk fails, file fails
        this.fileUploadFailed();
    }

    private areAllChunksUploaded(): boolean {
        const chunkCount = this.chunks.length;
        for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
            const chunk = this.chunks[chunkIndex];
            if (chunk.status !== NiftyStatus.SUCCESSFUL) {
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
