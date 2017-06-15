import { markBoxAsReceived } from '@honesty-store/box';
import { CodedError } from '@honesty-store/service/lib/error';
import { updateItemCount } from '@honesty-store/store';
import isEmail = require('validator/lib/isEmail');
import { authenticateAccessToken } from '../middleware/authenticate';
import { getSessionData  } from '../services/session';

// tslint:disable-next-line:export-name
export default (router) => {
  router.post(
    '/out-of-stock',
    authenticateAccessToken,
    async (key, _params, { itemId }, { user }) => {
      await updateItemCount(key, user.defaultStoreId, itemId, 0, user.id);
      return {};
    });

  router.post(
    '/received/:boxId',
    authenticateAccessToken,
    async (key, { boxId }, {}, { user }) => {
      const { emailAddress } =  user;
      if (emailAddress == null || !isEmail(emailAddress)) {
        throw new CodedError('FullRegistrationRequired', 'Full registration required to mark box as received');
      }
      await markBoxAsReceived(key, boxId);

      return await getSessionData(key, { user });
    }
  );
};
