import { NiftyFile } from "./NiftyFile";

export interface INiftyOptionsParameter {
    chunking?: boolean;
    chunkSize?: number;
    numberOfConcurrentUploads?: number;
    generateUniqueIdentifier?: ((file: NiftyFile) => string | Promise<string>);
    endpoint?: string;
}

export interface INiftyOptions extends INiftyOptionsParameter {
    chunking: boolean;
    chunkSize: number;
    numberOfConcurrentUploads: number;
    generateUniqueIdentifier?: ((file: NiftyFile) => string | Promise<string>);
    endpoint: string;
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
}
