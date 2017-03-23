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
  storeId: string;
  version: number;
  boxItems: {
    itemID: string;
    batches: {
      id: string;
      count: number;
    }[];
    count: number;
    depleted?: number;
    shippingCost: number;
    warehousingCost: number;
    packagingCost: number;
    packingCost: number;
    serviceFee: number;
    creditCardFee: number;
    subtotal: number;
    VAT: number;
    total: number;
  }[];
  shippingCost: number;
  packed?: number;
  shipped?: number;
  received?: number;
  closed?: number;
  count: number;
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

const shipping = {
  shippingCost: 300,
  packed: 1485475200000,
  shipped: 1485561600000,
  received: 1485734400000
};

const walkersCosts = {
  // wholesale cost: 15
  shippingCost: 3,
  warehousingCost: 2,
  packagingCost: 3,
  packingCost: 2,
  serviceFee: 2,
  creditCardFee: 3,
  subtotal: 30,
  VAT: 0,
  total: 30
}

const natureValleyCosts = {
  // wholesale cost: 20
  shippingCost: 5,
  warehousingCost: 5,
  packagingCost: 3,
  packingCost: 2,
  serviceFee: 5,
  creditCardFee: 5,
  subtotal: 45,
  VAT: 6,
  total: 51
}

const dietCokeCosts = {
  // wholesale cost: 50
  shippingCost: 10,
  warehousingCost: 5,
  packagingCost: 5,
  packingCost: 10,
  serviceFee: 10,
  creditCardFee: 10,
  subtotal: 100,
  VAT: 30,
  total: 130
}

const dummyBoxData: BoxData[] = [
  {
    id: '06439c6c-57c9-4a17-b218-2018ea8dae55',
    storeId: 'dev-test',
    version: 0,
    boxItems: [
      {
        itemID: '46ced0c0-8815-4ed2-bfb6-40537f5bd512',
        count: 3,
        batches: [
          {
            // these batch ids are entirely fabricated and don't refer to anything
            id: '67a144ae-57bd-4887-ad4d-be579a1255a7',
            count: 3
          }
        ],
        ...walkersCosts
      },
      {
        itemID: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
        count: 7,
        depleted: 1489157268215,
        batches: [
          {
            id: '85b9c287-7df8-4f84-b43c-0d04e24f6f18',
            count: 7
          }
        ],
        ...natureValleyCosts
      },
      {
        itemID: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
        count: 7,
        batches: [
          {
            id: '8811ffd0-d2d6-4d6c-bd75-f2fd40d0e113',
            count: 7
          }
        ],
        ...dietCokeCosts
      }
    ],
    count: 17,
    ...shipping
  },
  {
    id: 'a7a863c6-9974-475d-96e9-4b4078a2e1c2',
    storeId: 'dev-test',
    version: 0,
    boxItems: [
      {
        itemID: '46ced0c0-8815-4ed2-bfb6-40537f5bd512',
        count: 4,
        batches: [
          {
            id: '99eb764f-76b5-488f-b797-e463db39fd39',
            count: 4
          }
        ],
        ...walkersCosts
      },
      {
        itemID: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
        count: 6,
        depleted: 1489157268215,
        batches: [
          {
            id: 'af6ecd4c-5b08-4ee8-ae6f-9ba13036f749',
            count: 6
          }
        ],
        ...natureValleyCosts
      },
      {
        itemID: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
        count: 8,
        depleted: 1489157268215,
        batches: [
          {
            id: 'baff2a00-0ae7-4d9b-b35c-59b5133f3709',
            count: 8
          }
        ],
        ...dietCokeCosts
      }
    ],
    ...shipping,
    count: 18
  },
  {
    id: '5b3b4683-918e-49b1-bc68-9c33a5bbdf33',
    storeId: 'dev-test',
    version: 0,
    boxItems: [
      {
        itemID: '46ced0c0-8815-4ed2-bfb6-40537f5bd512',
        count: 10,
        depleted: 1489157268215,
        batches: [
          {
            id: '4e8aae2f-cc53-4b5f-bd1c-7fb0e35b2283',
            count: 10
          }
        ],
        ...walkersCosts
      },
      {
        itemID: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
        count: 12,
        depleted: 1489157268215,
        batches: [
          {
            id: '5d9d658d-0c36-4373-bebf-8742d0e8c59a',
            count: 12
          }
        ],
        ...natureValleyCosts
      },
      {
        itemID: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
        count: 15,
        depleted: 1489157268215,
        batches: [
          {
            id: '002984a8-9030-4b0a-9fca-d2769de73356',
            count: 15
          }
        ],
        ...dietCokeCosts
      }
    ],
    ...shipping,
    closed: 1485820800000,
    count: 37
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
