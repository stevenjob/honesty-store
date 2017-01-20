import HTTPStatus = require('http-status');
import { authenticateAccessToken } from '../middleware/authenticate';
import { expireRefreshToken } from '../services/user';

export default (router) => {
  router.post(
    '/logout',
    authenticateAccessToken,
    (req, res) => {
      expireRefreshToken(req.userID)
        .then(() =>
          res.status(HTTPStatus.OK)
            .json({ response: {} }))
        .catch((error) =>
          res.status(HTTPStatus.OK)
            .json({ error: error.message }));
    });
};
