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
    wholesaleCost: number;
    shippingCost: number;
    warehousingCost: number;
    packagingCost: number;
    packingCost: number;
    serviceFee: number;
    creditCardFee: number;
    subtotal: number;
    VAT: number;
    donation: number;
    total: number;
    expiry: number;
  }[];
  shippingCost: number;
  packed?: number;
  shipped?: number;
  received?: number;
  closed?: number;
  count: number;
  donationRate: number;
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

const expiry = 1492513200000;

const shipping = {
  shippingCost: 300,
  packed: 1485475200000,
  shipped: 1485561600000,
  received: 1485734400000
};

const walkersBoxItem = {
  wholesaleCost: 15,
  shippingCost: 3,
  warehousingCost: 2,
  packagingCost: 3,
  packingCost: 2,
  serviceFee: 2,
  creditCardFee: 2,
  subtotal: 29,
  VAT: 0,
  donation: 1,
  total: 30,
  expiry
};

const natureValleyBoxItem = {
  wholesaleCost: 20,
  shippingCost: 5,
  warehousingCost: 5,
  packagingCost: 3,
  packingCost: 2,
  serviceFee: 5,
  creditCardFee: 5,
  subtotal: 45,
  VAT: 5,
  donation: 1,
  total: 51,
  expiry
};

const dietCokeBoxItem = {
  wholesaleCost: 50,
  shippingCost: 10,
  warehousingCost: 5,
  packagingCost: 5,
  packingCost: 10,
  serviceFee: 10,
  creditCardFee: 10,
  subtotal: 100,
  VAT: 30,
  donation: 10,
  total: 130,
  expiry
};

