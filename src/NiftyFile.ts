import { NiftyChunk } from "./NiftyChunk";
import { NiftyUploader } from "./NiftyUploader";
import { ChunkStatus, FileStatus } from "./NiftyStatus";
import { NiftyOptionsParameter, NiftyOptions } from "./NiftyOptions";

export class NiftyFile {

    public uploader: NiftyUploader;
    public options: NiftyOptions;

    public name: string;
    public size: number;
    public content: Blob;

    public status: FileStatus;

    public chunks: NiftyChunk[] = new Array<NiftyChunk>();


    constructor(param: {
        uploader: NiftyUploader,
        file: File,
        options?: NiftyOptionsParameter
    }) {
        this.uploader = param.uploader;
        this.name = param.file.name;
        this.size = param.file.size;
        this.content = param.file;
        
        this.status = FileStatus.QUEUED;

        // set options to uploader options
        this.options = this.uploader.options;
        if(param.options) {
            // override options with file options
            this.options = { ...this.options, ...param.options };
        }

    }

    public processFile(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.options.chunking) {
                this.createChunks();
            }
            resolve();
        });
    }

    public upload(): boolean {
        const chunkCount = this.chunks.length;
        for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
            const chunk = this.chunks[chunkIndex];
            if (chunk.status == ChunkStatus.QUEUED) {
                chunk.upload().then(() => {
                    this.chunkUploadSucessfull(chunk);
                }).catch((error) => {
                    this.chunkUploadFailed(chunk, error);
                })
                this.status = FileStatus.UPLOADING;
                return true;
            }
        }
        return false;
    }


    private chunkUploadSucessfull(chunk: NiftyChunk) {
        if (this.areAllChunksUploaded()) {
            this.status == FileStatus.SUCCESSFUL;
        }
        this.uploader.chunkSucsessEvent.trigger({ chunk: chunk });
    }
    private chunkUploadFailed(chunk: NiftyChunk, error: string | Error) {
        this.status = FileStatus.FAILED;
        this.uploader.chunkFailEvent.trigger({ chunk: chunk });
    }


    private areAllChunksUploaded(): boolean {
        const chunkCount = this.chunks.length;
        for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
            const chunk = this.chunks[chunkIndex];
            if (chunk.status != ChunkStatus.SUCCESSFUL) {
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
                file: this,
                chunkIndex,
                startByte,
                endByte
            }));
        }
    }

}