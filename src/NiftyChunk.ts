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

    public upload() {
        // create request
        const connection = new XMLHttpRequest();
        // slice file
        const chunkData: Blob = this.sliceFile();
        // create form data to send
        const formData = new FormData();
        // add chunk to from data
        formData.append('chunk', chunkData, this.file.name);
        // set request method an url
        connection.open('POST', '/endpoint');
        // initilize request
        connection.send(formData);
    }

    private sliceFile(): Blob {
        return this.file.content.slice(this.startByte, this.endByte, 'application/octet-stream');
    }

}
