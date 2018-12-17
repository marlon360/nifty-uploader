import { NiftyChunk } from "./NiftyChunk";
import { NiftyEvent } from "./NiftyEvent";
import { NiftyFile } from "./NiftyFile";
import { INiftyOptions, INiftyOptionsParameter, NiftyDefaultOptions } from "./NiftyOptions";
import { FileStatus } from "./NiftyStatus";

export class NiftyUploader {

    // files in uploader
    public files: NiftyFile[] = new Array<NiftyFile>();
    // initilize options with default options
    public options: INiftyOptions = new NiftyDefaultOptions();
    // whether the browser support html5 file system api.
    public isSupported: boolean = false;

    // Events
    public chunkSucsessEvent: NiftyEvent<{ chunk: NiftyChunk }> = new NiftyEvent();
    public chunkFailEvent: NiftyEvent<{ chunk: NiftyChunk }> = new NiftyEvent();
    public fileQueuedEvent: NiftyEvent<{ file: NiftyFile }> = new NiftyEvent();

    constructor(options?: INiftyOptionsParameter) {
        // merge provided options with current options
        this.options = { ...this.options, ...options };
        this.setupEventHandler();
        this.checkSupport();
    }

    public addFiles(files: File[], options?: INiftyOptionsParameter): void {
        files.forEach((file: File) => {
            const addedFile = new NiftyFile({ uploader: this, file, options });
            this.files.push(addedFile);
            addedFile.status = FileStatus.ADDED;
            this.processFile(addedFile);
        });
    }

    public addFile(file: File, options?: INiftyOptionsParameter): void {
        this.addFiles([file], options);
    }

    public processFile(file: NiftyFile) {
        file.status = FileStatus.PROCESSING;
        file.processFile().then(() => {
            this.enqueueFile(file);
        });
    }

    public enqueueFile(file: NiftyFile) {
        file.status = FileStatus.QUEUED;
        this.fileQueuedEvent.trigger({ file });
    }

    public upload() {
        for (let i = 0; i < this.options.numberOfConcurrentUploads; i++) {
            this.uploadNextChunk();
        }
    }

    public uploadNextChunk() {
        const filesCount = this.files.length;
        for (let fileIndex = 0; fileIndex < filesCount; fileIndex++) {
            const file = this.files[fileIndex];
            if (file.status === FileStatus.QUEUED || file.status === FileStatus.UPLOADING) {
                file.upload();
                return;
            }
        }
    }

    // Events
    public onChunkSuccess(callback: (data: { chunk: NiftyChunk }) => void) {
        this.chunkSucsessEvent.on(callback);
    }
    public onChunkFail(callback: (data: { chunk: NiftyChunk }) => void) {
        this.chunkFailEvent.on(callback);
    }
    public onFileQueued(callback: (data: { file: NiftyFile }) => void) {
        this.fileQueuedEvent.on(callback);
    }
    // check whether the browser support.
    // - File object type
    // - Blob object type
    // - FileList object type
    // - slicing files
    private checkSupport(): void {
        this.isSupported = (
            (typeof (File) !== "undefined")
            &&
            (typeof (Blob) !== "undefined")
            &&
            (typeof (FileList) !== "undefined")
            &&
            (!!Blob.prototype.webkitSlice || !!Blob.prototype.mozSlice || !!Blob.prototype.slice || false)
        );
    }

    private setupEventHandler() {
        this.chunkSucsessEvent.on((data: { chunk: NiftyChunk }) => {
            this.uploadNextChunk();
        });
    }

}
