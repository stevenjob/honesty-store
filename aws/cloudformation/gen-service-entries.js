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

const makeLambda = ({ handler, name, timeout }) => ({
  [`${removeHyphens(name)}Lambda`]: {
    "Type": "AWS::Lambda::Function",
    "Properties": {
      "Code": {
        "S3Bucket": {
          "Fn::Join": [
            "",
            [
              "honesty-store-lambdas-",
              { "Ref": "AWS::Region" }
            ]
          ]
        },
        "S3Key": `${name}.zip`
      },
      "FunctionName": {
        "Fn::Join": [
          "",
          [
            { "Ref": "ServicePrefix" },
            "-",
            name
          ]
        ]
      },
      "Timeout": `${timeout}`,
      "Role": {
        "Fn::Join": [
          "",
          [
            "arn:aws:iam::812374064424:role/",
            { "Ref": "HSPrefix" },
            "-lambda-dynamo-rw"
          ]
        ]
      },
      "Handler": handler,
      "Environment": {
        "Variables": {
          "BASE_URL": {
            "Fn::Join": [
              "",
              [
                "https://",
                { "Ref": "HSDomainName" }
              ]
            ]
          },
          "LAMBDA_BASE_URL": {
            "Fn::Join": [
              "",
              [
                "https://",
                { "Ref": "HSDomainName" }
              ]
            ]
          },
          "SERVICE_TOKEN_SECRET": {
            "Ref": "ServiceSecret"
          },
          "LIVE_STRIPE_KEY": (
            name === 'topup'
            ? { "Ref": "StripeKeyLive" }
            : ""
          ),
          "TEST_STRIPE_KEY": (
            name === 'topup'
            ? { "Ref": "StripeKeyTest" }
            : ""
          ),
          "SLACK_CHANNEL_PREFIX": "",
          "USER_TOKEN_SECRET": (
            name === 'user'
            ? { "Ref": "UserSecret" }
            : ""
          ),
          "TABLE_NAME": {
            "Fn::If": [
              "WithTable",
              {
                "Fn::Join": [
                  "",
                  [
                    { "Ref": "ServicePrefix" },
                    "-",
                    `${name}`
                  ]
                ]
              },
              { "Ref": "AWS::NoValue" }
            ]
          }
        }
      },
      "Runtime": "nodejs6.10",
      "TracingConfig": {
        "Mode": "Active"
      }
    }
  }});

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
          "LambdaTimeout": `${timeout}`,
          "LambdaHandler": `${handler}`,
          "WithTable": boolToYN(read && write),
          "CreateTable": read && write ? { "Ref": `CreateTable${removeHyphens(name)}` } : "No",
          "CreateLambda": { "Ref": `CreateLambda${removeHyphens(name)}` },
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
  .map(entry => {
    return Object.assign(
      {},
      makeTemplate(entry),
      makeLambda(entry));
  })
  .reduce((acc, ent) => Object.assign(acc, ent), {});

console.log(JSON.stringify(out));
