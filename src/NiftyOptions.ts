import { NiftyFile } from "./NiftyFile";

export interface INiftyOptionsParameter extends Partial<INiftyOptions> {

}

export interface INiftyOptions {
    chunking: boolean;
    chunkSize: number;
    numberOfConcurrentUploads: number;
    generateUniqueIdentifier?: ((file: NiftyFile) => string | Promise<string>);
    endpoint: string;
    customRequestParameters: { [key: string]: string | number };
    customHeaders: { [key: string]: string | number };
    autoUpload: boolean;
    autoQueue: boolean;
    autoProcess: boolean;
    maxRetries: number;
    retryDelay: number;
    permanentError: number[];
    minFileSize: number;
    maxFileSize?: number;
    totalFileSizeLimit?: number;
    allowedFileTypes: string[];
    customValidation?: ((file: NiftyFile) => Promise<any>);
    finalization?: ((file: NiftyFile) => Promise<any>);

    fileTooSmallError: ((size: number, min: number) => string);
    fileTooBigError: ((size: number, max: number) => string);
    fileTypeError: ((type: string, allowedFileTypes: string[]) => string);
    totalFileSizeLimitError: ((size: number, totalFileSizeLimit: number, totalFileSize: number) => string);

}

export class NiftyDefaultOptions implements INiftyOptions {
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
    public autoProcess = true;
    // retry 3 times
    public maxRetries = 3;
    // delay retry by 100ms
    public retryDelay = 100;
    // if status code equals 400, 404, 409, 415, 500, 501 upload failed and do not retry
    public permanentError = [400, 404, 409, 415, 500, 501];
    // file has to be at least 1 byte
    public minFileSize = 1;
    // allow every type
    public allowedFileTypes = [];

    public fileTooSmallError = ((size: number, min: number) => {
        return "File is too small. File has to be at least " + min + " Bytes.";
    });
    public fileTooBigError = ((size: number, max: number) => {
        return "File is too big. Maximum file size is " + max + " Bytes";
    });
    public fileTypeError = ((type: string, allowedFileTypes: string[]) => {
        let errorMsg = "Filetype is not allowed. Allowed file types: ";
        for (let i = 0; i < allowedFileTypes.length; i++) {
                errorMsg += allowedFileTypes[i];
                if (i < allowedFileTypes.length - 1) {
                    errorMsg += ", ";
                }
            }
        return errorMsg;
    });
    public totalFileSizeLimitError = ((size: number, totalFileSizeLimit: number, totalFileSize: number) => {
        return "The total file size limit of " + (totalFileSizeLimit / 1e+6).toFixed(2) + "MB reached. You cannot add this file.";
    });
}
