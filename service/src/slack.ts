import fetch from 'node-fetch';
import { v4 as uuid } from 'uuid';

import { Key } from './key';
import { info } from './log';

type Channel = 'support' | 'purchases';

interface SlackMessageParams {
  key: Key;
  message: string;
  channel: Channel;
  fields: {
    title: string;
    value: string;
  }[];
}

const urlForChannel = (channel: Channel) => {
  switch (channel) {
    case 'support':
      return 'https://hooks.slack.com/services/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';
    case 'purchases':
      return 'https://hooks.slack.com/services/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';
    default:
      throw new Error(`unknown channel '${channel}'`);
  }
};

export const sendSlackMessage = async ({ key, message, channel, fields: extraFields }: SlackMessageParams) => {
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

  const url = urlForChannel(channel);
  const response = await fetch(url, {
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
