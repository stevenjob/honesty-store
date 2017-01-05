import request = require('request');

export const post = (url, json) =>
  new Promise<{ response, body }>(
    (resolve, reject) => request.post(
      url,
      { json },
      (error, response, body) => {
        if (error) {
          return reject(error);
        }
        if (response.statusCode !== 200) {
          return reject(`response=${JSON.stringify(response)}`);
        }
        if (body.error) {
          return reject(body.error);
        }
        return resolve({ response, body });
      }));
