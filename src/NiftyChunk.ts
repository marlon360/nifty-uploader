import { NiftyFile } from "./NiftyFile";
import { NiftyUploader } from "./NiftyUploader";

export class NiftyChunk {

    public uploader: NiftyUploader;
    public file: NiftyFile;

    public chunkIndex: number;

    constructor(param: {
        file: NiftyFile,
        chunkIndex: number,
    }) {
        this.uploader = param.file.uploader;
        this.file = param.file;
        this.chunkIndex = param.chunkIndex;
    }

}
