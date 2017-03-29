import { config, DynamoDB } from 'aws-sdk';
import { readFileSync } from 'fs';

if (!process.env.AWS_REGION) {
  console.error(`no $AWS_REGION given`);
  process.exit(1);
}
config.region = process.env.AWS_REGION;

const put = async (table, item) => {
  await new DynamoDB.DocumentClient()
    .put({
      TableName: table,
      Item: item
    })
    .promise();
};

const main = async (args) => {
  if (args.length !== 1) {
    const script = process.argv[1];
    const [, path = script] = script.match(/\/([^/]+)$/);

    console.error(`Usage: ${path} table-name`);
    process.exit(2);
  }

  const table = args[0];

  const items = JSON.parse(readFileSync('/dev/stdin').toString());

  if (!Array.isArray(items)) {
    throw new Error('expected array');
  }

  await Promise.all(items.map(item => put(table, item)));
};

main(process.argv.slice(2))
  .then(() => void 0)
  .catch((e) => { console.error(e); process.exit(1); });
