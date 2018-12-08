import { NiftyFile } from "./NiftyFile";

export class NiftyUploader {

    public files: Array<NiftyFile> = new Array<NiftyFile>();

    public addFiles(files: File[]): void {
        files.forEach((file: File) => {
            this.files.push(new NiftyFile(file));
        })
    }

}