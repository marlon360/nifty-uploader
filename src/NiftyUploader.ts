import { NiftyFile } from "./NiftyFile";
import { NiftyOptions, NiftyDefaultOptions, NiftyOptionsParameter } from "./NiftyOptions";

export class NiftyUploader {

    // files in uploader
    public files: Array<NiftyFile> = new Array<NiftyFile>();
    // initilize options with default options
    public options: NiftyOptions = new NiftyDefaultOptions();

    constructor(options?: NiftyOptionsParameter) {
        // merge provided options with current options
        this.options = {...this.options, ...options};
    }

    public addFiles(files: File[]): void {
        files.forEach((file: File) => {
            this.files.push(new NiftyFile({uploader: this, file: file}));
        });
    }

}
