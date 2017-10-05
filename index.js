'use strict';

module.exports = config => {
  const main = (module.exports = {});

  main.validate = require('./lib/validate');
  main.media = require('./lib/media')(config.media);
  main.crypto = require('./lib/crypto')(config.algorythm);
  main.Mailer = require('./lib/mailer');
  main.templater = require('./lib/templater');

  return main;
};
