# Nifty Uploader
[![Build Status](https://travis-ci.org/marlon360/nifty-uploader.svg?branch=master)](https://travis-ci.org/marlon360/nifty-uploader)
[![codecov](https://codecov.io/gh/marlon360/nifty-uploader/branch/master/graph/badge.svg)](https://codecov.io/gh/marlon360/nifty-uploader)  
An easy file uploader for the browser written in TypeScript.

## Features

* upload in chunks
* concurrent uploads
* add files to uploader
* cancel uploads
* retry uploads
* get progress of file/chunk or total progress
* validate filesize and filetype
* limit the total file size of all files
* add custom validation
* add custom headers to request
* add custom request parameters
* event system

## API

### NiftyUploader(options)



#### Options

option | type | default | description
--- | --- | --- | ---
chunking | `boolean` | `true` | Enable or disable chunking. Uploads file in smaller pieces.
chunksize | `number` | `2 * 1024 * 1024` | The size of each chunk.
endpoint | `string` | `/` | The server endpoint of the uploader. Sends request to this address.
numberOfConcurrentUploads | `number` | `3` | Number of concurrent uploads.
generateUniqueIdentifier | `(file: NiftyFile) => string \| Promise<string>` | `undefined` | The function to generate the unique identifier, which returns a `string` with the identifier. It can also return a `Promise`.
customRequestParameters | `{ [key: string]: string \| number }` | `{}` | POST request parameter, which will be send with every request.
customHeaders | `{ [key: string]: string \| number }` | `{}` | Request headers, which will be send with every request.
autoUpload | `boolean` | `true` | Determines if the queue of files should be uploaded automatically.
autoQueue | `boolean` | `true` | Determines if a sucessfully processed file should be added automatically to the queue.
autoProcess | `boolean` | `true` | Determines if an added file should be processed automatically.
maxRetries | `number` | `3` | The number of retries before the file will be rejected.
retryDelay | `number` | `100` | The delay between the attempts to retry an upload.
permanentError | `number[]` | `[400, 404, 409, 415, 500, 501]` | An array of HTTP status codes, which rejects the file without retrying.
minFileSize | `number` | `1` | The minimum size of a file.
maxFileSize | `number` | `undefined`  | The maximum size of a file.     
totalFileSizeLimit | `number` | `undefined`  | The maximum size of all file sizes in the uploader combined.
allowedFileTypes | `string[]` | `[]` | The allowed file types. You can use `.ext`, `ext`, `mime/type` or `mime/*`. An empty array (default) allows all file types.
customValidation | `(file: NiftyFile) => boolean \| Promise<boolean>` | `undefined` | A custom function, which will be called in the processing step. If the function returns `false` the file will be rejected. The function can also return a `Promise`.

##### Example initialization with options

```js
var uploader = new NiftyUploader({
    endpoint: '/backend.php',
    numberOfConcurrentUploads: 2
})
```
