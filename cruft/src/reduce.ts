import { create } from './create';
import { AbstractItem, Configuration, EnhancedItem, EventItem } from './index';
import { read } from './read';
import { update } from './update';

type ReduceEmit<Event> = (event: Event) => void;
type MaybePromise<T> = Promise<T> | T;

export const reduce = <
  Aggregate extends AbstractItem,
  ReceivedEvent extends AbstractItem,
  EmittedEvent extends AbstractItem
  >({ client, tableName }: Configuration) =>
  (
    aggregateIdSelector: (event: ReceivedEvent) => string,
    eventIdSelector: (event: ReceivedEvent) => string,
    reducer: (
      aggregate: EnhancedItem<Aggregate>,
      event: ReceivedEvent,
      emit: ReduceEmit<EmittedEvent>
    ) => MaybePromise<EnhancedItem<Aggregate>>
  ) =>
    async (event: ReceivedEvent): Promise<EnhancedItem<Aggregate>> => {

      const aggregateId = aggregateIdSelector(event);

      const aggregate = await read<Aggregate>({ client, tableName, consistent: false })(aggregateId);

      const eventId = eventIdSelector(event);

      const {
        lastReceived: previousLastReceived,
        lastEmitted: previousLastEmitted
      } = aggregate;

      if (previousLastReceived != null && previousLastReceived.id === eventId) {
        return aggregate;
      }

      let archivedEvent: EventItem | null = null;

      try {
        archivedEvent = await read<EventItem & { version: 0 }>({ client, tableName, consistent: true })(eventId);
      } catch (e) {
        if (e.message !== `Key not found ${eventId}`) {
          throw e;
        }
      }

      if (archivedEvent != null) {
        return aggregate;
      }

      if (previousLastReceived != null) {
        try {
          await create<EventItem & { version: 0 }>({ client, tableName })(<EventItem & { version: 0 }>previousLastReceived);
        } catch (e) {
          if (e.message !== `Item already exists ${previousLastReceived.id}`) {
            throw e;
          }
        }
      }

      if (previousLastEmitted != null) {
        try {
          await create<EventItem & { version: 0 }>({ client, tableName })(<EventItem & { version: 0 }>previousLastEmitted);
        } catch (e) {
          if (e.message !== `Item already exists ${previousLastEmitted.id}`) {
            throw e;
          }
        }
      }

      let updatedLastEmitted: EventItem | null = null;

      const emit = (emittedEvent: EmittedEvent) => {
        if (updatedLastEmitted != null) {
          throw new Error(`Currently emit can only be invoked once ${updatedLastEmitted.id}.`);
        }

        updatedLastEmitted = {
          id: emittedEvent.id,
          data: emittedEvent,
          previous: aggregate.lastEmitted && aggregate.lastEmitted.id
        };
      };

      const reducedAggregate = await reducer(aggregate, event, emit);

      const updatedLastReceived: EventItem = {
        id: eventId,
        data: event,
        previous: previousLastReceived && previousLastReceived.id
      };

      const updatedAggregate = Object.assign(
        {},
        reducedAggregate,
        {
          lastReceived: updatedLastReceived,
          lastEmitted: updatedLastEmitted
        }
      );

      return await update<Aggregate>({ client, tableName })(updatedAggregate);
    };
