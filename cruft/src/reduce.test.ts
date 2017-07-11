import { createTable, cruftForTable, deleteTable, nextId } from './__tests__/aws';

const suiteName = 'reduce';

describe.only(suiteName, () => {

  beforeAll(createTable(suiteName));
  afterAll(deleteTable(suiteName));
  const cruft = cruftForTable(suiteName);

  it('should throw if aggregate is not found', async () => {
    const id = nextId();
    try {
      await cruft.reduce(_ => id, _ => '', (aggregate, _) => aggregate)({ id: nextId() });
      fail('Aggregate not found');
    } catch (e) {
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
    expect(aggregate.lastReceived && aggregate.lastReceived.id).toEqual(event.id);
    expect(aggregate.lastReceived && aggregate.lastReceived.data).toEqual(event);
    expect(aggregate.lastReceived && aggregate.lastReceived.previous).toEqual(undefined);
  });

  it('should archive event when limit reached', async () => {
    const aggregateId = nextId();
    const event = {
      id: nextId()
    };
    await cruft.create({ id: aggregateId, version: 0 });
    const reduce = cruft.reduce(_ => aggregateId, ({ id }) => id, (aggregate, _) => aggregate);
    let aggregate = await reduce(event);
    aggregate = await reduce({
      id: nextId()
    });
    expect(aggregate.lastReceived && aggregate.lastReceived.id).not.toEqual(event.id);
    expect(aggregate.lastReceived && aggregate.lastReceived.previous).toEqual(event.id);
  });

  it('should ignore the last event', async () => {
    const aggregateId = nextId();
    const event = {
      id: nextId()
    };
    await cruft.create({ id: aggregateId, version: 0 });
    const reduce = cruft.reduce(_ => aggregateId, ({ id }) => id, (aggregate, _) => aggregate);
    let aggregate = await reduce(event);
    expect(aggregate.version).toEqual(1);
    aggregate = await reduce(event);
    expect(aggregate.version).toEqual(1);
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
    expect(aggregate.version).toEqual(0);
  });

  it('should permit one emitted event', async () => {
    const aggregateId = nextId();
    const event = {
      id: nextId()
    };
    await cruft.create({ id: aggregateId, version: 0 });
    const reduce = cruft.reduce(_ => aggregateId, ({ id }) => id, (aggregate, _, emit) => {
      emit({ id: 'a', version: 0 });
      return aggregate;
    });

    const aggregate = await reduce(event);

    expect(aggregate.lastEmitted).toEqual({
      id: 'a',
      previous: undefined,
      data: {
        id: 'a', version: 0
      }
    });
  });

  it('should not permit more than one emitted event', async () => {
    const aggregateId = nextId();
    const event = {
      id: nextId()
    };
    await cruft.create({ id: aggregateId, version: 0 });
    const reduce = cruft.reduce(_ => aggregateId, ({ id }) => id, (aggregate, _, emit) => {
      emit({ id: 'a', version: 0 });
      emit({ id: 'b', version: 0 });
      return aggregate;
    });

    try {
      await reduce(event);
    } catch (e) {
      if (e.message !== 'Currently emit can only be invoked once a.') {
        throw e;
      }
    }
  });
});
