import { NiftyUploader } from "../NiftyUploader";
import { NiftyFile } from "../NiftyFile";

export class Plugin {


    public ops: {

        upload?: ((file: NiftyFile) => Promise<string>),
        process?: ((file: NiftyFile) => Promise<string>),
        finalize?: ((file: NiftyFile) => void),

    }

    protected uploader: NiftyUploader;
    protected options: any;
    protected defaultOptions: any;

    constructor(uploader: NiftyUploader, options?: any) {
        this.uploader = uploader;
        this.options = {...this.defaultOptions,...options};
    };

    public onInit() {

    }
    public onDestroy() {

    }

}