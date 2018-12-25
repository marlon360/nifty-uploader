import { NiftyFile } from "./NiftyFile";

export interface INiftyOptionsParameter {
    chunking?: boolean;
    chunkSize?: number;
    numberOfConcurrentUploads?: number;
    generateUniqueIdentifier?: ((file: NiftyFile) => string | Promise<string>);
    endpoint?: string;
    customRequestParameters?: { [key: string]: string | number };
    customHeaders?: { [key: string]: string | number };
    autoUpload?: boolean;
    autoQueue?: boolean;
    autoProcess?: boolean;
    maxRetries?: number;
    retryDelay?: number;
    permanentError?: number[];
}

export interface INiftyOptions extends INiftyOptionsParameter {
    chunking: boolean;
    chunkSize: number;
    numberOfConcurrentUploads: number;
    generateUniqueIdentifier?: ((file: NiftyFile) => string | Promise<string>);
    endpoint: string;
    customRequestParameters: { [key: string]: string | number };
    customHeaders: { [key: string]: string | number };
    autoUpload: boolean;
    autoQueue: boolean;
    autoProcess: boolean;
    maxRetries: number;
    retryDelay: number;
    permanentError: number[];
}

export class NiftyDefaultOptions implements INiftyOptionsParameter {
    // chuning enabled
    public chunking = true;
    // 2 MB for chunks
    public chunkSize = 2 * 1024 * 1024;
    // 3 concurrent uploads
    public numberOfConcurrentUploads = 3;
    // the default endpoint for uplaods
    public endpoint = "/";
    // no custom parameters
    public customRequestParameters = {};
    // no custom headers
    public customHeaders = {};
    // enable auto upload
    public autoUpload = true;
    // enable auto queue
    public autoQueue = true;
    // enable auto process
    public  autoProcess = true;
    // retry 3 times
    public maxRetries = 3;
    // delay retry by 100ms
    public retryDelay = 100;
    // if status code equals 400, 404, 409, 415, 500, 501 upload failed and do not retry
    public permanentError = [400, 404, 409, 415, 500, 501];
}
