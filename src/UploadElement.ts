import { INiftyOptions } from "./NiftyOptions";

export abstract class UploadElement {
    public options: INiftyOptions;

    protected connection: XMLHttpRequest;

    protected uploadData(data: Blob): Promise<string | Error> {

        return new Promise<string | Error>((resolve, reject) => {

            // create request
            this.connection = new XMLHttpRequest();

            // request event handler
            const onRequestComplete = () => {
                if (this.connection.status === 200 || this.connection.status === 201) {
                    resolve();
                } else {
                    reject();
                }
            };
            const onRequestError = () => {
                reject();
            };
            this.connection.addEventListener("load", onRequestComplete, false);
            this.connection.addEventListener("error", onRequestError, false);
            this.connection.addEventListener("timeout", onRequestError, false);

            // create form data to send
            const formData = new FormData();

            // request parameter
            const requestParameter = this.getRequestParameter();
            // append parameter to formdata
            for (const parameter of Object.keys(requestParameter)) {
                formData.append(parameter, String(requestParameter[parameter]));
            }
            // add chunk to form data
            formData.append("blob", data, "blob");
            // set request method and url
            this.connection.open("POST", this.getEndpoint());
            // initilize request
            this.connection.send(formData);
        });
    }

    protected getRequestParameter(): { [key: string]: string | number } {
        return this.options.customRequestParameters;
    }

    protected getEndpoint(): string {
        return this.options.endpoint;
    }

}
