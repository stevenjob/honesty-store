import { Box, flagOutOfStock, getBoxesForStore, markBoxAsReceived } from '@honesty-store/box/src/client';
import { CodedError } from '@honesty-store/service/src/error';
import isEmail = require('validator/lib/isEmail');
import { authenticateAccessToken } from '../middleware/authenticate';
import { getSessionData  } from '../services/session';
import { boxIsReceivedAndOpen } from '../services/store';

const itemInBox = (itemId) => ({ boxItems }: Box) => boxItems.some(item => item.itemID === itemId);

// tslint:disable-next-line:export-name
export default (router) => {
  router.post(
    '/out-of-stock',
    authenticateAccessToken,
    async (key, _params, { itemId }, { user }) => {
      const boxes = await getBoxesForStore(key, user.defaultStoreId, boxIsReceivedAndOpen);
      const depleted = Date.now();

      const flagPromises = boxes
        .filter(itemInBox(itemId))
        .map(box => flagOutOfStock({ key, boxId: box.id, itemId, depleted }));

      await Promise.all(flagPromises);

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
