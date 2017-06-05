import { findAll } from './findAll';
import { IConfiguration, AbstractItem, EnhancedItem, PrototypicalItem } from './index';

// deprecated hack from before async iterators were supported
export const __findAll = <T extends AbstractItem>({ client, tableName }: IConfiguration) =>
  async (fields: PrototypicalItem<T>): Promise<Array<EnhancedItem<T>>> => {

    let result: Array<EnhancedItem<T>> = [];

    for await (const item of findAll<T>({ client, tableName })(fields)) {
      result.push(item);
    }

    return result;
  };