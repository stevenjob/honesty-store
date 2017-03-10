import { DynamoDB } from 'aws-sdk';
interface TemplateArgument {
  readCapacityUnits: number;
  writeCapacityUnits: number;
  dummyData: any;
  config?: any;
}

interface TableTemplate {
  config: DynamoDB.CreateTableInput;
  data: any;
}

interface BoxData { // this is duplicated in box/src/client/index.ts
  id: string;
  version: number;
  boxItems: {
    itemID: string;
    count: number;
    depleted?: number;
  }[];
  packed: string;
  shipped: string;
  received: string;
  closed?: string;
}

const template = ({
  readCapacityUnits,
  writeCapacityUnits,
  dummyData,
  config = {}
}: TemplateArgument): TableTemplate => ({
  config: {
    ...(config || {}),
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
      ...(config.KeySchema || [])
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      ...(config.AttributeDefinitions || [])
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: readCapacityUnits,
      WriteCapacityUnits: writeCapacityUnits
    }
  },
  data: dummyData
});

const dummyBoxData: BoxData[] = [
  {
    id: '06439c6c-57c9-4a17-b218-2018ea8dae55',
    version: 0,
    boxItems: [
      { itemID: '46ced0c0-8815-4ed2-bfb6-40537f5bd512', count: 3 },
      { itemID: 'faeda516-bd9f-41ec-b949-7a676312b0ae', count: 7, depleted: 1489157268215 },
      { itemID: 'cf7a7886-c30d-4760-8c15-39adb2dc8649', count: 7 }
    ],
    packed: '20170127',
    shipped: '20170128',
    received: '20170130'
  },
  {
    id: 'a7a863c6-9974-475d-96e9-4b4078a2e1c2',
    version: 0,
    boxItems: [
      { itemID: '46ced0c0-8815-4ed2-bfb6-40537f5bd512', count: 4 },
      { itemID: 'faeda516-bd9f-41ec-b949-7a676312b0ae', count: 6, depleted: 1489157268215 },
      { itemID: 'cf7a7886-c30d-4760-8c15-39adb2dc8649', count: 8, depleted: 1489157268215 }
    ],
    packed: '20170129',
    shipped: '20170130',
    received: '20170131'
  },
  {
    id: '5b3b4683-918e-49b1-bc68-9c33a5bbdf33',
    version: 0,
    boxItems: [
      { itemID: '46ced0c0-8815-4ed2-bfb6-40537f5bd512', count: 10, depleted: 1489157268215 },
      { itemID: 'faeda516-bd9f-41ec-b949-7a676312b0ae', count: 12, depleted: 1489157268215 },
      { itemID: 'cf7a7886-c30d-4760-8c15-39adb2dc8649', count: 15, depleted: 1489157268215 }
    ],
    packed: '20170130',
    shipped: '20170130',
    received: '20170130',
    closed: '20170131'
  }
];

const dirToTable = {
  user: ({ readCapacityUnits, writeCapacityUnits }) => template({
    readCapacityUnits,
    writeCapacityUnits,
    dummyData: [
      {
        id: 'c50234ff-6c33-4878-a1ab-05f6b3e7b649',
        accountId: 'b423607f-64de-441f-ac39-12d50aaedbe9',
        emailAddress: 'c50234ff-6c33-4878-a1ab-05f6b3e7b649@example.com',
        refreshToken: '34726c71-92aa-4e2e-83ec-0b4a5d83dedf'
      }
    ]
  }),

  transaction: ({ readCapacityUnits, writeCapacityUnits }) => template({
    readCapacityUnits,
    writeCapacityUnits,
    dummyData: [
      {
        id: 'b423607f-64de-441f-ac39-12d50aaedbe9',
        created: 1487667277000,
        balance: 0,
        transactions: []
      },
      {
        id: '0b0117da-21b5-4a5e-9c18-7ad20691dd24',
        created: 1487667277000,
        balance: 100,
        transactions: [
          {
            id: 'c2e1ba91-ba1d-497b-b2a2-4f7ed1d91685',
            type: 'topup',
            amount: 100,
            data: {}
          }
        ]
      },
      {
        id: '08ccf030-537a-4c81-9789-70476dad152a',
        created: 1487667277000,
        balance: 123,
        transactions: [
          {
            id: 'bcbf62c2-defd-4049-b3bb-4cfb87b2c15d',
            type: 'purchase',
            amount: 77,
            data: {}
          },
          {
            id: 'd2b51e9e-c776-4b96-bf71-3cb70cd53aad',
            type: 'topup',
            amount: 200,
            data: {}
          }
        ]
      }
    ]
  }),

  topup: ({ readCapacityUnits, writeCapacityUnits }) => template({
    readCapacityUnits,
    writeCapacityUnits,
    dummyData: [
      {
        id: 'df39d529-8f35-4e04-a91f-408c189563f1',
        accountId: 'b423607f-64de-441f-ac39-12d50aaedbe9',
        userId: 'c50234ff-6c33-4878-a1ab-05f6b3e7b649',
        created: 1487667277000,
        test: true
      }
    ],
    config: {
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'userId',
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' }
          ],
          Projection: {
            ProjectionType: 'KEYS_ONLY'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: readCapacityUnits,
            WriteCapacityUnits: writeCapacityUnits
          }
        }
      ]
    }
  }),

  survey: ({ readCapacityUnits, writeCapacityUnits }) => template({
    readCapacityUnits,
    writeCapacityUnits,
    dummyData: []
  }),

  box: ({ readCapacityUnits, writeCapacityUnits }) => template({
    readCapacityUnits,
    writeCapacityUnits,
    dummyData: dummyBoxData
  })
};

export default ({ dir, readCapacityUnits, writeCapacityUnits }) => {
  const createJSON: (_: { readCapacityUnits, writeCapacityUnits }) => TableTemplate = dirToTable[dir];

  if (!createJSON) {
    throw new Error(`no container for directory '${dir}'`);
  }

  return createJSON({ readCapacityUnits, writeCapacityUnits });
};