const dummyBoxData: BoxData[] = [
  {
    id: 'f46228cc-a138-495d-b28e-c5f7f0973f56',
    storeId: 'dev-test',
    version: 0,
    shippingCost: 0,
    packed: 1491300007664,
    shipped: 1491300007664,
    received: 1491300007664,
    count: 20,
    donationRate: 0.1,
    boxItems: [
      {
        itemID: '32a9520f-f407-42ee-9bc5-ab9e2a9c76ea',
        batches: [
          {
            id: '989721c5-b0db-43b0-8c49-0db83a1b3276',
            count: 20
          }
        ],
        count: 20,
        wholesaleCost: 30,
        serviceFee: 3,
        subtotal: 33,
        donation: 3,
        total: 36,
        VAT: 0,
        shippingCost: 0,
        warehousingCost: 0,
        packagingCost: 0,
        packingCost: 0,
        creditCardFee: 0,
        expiry
      }
    ]
  },
  {
    id: '06439c6c-57c9-4a17-b218-2018ea8dae55',
    storeId: 'dev-test',
    version: 0,
    donationRate: 0.1,
    boxItems: [
      {
        itemID: '46ced0c0-8815-4ed2-bfb6-40537f5bd512',
        count: 3,
        batches: [
          {
            id: '1bea7790-5c53-4bdc-91dd-21b004310ac1',
            count: 3
          }
        ],
        ...walkersBoxItem
      },
      {
        itemID: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
        count: 7,
        depleted: 1489157268215,
        batches: [
          {
            id: '03e918c6-8868-4682-9c40-43caebdfc5b7',
            count: 7
          }
        ],
        ...natureValleyBoxItem
      },
      {
        itemID: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
        count: 7,
        batches: [
          {
            id: '3af2571d-abe2-49f3-849e-9f180a1a8f8f',
            count: 7
          }
        ],
        ...dietCokeBoxItem
      }
    ],
    count: 17,
    ...shipping
  },
  {
    id: 'a7a863c6-9974-475d-96e9-4b4078a2e1c2',
    storeId: 'dev-test',
    version: 0,
    donationRate: 0.1,
    boxItems: [
      {
        itemID: '46ced0c0-8815-4ed2-bfb6-40537f5bd512',
        count: 4,
        batches: [
          {
            id: '1bea7790-5c53-4bdc-91dd-21b004310ac1',
            count: 4
          }
        ],
        ...walkersBoxItem
      },
      {
        itemID: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
        count: 6,
        depleted: 1489157268215,
        batches: [
          {
            id: '03e918c6-8868-4682-9c40-43caebdfc5b7',
            count: 6
          }
        ],
        ...natureValleyBoxItem
      },
      {
        itemID: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
        count: 8,
        depleted: 1489157268215,
        batches: [
          {
            id: '3af2571d-abe2-49f3-849e-9f180a1a8f8f',
            count: 8
          }
        ],
        ...dietCokeBoxItem
      }
    ],
    ...shipping,
    count: 18
  },
  {
    id: '5b3b4683-918e-49b1-bc68-9c33a5bbdf33',
    storeId: 'dev-test',
    version: 0,
    donationRate: 0.1,
    boxItems: [
      {
        itemID: '46ced0c0-8815-4ed2-bfb6-40537f5bd512',
        count: 10,
        depleted: 1489157268215,
        batches: [
          {
            id: '1bea7790-5c53-4bdc-91dd-21b004310ac1',
            count: 10
          }
        ],
        ...walkersBoxItem
      },
      {
        itemID: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
        count: 12,
        depleted: 1489157268215,
        batches: [
          {
            id: '03e918c6-8868-4682-9c40-43caebdfc5b7',
            count: 12
          }
        ],
        ...natureValleyBoxItem
      },
      {
        itemID: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
        count: 15,
        depleted: 1489157268215,
        batches: [
          {
            id: '3af2571d-abe2-49f3-849e-9f180a1a8f8f',
            count: 15
          }
        ],
        ...dietCokeBoxItem
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
        defaultStoreId: 'dev-test',
        emailAddress: 'support@honesty.store',
        refreshToken: '34726c71-92aa-4e2e-83ec-0b4a5d83dedf'
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
        transactionHead: '0b0117da-21b5-4a5e-9c18-7ad20691dd24:abd853b75d730ce035dfb04e99f195703dd3c705ce58272d852154e3c23b7c99'
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
        transactionHead: '08ccf030-537a-4c81-9789-70476dad152a:282cb208113826eb54568759f56eb386d835174436d7da5591eb9f27bd80341a'
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
        id: 'b423607f-64de-441f-ac39-12d50aaedbe9'
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
        weight: 30,
        unit: 'bar',
        unitPlural: 'bars',
        genericName: 'cereal bar',
        genericNamePlural: 'cereal bars'
      },
      {
        id: '46ced0c0-8815-4ed2-bfb6-40537f5bd512',
        name: 'Walkers',
        image: 'walkers-cheese-onion.svg',
        weight: 32.5,
        qualifier: 'Cheese & Onion',
        unit: 'pack',
        unitPlural: 'packs',
        genericName: 'crisps',
        genericNamePlural: 'crisps'
      },
      {
        id: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
        name: 'Diet Coke',
        location: 'Fridge',
        image: 'diet-cola-can.svg',
        weight: 400,
        unit: 'can',
        unitPlural: 'cans',
        genericName: 'drink',
        genericNamePlural: 'drinks'
      },
      {
        id: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
        name: 'Nature Valley',
        qualifier: 'Crunchy Oats & Honey',
        image: 'nature-valley-oats-n-honey.svg',
        weight: 42,
        unit: 'bar',
        unitPlural: 'bars',
        genericName: 'cereal bar',
        genericNamePlural: 'cereal bars'
      }
    ]
  }),

  batch: ({ readCapacityUnits, writeCapacityUnits }) => template({
    readCapacityUnits,
    writeCapacityUnits,
    dummyData: [
      {
        id: '03e918c6-8868-4682-9c40-43caebdfc5b7',
        purchased: 1484179200000,
        version: 0,
        quantity: 2,
        supplier: 'Costco',
        supplierCode: '163126',
        itemId: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
        itemQuantity: 40,
        expiry: null,
        priceExcludingVAT: 999,
        VATRate: 0.2
      },
      {
        id: '1bea7790-5c53-4bdc-91dd-21b004310ac1',
        purchased: 1484179200000,
        version: 0,
        quantity: 1,
        supplier: 'Costco',
        supplierCode: null,
        itemId: '46ced0c0-8815-4ed2-bfb6-40537f5bd512',
        itemQuantity: 32,
        expiry: null,
        priceExcludingVAT: 979,
        VATRate: 0.2
      },
      {
        id: '3af2571d-abe2-49f3-849e-9f180a1a8f8f',
        purchased: 1486339200000,
        version: 0,
        quantity: 3,
        supplier: 'Poundstretcher',
        supplierCode: '263178',
        itemId: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
        itemQuantity: 10,
        expiry: 1483833600000,
        priceExcludingVAT: 249,
        VATRate: 0.2
      },
      {
        id: '989721c5-b0db-43b0-8c49-0db83a1b3276',
        purchased: 1484179200000,
        version: 0,
        quantity: 1,
        supplier: 'HS_MARKETPLACE',
        supplierCode: 'c50234ff-6c33-4878-a1ab-05f6b3e7b649',
        itemId: '32a9520f-f407-42ee-9bc5-ab9e2a9c76ea',
        itemQuantity: 20,
        expiry: 1506812400000,
        priceExcludingVAT: 1000,
        VATRate: 0
      }
    ]
  }),

  store: ({ readCapacityUnits, writeCapacityUnits }) => template({
    readCapacityUnits,
    writeCapacityUnits,
    dummyData: [
      {
        id: '1e7c9c0d-a9be-4ab7-8499-e57bf859978d',
        code: 'dev-test',
        agentId: 'c50234ff-6c33-4878-a1ab-05f6b3e7b649'
      }
    ]
  })
};

export default ({ dir, readCapacityUnits, writeCapacityUnits }) => {
  const createJSON: (_: { readCapacityUnits, writeCapacityUnits }) => TableTemplate = dirToTable[dir];

  if (!createJSON) {
    throw new Error(`no container for directory '${dir}'`);
  }

  return createJSON({ readCapacityUnits, writeCapacityUnits });
};
