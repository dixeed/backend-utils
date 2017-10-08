'use strict';

const archiver = require('archiver');
const slug = require('limax');
const path = require('path');
const fse = require('fs-extra');
const Q = require('q');

module.exports = config => {
  const mediaObj = {
    createImage(stream, filename, filePath, options = {}) {
      const defaultOpts = { addTimestamp: true, ext: null };
      const mergedOpts = Object.assign(defaultOpts, options);
      const deferred = Q.defer();
      const fileExtension = path.extname(filename);
      const file = slug(filename.substr(0, filename.length - fileExtension.length));
      const directoryBase = `${config.publicImgFolder}/${filePath}`;
      let imgPath = `${directoryBase}/`;

      if (mergedOpts.addTimestamp === true) {
        const timestamp = new Date().getTime().toString();
        imgPath = `${imgPath}${timestamp}-${file}`;
      } else {
        imgPath = `${imgPath}${file}`;
      }

      if (fileExtension === '' && mergedOpts.ext !== null) {
        imgPath = `${imgPath}.${mergedOpts.ext}`;
      } else {
        imgPath = `${imgPath}${fileExtension}`;
      }

      // make sure the path exists so we can write to it
      fse.mkdirs(directoryBase, err => {
        if (err) {
          deferred.reject(err);
        }

        const writeStream = fse.createWriteStream(imgPath);

        stream.on('end', () => deferred.resolve(imgPath));
        stream.on('error', err2 => {
          // when an error occurs writable stream is not closed so we do it ourselves
          writeStream.end();
          deferred.reject(err2);
        });

        stream.pipe(writeStream);
      });

      return deferred.promise;
    },

    createFile(stream, filename, directoryPath, options = {}) {
      const defaultOpts = { addTimestamp: true, ext: null };
      const mergedOpts = Object.assign(defaultOpts, options);
      const deferred = Q.defer();
      const fileExtension = path.extname(filename);
      const file = slug(filename.substr(0, filename.length - fileExtension.length));
      const directoryBase = `${config.publicFileFolder}/${directoryPath}`;
      let filePath = `${directoryBase}/`;

      if (mergedOpts.addTimestamp === true) {
        const timestamp = new Date().getTime().toString();
        filePath = `${filePath}${timestamp}-${file}`;
      } else {
        filePath = `${filePath}${file}`;
      }

      if (fileExtension === '' && mergedOpts.ext !== null) {
        filePath = `${filePath}.${mergedOpts.ext}`;
      } else {
        filePath = `${filePath}${fileExtension}`;
      }

      // make sure the path exists so we can write to it
      fse.mkdirs(directoryBase, err => {
        if (err) {
          deferred.reject(err);
        }

        const writeStream = fse.createWriteStream(filePath);

        stream.on('end', () => deferred.resolve(filePath));
        stream.on('error', err2 => {
          // when an error occurs writable stream is not closed so we do it ourselves
          writeStream.end();
          deferred.reject(err2);
        });

        stream.pipe(writeStream);
      });

      return deferred.promise;
    },

    deleteFile(filePath) {
      const deferred = Q.defer();
      fse.remove(filePath, err => {
        if (err) {
          return deferred.reject(err);
        }

        return deferred.resolve();
      });

      return deferred.promise;
    },

    /**
   * Create an archive from a list of path
   * @param {string} archiveName Archive name
   * @param {string} directoryPath Path to the directory where to create the archive
   * @param {array of string} paths File paths array
   * @param {function} log logger function
   */
    createArchive(archiveName, directoryPath, paths, log) {
      const archiveDest = path.resolve(config.publicFileFolder, directoryPath);
      const zipPath = path.resolve(archiveDest, archiveName);
      const archive = archiver('zip', { zlib: { level: 9 } });

      return Q.Promise((resolve, reject) => {
        // Make sure the path exists so we can write to it
        fse.mkdirs(archiveDest, mkdirsErr => {
          if (mkdirsErr) {
            return reject(mkdirsErr);
          }

          const output = fse.createWriteStream(zipPath);
          output.on('error', err2 => {
            archive.abort();
            reject(err2);
          });

          archive.on('end', () => {
            log(['log'], `Archive "${archiveName}" of ${archive.pointer()} bytes written`);
            resolve(zipPath);
          });

          // good practice to catch warnings (ie stat failures and other non-blocking errors)
          archive.on('warning', err => {
            // if (err.code === 'ENOENT') {
            //   return log(['warning', 'archive'], err);
            // }

            output.close();
            return reject(err);
          });

          // good practice to catch this error explicitly
          archive.on('error', err => {
            output.close();
            reject(err);
          });

          archive.pipe(output);

          paths.map(filePath => {
            const name = path.basename(filePath);
            return archive.file(filePath, { name });
          });

          archive.finalize();
          return null;
        });
      });
    },
  };

  return mediaObj;
};
