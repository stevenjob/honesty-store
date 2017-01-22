import HTTPStatus = require('http-status');
import { createUserKey } from '../../../service/src/key';
import { authenticateRefreshToken } from '../middleware/authenticate';
import { getSessionData, SessionData } from '../services/session';
import { promiseResponse } from '../../../service/src/endpoint-then-catch';

export default (router) => {
  router.post(
    '/session',
    authenticateRefreshToken,
    (request, response) => {
      promiseResponse<SessionData>(
        getSessionData(createUserKey({ userId: request.user.id }), { userID: request.user.id, accountID: request.user.accountId }),
          response,
          HTTPStatus.INTERNAL_SERVER_ERROR);
    });
};
