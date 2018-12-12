export interface NiftyOptionsParameter {
    chunking?: boolean;
    chunkSize?: number;
    endpoint: string;
}

export interface NiftyOptions extends NiftyOptionsParameter {
    chunking: boolean;
    chunkSize: number;
    endpoint: string;
}

export class NiftyDefaultOptions implements NiftyOptionsParameter {
    // chuning enabled
    chunking = true;
    // 2 MB for chunks
    chunkSize = 2 * 1024 * 2014;
    endpoint: string;
}