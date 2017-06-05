import { IConfiguration, AbstractItem, EnhancedItem } from './index';

export const read = <T extends AbstractItem>({ client, tableName, consistent = false }: IConfiguration & { consistent?: boolean }) =>
  async (id: string): Promise<EnhancedItem<T>> => {
    const response = await client.get({
      TableName: tableName,
      Key: {
        id
      },
      ConsistentRead: consistent
    })
      .promise();

    if (response.Item == null) {
      throw new Error(`Key not found ${id}`);
    }

    return <EnhancedItem<T>>response.Item;
  };