import { createTable, cruftForTable, deleteTable, nextId } from './__tests__/aws';
import { expect } from 'chai';

const suiteName = 'read';

describe.only(suiteName, () => {

  beforeAll(createTable(suiteName));
  afterAll(deleteTable(suiteName));
  const cruft = cruftForTable(suiteName);

  it('should read an item', async () => {
    const id = nextId();
    await cruft.create({ id, version: 0 });
    const item = await cruft.read(id);
    expect(item.id).to.equal(id, 'Incorrect item id');
    expect(item.version).to.equal(0, 'Incorrect item version');
    expect(item.created).to.equal(item.modified, 'Incorrect timestamps');
  });

});
