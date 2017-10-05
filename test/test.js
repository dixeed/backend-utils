'use strict';

var expect = require('chai').expect;
var utils = require('../index')({ media: {}, algorythm: '' });

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
});
