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
  const channels = {
    support: {
      live: 'https://hooks.slack.com/services/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',
      test: 'https://hooks.slack.com/services/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'
    },
    purchases: {
      live: 'https://hooks.slack.com/services/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',
      test: 'https://hooks.slack.com/services/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'
    }
  };

  if (!(channel in channels)) {
    throw new Error(`unknown channel '${channel}'`);
  }

  const channelType = process.env.SLACK_CHANNEL_TYPE;
  const url = channels[channel][channelType];
  if (url == null) {
    throw new Error(`no channel for $SLACK_CHANNEL_TYPE '${channelType}'`);
  }

  return url;
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

export const sendSlackMessageOneLine = async ({ key, message, channel }) => {
  const url = urlForChannel(channel);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      username: 'Support Bot',
      icon_emoji: ':ghost:',
      text: message
    })
  });
  info(key, 'One-line message sent', message, response.status);
  if (response.status !== 200) {
    throw new Error(`Unexpected response code from slack ${response.status}`);
  }
};
