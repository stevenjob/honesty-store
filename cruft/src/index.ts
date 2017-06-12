import { DynamoDB } from 'aws-sdk';
import { __findAll } from './__findAll';
import { create } from './create';
import { find } from './find';
import { findAll } from './findAll';
import { read } from './read';
import { reduce } from './reduce';
import { truncate } from './truncate';
import { update } from './update';

(<any>Symbol).asyncIterator = Symbol.for('asyncIterator');

export type Timestamp = number;

interface HasId {
  /**
   * ID managed by consumer
   */
  id: string;
}

interface HasVersion {
  /**
   * Monotomically increasing counter managed by store
   */
  version: number;
}

interface HasMetadata {
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
   * Last event to be reduced on to this aggregate or null for non-aggregate records.
   */
  lastReceived?: EventItem;
  /**
   * Last event to be emitted by this aggregate or null for non-aggregate records.
   */
  lastEmitted?: EventItem;
}

export type AbstractItem = HasId & HasVersion;

// hack - should take an Item without IHasVersion & IHasMetadata but need literal type subtraction
// for that https://github.com/Microsoft/TypeScript/issues/12215
export type NewItem<T extends AbstractItem> = T & { version: 0 };

export type EnhancedItem<T extends AbstractItem> = T & HasVersion & HasMetadata;

export type PrototypicalItem<T extends AbstractItem> = Partial<T>;

export type EventItem = AbstractItem & { previous?: string, data: AbstractItem };

export interface Configuration {
  client: DynamoDB.DocumentClient;
  tableName: string;
}

export interface Cruft<T extends AbstractItem> {
  create(item: NewItem<T>): Promise<EnhancedItem<T>>;
  read(id: string): Promise<EnhancedItem<T>>;
  reduce<Event extends AbstractItem>(
    aggregateIdSelector: (event: Event) => string,
    eventIdSelector: (event: Event) => string,
    reducer: (aggregate: EnhancedItem<T>, event: Event) => EnhancedItem<T>
  ): (event: Event) => Promise<EnhancedItem<T>>;
  update(item: EnhancedItem<T>): Promise<EnhancedItem<T>>;
  find(fields: PrototypicalItem<T>): Promise<EnhancedItem<T>>;
  __findAll(fields: PrototypicalItem<T>, options?: { limit?: number }): Promise<EnhancedItem<T>[]>;
  findAll(fields: PrototypicalItem<T>): AsyncIterableIterator<EnhancedItem<T>>;
  truncate(item: AbstractItem): Promise<void>;
}

export default <T extends AbstractItem, Event extends AbstractItem = AbstractItem>({
  endpoint = process.env.AWS_DYNAMODB_ENDPOINT,
  region = process.env.AWS_REGION,
  tableName
}): Cruft<T> => {
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
