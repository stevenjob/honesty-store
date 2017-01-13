import HTTPStatus = require('http-status');
import { authenticateRefreshToken } from '../middleware/authenticate';
import { updateAccessToken } from '../services/user';
import { getSessionData } from '../services/session';

export default (router) => {
  router.post(
    '/session',
    authenticateRefreshToken,
    (request, response) => {
      const sessionResponse: any = getSessionData(request.userID);

      const { accessToken } = updateAccessToken(request.userID);

      sessionResponse.accessToken = accessToken;
      response.status(HTTPStatus.OK)
        .json({ response: sessionResponse });
    });
};
