import request from 'request';
import { assert } from 'chai';
import { getUser, registerUser, __users } from '@honesty-store/src/services/user';

require('../../src/app');

const baseURL = 'http://localhost:3000/api/v1';

describe('/logout', () => {
  beforeEach(() => {
    __users.length = 0;
  });

  it('should \'expire\' the user\'s refresh token',
    (done) => {
      const { id, accessToken } = registerUser('sl-ncl');
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
