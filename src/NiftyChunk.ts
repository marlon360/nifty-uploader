import { NiftyFile } from "./NiftyFile";
import { NiftyUploader } from "./NiftyUploader";
import { NiftyEvent } from "./NiftyEvent";
import { ChunkStatus } from "./NiftyStatus";

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

    public upload() {
        // set status to uploading
        this.status = ChunkStatus.UPLOADING;

        // create request
        const connection = new XMLHttpRequest();

        // request event handler
        const onRequestComplete = () => {
            if (connection.status == 200 || connection.status == 201) {
                this.status = ChunkStatus.SUCCESSFUL;
                this.file.chunkSucsessEvent.trigger({chunk: this});
            } else {
                this.status = ChunkStatus.FAILED;
                this.file.chunkFailEvent.trigger({chunk: this});
            }
        }
        const onRequestError = () => {
            this.status = ChunkStatus.FAILED;
            this.uploader.chunkFailEvent.trigger({chunk: this});
        }
        connection.addEventListener('load', onRequestComplete, false);
        connection.addEventListener('error', onRequestError, false);
        connection.addEventListener('timeout', onRequestError, false);

        // slice file
        const chunkData: Blob = this.sliceFile();
        // create form data to send
        const formData = new FormData();
        // add chunk to from data
        formData.append('chunk', chunkData, this.file.name);
        // set request method an url
        connection.open('POST', this.uploader.options.endpoint);
        // initilize request
        connection.send(formData);
    }

    private sliceFile(): Blob {
        return this.file.content.slice(this.startByte, this.endByte, 'application/octet-stream');
    }

}
