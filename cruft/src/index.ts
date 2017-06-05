import { DynamoDB } from 'aws-sdk';
import { create } from './create';
import { read } from './read';
import { reduce } from './reduce';
import { update } from './update';
import { find } from './find';
import { findAll } from './findAll';
import { __findAll } from './__findAll';
import { truncate } from './truncate';

(<any>Symbol).asyncIterator = Symbol.for('asyncIterator');

export type Timestamp = number;

export interface IHasId {
  /**
   * ID managed by consumer
   */
  id: string;
}

export interface IHasVersion {
  /**
   * Monotomically increasing counter managed by store
   */
  version: number;
}

export interface IHasMetadata {
  /**
   * Unix timestamp of record creation managed by store.
   * N.B. The store will always silently override this value if specified to support use cases which read an item, modify it and attempt to
   * write it back.
   */
  created: Timestamp;
  /**
   * Unix timestamp of last record modification managed by store.
   * N.B. The store will always silently override this value if specified to support use cases which read an item, modify it and attempt to
   * write it back.
   */
  modified: Timestamp;
  /**
   * Recent event IDs that have been reduced on to this aggregate or empty for non-aggregate records.
   */
  recentEvents: EventItem[];
}

export type AbstractItem = IHasId & IHasVersion;

// hack - should take an Item without IHasVersion & IHasMetadata but need literal type subtraction
// for that https://github.com/Microsoft/TypeScript/issues/12215
export type NewItem<T extends AbstractItem> = T & { version: 0 };

export type EnhancedItem<T extends AbstractItem> = T & IHasVersion & IHasMetadata;

export type PrototypicalItem<T extends AbstractItem> = Partial<T>;

export type UpdatedItem<T extends AbstractItem> = T & IHasVersion & Partial<IHasMetadata>;

export type EventItem = AbstractItem & { previous?: string, data: any };

export interface IConfiguration {
  client: DynamoDB.DocumentClient;
  tableName: string;
}

export interface ICruft<T extends AbstractItem> {
  create(item: NewItem<T>): Promise<EnhancedItem<T>>;
  read(id: string): Promise<EnhancedItem<T>>;
  reduce<Event>(
    aggregateIdSelector: (event: Event) => string,
    eventIdSelector: (event: Event) => string,
    reducer: (aggregate: T, event: Event) => T
  ): (event: Event) => Promise<EnhancedItem<T>>;
  update(item: UpdatedItem<T>): Promise<EnhancedItem<T>>;
  find(fields: PrototypicalItem<T>): Promise<EnhancedItem<T>>;
  __findAll(fields: PrototypicalItem<T>, options?: { limit?: number }): Promise<Array<EnhancedItem<T>>>;
  findAll(fields: PrototypicalItem<T>): AsyncIterableIterator<EnhancedItem<T>>;
  truncate(item: AbstractItem): Promise<void>;
}

export default <T extends AbstractItem, Event = any>({
  endpoint = process.env.AWS_DYNAMODB_ENDPOINT,
  region = process.env.AWS_REGION,
  tableName
}): ICruft<T> => {
  // hack - endpoint isn't a valid property according to the typings
  const client = new DynamoDB.DocumentClient(<{ endpoint: string }>{
    apiVersion: '2012-08-10',
    endpoint,
    region
  });

  return {
    create: create<T>({ client, tableName }),
    read: read<T>({ client, tableName }),
    reduce: reduce<T, Event>({ client, tableName }),
    update: update<T>({ client, tableName }),
    __findAll: __findAll<T>({ client, tableName }),
    findAll: findAll<T>({ client, tableName }),
    find: find<T>({ client, tableName }),
    truncate: truncate({ client, tableName })
  };
};
