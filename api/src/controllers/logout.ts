import HTTPStatus = require('http-status');
import { authenticateAccessToken } from '../middleware/authenticate';
import { expireRefreshToken } from '../services/user';

export default (router) => {
  router.post(
    '/logout',
    authenticateAccessToken,
    (req, res) => {
      expireRefreshToken(req.userID);
      res.status(HTTPStatus.OK)
        .json({ response: {} });
    });
};
