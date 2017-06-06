import { findAll } from './findAll';
import { AbstractItem, Configuration, EnhancedItem, PrototypicalItem } from './index';

// deprecated hack from before async iterators were supported
// tslint:disable-next-line:variable-name
export const __findAll = <T extends AbstractItem>({ client, tableName }: Configuration) =>
  async (fields: PrototypicalItem<T>): Promise<EnhancedItem<T>[]> => {

    const result: EnhancedItem<T>[] = [];

    for await (const item of findAll<T>({ client, tableName })(fields)) {
      result.push(item);
    }

    return result;
  };
