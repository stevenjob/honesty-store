import { config, SES } from 'aws-sdk';

config.region = process.env.AWS_REGION;

type EmailMessage = {
  to: string[];
  replyTo?: string[];
  subject: string;
  message: string;
};

const noreplyAddress = 'no-reply@honesty.store';

export const sendEmail = async ({ to, replyTo, subject, message }: EmailMessage) => {
  const response = await new SES({ apiVersion: '2010-12-01' })
    .sendEmail({
      Destination: {
        ToAddresses: to
      },
      ReplyToAddresses: replyTo,
      Source: noreplyAddress,
      Message: {
        Subject: { Charset: 'UTF-8', Data: subject },
        Body: { Text: { Charset: 'UTF-8', Data: message } }
      }
    })
    .promise();

  return response.MessageId;
};
