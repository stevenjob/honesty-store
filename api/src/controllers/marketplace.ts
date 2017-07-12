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

      const adminUrl = `https://honesty.store/admin/listing/${storeCode}`;

      const message = `A marketplace request has been made - if you approve of this, you can list the item(s) at ${adminUrl}.
Replying to this email will send your message to the user who submitted the request.

See the below "Item" fields for more details.
`;

      return await mailStoreAgent({
        key,
        storeCode,
        fromUser: user,
        subject,
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
          }
        ]
      });
    });
};
