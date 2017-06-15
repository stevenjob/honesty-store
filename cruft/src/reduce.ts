import { create } from './create';
import { AbstractItem, Configuration, EnhancedItem, EventItem } from './index';
import { read } from './read';
import { update } from './update';

type ReduceEmit = <Event>(event: Event) => void;

export const reduce = <Aggregate extends AbstractItem, InEvent extends AbstractItem, OutEvent extends AbstractItem>({ client, tableName }: Configuration) =>
  (
    aggregateIdSelector: (event: InEvent) => string,
    eventIdSelector: (event: InEvent) => string,
    reducer: (aggregate: EnhancedItem<Aggregate>, event: InEvent, emit: ReduceEmit) => EnhancedItem<Aggregate>
  ) =>
    async (event: InEvent): Promise<EnhancedItem<Aggregate>> => {

      const aggregateId = aggregateIdSelector(event);

      const aggregate = await read<Aggregate>({ client, tableName, consistent: false })(aggregateId);

      const eventId = eventIdSelector(event);

      const { lastReceived: previousLastReceived } = aggregate;

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

      const emittedEvents: OutEvent[] = [];
      const emit = (event: OutEvent) => void emittedEvents.push(event);
      const reducedAggregate = reducer(aggregate, event, emit);

      const updatedLastReceived: EventItem = {
        id: eventId,
        data: event,
        previous: previousLastReceived && previousLastReceived.id
      };

      await Promise.all(emittedEvents.map(event => create<OutEvent>({ client, tableName })(<OutEvent & { version: 0 }>event)));

      const updatedAggregate = Object.assign(
        {},
        reducedAggregate,
        {
          lastReceived: updatedLastReceived,
          lastEmitted: emittedEvents[emittedEvents.length - 1]
        }
      );

      return await update<Aggregate>({ client, tableName })(updatedAggregate);
    };
