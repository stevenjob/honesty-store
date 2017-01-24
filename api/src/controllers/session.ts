import HTTPStatus = require('http-status');
import { authenticateRefreshToken } from '../middleware/authenticate';
import { getSessionData, SessionData } from '../services/session';
import { promiseResponse } from '../../../service/src/endpoint-then-catch';

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
