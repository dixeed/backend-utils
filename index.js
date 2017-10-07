'use strict';

const validate = require('./lib/validate');
const media = require('./lib/media');
const crypto = require('./lib/crypto');
const Mailer = require('./lib/mailer');
const templater = require('./lib/templater');
const Hoek = require('hoek');

let initialized = false;

module.exports = {
  init(config) {
    Hoek.assert(initialized === false, 'You should call init() only once.');

    this.validate = validate;
    this.media = media(config.media);
    this.crypto = crypto(config.algorythm);
    this.Mailer = Mailer;
    this.templater = templater;

    initialized = true;
  },
};
