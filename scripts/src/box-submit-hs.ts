import { readFileSync } from 'fs';

import { BoxItemWithBatchReference, createShippedBox, ShippedBoxSubmission } from '../../box/src/client';
import { createServiceKey } from '../../service/src/key';

const usage = (help): never => {
  console.error('Usage: path/to/script shipping-cost store-id dry-run');
  console.error('reads (from standard input) lines consisting of:');
  console.error('  count item-id batch-id');
  console.error(help);
  // tslint:disable-next-line:no-constant-condition
  while (true) {
    process.exit(2);
  }
};

const throwParseError = (type, name, str) => {
  throw new Error(`${name} not a ${type} (${str})`);
};

const maybeParseBool = (str, name) => {
  if (str === 'true') { return true; }
  if (str === 'false') { return false; }

  throwParseError('boolean', name, str);
};

const maybeParseInt = (str, name) => {
  const i = Number(str);
  if (Number.isInteger(i)) {
    return i;
  }

  throwParseError('number', name, str);
};

const main = async (argv) => {
  if (argv.length !== 3) { usage('wrong number of arguments'); }

  const shippingCost = maybeParseInt(argv[0], 'shipping-cost');
  const storeId = argv[1];
  const isDryRun = maybeParseBool(argv[2], 'dryrun');

  const boxItems = readFileSync('/dev/stdin')
    .toString()
    .split('\n')
    .filter(line => line.length)
    .map((line, index) => {
      const parts = line.split(' ');
      if (parts.length !== 3) {
        throw new Error(`line ${index + 1} has ${parts.length} field(s) - 3 expected`);
      }

      const count = maybeParseInt(parts[0], 'count');
      const itemId = parts[1];
      const batchId = parts[2];

      return {
        count,
        itemId,
        batchId
      };
    })
    .reduce((itemIdToBatches, { count, itemId, batchId }) => {
      const existing = itemIdToBatches.get(itemId) || { itemID: itemId, batches: [] };

      itemIdToBatches.set(
        itemId,
        {
          ...existing,
          batches: [
            ...existing.batches,
            {
              id: batchId,
              count
            }
          ]
        });

      return itemIdToBatches;
      // tslint:disable-next-line:align
    }, new Map<string, BoxItemWithBatchReference>())
    .values();

  const key = createServiceKey({ service: 'marketplace-script' });

  const submission: ShippedBoxSubmission = {
    donationRate: 0,
    boxItems: Array.from(boxItems),
    shippingCost,
    packed: null,
    shipped: null
  };

  const response = await createShippedBox(key, storeId, submission, isDryRun);
  // tslint:disable-next-line:no-console
  console.log(JSON.stringify(response, null, 2));
};

main(process.argv.slice(2))
  .then(() => void 0)
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
