import fetch from 'node-fetch';
import HTTPStatus = require('http-status');
import { info } from '../../../service/src/log';
import { promiseResponse } from '../../../service/src/promiseResponse';
import { authenticateAccessToken } from '../middleware/authenticate';

const sendSlackSupportMessage = async ({ key, user, message }) => {
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
                    fallback: `New support request received ${message} ${user.id} ${user.emailAddress}`,
                    fields: [
                        {
                            title: 'Message',
                            value: message
                        },
                        {
                            title: 'User',
                            value: user.id
                        },
                        {
                            title: 'Email',
                            value: user.emailAddress
                        }
                    ]
                }
            ]
        })
    });
    info(key, 'Support message sent', message, response.status);
    if (response.status !== 200) {
        throw new Error(`Unexpected response code from slack ${response.status}`);
    }
    return {};
};

export default (router) => {
    router.post(
        '/support',
        authenticateAccessToken,
        (req, res) => {
            const { key, user } = req;
            const { message } = req.body;

            promiseResponse<{}>(
                sendSlackSupportMessage({ key, user, message }),
                req,
                res,
                HTTPStatus.OK);
        });
};
