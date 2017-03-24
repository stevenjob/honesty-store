import { authenticateAccessToken } from '../middleware/authenticate';
import { sendSlackMessage } from './support';

export default (router) => {
  router.post(
    '/marketplace',
    authenticateAccessToken,
    async (
      key,
      _params,
      { item: { description, totalPrice, quantity, location, expiry } },
      { user }
    ) => {
      const message = 'Marketplace request';

      return await sendSlackMessage({
        key,
        user,
        message,
        fields:  [
          {
            title: 'Item-Description',
            value: description
          },
          {
            title: 'Item-Total (£)',
            value: totalPrice
          },
          {
            title: 'Item-Quantity',
            value: quantity
          },
          {
            title: 'Item-Location',
            value: location
          },
          {
            title: 'Item-Expiry',
            value: expiry
          }
        ]
      });
    });
};
