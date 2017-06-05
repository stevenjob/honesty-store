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

const slackChannelName = (channel: Channel) => `#${process.env.SLACK_CHANNEL_PREFIX}${channel}`;
const slackPostUrl = 'https://hooks.slack.com/services/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';

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

  const response = await fetch(slackPostUrl, {
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
      ],
      channel: slackChannelName(channel)
    })
  });
  info(key, 'Support message sent', message, response.status, requestId);
  if (response.status !== 200) {
    throw new Error(`Unexpected response code from slack ${response.status}`);
  }
};

export const sendSlackMessageOneLine = async ({ key, message, channel }) => {
  const response = await fetch(slackPostUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      username: 'Support Bot',
      icon_emoji: ':ghost:',
      text: message,
      channel: slackChannelName(channel)
    })
  });
  info(key, 'One-line message sent', message, response.status);
  if (response.status !== 200) {
    throw new Error(`Unexpected response code from slack ${response.status}`);
  }
};
