'use strict';

const fs = require('fs');
const Q = require('q');
const handlebars = require('handlebars');

exports.getCompiledHtml = (templatePath, data) => {
  const deferred = Q.defer();
  fs.readFile(templatePath, 'utf8', (err, fileContent) => {
    if (err) {
      deferred.reject(err);
    }

    const compiledHtml = handlebars.compile(fileContent)(data);
    deferred.resolve(compiledHtml);
  });

  return deferred.promise;
};
