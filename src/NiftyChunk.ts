import { NiftyEvent } from "./NiftyEvent";
import { NiftyFile } from "./NiftyFile";
import { NiftyStatus } from "./NiftyStatus";
import { NiftyUploader } from "./NiftyUploader";
import { UploadElement } from "./UploadElement";

export class NiftyChunk extends UploadElement {

    public file: NiftyFile;

    public chunkIndex: number;

    public status: NiftyStatus;

    private startByte: number;
    private endByte: number;

    constructor(param: {
        file: NiftyFile,
        chunkIndex: number,
        startByte: number,
        endByte: number
    }) {
        super();
        this.uploader = param.file.uploader;
        this.file = param.file;
        this.chunkIndex = param.chunkIndex;
        this.startByte = param.startByte;
        this.options = param.file.options;
        this.endByte = param.endByte;
        // set initial status to queued
        this.status = NiftyStatus.QUEUED;
    }

    public upload(): Promise<string | Error> {

        return new Promise<string | Error>((resolve, reject) => {

            // set status to uploading
            this.status = NiftyStatus.UPLOADING;

            // slice file
            const chunkData: Blob = this.sliceFile();

            // upload chunk
            this.uploadData(chunkData).then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            });

        });
    }

    // override method
    protected getRequestParameter(): { [key: string]: string | number } {
        const params = {
            chunkIndex: this.chunkIndex,
            filename: this.file.name,
            identifier: this.file.uniqueIdentifier,
            totalChunks: this.file.chunks.length,
            totalSize: this.file.size,
        };
        // merge params
        return { ...super.getRequestParameter(), ...params };
    }

    protected triggerRetryEvent() {
        this.uploader.chunkRetryEvent.trigger({ chunk: this });
    };

    private sliceFile(): Blob {
        return this.file.content.slice(this.startByte, this.endByte, "application/octet-stream");
    }

}
