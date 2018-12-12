import { NiftyChunk } from "./NiftyChunk";
import { NiftyUploader } from "./NiftyUploader";
import { ChunkStatus, FileStatus } from "./NiftyStatus";
import { NiftyEvent } from "./NiftyEvent";

export class NiftyFile {

    public uploader: NiftyUploader;

    public name: string;
    public size: number;
    public content: Blob;

    public status: FileStatus;

    public chunks: NiftyChunk[] = new Array<NiftyChunk>();

    //Events
    public chunkSucsessEvent: NiftyEvent<{ chunk: NiftyChunk }> = new NiftyEvent();
    public chunkFailEvent: NiftyEvent<{ chunk: NiftyChunk }> = new NiftyEvent();

    constructor(param: {
        uploader: NiftyUploader,
        file: File,
    }) {
        this.uploader = param.uploader;
        this.name = param.file.name;
        this.size = param.file.size;
        this.content = param.file;

        this.createChunks();
        this.status = FileStatus.QUEUED;
        this.setupEventHandler();
    }

    public upload(): boolean {
        const chunkCount = this.chunks.length;
        for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
            const chunk = this.chunks[chunkIndex];
            if (chunk.status == ChunkStatus.QUEUED) {
                chunk.upload();
                this.status = FileStatus.UPLOADING;
                return true;
            }
        }
        return false;
    }

    private setupEventHandler() {
        this.chunkSucsessEvent.on((data: { chunk: NiftyChunk }) => {
            if (this.areAllChunksUploaded()) {
                this.status == FileStatus.SUCCESSFUL;
            }
            this.uploader.chunkSucsessEvent.trigger({ chunk: data.chunk });
        })
        this.chunkFailEvent.on((data: { chunk: NiftyChunk }) => {
            this.status = FileStatus.FAILED;
            this.uploader.chunkFailEvent.trigger({ chunk: data.chunk });
        })
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