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
* add czstom request parameters
* event system

## API

### NiftyUploader(options)

#### options

##### chunking

Type: `boolean`  
Default: `true`

Enable or disable chunking. Uploads file in smaller pieces.

##### chunksize

Type: `number`  
Default: `2 * 1024 * 1024` (2MB)

The size of each chunk.

##### endpoint

Type: `string`  
Default: `/`

The server endpoint of the uploader. Sends request to this address.

##### numberOfConcurrentUploads

Type: `number`  
Default: `3`

Number of concurrent uploads.

