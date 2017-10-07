/* eslint-disable no-unused-expressions */
'use strict';

const chai = require('chai');
const expectToBeAPromise = require('expect-to-be-a-promise');
const fs = require('fs');

chai.use(expectToBeAPromise);

const { expect } = chai;

const utils = require('../index');
utils.init({
  media: {
    publicImgFolder: '/tmp/dixeed-utils-backend/images',
    publicFileFolder: '/tmp/dixeed-utils-backend/files',
  },
  algorythm: 'SHA1',
});

describe('utils', () => {
  it('should have a crypto property defined', () => {
    expect(utils.crypto).to.exist;
  });

  it('should have a validate property defined', () => {
    expect(utils.validate).to.exist;
  });

  it('should have a media property defined', () => {
    expect(utils.media).to.exist;
  });

  it('should have a Mailer property defined', () => {
    expect(utils.Mailer).to.exist;
  });

  it('should have a templater property defined', () => {
    expect(utils.templater).to.exist;
  });

  describe('#crypto', () => {
    it('should have a getSecuredHash method', () => {
      expect(utils.crypto.getSecuredHash).to.be.a('function');
    });

    describe('#getSecuredHash()', () => {
      it('should return a Promise', () => {
        const result = utils.crypto.getSecuredHash(5, 'S4lt');
        expect(result).to.be.a.promise;

        return result;
      });

      it('should generate a SHA1 hash by default', () => {
        return utils.crypto.getSecuredHash(5, 'S4lt').then(hash => {
          expect(hash).to.have.lengthOf(40);
        });
      });

      it('should use another algorithm if specified (MD5)', () => {
        return utils.crypto.getSecuredHash(5, 'S4lt', 'MD5').then(hash => {
          expect(hash).to.have.lengthOf(32);
        });
      });
    });
  });

  describe('#Mailer', () => {
    let mailer = null;

    beforeEach(() => {
      mailer = new utils.Mailer({
        port: 587,
        host: 'mail.host.com',
        secure: false,
        auth: {
          user: 'user@domain.co',
          pass: 'password',
        },
      });
    });

    it('should return a constructor for the Mailer object', () => {
      expect(utils.Mailer).to.be.a('function');
      expect(mailer).to.be.a('object');
    });

    it('should create an object with a sendMail method', () => {
      expect(mailer.sendMail).to.be.a('function');
    });

    describe('#sendMail()', () => {
      it('should return a Promise', done => {
        const result = mailer.sendMail({}).catch(() => done());
        expect(result).to.be.a.promise;
      });
    });
  });

  describe('#media', () => {
    it('should have a createImage method', () => {
      expect(utils.media.createImage).to.be.a('function');
    });

    it('should have a createFile method', () => {
      expect(utils.media.createFile).to.be.a('function');
    });

    it('should have a deleteImage method', () => {
      expect(utils.media.deleteImage).to.be.a('function');
    });

    it('should have a createArchive method', () => {
      expect(utils.media.createArchive).to.be.a('function');
    });

    describe('#createImage', () => {
      let stream = null;

      beforeEach(() => {
        stream = fs.createReadStream('test/images/placeholder.png');
      });

      it('should create an image with the passed data', () => {
        return utils.media
          .createImage(stream, 'image.jpg', '1', { addTimestamp: false })
          .then(imgPath => {
            expect(imgPath).to.be.a('string');
            expect(imgPath).to.equals('/tmp/dixeed-utils-backend/images/1/image.jpg');
            expect(fs.existsSync(imgPath)).to.be.true; // eslint-disable-line no-sync
          });
      });
    });

    describe('#createFile', () => {
      let stream = null;

      beforeEach(() => {
        stream = fs.createReadStream('test/files/test.txt');
      });

      it('should create a file with the passed data', () => {
        return utils.media
          .createFile(stream, 'file.txt', '1', { addTimestamp: false })
          .then(filePath => {
            expect(filePath).to.be.a('string');
            expect(filePath).to.equals('/tmp/dixeed-utils-backend/files/1/file.txt');
            expect(fs.existsSync(filePath)).to.be.true; // eslint-disable-line no-sync
          });
      });
    });
  });
});
