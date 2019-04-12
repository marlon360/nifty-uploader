import { INiftyOptions } from "./NiftyOptions";
import { NiftyStatus } from "./NiftyStatus";
import { NiftyUploader } from "./NiftyUploader";

export abstract class UploadElement {

    public options: INiftyOptions;
    public status: NiftyStatus;
    public uploader: NiftyUploader;

    protected progress: number = 0;

    protected connection: XMLHttpRequest;

    private currentRetries = 0;

    public cancel(): boolean {
        // if element upload not completed
        if (!this.isUploadComplete()) {
            // if xhr connection active, abort it
            if (this.connection) {
                this.connection.abort();
            }
            // set status to canceled
            this.status = NiftyStatus.CANCELED;
            // sucessfully canceled
            return true;
        }
        // not canceled, because upload already completed
        return false;
    }

    public isUploadComplete() {
        return this.status === NiftyStatus.FAILED_UPLOADING ||
               this.status === NiftyStatus.SUCCEEDED_UPLOADING ||
               this.status === NiftyStatus.FINALIZING ||
               this.status === NiftyStatus.SUCCESSFULLY_COMPLETED ||
               this.status === NiftyStatus.UNSUCCESSFULLY_COMPLETED;
    }

    public getProgress(): number {
        if (this.status === NiftyStatus.UPLOADING) {
            return this.progress;
        } else if (this.isUploadComplete()) {
            return 1;
        } else {
            return 0;
        }
    }

    protected uploadData(data: Blob): Promise<string | Error> {

        return new Promise<string | Error>((resolve, reject) => {

            // create request
            this.connection = new XMLHttpRequest();

            // request event handler
            const onRequestComplete = () => {
                if (this.connection.status === 200 || this.connection.status === 201) {
                    this.status = NiftyStatus.SUCCEEDED_UPLOADING;
                    resolve();
                } else {
                    // do not retry on permanent error
                    if (this.options.permanentError.indexOf(this.connection.status) > -1) {
                        this.status = NiftyStatus.FAILED_UPLOADING;
                        reject();
                    } else {
                        // if maximum of retries reached, element failed
                        if (this.currentRetries >= this.options.maxRetries) {
                            this.status = NiftyStatus.FAILED_UPLOADING;
                            reject();
                        } else {
                            // wait for retry
                            this.status = NiftyStatus.PENDING_RETRY;
                            // increment number of retries
                            this.currentRetries++;
                            // trigger retry event
                            this.triggerRetryEvent();
                            // delay retry by specified time
                            setTimeout(() => {
                                // queue element
                                this.status = NiftyStatus.QUEUED;
                                // upload next element
                                this.uploader.upload();
                            }, this.options.retryDelay);
                        }
                    }
                }
            };
            const onRequestError = () => {
                this.status = NiftyStatus.FAILED_UPLOADING;
                reject();
            };
            const onRequestProgess = (ev: ProgressEvent) => {
                if (ev.lengthComputable) {
                    this.progress = ev.loaded / ev.total;
                } else {
                    this.progress = (ev.loaded || 0) / data.size;
                }
                this.triggerProgressEvent();
            };
            this.connection.onload = onRequestComplete;
            this.connection.onerror = onRequestError;
            this.connection.ontimeout = onRequestError;
            this.connection.upload.onprogress = onRequestProgess;

            // create form data to send
            const formData = new FormData();

            // request parameter
            const requestParameter = this.getRequestParameter();
            // append parameter to formdata
            for (const parameter of Object.keys(requestParameter)) {
                formData.append(parameter, String(requestParameter[parameter]));
            }
            // add chunk to form data
            formData.append("blob", data, "blob");
            // set request method and url
            this.connection.open("POST", this.getEndpoint());

            // set custom headers
            for (const header of Object.keys(this.options.customHeaders)) {
                this.connection.setRequestHeader(header, String(this.options.customHeaders[header]));
            }

            // initilize request
            this.connection.send(formData);
        });
    }

    protected getRequestParameter(): { [key: string]: string | number } {
        return this.options.customRequestParameters;
    }

    protected getEndpoint(): string {
        return this.options.endpoint;
    }

    protected abstract triggerRetryEvent(): void;
    protected abstract triggerProgressEvent(): void;

}
