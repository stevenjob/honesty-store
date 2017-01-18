import HTTPStatus = require('http-status');
import { authenticateAccessToken } from '../middleware/authenticate';

const expireRefreshToken = async (userID) => {
    throw new Error(`logout not supported yet (expireRefreshToken())`);
};

export default (router) => {
  router.post(
    '/logout',
    authenticateAccessToken,
    (req, res) => {
      expireRefreshToken(req.user.id)
        .then(() =>
          res.status(HTTPStatus.OK)
            .json({ response: {} }))
        .catch((error) =>
          res.status(HTTPStatus.OK)
            .json({ error: error.message }));
    });
};
