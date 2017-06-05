import { IConfiguration, AbstractItem } from './index';

export const truncate = ({ client, tableName }: IConfiguration) =>
  async (item: AbstractItem): Promise<void> => {
    try {
      await client.delete({
        TableName: tableName,
        Key: {
          id: item.id
        },
        ConditionExpression: 'version = :version',
        ExpressionAttributeValues: {
          ':version': item.version
        }
      })
        .promise();
    }
    catch (e) {
      if (e.code !== 'ConditionalCheckFailedException') {
        throw e;
      }
      throw new Error(`Item is out of date`);
    }
  };