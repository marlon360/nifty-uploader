import { NiftyFile } from "./NiftyFile";
import { NiftyOptions, NiftyDefaultOptions } from "./NiftyOptions";

export class NiftyUploader {

    public files: Array<NiftyFile> = new Array<NiftyFile>();
    private options: NiftyOptions;

    constructor(options?: NiftyOptions) {
        // create default options
        const defaultOptions = new NiftyDefaultOptions;
        if(options == undefined) {
            // set deafult options as options if no options provided
            this.options = defaultOptions;
        } else {
            // merge provided options with default options
            this.options = {...defaultOptions, ...options};
        }
    }

    public addFiles(files: File[]): void {
        files.forEach((file: File) => {
            this.files.push(new NiftyFile(file));
        })
    }

}