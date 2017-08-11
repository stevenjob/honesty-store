#!/usr/bin/env node

const config = [
  { name: "item",              capacity: { read: 2, write: 1 }, timeout: 10, handler: 'lib/bundle-min.handler' },
  { name: "store",             capacity: { read: 3, write: 3 }, timeout: 10, handler: 'lib/bundle-min.handler' },
  { name: "topup",             capacity: { read: 1, write: 1 }, timeout: 10, handler: 'lib/bundle-min.handler' },
  { name: "transaction",       capacity: { read: 2, write: 2 }, timeout: 10, handler: 'lib/bundle-min.handler' },
  { name: "transaction-store", capacity: { read: 1, write: 1 }, timeout: 10, handler: 'lib/bundle-min.handler' },
  { name: "user",              capacity: { read: 1, write: 1 }, timeout: 10, handler: 'lib/bundle-min.handler' },
  { name: "web",               capacity: { read: 0, write: 0 }, timeout: 10, handler: 'server/lambda.handler' },
  { name: "api",               capacity: { read: 0, write: 0 }, timeout: 30, handler: 'lib/bundle-min.handler' }
];

const boolToYN = b => b ? "Yes" : "No";

const removeHyphens = str => str.replace(/-/g, '');

const makeTemplate = ({ name, capacity: { read, write }, timeout, handler }) => ({
    [`${removeHyphens(name)}Stack`]: {
      "Type": "AWS::CloudFormation::Stack",
      "DependsOn" : [
         "RestApi"
      ],
      "Properties": {
        "TemplateURL": {
          "Fn::Join": [
            "",
            [
              "https://s3.amazonaws.com/honesty-store-templates-",
              { "Ref": "AWS::Region" },
              "/per-service.json"
            ]
          ]
        },
        "TimeoutInMinutes": "10",
        "Parameters": {
          "ServiceName": `${name}`,
          "ServiceSecret": { "Ref": "ServiceSecret" },
          "IndexUserId": boolToYN(name == "topup"),
          "ReadCapacityUnits": `${read}`,
          "WriteCapacityUnits": `${write}`,
          "LambdaS3Key": `${name}.zip`,
          "LambdaTimeout": `${timeout}`,
          "LambdaHandler": `${handler}`,
          "WithTable": boolToYN(read && write),
          "CreateTable": read && write ? { "Ref": `CreateTable${removeHyphens(name)}` } : "No",
          "UserSecret": name == "user" ? { "Ref": "UserSecret" } : "",
          "StripeKeyLive": name == "topup" ? { "Ref": "StripeKeyLive" } : "",
          "StripeKeyTest": name == "topup" ? { "Ref": "StripeKeyTest" } : "",
          "WithApiGateway": boolToYN(name == "web" || name == "api"),
          "HSPrefix": { "Ref": "HSPrefix" },
          "HSDomainName": { "Ref": "HSDomainName" },
          "ServicePrefix" : { "Ref" : "ServicePrefix" },
        }
      }
    }
});

const out = config
  .map(makeTemplate)
  .reduce((acc, ent) => {
    const name = Object.keys(ent)[0];
    acc[name] = ent[name];
    return acc;
  }, {});

console.log(JSON.stringify(out));
