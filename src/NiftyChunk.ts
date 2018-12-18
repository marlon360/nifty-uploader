import { NiftyEvent } from "./NiftyEvent";
import { NiftyFile } from "./NiftyFile";
import { ChunkStatus } from "./NiftyStatus";
import { NiftyUploader } from "./NiftyUploader";

export class NiftyChunk {

    public uploader: NiftyUploader;
    public file: NiftyFile;

    public chunkIndex: number;

    public status: ChunkStatus;

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
        // set initial status to queued
        this.status = ChunkStatus.QUEUED;
    }

    public upload(): Promise<string | Error> {

        return new Promise<string | Error>((resolve, reject) => {
            // set status to uploading
            this.status = ChunkStatus.UPLOADING;

            // create request
            const connection = new XMLHttpRequest();

            // request event handler
            const onRequestComplete = () => {
                if (connection.status === 200 || connection.status === 201) {
                    this.status = ChunkStatus.SUCCESSFUL;
                    resolve();
                } else {
                    this.status = ChunkStatus.FAILED;
                    reject();
                }
            };
            const onRequestError = () => {
                this.status = ChunkStatus.FAILED;
                reject();
            };
            connection.addEventListener("load", onRequestComplete, false);
            connection.addEventListener("error", onRequestError, false);
            connection.addEventListener("timeout", onRequestError, false);

            // slice file
            const chunkData: Blob = this.sliceFile();

            // parameter
            const params: { [key: string]: string | number } = {
                chunkIndex: this.chunkIndex,
                filename: this.file.name,
                identifier: this.file.uniqueIdentifier,
                totalChunks: this.file.chunks.length,
                totalSize: this.file.size,
            };

            // create form data to send
            const formData = new FormData();
            // append parameter to formdata
            for (const parameter of Object.keys(params)) {
                formData.append(parameter, String(params[parameter]));
            }
            // add chunk to form data
            formData.append("chunk", chunkData, this.file.name);
            // set request method and url
            connection.open("POST", this.uploader.options.endpoint);
            // initilize request
            connection.send(formData);
        });
    }

    private sliceFile(): Blob {
        return this.file.content.slice(this.startByte, this.endByte, "application/octet-stream");
    }

}
