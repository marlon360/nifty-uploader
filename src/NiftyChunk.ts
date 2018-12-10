import { NiftyFile } from "./NiftyFile";
import { NiftyUploader } from "./NiftyUploader";

export class NiftyChunk {

    public uploader: NiftyUploader;
    public file: NiftyFile;

    public chunkIndex: number;

    private startByte: number;
    private endByte: number;

    constructor(param: {
        file: NiftyFile,
        chunkIndex: number,
        startByte: number,
        endByte: number
    }) {
        this.uploader = param.file.uploader;
        this.file = param.file;
        this.chunkIndex = param.chunkIndex;
        this.startByte = param.startByte;
        this.endByte = param.endByte;
    }

}
