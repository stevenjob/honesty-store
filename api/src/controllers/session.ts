import HTTPStatus = require('http-status');
import { ServiceRouterCode } from '../../../service/src/router';
import { authenticateRefreshToken } from '../middleware/authenticate';
import { getSessionData } from '../services/session';

export default (router) => {
  router.post(
    '/session',
    authenticateRefreshToken,
    async (key, _params, _body, { user }) => {
      try {
        return await getSessionData(key, { user });
      } catch (e) {
        throw new ServiceRouterCode(HTTPStatus.INTERNAL_SERVER_ERROR, e.message);
      }
    });
};
