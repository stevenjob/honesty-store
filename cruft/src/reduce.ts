import { create } from './create';
import { AbstractItem, Configuration, EnhancedItem, EventItem } from './index';
import { read } from './read';
import { update } from './update';

export const reduce = <Aggregate extends AbstractItem, Event extends AbstractItem>({ client, tableName }: Configuration) =>
  (
    aggregateIdSelector: (event: Event) => string,
    eventIdSelector: (event: Event) => string,
    reducer: (aggregate: EnhancedItem<Aggregate>, event: Event) => EnhancedItem<Aggregate>
  ) =>
    async (event: Event): Promise<EnhancedItem<Aggregate>> => {

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

      const updatedLastReceived: EventItem = {
        id: eventId,
        data: event,
        previous: previousLastReceived && previousLastReceived.id
      };

      const updatedAggregate = Object.assign(
        {},
        reducer(aggregate, event),
        {
          lastReceived: updatedLastReceived
        }
      );

      return await update<Aggregate>({ client, tableName })(updatedAggregate);
    };
