import { NiftyFile } from "./NiftyFile";
import { NiftyOptions, NiftyDefaultOptions, NiftyOptionsParameter } from "./NiftyOptions";
import { NiftyEvent } from "./NiftyEvent";
import { NiftyChunk } from "./NiftyChunk";
import { FileStatus } from "./NiftyStatus";

export class NiftyUploader {

    // files in uploader
    public files: Array<NiftyFile> = new Array<NiftyFile>();
    // initilize options with default options
    public options: NiftyOptions = new NiftyDefaultOptions();

    //Events
    public chunkSucsessEvent: NiftyEvent<{ chunk: NiftyChunk }> = new NiftyEvent();
    public chunkFailEvent: NiftyEvent<{ chunk: NiftyChunk }> = new NiftyEvent();

    constructor(options: NiftyOptionsParameter) {
        // merge provided options with current options
        this.options = { ...this.options, ...options };
        this.setupEventHandler();
    }

    public addFiles(files: File[], options?: NiftyOptionsParameter): void {
        files.forEach((file: File) => {
            this.files.push(new NiftyFile({ uploader: this, file: file, options: options }));
        });
    }

    public upload() {
        this.uploadNextChunk();
    }

    public uploadNextChunk() {
        const filesCount = this.files.length;
        for (let fileIndex = 0; fileIndex < filesCount; fileIndex++) {
            const file = this.files[fileIndex];
            if (file.status == FileStatus.QUEUED || file.status == FileStatus.UPLOADING) {
                file.upload();
                return;
            }
        }
    }

    private setupEventHandler() {
        this.chunkSucsessEvent.on((data: { chunk: NiftyChunk }) => {
            this.uploadNextChunk();
        })
    }

    // Events
    public onChunkSuccess(callback: (data: { chunk: NiftyChunk }) => void) {
        this.chunkSucsessEvent.on(callback);
    }
    public onChunkFail(callback: (data: { chunk: NiftyChunk }) => void) {
        this.chunkFailEvent.on(callback);
    }

}
