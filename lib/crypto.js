'use strict';

const crypto = require('crypto');
const Promise = require('bluebird');

module.exports = algorithm => {
  const randomBytesAsync = Promise.promisify(crypto.randomBytes);

  return {
    /**
   * Generates a cryptographic hash.
   * @param  {INTEGER} seedSize Size of the seed used for the hash generation.
   * @param  {string} data     The data to be added to the hash.
   * @return {promise}          The promise containing the a hash string
   *                            in hexadecimal format if resolved.
   */
    getSecuredHash(seedSize, data) {
      return randomBytesAsync(seedSize).then(seed => {
        const hash = crypto
          .createHash(algorithm)
          .update(`${seed}${data}`, 'utf8')
          .digest('hex');

        return hash;
      });
    },
  };
};
