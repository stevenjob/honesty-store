import * as path from 'path';
import { readFile } from 'fs';

const readFilePromise = (file): Promise<string> => 
    new Promise((resolve, reject) => {
        readFile(file, 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });

export const templateText = async ({ type, name, data = {}, extension = 'json' }) => {
    const file = path.join(__dirname, '..', 'template', type, `${name}.${extension}`);
    const template = await readFilePromise(file);
    return template.replace(/\$\{([\w\d]+)\}/gi, (substring, token) => data[token]);
};

export const templateJSON = async ({ type, name, data = {}, extension = 'json' }) => {
    const text = await templateText({ type, name, data, extension});

    try {
        return JSON.parse(text);
    } catch (e) {
        console.error(`couldn't parse JSON ${JSON.stringify({ type, name, extension })}, text: ${text}`);
        throw e;
    }
};
