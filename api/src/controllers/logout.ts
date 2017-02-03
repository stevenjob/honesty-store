import HTTPStatus = require('http-status');
import { promiseResponse } from '../../../service/src/promiseResponse';
import { logout } from  '../../../user/src/client';
import { authenticateAccessToken } from '../middleware/authenticate';

// tslint:disable-next-line:export-name
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
