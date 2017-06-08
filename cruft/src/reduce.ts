import { create } from './create';
import { AbstractItem, Configuration, EnhancedItem, EventItem } from './index';
import { read } from './read';
import { update } from './update';

export const reduce = <Aggregate extends AbstractItem, Event>({ client, tableName }: Configuration) =>
  (
    aggregateIdSelector: (event: Event) => string,
    eventIdSelector: (event: Event) => string,
    reducer: (aggregate: EnhancedItem<Aggregate>, event: Event) => EnhancedItem<Aggregate>
  ) =>
    async (event: Event): Promise<EnhancedItem<Aggregate>> => {

      const aggregateId = aggregateIdSelector(event);

      const aggregate = await read<Aggregate>({ client, tableName, consistent: false })(aggregateId);

      const eventId = eventIdSelector(event);

      const { lastEvent } = aggregate;

      if (lastEvent != null && lastEvent.id === eventId) {
        return aggregate;
      }

      let archivedEvent: EventItem | null = null;

      try {
        archivedEvent = await read<EventItem>({ client, tableName, consistent: true })(eventId);
      } catch (e) {
        if (e.message !== `Key not found ${eventId}`) {
          throw e;
        }
      }

      if (archivedEvent != null) {
        return aggregate;
      }

      if (lastEvent != null) {
        try {
          await create<EventItem>({ client, tableName })(<EventItem & { version: 0 }>lastEvent);
        } catch (e) {
          if (e.message !== `Item already exists ${lastEvent.id}`) {
            throw e;
          }
        }
      }

      const updatedAggregate = Object.assign(
        {},
        reducer(aggregate, event),
        {
          lastEvent: {
            id: eventId,
            version: 0,
            data: event,
            previousId: lastEvent != null ? lastEvent.id : null
          }
        }
      );

      return await update<Aggregate>({ client, tableName })(updatedAggregate);
    };
