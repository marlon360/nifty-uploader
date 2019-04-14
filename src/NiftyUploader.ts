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

    private ee: EventEmitter;

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
            addedFile.setStatus(NiftyStatus.ADDED);
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
     * @param files An array of objects with the keys: name, uniqueIdentifier, size
     * @param options Options for the files
     */
    public addInitialFiles(files: Array<{ name: string, size?: number, uniqueIdentifier: string }>, options?: INiftyOptionsParameter) {
        for (const file of files) {
            // create new NiftyFile
            const initialFile = new NiftyFile({
                file: new File([], file.name),
                options,
                uploader: this,
            });
            // set status to success
            initialFile.setStatus(NiftyStatus.SUCCEEDED_UPLOADING);
            // add the unique identifier
            initialFile.uniqueIdentifier = file.uniqueIdentifier;
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
     * @param file An object with the keys: name, uniqueIdentifier, size
     * @param options Options for the file
     */
    public addInitialFile(file: { name: string, size?: number, uniqueIdentifier: string }, options?: INiftyOptionsParameter) {
        this.addInitialFiles([file], options);
    }

    /**
     * Process a NiftyFile object.
     *
     * @param file The file to process.
     */
    public processFile(file: NiftyFile) {

        const errorHandler = (errorMsg: string) => {
            // set status to rejected if processing failed
            file.setStatus(NiftyStatus.REJECTED);
            // remove from list
            file.remove();
            // trigger fileProcessingFailedEvent
            this.emit("processing-failed", { file, error: errorMsg });
        };

        try {
            file.beforeProcessing();
            if (this.options.beforeProcess) {
                this.options.beforeProcess(file);
            }
        } catch (error) {
            errorHandler(error.message);
            return;
        }

        // set status to processing
        file.setStatus(NiftyStatus.PROCESSING);
        // run the process method of the file
        file.processFile().then(() => {
            // ste status to processed after successful processing
            file.setStatus(NiftyStatus.ACCEPTED);
            // trigger fileProcessedEvent
            this.emit("processing-success", { file });
            // enqueue file if autoQueue is enabled
            if (file.options.autoQueue) {
                this.enqueueFile(file);
            }
        }).catch((errorMsg) => {
            errorHandler(errorMsg);
        });
    }

    /**
     * Enqueue file in the uploader queue.
     *
     * @param file The file to enqueue.
     */
    public enqueueFile(file: NiftyFile) {
        // set status to queued
        file.setStatus(NiftyStatus.QUEUED);
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

    public finalize(file: NiftyFile) {

        file.setStatus(NiftyStatus.FINALIZING);

        if (this.options.finalization) {
            this.options.finalization(file).then(() => {
                file.setStatus(NiftyStatus.SUCCESSFULLY_COMPLETED);
                this.ee.emit("file-completed-successfully", { file });
            }).catch(() => {
                file.setStatus(NiftyStatus.UNSUCCESSFULLY_COMPLETED);
                this.ee.emit("file-completed-unsuccessfully", { file });
            });
        } else {
            file.setStatus(NiftyStatus.SUCCESSFULLY_COMPLETED);
            this.ee.emit("file-completed-successfully", { file });
        }

    }

    /**
     * Cancels all files of the uploader.
     *
     * @param {boolean} remove If enabled, all files will be removed from the list of the uploader
     */
    public cancelAll(remove: boolean = true) {
        for (const file of this.files) {
            file.cancel(remove);
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

    public getTotalFileSize(): number {
        let totalFileSize = 0;
        for (const file of this.files) {
            if (file.status !== NiftyStatus.ADDED &&
                file.status !== NiftyStatus.REJECTED &&
                file.status !== NiftyStatus.FAILED_UPLOADING &&
                file.status !== NiftyStatus.CANCELED &&
                file.status !== NiftyStatus.UNSUCCESSFULLY_COMPLETED) {
                totalFileSize += file.size;
            }
        }
        return totalFileSize;
    }

    public getFileByUniqueIdentifier(uniqueIdentifier: string): NiftyFile | undefined {
        for (const file of this.files) {
            if (file.uniqueIdentifier === uniqueIdentifier) {
                return file;
            }
        }
        return undefined;
    }

    public getFilesByStatus(status: NiftyStatus[]): NiftyFile[] {
        const files: NiftyFile[] = new Array<NiftyFile>();
        for (const file of this.files) {
            if (status.indexOf(file.status) > -1) {
                files.push(file);
            }
        }
        return files;
    }

    // Events
    public on(eventName: "file-added", fn: (data: { file: NiftyFile }) => void): void;
    public on(eventName: "processing-failed", fn: (data: { file: NiftyFile, error: string }) => void): void;
    public on(eventName: "processing-success", fn: (data: { file: NiftyFile }) => void): void;
    public on(eventName: "file-queued", fn: (data: { file: NiftyFile }) => void): void;
    public on(eventName: "file-canceled", fn: (data: { file: NiftyFile }) => void): void;
    public on(eventName: "file-retry", fn: (data: { file: NiftyFile }) => void): void;
    public on(eventName: "file-upload-started", fn: (data: { file: NiftyFile }) => void): void;
    public on(eventName: "file-upload-succeeded", fn: (data: { file: NiftyFile }) => void): void;
    public on(eventName: "file-upload-failed", fn: (data: { file: NiftyFile }) => void): void;
    public on(eventName: "file-completed-successfully", fn: (data: { file: NiftyFile }) => void): void;
    public on(eventName: "file-completed-unsuccessfully", fn: (data: { file: NiftyFile }) => void): void;
    public on(eventName: "file-progress", fn: (data: { file: NiftyFile, progress: number }) => void): void;
    public on(eventName: "chunk-success", fn: (data: { chunk: NiftyChunk }) => void): void;
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
        this.on("file-upload-succeeded", (data: { file: NiftyFile }) => {
            this.finalize(data.file);
            this.upload();
        });
    }

}
