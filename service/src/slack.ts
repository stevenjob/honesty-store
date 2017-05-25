import fetch from 'node-fetch';
import { v4 as uuid } from 'uuid';

import { Key } from './key';
import { info } from './log';

interface SlackMessageParams {
  key: Key;
  message: string;
  fields: {
    title: string;
    value: string;
  }[];
}

export const sendSlackMessage = async ({ key, message, fields: extraFields }: SlackMessageParams) => {
  const requestId = uuid();
  const fields = [
    {
      title: 'Message',
      value: message
    },
    {
      title: 'Request',
      value: requestId
    },
    ...extraFields
  ];

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
          fallback: JSON.stringify(fields),
          fields
        }
      ]
    })
  });
  info(key, 'Support message sent', message, response.status, requestId);
  if (response.status !== 200) {
    throw new Error(`Unexpected response code from slack ${response.status}`);
  }
};

