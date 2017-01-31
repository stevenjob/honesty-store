import HTTPStatus = require('http-status');
import { promiseResponse } from '../../../service/src/promiseResponse';
import { authenticateRefreshToken } from '../middleware/authenticate';
import { getSessionData, SessionData } from '../services/session';

export default (router) => {
  router.post(
    '/session',
    authenticateRefreshToken,
    (request, response) => {
      const { key } = request;
      promiseResponse<SessionData>(
        getSessionData(key, { user: request.user }),
        request,
        response,
        HTTPStatus.INTERNAL_SERVER_ERROR);
    });
};
