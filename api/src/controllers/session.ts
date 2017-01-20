import HTTPStatus = require('http-status');
import { authenticateRefreshToken } from '../middleware/authenticate';
import { updateAccessToken } from '../services/user';
import { getSessionData, SessionData } from '../services/session';
import { promiseResponse } from '../../../service/src/endpoint-then-catch';

const session = async (userID) => {
    const sessionResponse = await getSessionData(userID)
    const { accessToken } = updateAccessToken(userID); // this is going to get rebased the funk out

    return {
        ...sessionResponse,
        accessToken,
    };
};

const updateSession = async (userID) => {
  const [sessionResponse, { accessToken }] = await Promise.all([
    getSessionData(userID),
    updateAccessToken(userID),
  ]);

  return {
    ...sessionResponse,
    accessToken,
  };
};

export default (router) => {
  router.post(
    '/session',
    authenticateRefreshToken,
    (request, response) => {
      promiseResponse<SessionData>(
          session(request.userID),
          response,
          HTTPStatus.INTERNAL_SERVER_ERROR);
    });
};
