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

export interface HasId {
  /**
   * ID managed by consumer
   */
  id: string;
}

export interface HasVersion {
  /**
   * Monotomically increasing counter managed by store
   */
  version: number;
}

export interface HasMetadata {
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

export type EventItem = HasId & { previous?: string, data: HasId };

export interface Configuration {
  client: DynamoDB.DocumentClient;
  tableName: string;
}

export interface FindConfiguration extends Configuration {
  limit: number;
}

export interface Cruft<T extends AbstractItem> {
  create(item: NewItem<T>): Promise<EnhancedItem<T>>;
  read(id: string): Promise<EnhancedItem<T>>;
  reduce<Event extends HasId>(
    aggregateIdSelector: (event: Event) => string,
    eventIdSelector: (event: Event) => string,
    reducer: (aggregate: EnhancedItem<T>, event: Event, emit: (event: AbstractItem) => void) => EnhancedItem<T>
  ): (event: Event) => Promise<EnhancedItem<T>>;
  update(item: EnhancedItem<T>): Promise<EnhancedItem<T>>;
  find(fields: PrototypicalItem<T>): Promise<EnhancedItem<T>>;
  __findAll(fields: PrototypicalItem<T>, options?: { limit?: number }): Promise<EnhancedItem<T>[]>;
  findAll(fields: PrototypicalItem<T>): AsyncIterableIterator<EnhancedItem<T>>;
  truncate(item: AbstractItem): Promise<void>;
}

export default <
  T extends AbstractItem,
  InEvent extends AbstractItem = AbstractItem,
  OutEvent extends AbstractItem = AbstractItem
>({
  endpoint = process.env.AWS_DYNAMODB_ENDPOINT,
  region = process.env.AWS_REGION,
  tableName,
  limit
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
    reduce: reduce<T, InEvent, OutEvent>({ client, tableName }),
    update: update<T>({ client, tableName }),
    __findAll: __findAll<T>({ client, tableName, limit }),
    findAll: findAll<T>({ client, tableName, limit }),
    find: find<T>({ client, tableName, limit }),
    truncate: truncate({ client, tableName })
  };
};
