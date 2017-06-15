import { Box } from '@honesty-store/box';
import { config } from 'aws-sdk';
import cruftDDB from 'cruft-ddb';

if (!process.env.AWS_REGION) {
  console.error(`no $AWS_REGION given`);
  process.exit(1);
}
config.region = process.env.AWS_REGION;

const main = async (args) => {
  if (args.length !== 0) {
    const script = process.argv[1];
    const [, path = script] = script.match(/\/([^/]+)$/);

    console.error(`Usage: ${path}`);
    process.exit(2);
  }

  const cruft = cruftDDB<Box>({ tableName: 'honesty-store-box' });
  const now = Date.now();
  const promises = [];
  const ids = [];

  for await (const box of cruft.findAll({})) {
    const { closed, boxItems } = box;

    if (!closed && boxItems.every(item => item.depleted != null)) {
      promises.push(cruft.update({ ...box, closed: now }));
      ids.push(box.id);
    }
  }

  await Promise.all(promises);

  // tslint:disable-next-line:no-console
  console.log(JSON.stringify(ids, null, 2));
};

main(process.argv.slice(2))
  .then(() => void 0)
  .catch((e) => { console.error(e); process.exit(1); });
