import HTTPStatus = require('http-status');
import { authenticateRefreshToken } from '../middleware/authenticate';
import { getSessionData, SessionData } from '../services/session';
import { promiseResponse } from '../../../service/src/endpoint-then-catch';

const updateSession = async (userID) => {
  return await getSessionData(userID);
};

export default (router) => {
  router.post(
    '/session',
    authenticateRefreshToken,
    (request, response) => {
      promiseResponse<SessionData>(
          updateSession(request.userID),
          response,
          HTTPStatus.INTERNAL_SERVER_ERROR);
    });
};
