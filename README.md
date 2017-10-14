<div align="center">
  <h1>Backend-utils</h1>
  <strong>A set of utility functions for Dixeed's backend developments.</strong>
</div>

<hr>

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Build Status](https://travis-ci.org/dixeed/backend-utils.svg?branch=master)](https://travis-ci.org/dixeed/backend-utils.svg)
[![npm (scoped)](https://img.shields.io/npm/v/@dixeed/backend-utils.svg)](https://www.npmjs.com/package/@dixeed/backend-utils)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://opensource.org/licenses/MIT)

## Disclaimer
**This project is made to be used in Dixeed's projects thus its configuration may not suit every needs.**

## Requirements
- Nodejs >= 6.11.4

## Usage
```javascript
const utils = require('@dixeed/backend-utils');

utils.init({
  algorithm: 'SHA1',
  media: {
    publicImgFolder: 'public/images',
    publicFileFolder: 'public/files',
  }
});

// Once initialized, you can use every utility functions within this helper.

utils.crypto.getSecuredHash(3, 'mydata');

// ...
```

## API Documentation
### utils.init(config)
This method initializes the helper. You cannot use it without calling the init() method first.
The `config` parameter is as follow:
```javascript
{
  "algorithm": "",                  // The default algorithm used by the crypto methods.
  "media": {
    "publicImgFolder": "",          // Path to the folder into which save images.
    "publicFileFolder": "",         // Path to the folder into which save files.
  }
}
```

### utils.crypto.getSecuredHash(seedSize, data, algorithm = algo)
Generates a cryptographic hash.

**seedSize** - _integer_ - Size of the seed used for the hash generation.
**data** - _string_ -The data to be added to the hash.
**algorithm** - _string_ - (optional) The algorithm to use for creating the hash. Will override the default algorithm set in the config.

**return** a Promise containing the generated hash.

### utils.Mailer(transporterOpts)
Constructor for a Mailer object.
The **transporterOpts** parameter is as follow:
```javascript
{
  "port": 322,
  "host": "mail.provider.net",
  "secure": false,
  "auth": {
    "user": "my.email@domain.com",
    "pass": "*********"
  }
}
```
The mailer object resulting from the instanciation has a _sendMail()_ method. The sendMail() method return a Promise object.
**See the nodemailer sendMail documentation for information on the mailer.sendMail(opts)**

### utils.media.createImage(stream, filename, filePath, options = {})
Creates an image from the provided stream at the path relative to the base path provided in the init() config.
**options** parameter:
```javascript
{
  "addTimestamp": true,   // Adds the current timestamp to the filename
  "ext": null             // Custom extension for the image
}
```
**return** a Promise containing the path of the image.

### utils.media.createFile(stream, filename, directoryPath, options = {})
Creates a file from the provided stream at the path relative to the base path provided in the init() config.
**options** parameter:
```javascript
{
  "addTimestamp": true,   // Adds the current timestamp to the filename
  "ext": null             // Custom extension for the file
}
```
**return** a Promise containing the path of the file.

### utils.media.deleteFile(filePath)
Deletes a file located at the provided relative path. The base path is the one set in the init() config.

**return** a Promise.

### utils.media.createArchive(archiveName, directoryPath, paths, log)
Create an archive from a list of path.

**archiveName** - _string_ - Archive name
**directoryPath** - _string_ - Path to the directory where to create the archive
**paths** - _Array<string>_ - File paths array
**log** - _function_ - logger function

**return** a Promise containing the path of the archive.

### utils.templater.getCompiledHtml(templatePath, data)
Compile a Handlebar template and inject the provided data in it and generate an HTML output.

**return** a Promise containing the compiled html.

For more detail on the template, see the [Handlebars documentation](http://handlebarsjs.com/)

### utils.validate
It is a simple object containing common Joi validators for request validation.
Implementation detail:
```javascript
{
  "id": Joi.number().integer().min(1).required(),
  "fileName": Joi.string().required(),
}
```

## Contributing
This project uses [semantic-release](https://github.com/semantic-release/semantic-release) to automatically handle semver bumps based on the commits messages.

To simplify commits messages redaction you can use `npm run cm` instead of `git commit`. To use that command make sure to `git add` your changes before.

This repo is configured to forbid commit messages that do not follow the [Angular conventional changelog commit message format](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit).
