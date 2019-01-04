import { NiftyChunk } from "./NiftyChunk";
import { NiftyEvent } from "./NiftyEvent";
import { NiftyFile } from "./NiftyFile";
import { INiftyOptions, INiftyOptionsParameter, NiftyDefaultOptions } from "./NiftyOptions";
import { NiftyStatus } from "./NiftyStatus";

export class NiftyUploader {

    // files in uploader
    public files: NiftyFile[] = new Array<NiftyFile>();
    // initilize options with default options
    public options: INiftyOptions = new NiftyDefaultOptions();
    // whether the browser support html5 file system api.
    public isSupported: boolean = false;

    // Events
    public chunkSucsessEvent: NiftyEvent<{ chunk: NiftyChunk }> = new NiftyEvent();
    public chunkFailEvent: NiftyEvent<{ chunk: NiftyChunk, error: string | Error }> = new NiftyEvent();
    public chunkRetryEvent: NiftyEvent<{ chunk: NiftyChunk }> = new NiftyEvent();
    public fileSucsessEvent: NiftyEvent<{ file: NiftyFile }> = new NiftyEvent();
    public fileFailEvent: NiftyEvent<{ file: NiftyFile }> = new NiftyEvent();
    public fileRetryEvent: NiftyEvent<{ file: NiftyFile }> = new NiftyEvent();
    public fileProcessingFailedEvent: NiftyEvent<{ file: NiftyFile }> = new NiftyEvent();
    public fileProcessedEvent: NiftyEvent<{ file: NiftyFile }> = new NiftyEvent();
    public fileQueuedEvent: NiftyEvent<{ file: NiftyFile }> = new NiftyEvent();
    public fileAddedEvent: NiftyEvent<{ file: NiftyFile }> = new NiftyEvent();
    public fileCanceledEvent: NiftyEvent<{ file: NiftyFile }> = new NiftyEvent();
    public fileProgressEvent: NiftyEvent<{ file: NiftyFile, progress: number }> = new NiftyEvent();
    public chunkProgressEvent: NiftyEvent<{ chunk: NiftyChunk, progress: number }> = new NiftyEvent();
    public fileUploadStartedEvent: NiftyEvent<{ file: NiftyFile }> = new NiftyEvent();

    constructor(options?: INiftyOptionsParameter) {
        // merge provided options with current options
        this.options = { ...this.options, ...options };
        this.setupEventHandler();
        this.checkSupport();
    }

    public addFiles(files: File[] | FileList, options?: INiftyOptionsParameter): void {
        for (const file of Array.from(files)) {
            const addedFile = new NiftyFile({ uploader: this, file, options });
            this.files.push(addedFile);
            addedFile.status = NiftyStatus.ADDED;
            this.fileAddedEvent.trigger({ file: addedFile });
            if (this.options.autoProcess) {
                this.processFile(addedFile);
            }
        }
    }

    public addFile(file: File, options?: INiftyOptionsParameter): void {
        this.addFiles([file], options);
    }

    public processFile(file: NiftyFile) {
        file.status = NiftyStatus.PROCESSING;
        file.processFile().then(() => {
            file.status = NiftyStatus.PROCESSED;
            this.fileProcessedEvent.trigger({ file });
            if (file.options.autoQueue) {
                this.enqueueFile(file);
            }
        }).catch((error) => {
            file.status = NiftyStatus.REJECTED;
            this.fileProcessingFailedEvent.trigger({ file });
        });
    }

    public enqueueFile(file: NiftyFile) {
        file.status = NiftyStatus.QUEUED;
        this.fileQueuedEvent.trigger({ file });
        if (this.options.autoUpload) {
            this.upload();
        }
    }

    public upload() {
        const activeConnections = this.activeConnectionCount();
        const freeConnections = this.options.numberOfConcurrentUploads - activeConnections;
        for (let i = 0; i < freeConnections; i++) {
            this.uploadNextQueuedElement();
        }
    }

    public uploadNextQueuedElement() {
        const filesCount = this.files.length;
        for (let fileIndex = 0; fileIndex < filesCount; fileIndex++) {
            const file = this.files[fileIndex];
            if (file.status === NiftyStatus.QUEUED ||
                (file.status === NiftyStatus.UPLOADING && file.options.chunking)) {
                if (file.upload()) {
                    // exit function after first file for upload found
                    return;
                }
            }
        }
    }

    public cancelAll() {
        for (const file of this.files) {
            file.cancel();
        }
    }

    public getProgress() {
        let totalProgress = 0;
        let totalFiles = 0;
        for (const file of this.files) {
            if (file.status === NiftyStatus.UPLOADING || file.status === NiftyStatus.QUEUED) {
                totalProgress += file.getProgress();
                totalFiles++;
            }
        }
        return totalProgress / totalFiles;
    }

    // Events
    public onChunkSuccess(callback: (data: { chunk: NiftyChunk }) => void) {
        this.chunkSucsessEvent.on(callback);
    }
    public onChunkFail(callback: (data: { chunk: NiftyChunk, error: string | Error }) => void) {
        this.chunkFailEvent.on(callback);
    }
    public onChunkRetry(callback: (data: { chunk: NiftyChunk }) => void) {
        this.chunkRetryEvent.on(callback);
    }
    public onFileProcessingFailed(callback: (data: { file: NiftyFile }) => void) {
        this.fileProcessingFailedEvent.on(callback);
    }
    public onFileProcessed(callback: (data: { file: NiftyFile }) => void) {
        this.fileProcessedEvent.on(callback);
    }
    public onFileQueued(callback: (data: { file: NiftyFile }) => void) {
        this.fileQueuedEvent.on(callback);
    }
    public onFileAdded(callback: (data: { file: NiftyFile }) => void) {
        this.fileAddedEvent.on(callback);
    }
    public onFileCanceled(callback: (data: { file: NiftyFile }) => void) {
        this.fileCanceledEvent.on(callback);
    }
    public onFileRetry(callback: (data: { file: NiftyFile }) => void) {
        this.fileRetryEvent.on(callback);
    }
    public onFileUploadStarted(callback: (data: { file: NiftyFile }) => void) {
        this.fileUploadStartedEvent.on(callback);
    }
    public onFileSuccess(callback: (data: { file: NiftyFile }) => void) {
        this.fileSucsessEvent.on(callback);
    }
    public onFileFail(callback: (data: { file: NiftyFile }) => void) {
        this.fileFailEvent.on(callback);
    }
    public onFileProgress(callback: (data: { file: NiftyFile, progress: number }) => void) {
        this.fileProgressEvent.on(callback);
    }
    public onChunkProgress(callback: (data: { chunk: NiftyChunk, progress: number }) => void) {
        this.chunkProgressEvent.on(callback);
    }

    private activeConnectionCount(): number {
        let numberOfConnections = 0;
        for (const file of this.files) {
            if (file.status === NiftyStatus.UPLOADING) {
                if (file.chunks.length > 0) {
                    for (const chunk of file.chunks) {
                        if (chunk.status === NiftyStatus.UPLOADING) {
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
            this.upload();
        });
        this.onFileSuccess((data: { file: NiftyFile }) => {
            this.upload();
        });
    }

}
