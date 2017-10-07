'use strict';

const nodemailer = require('nodemailer');

module.exports = Mailer;

function Mailer(transOptions) {
  let transporter = null;
  this.sendMail = sendMail;

  init();

  function init() {
    transporter = nodemailer.createTransport(transOptions);
  }

  function sendMail(options) {
    return transporter.sendMail(options);
  }
}
