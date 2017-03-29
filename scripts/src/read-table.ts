import { config, DynamoDB } from 'aws-sdk';

if (!process.env.AWS_REGION) {
  console.error(`no $AWS_REGION given`);
  process.exit(1);
}
config.region = process.env.AWS_REGION;

const scan = async (table) => {
  const items = [];
  let nextKey = undefined;

  do {
    const response = await new DynamoDB.DocumentClient()
      .scan({
        TableName: table,
        ExclusiveStartKey: nextKey
      })
      .promise();

    items.push(...response.Items);

    nextKey = response.LastEvaluatedKey;
  } while (nextKey);

  return items;
};

const main = async (args) => {
  if (args.length !== 1) {
    const script = process.argv[1];
    const [, path = script] = script.match(/\/([^/]+)$/);

    console.error(`Usage: ${path} table-name`);
    process.exit(2);
  }

  const table = args[0];
  // tslint:disable-next-line:no-console
  console.log(JSON.stringify(await scan(table)));
};

main(process.argv.slice(2))
  .then(() => void 0)
  .catch((e) => { console.error(e); process.exit(1); });
