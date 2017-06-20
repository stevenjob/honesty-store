import { getItem } from '@honesty-store/item';
import { createAssertValidUuid } from '@honesty-store/service/lib/assert';
import { createServiceKey } from '@honesty-store/service/lib/key';
import { listItem, StoreItemListing, updateItemCount } from '@honesty-store/store';

type ItemSubmissionDetails = {
  id: string,
  price: number;
  count: number;
};

const storeId = '';
const sellerId = '';
const auditorId = '';

const itemSubmissions: ItemSubmissionDetails[] = [];

const key = createServiceKey({ service: 'list-items-script' });

const warnAndExit = e => {
  console.error(e);
  process.exit(1);
};

const assertValidStoreId = createAssertValidUuid('storeId');
const assertValidSellerId = createAssertValidUuid('sellerId');
const assertValidAuditorId = createAssertValidUuid('auditorId');

const addItem = async (itemId: string, count: number, price: number) => {
  const { id, name, genericName, genericNamePlural, unit, unitPlural, image } = await getItem(key, itemId);

  const storeItemListing: StoreItemListing = {
    id,
    name,
    genericName,
    genericNamePlural,
    unit,
    unitPlural,
    image,
    price,
    sellerId,
    listCount: count
  };

  try {
    await listItem(key, storeId, storeItemListing);
  } catch (e) {
    if (e.message.includes('Listing already exists')) {
      await updateItemCount(key, storeId, itemId, count, auditorId);
    } else {
      throw e;
    }
  }
};

const main = async () => {
  assertValidStoreId(storeId);
  assertValidSellerId(sellerId);
  assertValidAuditorId(auditorId);
  for (const { id, price, count }  of itemSubmissions) {
    await addItem(id, count, price);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

main()
  .then(() => void 0)
  .catch(warnAndExit);
