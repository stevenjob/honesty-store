import { ECS } from 'aws-sdk';

const template = ({ image, baseUrl, lambdaBaseUrl, serviceSecret, logGroup, environment, port = 3000 }): ECS.ContainerDefinitions => [
  {
    name: 'container',
    image,
    cpu: 128,
    memory: 128,
    essential: true,
    portMappings: [
      {
        containerPort: port,
        protocol: 'tcp'
      }
    ],
    environment: [
      {
        name: 'BASE_URL',
        value: baseUrl
      },
      {
        name: 'SERVICE_TOKEN_SECRET',
        value: serviceSecret
      },
      {
        name: 'LAMBDA_BASE_URL',
        value: lambdaBaseUrl
      },
      ...environment
    ],
    logConfiguration: {
      logDriver: 'awslogs',
      options: {
        'awslogs-group': logGroup,
        'awslogs-region': 'eu-west-1',
        'awslogs-stream-prefix': 'container'
      }
    }
  }
];

const dirToContainer = {
  api: ({ image, baseUrl, lambdaBaseUrl, serviceSecret, logGroup }) =>
    template({
      image,
      baseUrl,
      lambdaBaseUrl,
      serviceSecret,
      logGroup,
      environment: []
    }),

  topup: ({ image, baseUrl, lambdaBaseUrl, serviceSecret, logGroup, tableName, liveStripeKey, testStripeKey }) =>
    template({
      image,
      baseUrl,
      lambdaBaseUrl,
      serviceSecret,
      logGroup,
      environment: [
        {
          name: 'TABLE_NAME',
          value: tableName
        },
        {
          name: 'AWS_REGION',
          value: 'eu-west-1'
        },
        {
          name: 'LIVE_STRIPE_KEY',
          value: liveStripeKey
        },
        {
          name: 'TEST_STRIPE_KEY',
          value: testStripeKey
        }
      ]
    }),

  transaction: ({ image, baseUrl, lambdaBaseUrl, serviceSecret, logGroup, tableName }) =>
    template({
      image,
      baseUrl,
      lambdaBaseUrl,
      serviceSecret,
      logGroup,
      environment: [
        {
          name: 'TABLE_NAME',
          value: tableName
        },
        {
          name: 'AWS_REGION',
          value: 'eu-west-1'
        }
      ]
    }),

  user: ({ image, baseUrl, lambdaBaseUrl, serviceSecret, logGroup, tableName, userSecret }) =>
    template({
      image,
      baseUrl,
      lambdaBaseUrl,
      serviceSecret,
      logGroup,
      environment: [
        {
          name: 'TABLE_NAME',
          value: tableName
        },
        {
          name: 'AWS_REGION',
          value: 'eu-west-1'
        },
        {
          name: 'USER_TOKEN_SECRET',
          value: userSecret
        }
      ]
    }),

  web: ({ image, baseUrl, lambdaBaseUrl, serviceSecret, logGroup }) =>
    template({
      image,
      baseUrl,
      lambdaBaseUrl,
      serviceSecret,
      logGroup,
      environment: [],
      port: 8080
    })
};

export default ({ dir, data }): ECS.ContainerDefinitions => {
  const createJSON = dirToContainer[dir];

  if (!createJSON) {
    throw new Error(`no container for directory '${dir}'`);
  }

  return createJSON(data);
};
