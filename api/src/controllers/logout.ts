import HTTPStatus = require('http-status');
import { authenticateAccessToken } from '../middleware/authenticate';
import { promiseResponse } from '../../../service/src/endpoint-then-catch';

const expireRefreshToken = async (userID): Promise<{}> => {
    throw new Error(`logout not supported yet (expireRefreshToken())`);
};

export default (router) => {
  router.post(
    '/logout',
    authenticateAccessToken,
    (req, res) => {
      promiseResponse<{}>(
        expireRefreshToken(req.user.id),
        res,
        HTTPStatus.OK);
    });
};
