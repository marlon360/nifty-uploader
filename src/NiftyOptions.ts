export interface NiftyOptionsParameter {
    chunking?: boolean;
    chunkSize?: number;
    numberOfConcurrentUploads?: number;
    endpoint: string;
}

export interface NiftyOptions extends NiftyOptionsParameter {
    chunking: boolean;
    chunkSize: number;
    numberOfConcurrentUploads: number;
    endpoint: string;
}

export class NiftyDefaultOptions implements NiftyOptionsParameter {
    // chuning enabled
    chunking = true;
    // 2 MB for chunks
    chunkSize = 2 * 1024 * 1024;
    // 3 concurrent uploads
    numberOfConcurrentUploads = 3;
    endpoint: string;
}