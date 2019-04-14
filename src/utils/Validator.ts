export class Validator {

    public static validateFileSize(size: number, min: number, fileTooSmallError: (size: number, min: number) => string, max?: number, fileTooBigError?: (size: number, max: number) => string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (size < min) {
                reject(fileTooSmallError(size, min));
            }
            if (max && fileTooBigError) {
                if (size > max) {
                    reject(fileTooBigError(size, max));
                }
            }
            resolve();
        });
    }

    public static validateFileType(file: Blob | File, filename: string, allowedFileTypes: string[], fileTypeError: ((type: string, allowedFileTypes: string[]) => string)): Promise<string> {
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
            reject(fileTypeError(actualType, allowedFileTypes));
        });
    }
}
