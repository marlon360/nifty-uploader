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
    public chunkSuccessEvent: NiftyEvent<{ chunk: NiftyChunk }> = new NiftyEvent();
    public chunkFailEvent: NiftyEvent<{ chunk: NiftyChunk, error: string | Error }> = new NiftyEvent();
    public chunkRetryEvent: NiftyEvent<{ chunk: NiftyChunk }> = new NiftyEvent();
    public fileSuccessEvent: NiftyEvent<{ file: NiftyFile }> = new NiftyEvent();
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

    /**
     * Add a File array or FileList to the uploader with optional options.
     *
     * @param files An array of File objects or a FileList, which should be added to the uploader
     * @param options Options for the files
     */
    public addFiles(files: File[] | FileList, options?: INiftyOptionsParameter): void {
        for (const file of Array.from(files)) {
            // create NiftyFile Object of File and options
            const addedFile = new NiftyFile({ uploader: this, file, options });
            // add NiftyFile to Array
            this.files.push(addedFile);
            // change status to ADDED
            addedFile.status = NiftyStatus.ADDED;
            // trigger fileAddedEvent
            this.fileAddedEvent.trigger({ file: addedFile });
            // process file if autoProcess is enabled
            if (this.options.autoProcess) {
                this.processFile(addedFile);
            }
        }
    }

    /**
     * Add a File to the uploader with optional options.
     *
     * @param file The File object, which should be added to the uploader
     * @param options Options for the file
     */
    public addFile(file: File, options?: INiftyOptionsParameter): void {
        this.addFiles([file], options);
    }

    /**
     * Add initial File to the uploader, which is already uploaded to the server.
     *
     * @param file An object with the keys: name, uuid, size
     * @param options Options for the file
     */
    public addInitialFile(file: {name: string, size?: number, uuid: string}, options?: INiftyOptionsParameter) {
        // create new NiftyFile
        const initialFile = new NiftyFile({
            file: new File([], file.name),
            options,
            uploader: this,
        });
        // set status to success
        initialFile.status = NiftyStatus.SUCCESS;
        // add the unique identifier
        initialFile.uniqueIdentifier = file.uuid;
        // add size if available
        initialFile.size = file.size ? file.size : 0;
        // add file to array
        this.files.push(initialFile);

        this.fileAddedEvent.trigger({ file: initialFile });
    }

    /**
     * Process a NiftyFile object.
     *
     * @param file The file to process.
     */
    public processFile(file: NiftyFile) {
        // set status to processing
        file.status = NiftyStatus.PROCESSING;
        // run the process method of the file
        file.processFile().then(() => {
            // ste status to processed after successful processing
            file.status = NiftyStatus.PROCESSED;
            // trigger fileProcessedEvent
            this.fileProcessedEvent.trigger({ file });
            // enqueue file if autoQueue is enabled
            if (file.options.autoQueue) {
                this.enqueueFile(file);
            }
        }).catch((error) => {
            // set status to rejected if processing failed
            file.status = NiftyStatus.REJECTED;
            // trigger fileProcessingFailedEvent
            this.fileProcessingFailedEvent.trigger({ file });
        });
    }

    /**
     * Enqueue file in the uploader queue.
     *
     * @param file The file to enqueue.
     */
    public enqueueFile(file: NiftyFile) {
        // set status to queued
        file.status = NiftyStatus.QUEUED;
        // trigger fileQueuedEvent
        this.fileQueuedEvent.trigger({ file });
        // start uploading if autoUpload is enabled
        if (this.options.autoUpload) {
            this.upload();
        }
    }

    /**
     * Starts the uploading process, if a free connection is available.
     */
    public upload() {
        // get all active connections
        const activeConnections = this.activeConnectionCount();
        // calculate the free connections
        const freeConnections = this.options.numberOfConcurrentUploads - activeConnections;
        // use every free connection to upload an enqueued file
        for (let i = 0; i < freeConnections; i++) {
            this.uploadNextQueuedElement();
        }
    }

    /**
     * Starts the upload for the next enqueued file.
     */
    public uploadNextQueuedElement() {
        const filesCount = this.files.length;
        // iterate through all files
        for (let fileIndex = 0; fileIndex < filesCount; fileIndex++) {
            // get file
            const file = this.files[fileIndex];
            // check if file is queued or is uploading with chunks
            if (file.status === NiftyStatus.QUEUED ||
                (file.status === NiftyStatus.UPLOADING && file.options.chunking)) {
                // start the upload of the file
                // check if the file can be uploaded
                if (file.upload()) {
                    // exit function after first file for upload found
                    return;
                }
            }
        }
    }

    /**
     * Cancels all files of the uploader.
     */
    public cancelAll() {
        for (const file of this.files) {
            file.cancel();
        }
    }

    /**
     * The percentage of the current upload progress.
     *
     * @returns {number} Percentage of the upload progress between 0 and 1
     */
    public getProgress(): number {
        let totalProgress = 0;
        let totalFiles = 0;
        for (const file of this.files) {
            // get all files, which are uploading or queued
            if (file.status === NiftyStatus.UPLOADING || file.status === NiftyStatus.QUEUED) {
                // add progress of the file to the total progress
                totalProgress += file.getProgress();
                totalFiles++;
            }
        }
        return totalProgress / totalFiles;
    }

    // Events
    public onChunkSuccess(callback: (data: { chunk: NiftyChunk }) => void) {
        this.chunkSuccessEvent.on(callback);
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
        this.fileSuccessEvent.on(callback);
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

    /**
     * The number of current active connections.
     * All files or chunks, which are uploading and using and XHR connection.
     *
     * @returns {number} Number of current active connections
     */
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
