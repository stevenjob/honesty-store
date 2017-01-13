const request = require('request');
const assert = require('chai').assert;
const { getUser, registerUser, __users } = require('../../src/services/user');

require('../../src/app');

const baseURL = 'http://localhost:3000/api/v1';

describe('/logout', () => {
  beforeEach(() => {
    __users.length = 0;
  });

  it('should \'expire\' the user\'s refresh token',
    (done) => {
      const { id, accessToken } = registerUser('SL-NCL');
      request.post({
        uri: `${baseURL}/logout`,
        auth: {
          bearer: accessToken,
        },
      },
      () => {
        const { refreshToken } = getUser(id);
        assert.isNull(refreshToken);
        done();
      });
    });
});
