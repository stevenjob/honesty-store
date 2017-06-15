import isEmail = require('validator/lib/isEmail');

import { sendSlackMessage } from '@honesty-store/service/lib/slack';
import { userRegistered } from '@honesty-store/user/lib/client';
import { authenticateAccessToken } from '../middleware/authenticate';

export const sendSlackUserMessage = async ({ key, user, message, emailAddress = null, fields }) => {
  const validatedEmailAddress = user.emailAddress || (emailAddress && isEmail(emailAddress) ? emailAddress : null);
  const prefixedEmailAddress = `${userRegistered(user) ? '' : '(unregistered) '}${validatedEmailAddress}`;

  return await sendSlackMessage({
    key,
    message,
    channel: 'support',
    fields: [
      {
        title: 'User',
        value: user.id
      },
      {
        title: 'Store',
        value: user.defaultStoreId
      },
      {
        title: 'Email',
        value: prefixedEmailAddress
      },
      ...fields
    ]
  });
};

const sendSlackSupportMessage = async ({ key, user, message, emailAddress, userAgent }) => {
  const validatedUserAgent = userAgent.substr(0, 250);
  return await sendSlackUserMessage({
    key,
    user,
    message,
    emailAddress,
    fields: [
      {
        title: 'User Agent',
        value: validatedUserAgent
      }
    ]
  });
};

export default (router) => {
  router.post(
    '/support',
    authenticateAccessToken,
    async (key, _params, { message, emailAddress, userAgent }, { user }) =>
      await sendSlackSupportMessage({ key, user, message, emailAddress, userAgent }));
};
