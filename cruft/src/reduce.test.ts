import { createTable, cruftForTable, deleteTable, nextId } from './__tests__/aws';
import { RECENT_EVENT_LIMIT } from './reduce';
import { EventItem } from './index';
import { expect } from 'chai';

const suiteName = 'reduce';

describe.only(suiteName, () => {

  beforeAll(createTable(suiteName));
  afterAll(deleteTable(suiteName));
  const cruft = cruftForTable(suiteName);

  it('should throw if aggregate is not found', async () => {
    const id = nextId();
    try {
      await cruft.reduce(_ => id, _ => '', (aggregate, _) => aggregate)({});
      fail('Aggregate not found');
    }
    catch (e) {
      if (e.message !== `Key not found ${id}`) {
        throw e;
      }
    }
  });

  it('should reduce the first event on to an empty aggregate', async () => {
    const aggregateId = nextId();
    const event = {
      id: nextId()
    };
    await cruft.create({ id: aggregateId, version: 0 });
    const reduce = cruft.reduce(_ => aggregateId, ({ id }) => id, (aggregate, _) => aggregate);
    const aggregate = await reduce(event);
    expect(aggregate.recentEvents).has.lengthOf(1);
    expect(aggregate.recentEvents[0].id).to.equal(event.id);
    expect(aggregate.recentEvents[0].data).to.deep.equal(event);
    expect(aggregate.recentEvents[0].previous).to.equal(null);
  });

  it('should archive event when limit reached', async () => {
    const aggregateId = nextId();
    const event = {
      id: nextId()
    };
    await cruft.create({ id: aggregateId, version: 0 });
    const reduce = cruft.reduce(_ => aggregateId, ({ id }) => id, (aggregate, _) => aggregate);
    let aggregate = await reduce(event);
    for (let i = 0; i < RECENT_EVENT_LIMIT; i++) {
      aggregate = await reduce({ id: nextId() });
    }
    expect(aggregate.recentEvents).has.lengthOf(RECENT_EVENT_LIMIT);
    expect(aggregate.recentEvents.map(eventItem => eventItem.id)).to.not.contain(event.id);
  });

  it('should ignore an event found in recent events', async () => {
    const aggregateId = nextId();
    const event = {
      id: nextId()
    };
    await cruft.create({ id: aggregateId, version: 0 });
    const reduce = cruft.reduce(_ => aggregateId, ({ id }) => id, (aggregate, _) => aggregate);
    let aggregate = await reduce(event);
    expect(aggregate.version).to.equal(1);
    aggregate = await reduce(event);
    expect(aggregate.version).to.equal(1);
  });

  it('should ignore archived events', async () => {
    const aggregateId = nextId();
    const event = {
      id: nextId()
    };
    await cruft.create({ id: aggregateId, version: 0 });
    await cruft.create({ id: event.id, version: 0, data: event });
    const reduce = cruft.reduce(_ => aggregateId, ({ id }) => id, (aggregate, _) => aggregate);
    const aggregate = await reduce(event);
    expect(aggregate.version).to.equal(0);
  });

});

