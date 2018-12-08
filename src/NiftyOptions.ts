export interface NiftyOptions {
    chunking?: boolean;
    chunkSize?: number;
}

export class NiftyDefaultOptions implements NiftyOptions {
    chunking = true;
    // 2 MB for chunks
    chunkSize = 2 * 1024 * 2014;
}