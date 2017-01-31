import HTTPStatus = require('http-status');
import { authenticateAccessToken } from '../middleware/authenticate';
import { promiseResponse } from '../../../service/src/promiseResponse';
import { logout } from  '../../../user/src/client';

export default (router) => {
  router.post(
    '/logout',
    authenticateAccessToken,
    (req, res) => {
      promiseResponse<{}>(
        logout(req.key, req.user.id),
        req,
        res,
        HTTPStatus.OK);
    });
};
