const path = require('path');

module.exports = (env) => {

    return {
        entry: {
            'index': path.resolve(__dirname, './lib/esm/index.js')
        },
        output: {
            path: path.resolve(__dirname, './lib/umd'),
            filename: 'nifty-uploader.js',
            library: 'NiftyUploader',
            libraryTarget: 'umd',
            globalObject: 'this'
        },
        module: {
            rules: [
                { test: /\.t|js$/, use: 'babel-loader' }
            ]
        }
    };

};