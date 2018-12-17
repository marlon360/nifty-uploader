import { NiftyFile } from "./NiftyFile";

export interface NiftyOptionsParameter {
    chunking?: boolean;
    chunkSize?: number;
    numberOfConcurrentUploads?: number;
    generateUniqueIdentifier?: ((file: NiftyFile) => string | Promise<string>);
    endpoint?: string;
}

export interface NiftyOptions extends NiftyOptionsParameter {
    chunking: boolean;
    chunkSize: number;
    numberOfConcurrentUploads: number;
    generateUniqueIdentifier?: ((file: NiftyFile) => string | Promise<string>);
    endpoint: string;
}

export class NiftyDefaultOptions implements NiftyOptionsParameter {
    // chuning enabled
    chunking = true;
    // 2 MB for chunks
    chunkSize = 2 * 1024 * 1024;
    // 3 concurrent uploads
    numberOfConcurrentUploads = 3;
    // the default endpoint for uplaods
    endpoint = '/';
}