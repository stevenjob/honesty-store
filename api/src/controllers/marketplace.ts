import { authenticateAccessToken } from '../middleware/authenticate';
import { mailStoreAgent } from './support';

export default (router) => {
  router.post(
    '/marketplace',
    authenticateAccessToken,
    async (
      key,
      _params,
      { item: { description, totalPrice, quantity }, storeCode },
      { user }
    ) => {
      const subject = 'Marketplace Request';

      return await mailStoreAgent({
        key,
        storeCode,
        fromUser: user,
        subject,
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
          }
        ]
      });
    });
};
