export abstract class UploadElement {

    protected connection: XMLHttpRequest;

    protected uploadData(param: {
        data: Blob,
        requestParameter: { [key: string]: string | number },
        endpoint: string
    }): Promise<string | Error> {

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
            // append parameter to formdata
            for (const parameter of Object.keys(param.requestParameter)) {
                formData.append(parameter, String(param.requestParameter[parameter]));
            }
            // add chunk to form data
            formData.append("blob", param.data, "blob");
            // set request method and url
            this.connection.open("POST", param.endpoint);
            // initilize request
            this.connection.send(formData);
        });
    }

}
