import { ECS } from 'aws-sdk';

const template = ({ image, baseUrl, lambdaBaseUrls, serviceSecret, logGroup, environment, port = 3000 }): ECS.ContainerDefinitions => [
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
      ...Object.keys(lambdaBaseUrls)
        .map(dir => ({
          name: `BASE_URL_${dir}`,
          value: lambdaBaseUrls[dir]
        })),
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
  api: ({ image, baseUrl, lambdaBaseUrls, serviceSecret, logGroup }) =>
    template({
      image,
      baseUrl,
      lambdaBaseUrls,
      serviceSecret,
      logGroup,
      environment: []
    }),

  topup: ({ image, baseUrl, lambdaBaseUrls, serviceSecret, logGroup, tableName, liveStripeKey, testStripeKey }) =>
    template({
      image,
      baseUrl,
      lambdaBaseUrls,
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

  transaction: ({ image, baseUrl, lambdaBaseUrls, serviceSecret, logGroup, tableName }) =>
    template({
      image,
      baseUrl,
      lambdaBaseUrls,
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

  user: ({ image, baseUrl, lambdaBaseUrls, serviceSecret, logGroup, tableName, userSecret }) =>
    template({
      image,
      baseUrl,
      lambdaBaseUrls,
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

  web: ({ image, baseUrl, lambdaBaseUrls, serviceSecret, logGroup }) =>
    template({
      image,
      baseUrl,
      lambdaBaseUrls,
      serviceSecret,
      logGroup,
      environment: [],
      port: 8080
    }),

  survey: ({ image, baseUrl, lambdaBaseUrls, serviceSecret, logGroup, tableName }) =>
    template({
      image,
      baseUrl,
      lambdaBaseUrls,
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

  box: ({ image, baseUrl, lambdaBaseUrls, serviceSecret, logGroup, tableName }) =>
    template({
      image,
      baseUrl,
      serviceSecret,
      logGroup,
      lambdaBaseUrls,
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
    })
};

export default ({ dir, data }): ECS.ContainerDefinitions => {
  const createJSON = dirToContainer[dir];

  if (!createJSON) {
    throw new Error(`no container for directory '${dir}'`);
  }

  return createJSON(data);
};
