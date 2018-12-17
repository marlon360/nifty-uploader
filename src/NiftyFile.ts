import { NiftyChunk } from "./NiftyChunk";
import { INiftyOptions, INiftyOptionsParameter } from "./NiftyOptions";
import { ChunkStatus, FileStatus } from "./NiftyStatus";
import { NiftyUploader } from "./NiftyUploader";

export class NiftyFile {

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

    public upload(): boolean {
        const chunkCount = this.chunks.length;
        for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
            const chunk = this.chunks[chunkIndex];
            if (chunk.status === ChunkStatus.QUEUED) {
                chunk.upload().then(() => {
                    this.chunkUploadSucessfull(chunk);
                }).catch((error) => {
                    this.chunkUploadFailed(chunk, error);
                });
                this.status = FileStatus.UPLOADING;
                return true;
            }
        }
        return false;
    }

    private generateUniqueIdentifier(): Promise<string> {
        if (this.options.generateUniqueIdentifier) {
            return Promise.resolve(this.options.generateUniqueIdentifier(this));
        } else {
            const defaultUniqueIdentifier = this.size + "-" + this.name.replace(/[^0-9a-zA-Z_-]/igm, "");
            return Promise.resolve(defaultUniqueIdentifier);
        }
    }

    private chunkUploadSucessfull(chunk: NiftyChunk) {
        if (this.areAllChunksUploaded()) {
            this.status = FileStatus.SUCCESSFUL;
        }
        this.uploader.chunkSucsessEvent.trigger({ chunk });
    }
    private chunkUploadFailed(chunk: NiftyChunk, error: string | Error) {
        this.status = FileStatus.FAILED;
        this.uploader.chunkFailEvent.trigger({ chunk });
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
