declare interface Blob {
    webkitSlice: any;
    mozSlice: any;
}

declare interface File {
    webkitRelativePath: string | undefined;
    relativePath: string | undefined;
    fileName: string | undefined;
}