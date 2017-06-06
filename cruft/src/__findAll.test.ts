import { expect } from 'chai';
import { createTable, cruftForTable, deleteTable, nextId } from './__tests__/aws';

const suiteName = '__FindAll';

describe.only(suiteName, () => {

  beforeAll(createTable(suiteName));
  afterAll(deleteTable(suiteName));
  const cruft = cruftForTable(suiteName);

  it('should find items without filter', async () => {
    const id = nextId();
    await cruft.create({ id, version: 0, bar: id });
    const items = await cruft.__findAll({ bar: id });
    expect(items).to.lengthOf(1, 'Incorrect item count');
  });

});
