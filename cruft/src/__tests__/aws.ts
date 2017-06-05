import { DynamoDB } from 'aws-sdk';
import index, { ICruft } from '../index';

export interface IFoo {
  id: string;
  version: number;
  [key: string]: any;
}

const tablePrefix = 'cruft-ddb-';
const region = 'eu-west-1';
const endpoint = 'http://localhost:8000/';

const db = new DynamoDB(<{ apiVersion: string, endpoint: string }>{
  apiVersion: '2012-08-10',
  endpoint,
  region
});

export const cruftForTable = (tableName): ICruft<IFoo> =>
  index<IFoo>({
    endpoint,
    region,
    tableName: tablePrefix + tableName
  });

export const createTable = (tableName: string) =>
  async () => {
    try {
      await db.createTable({
        AttributeDefinitions: [
          {
            AttributeName: 'id',
            AttributeType: 'S'
          }
        ],
        KeySchema: [
          {
            AttributeName: 'id',
            KeyType: 'HASH'
          }
        ],
        TableName: tablePrefix + tableName,
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1
        }
      })
        .promise()
    }
    catch (e) {
      console.log(e);
      // ignore
    }
  };

export const deleteTable = (tableName: string) =>
  async () => {
    try {
      await db.deleteTable({ TableName: tablePrefix + tableName })
        .promise();
    }
    catch (e) {
      console.log(e);
      // ignore
    }
  };

let id = 0;

export const nextId = () => String(id++);