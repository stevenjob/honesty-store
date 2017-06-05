import { DynamoDB } from 'aws-sdk';
import { assertHasValidDynamoDBFieldNames } from './assertHasValidDynamoDBFieldNames';
import { IConfiguration, AbstractItem, EnhancedItem, PrototypicalItem } from './index';

const createFilterExpression = (fieldNames, fields) =>
  fieldNames.reduce(
    (obj, key) => {
      obj[`:${key}`] = fields[key];
      return obj;
    },
    {}
  );

export const findAll = <T extends AbstractItem>({ client, tableName }: IConfiguration) =>
  async function*(fields: PrototypicalItem<T>): AsyncIterableIterator<EnhancedItem<T>> {
    assertHasValidDynamoDBFieldNames(fields);

    if ('id' in fields) {
      throw new Error('Use read rather than find if you know the id');
    }

    const fieldNames = Object.keys(fields);

    const filterExpression = fieldNames.length === 0
      ? undefined
      : fieldNames.map(key => `${key} = :${key}`)
        .join(' and ');

    const expressionAtributeValues = fieldNames.length === 0
      ? undefined
      : createFilterExpression(fieldNames, fields);

    let key: DynamoDB.DocumentClient.Key | undefined = undefined;

    do {
      const response = await client.scan({
        TableName: tableName,
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAtributeValues,
        ExclusiveStartKey: key,
        Limit: 100
      })
        .promise();

      for (const item of <Array<EnhancedItem<T>>>response.Items) {
        yield item;
      }

      key = response.LastEvaluatedKey;
    }
    while (key != null);
  };
