import { createMarketplaceBox, MarketplaceBoxSubmission } from '../../box/src/client';
import { createServiceKey } from '../../service/src/key';

const usage = (help): never => {
  console.error('Usage: path/to/script count-from-batch store-id item-id batch-id dry-run');
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
  if (argv.length !== 5) { usage('wrong number of arguments'); }

  const count = maybeParseInt(argv[0], 'count');
  const storeId = argv[1];
  const itemId = argv[2];
  const batchId = argv[3];
  const isDryRun = maybeParseBool(argv[4], 'dryrun');

  const key = createServiceKey({ service: 'marketplace-script' });

  const submission: MarketplaceBoxSubmission = {
    donationRate: 0,
    boxItem: {
      itemID: itemId,
      batches: [
        {
          id: batchId,
          count
        }
      ]
    }
  };

  const response = await createMarketplaceBox(key, storeId, submission, isDryRun);
  // tslint:disable-next-line:no-console
  console.log(JSON.stringify(response, null, 2));
};

main(process.argv.slice(2))
  .then(() => void 0)
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
