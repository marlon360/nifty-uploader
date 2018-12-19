import { NiftyChunk } from "./NiftyChunk";
import { INiftyOptions, INiftyOptionsParameter } from "./NiftyOptions";
import { ChunkStatus, FileStatus } from "./NiftyStatus";
import { NiftyUploader } from "./NiftyUploader";
import { UploadElement } from "./UploadElement";

export class NiftyFile extends UploadElement {

    public uploader: NiftyUploader;
    public options: INiftyOptions;

    public name: string;
    public size: number;
    public content: Blob;

    public status: FileStatus;
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

        this.status = FileStatus.QUEUED;

        // set options to uploader options
        this.options = this.uploader.options;
        if (param.options) {
            // override options with file options
            this.options = { ...this.options, ...param.options };
        }

    }

    public processFile(): Promise<any> {
        const tasks = new Array<any>();
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
                if (chunk.status === ChunkStatus.QUEUED) {
                    chunk.upload().then(() => {
                        this.chunkUploadSucessful(chunk);
                    }).catch((error) => {
                        this.chunkUploadFailed(chunk, error);
                    });
                    this.status = FileStatus.UPLOADING;
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
        return {...super.getRequestParameter(), ...params};
    }

    private generateUniqueIdentifier(): Promise<string> {
        if (this.options.generateUniqueIdentifier) {
            return Promise.resolve(this.options.generateUniqueIdentifier(this));
        } else {
            const defaultUniqueIdentifier = this.size + "-" + this.name.replace(/[^0-9a-zA-Z_-]/igm, "");
            return Promise.resolve(defaultUniqueIdentifier);
        }
    }

    private fileUploadSucessful() {
        // change status
        this.status = FileStatus.SUCCESSFUL;
        // trigger event
        this.uploader.fileSucsessEvent.trigger({ file: this });
    }

    private fileUploadFailed() {
        // change status
        this.status = FileStatus.FAILED;
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
        this.uploader.chunkFailEvent.trigger({ chunk });
        // if one chunk fails, file fails
        this.fileUploadFailed();
    }

    private areAllChunksUploaded(): boolean {
        const chunkCount = this.chunks.length;
        for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
            const chunk = this.chunks[chunkIndex];
            if (chunk.status !== ChunkStatus.SUCCESSFUL) {
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
