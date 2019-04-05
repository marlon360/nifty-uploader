export class Validator {

    public static validateFileSize(file: File | Blob, min: number, max?: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (file.size < min) {
                reject("File is too small. File has to be at least " + min + " Bytes.");
            }
            if (max) {
                if (file.size > max) {
                    reject("File is too big. Maximum file size is " + max + " Bytes");
                }
            }
            resolve();
        });
    }

    public static validateTotalFileSize(size: number, totalFileSize: number, totalFileSizeLimit: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (size + totalFileSize <= totalFileSizeLimit) {
                resolve();
            } else {
                reject("The total file size limit reached. You cannot add this file.");
            }
        });
    }

    public static validateFileType(file: Blob | File, filename: string, allowedFileTypes: string[]): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            // If no extensions specified, allow every file
            if (allowedFileTypes.length === 0) {
                resolve();
            }
            // file type can be an empty string, also check filename extension
            const actualType = file.type;

            for (let allowedType of allowedFileTypes) {
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
                    if (filename.slice(filename.indexOf(".")) === allowedExtension) {
                        resolve();
                    }
                    // subtype of mime ("image/png" -> "png")
                    const actualSubtype = actualType.slice(actualType.indexOf("/") + 1);
                    if ("." + actualSubtype === allowedExtension) {
                        resolve();
                    }
                }
            }
            reject("Filetype is not allowed.");
        });
    }
}
