declare interface Blob {
    // for safari 5.1
    webkitSlice?: (start?: number, end?: number, contentType?: string) => Blob;
    // for firefox 6 - 13
    mozSlice?: (start?: number, end?: number, contentType?: string) => Blob;
}

declare interface File {
    webkitRelativePath?: string;
    relativePath?: string;
    // for < firefox 7
    fileName?: string;
}