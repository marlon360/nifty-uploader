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

##### Example initialization with options

```js
var uploader = new NiftyUploader({
    endpoint: '/backend.php',
    numberOfConcurrentUploads: 2
})
```
