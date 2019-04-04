import { EventEmitter } from "./EventEmitter";
import { NiftyChunk } from "./NiftyChunk";
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

    public ee: EventEmitter;

    constructor(options?: INiftyOptionsParameter) {
        this.ee = new EventEmitter();
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
            this.emit("file-added", { file: addedFile });
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
     * Add initial Files to the uploader, which is already uploaded to the server.
     *
     * @param files An array of objects with the keys: name, uuid, size
     * @param options Options for the files
     */
    public addInitialFiles(files: Array<{ name: string, size?: number, uuid: string }>, options?: INiftyOptionsParameter) {
        for (const file of files) {
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

            this.emit("file-added", { file: initialFile });
        }
    }

    /**
     * Add initial File to the uploader, which is already uploaded to the server.
     *
     * @param file An object with the keys: name, uuid, size
     * @param options Options for the file
     */
    public addInitialFile(file: { name: string, size?: number, uuid: string }, options?: INiftyOptionsParameter) {
        this.addInitialFiles([file], options);
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
            this.emit("processing-success", { file });
            // enqueue file if autoQueue is enabled
            if (file.options.autoQueue) {
                this.enqueueFile(file);
            }
        }).catch((error) => {
            // set status to rejected if processing failed
            file.status = NiftyStatus.REJECTED;
            // trigger fileProcessingFailedEvent
            this.emit("processing-failed", { file });
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
        this.emit("file-queued", { file });
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
    public on(eventName: "file-added", fn: (data: { file: NiftyFile }) => void): void;
    public on(eventName: "processing-failed", fn: (data: { file: NiftyFile }) => void): void;
    public on(eventName: "processing-success", fn: (data: { file: NiftyFile }) => void): void;
    public on(eventName: "file-queued", fn: (data: { file: NiftyFile }) => void): void;
    public on(eventName: "file-canceled", fn: (data: { file: NiftyFile }) => void): void;
    public on(eventName: "file-retry", fn: (data: { file: NiftyFile }) => void): void;
    public on(eventName: "file-upload-started", fn: (data: { file: NiftyFile }) => void): void;
    public on(eventName: "file-success", fn: (data: { file: NiftyFile }) => void): void;
    public on(eventName: "file-failed", fn: (data: { file: NiftyFile }) => void): void;
    public on(eventName: "file-progress", fn: (data: { file: NiftyFile, progress: number }) => void): void;
    public on(eventName: "chunk-success", fn: (data: {chunk: NiftyChunk}) => void): void;
    public on(eventName: "chunk-failed", fn: (data: { chunk: NiftyChunk, error: string | Error }) => void): void;
    public on(eventName: "chunk-retry", fn: (data: { chunk: NiftyChunk }) => void): void;
    public on(eventName: "chunk-progress", fn: (data: { chunk: NiftyChunk, progress: number }) => void): void;
    public on(eventName: string, fn: (...args: any) => void): void {
        this.ee.on(eventName, fn);
    }

    public off(eventName: string, fn: () => void) {
        this.ee.off(eventName, fn);
    }

    public emit(eventName: string, data?: any) {
        this.ee.emit(eventName, data);
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
        this.on("chunk-success", (data: { chunk: NiftyChunk }) => {
            this.upload();
        });
        this.on("file-success", (data: { file: NiftyFile }) => {
            this.upload();
        });
    }

}
