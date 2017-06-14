import { findAll } from './findAll';
import { AbstractItem, EnhancedItem, FindConfiguration, PrototypicalItem } from './index';

// deprecated hack from before async iterators were supported
// tslint:disable-next-line:variable-name
export const __findAll = <T extends AbstractItem>({ client, tableName, limit }: FindConfiguration) =>
  async (fields: PrototypicalItem<T>): Promise<EnhancedItem<T>[]> => {

    const result: EnhancedItem<T>[] = [];

    for await (const item of findAll<T>({ client, tableName, limit })(fields)) {
      result.push(item);
    }

    return result;
  };
