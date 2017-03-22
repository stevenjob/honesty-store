import fetch from 'node-fetch';
import isEmail = require('validator/lib/isEmail');
import uuid = require('uuid/v4');

import { Key } from '../../../service/src/key';
import { info } from '../../../service/src/log';
import { authenticateAccessToken } from '../middleware/authenticate';

interface SlackMessageParams {
  key: Key;
  user: any;
  message: string;
  emailAddress?: string;
  fields: {
    title: string;
    value: string;
  }[];
}

export const sendSlackMessage = async ({ key, user, message, emailAddress, fields }: SlackMessageParams) => {
  const validatedEmailAddress = user.emailAddress || (emailAddress && isEmail(emailAddress) ? emailAddress : null);
  const requestId = uuid();

  const response = await fetch('https://hooks.slack.com/services/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', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      username: 'Support Bot',
      icon_emoji: ':ghost:',
      attachments: [
        {
          fallback: `New support request (${requestId}) received ${message} ${user.id} ${validatedEmailAddress}`,
          fields: [
            {
              title: 'Message',
              value: message
            },
            {
              title: 'Request',
              value: requestId
            },
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
              value: validatedEmailAddress
            },
            ...fields
          ]
        }
      ]
    })
  });
  info(key, 'Support message sent', message, response.status, requestId);
  if (response.status !== 200) {
    throw new Error(`Unexpected response code from slack ${response.status}`);
  }
};

const sendSlackSupportMessage = async ({ key, user, message, emailAddress, userAgent }) => {
  const validatedUserAgent = userAgent.substr(0, 250);
  return await sendSlackMessage({
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
