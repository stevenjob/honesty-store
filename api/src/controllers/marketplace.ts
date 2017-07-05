import { authenticateAccessToken } from '../middleware/authenticate';
import { sendSlackUserMessage } from './support';

export default (router) => {
  router.post(
    '/marketplace',
    authenticateAccessToken,
    async (
      key,
      _params,
      { item: { description, totalPrice, quantity } },
      { user }
    ) => {
      const message = 'Marketplace request';

      return await sendSlackUserMessage({
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
          }
        ]
      });
    });
};
