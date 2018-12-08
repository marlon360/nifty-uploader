export class NiftyFile {

    name: string;
    size: number;
    content: Blob;

    constructor(file: File) {
        this.name = file.name;
        this.size = file.size;
        this.content = file;
    }

}