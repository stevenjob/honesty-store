import { assertValidEmailAddress } from '@honesty-store/service/lib/assert';
import { sendEmail } from '@honesty-store/service/lib/email';
import { Key } from '@honesty-store/service/lib/key';
import { getStoreFromCode, getStoreFromId } from '@honesty-store/store';
import { getUser, userRegistered } from '@honesty-store/user';
import { authenticateAccessToken } from '../middleware/authenticate';

const emailStoreAgent = false;

export interface MailStoreAgentParams {
  key: Key;

  replyTo: string;
  storeCode: string;

  subject: string;
  message: string;
}

export const mailStoreAgent = async (
  { key, replyTo, subject, message, storeCode }: MailStoreAgentParams
) => {
  let agentEmailAddress: string;

  if (emailStoreAgent) {
    const { agentId } = await getStoreFromCode(key, storeCode);
    const { emailAddress } = await getUser(key, agentId);

    if (emailAddress == null) {
      throw new Error('agent doesn\'t have an email address');
    }

    agentEmailAddress = emailAddress;
  } else {
    agentEmailAddress = 'support@honesty.store';
  }

  return await sendEmail({
    to: [agentEmailAddress],
    replyTo: [replyTo],
    subject,
    message
  });
};

const sendSupportMessage = async ({ key, user, message: userMessage, enteredEmailAddress, userAgent }) => {
  assertValidEmailAddress(enteredEmailAddress);

  const validatedUserAgent = userAgent.substr(0, 250);
  const validatedEmailAddress = user.emailAddress || enteredEmailAddress;
  const defaultStore = (await getStoreFromId(key, user.defaultStoreId)).code;

  const message =
`honesty.store support message from ${validatedEmailAddress}${userRegistered(user) ? '' : ' (unregistered)'}:

${userMessage}

User Email: ${validatedEmailAddress}
User ID: ${user.id}
Default Store: ${defaultStore}
User Agent: ${validatedUserAgent}
`;

  const { code: storeCode } = await getStoreFromId(key, user.defaultStoreId);

  return await mailStoreAgent({
    key,
    subject: 'Support Message',
    message,
    replyTo: validatedEmailAddress,
    storeCode
  });
};

export default (router) => {
  router.post(
    '/support',
    authenticateAccessToken,
    async (key, _params, { message, emailAddress, userAgent }, { user }) =>
      await sendSupportMessage({ key, user, message, enteredEmailAddress: emailAddress, userAgent }));
};
