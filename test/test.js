/* eslint-disable no-unused-expressions */
'use strict';

const chai = require('chai');
const expectToBeAPromise = require('expect-to-be-a-promise');
const fs = require('fs-extra');

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

    it('should have a deleteFile method', () => {
      expect(utils.media.deleteFile).to.be.a('function');
    });

    it('should have a createArchive method', () => {
      expect(utils.media.createArchive).to.be.a('function');
    });

    describe('#createImage()', () => {
      let stream = null;

      beforeEach(() => {
        stream = fs.createReadStream('test/images/placeholder.png');
        fs.removeSync('/tmp/dixeed-utils-backend/images'); // eslint-disable-line no-sync
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

      it('should be able to override the default extension', () => {
        return utils.media
          .createImage(stream, 'picture', '2', { addTimestamp: false, ext: 'png' })
          .then(imgPath => {
            expect(imgPath).to.be.a('string');
            expect(imgPath).to.equals('/tmp/dixeed-utils-backend/images/2/picture.png');
            expect(fs.existsSync(imgPath)).to.be.true; // eslint-disable-line no-sync
          });
      });
    });

    describe('#createFile()', () => {
      let stream = null;

      beforeEach(() => {
        stream = fs.createReadStream('test/files/test.txt');
        fs.removeSync('/tmp/dixeed-utils-backend/files'); // eslint-disable-line no-sync
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

      it('should be able to override the default extension', () => {
        return utils.media
          .createFile(stream, 'test', '2', { addTimestamp: false, ext: 'doc' })
          .then(filePath => {
            expect(filePath).to.be.a('string');
            expect(filePath).to.equals('/tmp/dixeed-utils-backend/files/2/test.doc');
            expect(fs.existsSync(filePath)).to.be.true; // eslint-disable-line no-sync
          });
      });
    });

    describe('#deleteFile()', () => {
      beforeEach(done => {
        fs.ensureDirSync('/tmp/dixeed-utils-backend/remove/'); // eslint-disable-line no-sync
        const writeStream = fs.createWriteStream('/tmp/dixeed-utils-backend/remove/test.txt');
        const stream = fs.createReadStream('test/files/test.txt');

        stream.on('end', done);
        stream.on('error', err => {
          writeStream.end();
          done(err);
        });

        stream.pipe(writeStream);
      });

      it('should delete an existing file', () => {
        return utils.media.deleteFile('/tmp/dixeed-utils-backend/remove/test.txt').then(() => {
          expect(fs.existsSync('/tmp/dixeed-utils-backend/remove/test.txt')).to.be.false; // eslint-disable-line no-sync
        });
      });
    });

    describe('#createArchive()', () => {
      beforeEach(() => {
        fs.removeSync('/tmp/dixeed-utils-backend/files/archive'); // eslint-disable-line no-sync
      });

      it('should create an archive containing the different file', () => {
        return utils.media
          .createArchive(
            'test-archive.zip',
            'archive',
            ['test/files/test.txt', 'test/images/placeholder.png'],
            () => {}
          )
          .then(archivePath => {
            expect(archivePath).to.be.a('string');
            expect(archivePath).to.equals(
              '/tmp/dixeed-utils-backend/files/archive/test-archive.zip'
            );
            expect(fs.existsSync(archivePath)).to.be.true; // eslint-disable-line no-sync
          });
      });

      it('should throw an error if one of the files does not exist', () => {
        return utils.media
          .createArchive(
            'test-archive.zip',
            'archive',
            ['test/files/test.txt', 'a/path/that/does/not/exist.png'],
            console.log
          )
          .then(
            archivePath => {
              throw new Error(`Unexpected resolution of the promise. archivePath: ${archivePath}`);
            },
            err => {
              expect(err).to.be.an('error');
            }
          );
      });
    });
  });

  describe('#templater', () => {
    it('should have a getCompiledHtml method', () => {
      expect(utils.templater.getCompiledHtml).to.be.a('function');
    });

    describe('#getCompiledHtml()', () => {
      it('should return the content of a file', () => {
        return utils.templater
          .getCompiledHtml('test/files/test.txt', null)
          .then(compiledContent => {
            expect(compiledContent).to.be.a('string');
            expect(compiledContent).to.equal('azerty\n');
          });
      });

      it('should throw an error if an invalid path is passed', () => {
        return utils.templater.getCompiledHtml('test/files/inexistant', null).then(
          compiledContent => {
            throw new Error(
              `Unexpected resolution of the promise. compiledContent: ${compiledContent}`
            );
          },
          err => {
            expect(err).to.be.an('error');
          }
        );
      });

      it('should compile the content of a file with the passed data', () => {
        return utils.templater
          .getCompiledHtml('test/files/template.txt', { firstname: 'M.', lastname: 'ANDERSON' })
          .then(compiledContent => {
            expect(compiledContent).to.be.a('string');
            expect(compiledContent).to.equal('Hello M. ANDERSON !\n');
          });
      });
    });
  });

  describe('#validate', () => {
    it('should have an id property (Joi)', () => {
      expect(utils.validate.id).to.be.an('object');
      expect(utils.validate.id)
        .to.have.property('schemaType')
        .but.not.own.property('schemaType');
    });

    it('should have a fileName property (Joi)', () => {
      expect(utils.validate.fileName).to.be.an('object');
      expect(utils.validate.fileName)
        .to.have.property('schemaType')
        .but.not.own.property('schemaType');
    });

    describe('#id', () => {
      it('should validate an integer', () => {
        const result = utils.validate.id.validate(5);
        expect(result.error).to.be.null;
      });

      it('should reject other than an integer', () => {
        const result = utils.validate.id.validate('test');
        expect(result.error).to.be.an('error');
      });

      it('should reject integer smaller than 1', () => {
        const result = utils.validate.id.validate(0);
        expect(result.error).to.be.an('error');
      });

      it('should validate as a mandatory parameter', () => {
        const result = utils.validate.id.validate(null);
        expect(result.error).to.be.an('error');
      });
    });

    describe('#fileName', () => {
      it('should validate a string', () => {
        const result = utils.validate.fileName.validate('test');
        expect(result.error).to.be.null;
      });

      it('should reject other than a string', () => {
        const result = utils.validate.fileName.validate(5);
        expect(result.error).to.be.an('error');
      });

      it('should validate as a mandatory parameter', () => {
        const result = utils.validate.fileName.validate(null);
        expect(result.error).to.be.an('error');
      });
    });
  });
});
