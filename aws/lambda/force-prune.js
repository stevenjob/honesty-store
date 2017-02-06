const postData = JSON.stringify({
    build_parameters: {
        FORCE: "false"
    }
});

const options = {
    hostname: 'circleci.com',
    port: 443,
    path: '/api/v1.1/project/github/honesty-store/honesty-store',
    method: 'POST',
    auth: 'b29bdeba3a8ea955a5646fccc093b8cd0b5c21d7:',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

exports.handler = () => {
    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
            console.log('No more data in response.');
        });
    });

    req.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
    });

    req.write(postData);
    req.end();
};

exports.triggers = () => [
    { name: '8pm-weekdays', type: 'cloudwatchevents', scheduleExpression: 'cron(0 20 ? * MON-FRI *)' }
];