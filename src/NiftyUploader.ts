import { NiftyChunk } from "./NiftyChunk";
import { NiftyEvent } from "./NiftyEvent";
import { NiftyFile } from "./NiftyFile";
import { INiftyOptions, INiftyOptionsParameter, NiftyDefaultOptions } from "./NiftyOptions";
import { ChunkStatus, FileStatus } from "./NiftyStatus";

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
    public fileSucsessEvent: NiftyEvent<{ file: NiftyFile }> = new NiftyEvent();
    public fileFailEvent: NiftyEvent<{ file: NiftyFile }> = new NiftyEvent();
    public fileQueuedEvent: NiftyEvent<{ file: NiftyFile }> = new NiftyEvent();
    public fileAddedEvent: NiftyEvent<{ file: NiftyFile }> = new NiftyEvent();

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
            this.fileAddedEvent.trigger({ file: addedFile });
            this.processFile(addedFile);
        });
    }

    public addFile(file: File, options?: INiftyOptionsParameter): void {
        this.addFiles([file], options);
    }

    public processFile(file: NiftyFile) {
        file.status = FileStatus.PROCESSING;
        file.processFile().then(() => {
            if (file.options.autoQueue) {
                this.enqueueFile(file);
            }
        });
    }

    public enqueueFile(file: NiftyFile) {
        file.status = FileStatus.QUEUED;
        this.fileQueuedEvent.trigger({ file });
        if (this.options.autoUpload) {
            this.upload();
        }
    }

    public upload() {
        const activeConnections = this.activeConnectionCount();
        const freeConnections = this.options.numberOfConcurrentUploads - activeConnections;
        for (let i = 0; i < freeConnections; i++) {
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
    public onFileAdded(callback: (data: { file: NiftyFile }) => void) {
        this.fileAddedEvent.on(callback);
    }
    public onFileSuccess(callback: (data: { file: NiftyFile }) => void) {
        this.fileSucsessEvent.on(callback);
    }
    public onFileFail(callback: (data: { file: NiftyFile }) => void) {
        this.fileFailEvent.on(callback);
    }

    private activeConnectionCount(): number {
        let numberOfConnections = 0;
        for (const file of this.files) {
            if (file.status === FileStatus.UPLOADING) {
                if (file.chunks.length > 0) {
                    for (const chunk of file.chunks) {
                        if (chunk.status === ChunkStatus.UPLOADING) {
                            numberOfConnections++;
                        }
                    }
                } else {
                    numberOfConnections++;
                }
            }
        }
        return numberOfConnections;
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
        this.onChunkSuccess((data: { chunk: NiftyChunk }) => {
            this.uploadNextChunk();
        });
        this.onFileSuccess((data: { file: NiftyFile }) => {
            this.uploadNextChunk();
        });
    }

}
