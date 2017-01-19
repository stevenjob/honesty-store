import { exec as execRaw, spawn as spawnRaw } from 'child_process';
import * as winston from 'winston';

export const exec = (command) =>
    new Promise<{ stdout: string, stderr: string }>((resolve, reject) => {
        execRaw(command, (err, stdout, stderr) => {
            if (err) {
                return reject(err);
            }
            resolve({ stdout, stderr });
        });
    });

export const spawn = (command, ...args) =>
    new Promise((resolve, reject) => {
        const process = spawnRaw(command, args)
            .on('error', (err) => {
                reject(err);
            })
            .on('exit', (status) => {
                if (status !== 0) {
                    reject(status);
                }
                resolve();
            });
        process.stdout.on('data', (data: Buffer) => 
            // trim the trailing newline
            winston.debug(data.toString('utf8', 0, data.length - 1))
        );
        process.stderr.on('data', (data: Buffer) => 
            // trim the trailing newline
            winston.info(data.toString('utf8', 0, data.length - 1))
        );
    });
