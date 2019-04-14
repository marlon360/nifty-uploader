import { Plugin } from "./Plugin";
import { NiftyUploader } from "../NiftyUploader";
import { NiftyFile } from "../NiftyFile";
import { NiftyStatus } from "src/NiftyStatus";

export interface XHRUploaderOptions {
    endpoint: string,
    chunking: boolean,
    chunkSize: number
}

export class XHRUploader extends Plugin {

    protected options: XHRUploaderOptions;
    protected defaultOptions: XHRUploaderOptions = {
        endpoint: '/',
        chunking: true,
        chunkSize: 2 * 1024 * 1024,
    };

    private connection: XMLHttpRequest

    constructor(uploader: NiftyUploader, options?: Partial<XHRUploaderOptions>) {
        super(uploader, options);

        this.ops.process = this.process;
        this.ops.upload = this.upload;

    }

    private process(file: NiftyFile): Promise<string> {
        if(this.options.chunking) {
            this.createChunks(file);
        }
        
    }

    private upload(file: NiftyFile): Promise<string> {
        
        file.state

        if(this.options.chunking && file.state.chunks != null) {
            for (const chunk of file.state.chunks) {
                
            }
        }

    }


    protected uploadData(file: NiftyFile): Promise<string | Error> {

        return new Promise<string | Error>((resolve, reject) => {

            // create request
            this.connection = new XMLHttpRequest();

            // request event handler
            const onRequestComplete = () => {
                if (this.connection.status === 200 || this.connection.status === 201) {
                    file.status = NiftyStatus.SUCCEEDED_UPLOADING;
                    resolve();
                } else {
                    // do not retry on permanent error
                    if (this.uploader.options.permanentError.indexOf(this.connection.status) > -1) {
                        file.status = NiftyStatus.FAILED_UPLOADING;
                        reject();
                    } else {
                        // if maximum of retries reached, element failed
                        if (file.state.currentRetries >= file.options.maxRetries) {
                            file.status = NiftyStatus.FAILED_UPLOADING;
                            reject();
                        } else {
                            // wait for retry
                            file.status = NiftyStatus.PENDING_RETRY;
                            // increment number of retries
                            file.state.currentRetries++;
                            // trigger retry event
                            //this.triggerRetryEvent();
                            // delay retry by specified time
                            setTimeout(() => {
                                // queue element
                                file.status = NiftyStatus.QUEUED;
                                // upload next element
                                //this.uploader.upload();
                            }, file.options.retryDelay);
                        }
                    }
                }
            };
            const onRequestError = () => {
                file.status = NiftyStatus.FAILED_UPLOADING;
                reject();
            };
            // const onRequestProgess = (ev: ProgressEvent) => {
            //     if (ev.lengthComputable) {
            //         this.progress = ev.loaded / ev.total;
            //     } else {
            //         this.progress = (ev.loaded || 0) / data.size;
            //     }
            //     this.triggerProgressEvent();
            // };
            this.connection.onload = onRequestComplete;
            this.connection.onerror = onRequestError;
            this.connection.ontimeout = onRequestError;
            //this.connection.upload.onprogress = onRequestProgess;

            // create form data to send
            const formData = new FormData();

            // request parameter
            const requestParameter = this.getRequestParameter();
            // append parameter to formdata
            for (const parameter of Object.keys(requestParameter)) {
                formData.append(parameter, String(requestParameter[parameter]));
            }
            // add chunk to form data
            formData.append("blob", file.content, "blob");
            // set request method and url
            this.connection.open("POST", this.options.endpoint);

            // set custom headers
            for (const header of Object.keys(this.options.customHeaders)) {
                this.connection.setRequestHeader(header, String(this.options.customHeaders[header]));
            }

            // initilize request
            this.connection.send(formData);
        });
    }


    private createChunks(file: NiftyFile) {
        // clear array of chunks
        file.state.chunks = new Array<NiftyChunk>();
        // count of chunks with size equal or less to specified chunkSize
        const chunkCount = Math.ceil(file.size / this.options.chunkSize);
        // create chunks
        for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
            // calculate start byte of chunk
            const startByte = chunkIndex * this.options.chunkSize;
            // calculate end byte of chunk
            const endByte = Math.min(file.size, (chunkIndex + 1) * this.options.chunkSize);
            // create chunk object and add to array
            file.state.chunks.push({
                status: NiftyStatus.QUEUED,
                chunkIndex,
                endByte,
                file,
                startByte,
            } as NiftyChunk);
        }
    }

}

export interface NiftyChunk {

    file: NiftyFile,

    chunkIndex: number,

    status: NiftyStatus,

    startByte: number,
    endByte: number

}