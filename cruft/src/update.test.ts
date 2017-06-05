import { createTable, cruftForTable, deleteTable, nextId } from './__tests__/aws';
import { expect } from 'chai';

const suiteName = 'update';

describe.only(suiteName, () => {

  beforeAll(createTable(suiteName));
  afterAll(deleteTable(suiteName));
  const cruft = cruftForTable(suiteName);

  it('should update an item', async () => {
    const id = nextId();
    const original = await cruft.create({ id, version: 0, bar: 0 });
    const updated = await cruft.update({ id, bar: 1, version: original.version });
    expect(original.id).to.equal(updated.id, 'Incorrect item id');
    expect(updated.version).to.equal(1, 'Incorrect item version');
    expect(original.created).to.equal(updated.created, 'Incorrect created timestamp');
    expect(updated.created).not.to.equal(updated.modified, 'Incorrect updated timestamp');
    expect(updated.bar).to.equal(1, 'Incorrect attribute value');
  });

  it('should update an item with a reserved attribute name', async () => {
    const id = nextId();
    const original = await cruft.create({ id, version: 0, count: 0 });
    const updated = await cruft.update({ id, count: 1, version: original.version });
    expect(updated.count).to.equal(1, 'Incorrect attribute value');
  });

  it('should throw when updating an out of date item', async () => {
    const id = nextId();
    const original = await cruft.create({ id, version: 0, bar: 0 });
    await cruft.update({ id, bar: 1, version: original.version });
    try {
      await cruft.update({ id, bar: 1, version: original.version });
      fail('Item is out of date');
    } catch (e) {
      if (e.message !== 'Item is out of date') {
        throw e;
      }
    }
  });

  it('should throw when updating an item with an invalid attribute name', async () => {
    const id = nextId();
    const item = await cruft.create({ id, version: 0 });
    try {
      await cruft.update({ id, version: item.version, 'uh oh': true });
      fail('Item has an invalid attribute name');
    } catch (e) {
      if (e.message !== 'Invalid field name specified uh oh') {
        throw e;
      }
    }
  });

});
