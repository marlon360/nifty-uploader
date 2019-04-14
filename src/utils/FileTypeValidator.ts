import { Plugin } from "./Plugin";
import { NiftyUploader } from "../NiftyUploader";
import { NiftyFile } from "../NiftyFile";

export interface FileTypeValidatorOptions {
    allowedFileTypes: string[],
    fileTypeError: ((type: string, allowedFileTypes: string[]) => string)
}

export class FileTypeValidator extends Plugin {

    protected options: FileTypeValidatorOptions;
    protected defaultOptions: FileTypeValidatorOptions = {
        allowedFileTypes: [],
        fileTypeError: ((type: string, allowedFileTypes: string[]) => {
            let errorMsg = "Filetype is not allowed. Allowed file types: ";
            for (let i = 0; i < allowedFileTypes.length; i++) {
                errorMsg += allowedFileTypes[i];
                if (i < allowedFileTypes.length - 1) {
                    errorMsg += ", ";
                }
            }
            return errorMsg;
        })
    };

    constructor(uploader: NiftyUploader, options?: Partial<FileTypeValidatorOptions>) {
        super(uploader, options);

        this.ops.process = ((file: NiftyFile) => {
            return new Promise<string>((resolve, reject) => {
                // If no extensions specified, allow every file
                if (this.options.allowedFileTypes.length === 0) {
                    resolve();
                }
                // file type can be an empty string, also check filename extension
                const actualType = file.content.type;

                for (let allowedType of this.options.allowedFileTypes) {
                    // remove whitespace and lowercase every type
                    allowedType = allowedType.replace(/\s/g, "").toLowerCase();
                    // check if mime-type else it is extension
                    if (allowedType.indexOf("/") !== -1) {
                        // check if wildcard
                        if (allowedType.indexOf("*") !== -1) {
                            // genaral type is for example "image" in "image/png"
                            const allowedGeneralType = allowedType.slice(0, allowedType.indexOf("*"));
                            // compare allowed genaral type with actual general type
                            if (allowedGeneralType === actualType.slice(0, allowedType.indexOf("*"))) {
                                resolve();
                            }
                        } else {
                            if (allowedType === actualType) {
                                resolve();
                            }
                        }
                    } else {
                        // add dot to extension if not already
                        const allowedExtension = ((allowedType.match(/^[^.][^/]+$/)) ? "." : "") + allowedType;
                        // if filename contains allowed extension
                        if (file.name.slice(file.name.indexOf(".")) === allowedExtension) {
                            resolve();
                        }
                        // subtype of mime ("image/png" -> "png")
                        const actualSubtype = actualType.slice(actualType.indexOf("/") + 1);
                        if ("." + actualSubtype === allowedExtension) {
                            resolve();
                        }
                    }
                }
                reject(this.options.fileTypeError(actualType, this.options.allowedFileTypes));
            });
        })

    };

}

declare module '../NiftyUploader' {

    export interface NiftyUploader {
        install<FileTypeValidator>(pluginClass: typeof FileTypeValidator, options?: Partial<FileTypeValidatorOptions>): NiftyUploader;
    }
}