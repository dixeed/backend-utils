'use strict';

const archiver = require('archiver');
const slug = require('limax');
const path = require('path');
const fse = require('fs-extra');
const Q = require('q');

module.exports = config => {
  return {
    createImage(stream, filePath) {
      const deferred = Q.defer();
      const timestamp = new Date().getTime().toString();
      const fileExtension = path.extname(stream.hapi.filename);
      const fileName = slug(
        stream.hapi.filename.substr(0, stream.hapi.filename.length - fileExtension.length)
      );
      const directoryBase = `${config.publicImgFolder}/${filePath}`;
      let imgPath = `${directoryBase}/${timestamp + fileName}`;

      if (path.extname(fileName) === '' && stream.hapi.headers['content-type']) {
        const [, ext] = stream.hapi.headers['content-type'].split('/');
        imgPath = `${imgPath}.${ext}`;
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

    createFile(stream, directoryPath, addTimestamp = true) {
      const deferred = Q.defer();
      let fileExtension = path.extname(stream.hapi.filename);
      const fileName = slug(
        stream.hapi.filename.substr(0, stream.hapi.filename.length - fileExtension.length)
      );
      const directoryBase = `${config.publicFileFolder}/${directoryPath}`;
      let filePath = `${directoryBase}/`;

      if (addTimestamp === true) {
        const timestamp = new Date().getTime().toString();
        filePath = `${filePath}${timestamp}-${fileName}`;
      } else {
        filePath = `${filePath}${fileName}`;
      }

      if (fileExtension === '' && stream.hapi.headers['content-type']) {
        const [, ext] = stream.hapi.headers['content-type'].split('/');
        filePath = `${filePath}.${ext}`;
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

    deleteImage(filePath) {
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
   * @param {array of string} paths File paths array
   * @param {object} request Hapi's request object for log matter
   */
    createArchive(archiveName, directoryPath, paths, request) {
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
            request.log(['log'], `Archive "${archiveName}" of ${archive.pointer()} bytes written`);
            resolve(zipPath);
          });

          // good practice to catch warnings (ie stat failures and other non-blocking errors)
          archive.on('warning', err => {
            if (err.code === 'ENOENT') {
              return request.log(['warning', 'archive'], err);
            }

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
};
