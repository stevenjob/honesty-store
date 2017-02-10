import { authenticateRefreshToken } from '../middleware/authenticate';
import { getSessionData } from '../services/session';

export default (router) => {
  router.post(
    '/session',
    authenticateRefreshToken,
    async (key, _params, _body, { user }) => await getSessionData(key, { user }));
};
