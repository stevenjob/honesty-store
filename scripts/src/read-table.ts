import { config } from 'aws-sdk';
import cruftDDB from 'cruft-ddb';

if (!process.env.AWS_REGION) {
  console.error(`no $AWS_REGION given`);
  process.exit(1);
}
config.region = process.env.AWS_REGION;

const main = async (args) => {
  if (args.length !== 1) {
    const script = process.argv[1];
    const [, path = script] = script.match(/\/([^/]+)$/);

    console.error(`Usage: ${path} table-name`);
    process.exit(2);
  }

  const table = args[0];
  const cruft = cruftDDB<any>({ tableName: table });

  // tslint:disable-next-line:no-console
  console.log(JSON.stringify(await cruft.__findAll({})));
};

main(process.argv.slice(2))
  .then(() => void 0)
  .catch((e) => { console.error(e); process.exit(1); });
