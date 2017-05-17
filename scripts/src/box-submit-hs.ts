// tslint:disable:no-console
import { BoxItemWithBatchReference, createShippedBox, markBoxAsShipped, ShippedBoxSubmission } from '@honesty-store/box/src/client';
import { createServiceKey } from '@honesty-store/service/src/key';
import * as program from 'commander';
import { readFileSync } from 'fs';

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

const warnAndExit = e => {
  console.error(e);
  process.exit(1);
};

const key = createServiceKey({ service: 'marketplace-script' });

const packBox = async (shippingCost: number, storeId: string, donationRate: number, isDryRun: boolean, date: number) => {
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

  const submission: ShippedBoxSubmission = {
    donationRate,
    boxItems: Array.from(boxItems),
    shippingCost,
    packed: date
  };

  const response = await createShippedBox(key, storeId, submission, isDryRun);
  console.log(JSON.stringify(response, null, 2));
};

const shipBox = async (boxId: string, date: number) => markBoxAsShipped(key, boxId, date);

program.command('pack <shipping-cost> <store-id> <donation-rate> <dry-run>')
  // tslint:disable-next-line:max-line-length
  .description(`Submits a box with 'packed' field set to the current date (can be overriden using '-d' option). Reads box data (from standard input) lines consisting of: count item-id batch-id`)
  .option('-d, --date [date]', 'date box was packed, as a unix timestamp')
  .action((shippingCost, storeId, donationRate, isDryRun, options) =>
    packBox(
      maybeParseInt(shippingCost, 'shipping-cost'),
      storeId,
      maybeParseInt(donationRate, 'donation-rate'),
      maybeParseBool(isDryRun, 'dry-run'),
      options.date ? maybeParseInt(options.date, 'date') : Date.now()
    ).catch(warnAndExit)
  );

program.command('ship <box-id>')
  .description(`Updates the 'shipped' field of the box with the supplied id, set to current date (can be overriden using '-d' option)`)
  .option('-d, --date [date]', 'date box was shipped, as a unix timestamp')
  .action((boxId, options) =>
    shipBox(
      boxId,
      options.date ? maybeParseInt(options.date, 'date') : Date.now()
    ).catch(warnAndExit)
  );

program.command('*')
  .action(() => {
    program.help();
  });

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}
