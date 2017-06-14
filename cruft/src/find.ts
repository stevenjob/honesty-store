import { findAll } from './findAll';
import { AbstractItem, Configuration, EnhancedItem, PrototypicalItem } from './index';

export const find = <T extends AbstractItem>({ client, tableName }: Configuration) =>
  async (fields: PrototypicalItem<T>): Promise<EnhancedItem<T>> => {
    const items = await findAll<T>({ client, tableName })(fields);

    const firstResult = await items.next();

    if (firstResult.done) {
      throw new Error('No value found');
    }

    const secondResult = await items.next();

    if (!secondResult.done) {
      throw new Error('Multiple values found');
    }

    return firstResult.value;
  };
