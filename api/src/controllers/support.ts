import isEmail = require('validator/lib/isEmail');

import { sendEmail } from '@honesty-store/service/lib/email';
import { Key } from '@honesty-store/service/lib/key';
import { getStoreFromCode, getStoreFromId } from '@honesty-store/store';
import { getUser, User, userRegistered } from '@honesty-store/user';
import { authenticateAccessToken } from '../middleware/authenticate';

export interface MailStoreAgentParams {
  key: Key;

  storeCode: string;
  fromUser: User;

  subject: string;
  message: string;
  fromEmailAddress?: string;

  fields: {
    title: string;
    value: string;
  }[];
}

export const mailStoreAgent = async ({ key, storeCode, fromUser, subject, message, fields, fromEmailAddress }: MailStoreAgentParams) => {
  const validatedEmailAddress = fromUser.emailAddress || (fromEmailAddress && isEmail(fromEmailAddress) ? fromEmailAddress : null);
  const prefixedEmailAddress = `${userRegistered(fromUser) ? '' : '(unregistered) '}${validatedEmailAddress}`;

  const { agentId } = await getStoreFromCode(key, storeCode);
  const { emailAddress: agentEmailAddress } = await getUser(key, agentId);

  if (agentEmailAddress == null) {
    throw new Error('agent doesn\'t have an email address');
  }

  const details = [
    {
      title: 'User Email',
      value: prefixedEmailAddress
    },
    {
      title: 'User ID',
      value: fromUser.id
    },
    {
      title: 'Default Store',
      value: fromUser.defaultStoreId
    },
    ...fields
  ].reduce((msg, { title, value }) => `${msg}${title}: ${value}\n`, '');

  const concatenatedMessage = `honesty.store message from ${prefixedEmailAddress}\n

${message}

${details}
`;

  return await sendEmail({
    to: [agentEmailAddress],
    replyTo: [validatedEmailAddress],
    subject,
    message: concatenatedMessage
  });
};

const sendSupportMessage = async ({ key, user, message, fromEmailAddress, userAgent }) => {
  const validatedUserAgent = userAgent.substr(0, 250);
  const { code: storeCode } = await getStoreFromId(key, user.defaultStoreId);

  return await mailStoreAgent({
    key,
    storeCode,
    fromUser: user,
    subject: 'Support Message',
    fromEmailAddress,
    message,
    fields: [{
      title: 'User Agent',
      value: validatedUserAgent
    }]
  });
};

export default (router) => {
  router.post(
    '/support',
    authenticateAccessToken,
    async (key, _params, { message, emailAddress, userAgent }, { user }) =>
      await sendSupportMessage({ key, user, message, fromEmailAddress: emailAddress, userAgent }));
};
