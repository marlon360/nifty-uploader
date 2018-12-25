import { INiftyOptions } from "./NiftyOptions";
import { NiftyStatus } from "./NiftyStatus";
import { NiftyUploader } from "./NiftyUploader";

export abstract class UploadElement {

    public options: INiftyOptions;
    public status: NiftyStatus;
    public uploader: NiftyUploader;

    protected connection: XMLHttpRequest;

    private currentRetries = 0;

    public cancel(): boolean {
        // if element upload not completed
        if (!this.isComplete()) {
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

    public isComplete() {
        return this.status === NiftyStatus.FAILED || this.status === NiftyStatus.SUCCESSFUL;
    }

    protected uploadData(data: Blob): Promise<string | Error> {

        return new Promise<string | Error>((resolve, reject) => {

            // create request
            this.connection = new XMLHttpRequest();

            // request event handler
            const onRequestComplete = () => {
                if (this.connection.status === 200 || this.connection.status === 201) {
                    this.status = NiftyStatus.SUCCESSFUL;
                    resolve();
                } else {
                    // do not retry on permanent error
                    if (this.options.permanentError.indexOf(this.connection.status) > -1) {
                        this.status = NiftyStatus.FAILED;
                        reject();
                    } else {
                        // if maximum of retries reached, element failed
                        if (this.currentRetries >= this.options.maxRetries) {
                            this.status = NiftyStatus.FAILED;
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
                this.status = NiftyStatus.FAILED;
                reject();
            };
            this.connection.onload = onRequestComplete;
            this.connection.onerror = onRequestError;
            this.connection.ontimeout = onRequestError;

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

}
