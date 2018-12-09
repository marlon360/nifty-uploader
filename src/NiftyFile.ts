import { NiftyChunk } from "./NiftyChunk";
import { NiftyUploader } from "./NiftyUploader";

export class NiftyFile {

    public uploader: NiftyUploader;

    public name: string;
    public size: number;
    public content: Blob;

    public chunks: NiftyChunk[] = new Array<NiftyChunk>();

    constructor(param: {
        uploader: NiftyUploader,
        file: File,
    }) {
        this.uploader = param.uploader;
        this.name = param.file.name;
        this.size = param.file.size;
        this.content = param.file;
    }

    private createChunks() {
        // clear array of chunks
        this.chunks = [];
        // count of chunks with size equal or less to specified chunkSize
        const chunkCount = Math.ceil(this.size / this.uploader.options.chunkSize);
        // create chunks
        for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
            this.chunks.push(new NiftyChunk({
                file: this,
                chunkIndex: chunkIndex
            }));
        }
    }

}