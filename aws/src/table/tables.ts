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

const dirToTable = {
  user: ({ readCapacityUnits, writeCapacityUnits }) => template({
    readCapacityUnits,
    writeCapacityUnits,
    dummyData: [
      {
        id: 'c50234ff-6c33-4878-a1ab-05f6b3e7b649',
        accountId: 'b423607f-64de-441f-ac39-12d50aaedbe9',
        defaultStoreId: '1e7c9c0d-a9be-4ab7-8499-e57bf859978d',
        emailAddress: 'support@honesty.store',
        refreshToken: '34726c71-92aa-4e2e-83ec-0b4a5d83dedf',
        version: 0
      },
      {
        id: '9127e1db-2a2c-41c5-908f-781ac816b633',
        accountId: 'b411a0e5-7dce-4a7c-830b-72a0e46c9d7a',
        defaultStoreId: '1e7c9c0d-a9be-4ab7-8499-e57bf859978d',
        emailAddress: 'admin@scottlogic.co.uk',
        refreshToken: null,
        version: 0
      }
    ]
  }),

  transaction: ({ readCapacityUnits, writeCapacityUnits }) => template({
    readCapacityUnits,
    writeCapacityUnits,
    dummyData: [
      {
        balance: 100,
        cachedTransactions: [
          {
            amount: 100,
            data: {},
            id: '0b0117da-21b5-4a5e-9c18-7ad20691dd24:abd853b75d730ce035dfb04e99f195703dd3c705ce58272d852154e3c23b7c99',
            legacyId: 'c2e1ba91-ba1d-497b-b2a2-4f7ed1d91685',
            type: 'topup'
          }
        ],
        created: 1487667277000,
        id: '0b0117da-21b5-4a5e-9c18-7ad20691dd24',
        transactionHead: '0b0117da-21b5-4a5e-9c18-7ad20691dd24:abd853b75d730ce035dfb04e99f195703dd3c705ce58272d852154e3c23b7c99',
        version: 0
      },
      {
        balance: 123,
        cachedTransactions: [
          {
            amount: -77,
            data: {},
            id: '08ccf030-537a-4c81-9789-70476dad152a:282cb208113826eb54568759f56eb386d835174436d7da5591eb9f27bd80341a',
            legacyId: 'bcbf62c2-defd-4049-b3bb-4cfb87b2c15d',
            next: '08ccf030-537a-4c81-9789-70476dad152a:764f266ec07e9374983152894168b91ae3237bce4f11d3654d9278892e777d1c',
            type: 'purchase'
          },
          {
            amount: 200,
            data: {},
            id: '08ccf030-537a-4c81-9789-70476dad152a:764f266ec07e9374983152894168b91ae3237bce4f11d3654d9278892e777d1c',
            legacyId: 'd2b51e9e-c776-4b96-bf71-3cb70cd53aad',
            type: 'topup'
          }
        ],
        created: 1487667277000,
        id: '08ccf030-537a-4c81-9789-70476dad152a',
        transactionHead: '08ccf030-537a-4c81-9789-70476dad152a:282cb208113826eb54568759f56eb386d835174436d7da5591eb9f27bd80341a',
        version: 0
      },
      {
        amount: 100,
        data: {},
        id: '0b0117da-21b5-4a5e-9c18-7ad20691dd24:abd853b75d730ce035dfb04e99f195703dd3c705ce58272d852154e3c23b7c99',
        legacyId: 'c2e1ba91-ba1d-497b-b2a2-4f7ed1d91685',
        type: 'topup'
      },
      {
        amount: -77,
        data: {},
        id: '08ccf030-537a-4c81-9789-70476dad152a:282cb208113826eb54568759f56eb386d835174436d7da5591eb9f27bd80341a',
        legacyId: 'bcbf62c2-defd-4049-b3bb-4cfb87b2c15d',
        next: '08ccf030-537a-4c81-9789-70476dad152a:764f266ec07e9374983152894168b91ae3237bce4f11d3654d9278892e777d1c',
        type: 'purchase'
      },
      {
        amount: 200,
        data: {},
        id: '08ccf030-537a-4c81-9789-70476dad152a:764f266ec07e9374983152894168b91ae3237bce4f11d3654d9278892e777d1c',
        legacyId: 'd2b51e9e-c776-4b96-bf71-3cb70cd53aad',
        type: 'topup'
      },
      {
        balance: 0,
        cachedTransactions: [],
        created: 1487667277000,
        id: 'b423607f-64de-441f-ac39-12d50aaedbe9',
        version: 0
      },
      {
        balance: 0,
        cachedTransactions: [],
        created: 1500545744909,
        id: 'b411a0e5-7dce-4a7c-830b-72a0e46c9d7a',
        version: 0
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
      },
      {
        id: '74385eed-74b6-40aa-a5f3-cc43be364f58',
        accountId: 'b411a0e5-7dce-4a7c-830b-72a0e46c9d7a',
        userId: '9127e1db-2a2c-41c5-908f-781ac816b633',
        created: 1500545744909,
        test: false
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

  item: ({ readCapacityUnits, writeCapacityUnits }) => template({
    readCapacityUnits,
    writeCapacityUnits,
    dummyData: [
      {
        id: '32a9520f-f407-42ee-9bc5-ab9e2a9c76ea',
        name: 'Nakd',
        qualifier: 'Apple Crunch Bar',
        image: 'nakd-apple-crunch.svg',
        version: 0
      },
      {
        id: '46ced0c0-8815-4ed2-bfb6-40537f5bd512',
        name: 'Walkers',
        image: 'walkers-cheese-onion.svg',
        qualifier: 'Cheese & Onion',
        version: 0
      },
      {
        id: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
        name: 'Diet Coke',
        image: 'diet-cola-can.svg',
        version: 0
      },
      {
        id: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
        name: 'Nature Valley',
        qualifier: 'Crunchy Oats & Honey',
        image: 'nature-valley-oats-n-honey.svg',
        version: 0
      }
    ]
  }),

  store: ({ readCapacityUnits, writeCapacityUnits }) => template({
    readCapacityUnits,
    writeCapacityUnits,
    dummyData: [
      {
        agentId: 'c50234ff-6c33-4878-a1ab-05f6b3e7b649',
        code: 'dev-test',
        created: 1497426973580,
        id: '1e7c9c0d-a9be-4ab7-8499-e57bf859978d',
        items: [
          {
            availableCount: 1000,
            id: '46ced0c0-8815-4ed2-bfb6-40537f5bd512',
            image: 'walkers-cheese-onion.svg',
            listCount: 1000,
            name: 'Walkers',
            price: 30,
            purchaseCount: 0,
            qualifier: 'Cheese & Onion',
            refundCount: 0,
            sellerId: '9127e1db-2a2c-41c5-908f-781ac816b633',
            revenue: 0
          },
          {
            availableCount: 1000,
            id: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
            image: 'nature-valley-oats-n-honey.svg',
            listCount: 1000,
            name: 'Nature Valley',
            price: 51,
            purchaseCount: 0,
            qualifier: 'Crunchy Oats & Honey',
            refundCount: 0,
            sellerId: '9127e1db-2a2c-41c5-908f-781ac816b633',
            revenue: 0
          },
          {
            availableCount: 1000,
            id: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
            image: 'diet-cola-can.svg',
            listCount: 1000,
            name: 'Diet Coke',
            price: 130,
            purchaseCount: 0,
            refundCount: 0,
            sellerId: '9127e1db-2a2c-41c5-908f-781ac816b633',
            revenue: 0
          },
          {
            availableCount: 1000,
            id: '32a9520f-f407-42ee-9bc5-ab9e2a9c76ea',
            image: 'nakd-apple-crunch.svg',
            listCount: 1000,
            name: 'Nakd',
            price: 36,
            purchaseCount: 0,
            qualifier: 'Apple Crunch Bar',
            refundCount: 0,
            sellerId: 'c50234ff-6c33-4878-a1ab-05f6b3e7b649',
            revenue: 0
          }
        ],
        lastEvent: null,
        lastReceived: {
          data: {
            id: '0e02a0c9-40fa-4083-98b7-b5e8a183d251',
            listing: {
              id: '32a9520f-f407-42ee-9bc5-ab9e2a9c76ea',
              image: 'nakd-apple-crunch.svg',
              listCount: 1000,
              name: 'Nakd',
              price: 36,
              qualifier: 'Apple Crunch Bar',
              sellerId: 'c50234ff-6c33-4878-a1ab-05f6b3e7b649'
            },
            storeId: '1e7c9c0d-a9be-4ab7-8499-e57bf859978d',
            type: 'store-list'
          },
          id: '0e02a0c9-40fa-4083-98b7-b5e8a183d251',
          previous: '9c071db4-8417-4131-9b1e-4ce5f07353d3'
        },
        modified: 1497427124564,
        version: 4,
        revenue: []
      },
      {
        created: 1497427123919,
        data: {
          id: '37919edb-09e4-47ee-8b9e-42be8d01b52a',
          listing: {
            id: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
            image: 'nature-valley-oats-n-honey.svg',
            listCount: 1000,
            name: 'Nature Valley',
            price: 51,
            qualifier: 'Crunchy Oats & Honey',
            sellerId: '9127e1db-2a2c-41c5-908f-781ac816b633'
          },
          storeId: '1e7c9c0d-a9be-4ab7-8499-e57bf859978d',
          type: 'store-list'
        },
        id: '37919edb-09e4-47ee-8b9e-42be8d01b52a',
        modified: 1497427123919,
        previous: '18e23611-4330-4473-bbdb-02310be2ce5c',
        version: 0
      },
      {
        created: 1497427124481,
        data: {
          id: '9c071db4-8417-4131-9b1e-4ce5f07353d3',
          listing: {
            id: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
            image: 'diet-cola-can.svg',
            listCount: 1000,
            name: 'Diet Coke',
            price: 130,
            sellerId: '9127e1db-2a2c-41c5-908f-781ac816b633'
          },
          storeId: '1e7c9c0d-a9be-4ab7-8499-e57bf859978d',
          type: 'store-list'
        },
        id: '9c071db4-8417-4131-9b1e-4ce5f07353d3',
        modified: 1497427124481,
        previous: '37919edb-09e4-47ee-8b9e-42be8d01b52a',
        version: 0
      },
      {
        created: 1497427123384,
        data: {
          id: '18e23611-4330-4473-bbdb-02310be2ce5c',
          listing: {
            id: '46ced0c0-8815-4ed2-bfb6-40537f5bd512',
            image: 'walkers-cheese-onion.svg',
            listCount: 1000,
            name: 'Walkers',
            price: 30,
            qualifier: 'Cheese & Onion',
            sellerId: '9127e1db-2a2c-41c5-908f-781ac816b633'
          },
          storeId: '1e7c9c0d-a9be-4ab7-8499-e57bf859978d',
          type: 'store-list'
        },
        id: '18e23611-4330-4473-bbdb-02310be2ce5c',
        modified: 1497427123384,
        version: 0
      }
    ]
  })
};

export default ({ dir, readCapacityUnits, writeCapacityUnits }) => {
  const createJSON: (_: { readCapacityUnits, writeCapacityUnits }) => TableTemplate = dirToTable[dir];

  if (!createJSON) {
    throw new Error(`no table entry for directory '${dir}'`);
  }

  return createJSON({ readCapacityUnits, writeCapacityUnits });
};
