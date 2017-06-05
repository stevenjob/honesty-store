import { IConfiguration, AbstractItem, EnhancedItem, EventItem } from './index';
import { create } from './create';
import { read } from './read';
import { update } from './update';

export const RECENT_EVENT_LIMIT = 10;

export const reduce = <Aggregate extends AbstractItem, Event>({ client, tableName }: IConfiguration) =>
  (
    aggregateIdSelector: (event: Event) => string,
    eventIdSelector: (event: Event) => string,
    reducer: (aggregate: Aggregate, event: Event) => Aggregate
  ) =>
    async (event: Event): Promise<EnhancedItem<Aggregate>> => {

      const aggregateId = aggregateIdSelector(event);

      const aggregate = await read<Aggregate>({ client, tableName, consistent: false })(aggregateId);

      const eventId = eventIdSelector(event);

      const { recentEvents } = aggregate;

      for (const recentEvent of recentEvents) {
        if (recentEvent.id === eventId) {
          return aggregate;
        }
      }

      try {
        await read<EventItem>({ client, tableName, consistent: true })(eventId);
        return aggregate;
      }
      catch (e) {
        if (e.message !== `Key not found ${eventId}`) {
          throw e;
        }
      }

      for (const archivedEvent of recentEvents.slice(RECENT_EVENT_LIMIT - 1)) {
        try {
          await create<EventItem>({ client, tableName })({
            id: eventIdSelector(archivedEvent),
            version: 0,
            data: archivedEvent
          });
        }
        catch (e) {
          if (e.message !== `Key not found ${eventId}`) {
            throw e;
          }
        }
      }

      const previousEventId = recentEvents.length > 0 ? recentEvents[0].id : null;

      const updatedRecentEvents: EventItem[] = [
        {
          id: eventId,
          version: 0,
          data: event,
          previous: previousEventId
        },
        ...recentEvents.slice(0, RECENT_EVENT_LIMIT - 1)
      ];

      const updatedAggregate = Object.assign(
        {},
        reducer(aggregate, event),
        { recentEvents: updatedRecentEvents }
      );

      return await update<Aggregate>({ client, tableName, updateRecentEvents: true })(updatedAggregate);
    };
