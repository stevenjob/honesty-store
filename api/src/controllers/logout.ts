import HTTPStatus = require('http-status');
import { authenticateAccessToken } from '../middleware/authenticate';

const expireRefreshToken = async (userID): {} => {
    throw new Error(`logout not supported yet (expireRefreshToken())`);
};

export default (router) => {
  router.post(
    '/logout',
    authenticateAccessToken,
    (req, res) => {
      promiseResponse<{}>(
        expireRefreshToken(req.user.id),
        response,
          HTTPStatus.OK);
    });
};
