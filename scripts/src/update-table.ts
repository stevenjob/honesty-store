import { config, DynamoDB } from 'aws-sdk';
import { readFileSync } from 'fs';

if (!process.env.AWS_REGION) {
  console.error(`no $AWS_REGION given`);
  process.exit(1);
}
config.region = process.env.AWS_REGION;

const fieldIsOptional = (name) => name.length && name.indexOf('?') === name.length - 1;

const fieldRemoveMarkers = (name) => name.replace(/\?$/g, '');

const main = async (args) => {
  if (args.length < 2) {
    const script = process.argv[1];
    const [, path = script] = script.match(/\/([^/]+)$/);

    console.error(`Usage: ${path} table-name fields-to-update...`);
    console.error(`fields-to-update can be:`);
    console.error(` aSimpleFieldName: said field will be updated (field must exist)`);
    console.error(` optionalField?:   said field will be updated if present in the input`);
    process.exit(2);
  }

  const table = args[0];
  const fields = args.slice(1);

  const items = JSON.parse(readFileSync('/dev/stdin').toString());

  if (!Array.isArray(items)) {
    throw new Error('expected array');
  }

  items.forEach((item, index) => {
    ['id', ...fields]
      .filter(field => !fieldIsOptional(field))
      .filter(field => !(fieldRemoveMarkers(field) in item))
      .forEach(field => { throw new Error(`item [${index}] doesn't have property '${field}'`); });
  });

  const updateExpr = fields.map(field => `${fieldRemoveMarkers(field)} = :${fieldRemoveMarkers(field)}`).join(', ');

  await Promise.all(
    items.map(item =>
      new DynamoDB.DocumentClient()
        .update({
          TableName: table,
          Key: {
            id: item.id
          },
          UpdateExpression: `set ${updateExpr}`,
          ExpressionAttributeValues: Object.assign(
            {},
            ...fields.map(field => ({ [`:${fieldRemoveMarkers(field)}`]: item[fieldRemoveMarkers(field)] || null })))
        })
      .promise()));

};

main(process.argv.slice(2))
  .then(() => void 0)
  .catch((e) => { console.error(e); process.exit(1); });
