import { NiftyEvent } from "./NiftyEvent";
import { NiftyFile } from "./NiftyFile";
import { ChunkStatus } from "./NiftyStatus";
import { NiftyUploader } from "./NiftyUploader";
import { UploadElement } from "./UploadElement";

export class NiftyChunk extends UploadElement {

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
        super();
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

            // upload chunk
            this.uploadData({
                data: chunkData,
                endpoint: this.file.options.endpoint,
                requestParameter: params
            }).then(() => {
                this.status = ChunkStatus.SUCCESSFUL;
                resolve();
            }).catch(() => {
                this.status = ChunkStatus.FAILED;
                reject();
            });

        });
    }

    private sliceFile(): Blob {
        return this.file.content.slice(this.startByte, this.endByte, "application/octet-stream");
    }

}
