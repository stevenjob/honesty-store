import { create } from './create';
import { AbstractItem, Configuration, EnhancedItem, EventItem } from './index';
import { read } from './read';
import { update } from './update';

type ReduceEmit<Event> = (event: Event) => void;

export interface EventReduction<Aggregate extends AbstractItem> {
  aggregate: EnhancedItem<Aggregate>;
  eventStored: boolean;
};

export const reduce = <
  Aggregate extends AbstractItem,
  ReceivedEvent extends AbstractItem,
  EmittedEvent extends AbstractItem
>({ client, tableName }: Configuration) =>
  (
    aggregateIdSelector: (event: ReceivedEvent) => string,
    eventIdSelector: (event: ReceivedEvent) => string,
    reducer: (aggregate: EnhancedItem<Aggregate>, event: ReceivedEvent, emit: ReduceEmit<EmittedEvent>) => EnhancedItem<Aggregate>
  ) =>
    async (event: ReceivedEvent): Promise<EventReduction<Aggregate>> => {

      const aggregateId = aggregateIdSelector(event);

      const aggregate = await read<Aggregate>({ client, tableName, consistent: false })(aggregateId);

      const eventId = eventIdSelector(event);

      const { lastReceived: previousLastReceived } = aggregate;

      if (previousLastReceived != null && previousLastReceived.id === eventId) {
        return { aggregate, eventStored: false };
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
        return { aggregate, eventStored: false };
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

      const emittedEvents: EventItem[] = [];
      const emit = (emittedEvent: EmittedEvent) => {
        const previous = emittedEvents.length
          ? emittedEvents[emittedEvents.length - 1]
          : aggregate.lastEmitted;

        emittedEvents.push({
          id: emittedEvent.id,
          data: emittedEvent,
          previous: previous && previous.id
        });
      };
      const reducedAggregate = reducer(aggregate, event, emit);

      const updatedLastReceived: EventItem = {
        id: eventId,
        data: event,
        previous: previousLastReceived && previousLastReceived.id
      };

      const storeEvent = (eventItem: EventItem) =>
        create<EventItem & { version: number }>({ client, tableName })(<EventItem & { version: 0 }>eventItem);

      await Promise.all(emittedEvents.map(storeEvent));

      const updatedAggregate = Object.assign(
        {},
        reducedAggregate,
        {
          lastReceived: updatedLastReceived,
          lastEmitted: emittedEvents[emittedEvents.length - 1]
        }
      );

      return {
        aggregate: await update<Aggregate>({ client, tableName })(updatedAggregate),
        eventStored: true
      };
    };
