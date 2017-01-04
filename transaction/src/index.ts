import { DynamoDB } from 'aws-sdk';
import express = require('express');

const scan = async () => {
    const response = await new DynamoDB.DocumentClient()
        .scan({
            TableName: process.env.TABLE_NAME
        })
        .promise();

    return response.Items;
};

const app = express();

app.get('/transaction', (req, res) => {
    scan()
        .then((items) => {
            res.send(JSON.stringify(items));
        })
        .catch(() => {
            res.send(500);
        });
});

app.listen(3000);
