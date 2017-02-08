import { getItem } from './item';

interface Stock {
  id: string;
  purchased: string;
  quantity: number;
  supplier: string;
  supplierCode?: string;
  itemId: string;
  itemQuantity: number;
  expiry: string;
  priceExcludingTax: string;
  priceIncludingTax: string;
}

const items = [
  // Residual from bulky
  {
    id: '782f0776-ccf3-43a8-9ba6-386e80b12dd3',
    purchased: 'UNKNOWN',
    quantity: 1,
    supplier: 'UNKNOWN',
    supplierCode: 'UNKNOWN',
    itemId: '8e9bb2db-9437-4733-acc1-f5e218e0a603',
    itemQuantity: 1,
    expiry: 'UNKNOWN',
    priceExcludingTax: 'UNKNOWN',
    priceIncludingTax: 'UNKNOWN'
  },
  {
    id: 'ae3c4d05-fb9c-48d7-b22f-6f8761636b88',
    purchased: 'UNKNOWN',
    quantity: 1,
    supplier: 'UNKNOWN',
    supplierCode: 'UNKNOWN',
    itemId: '272c6a59-9b4c-41b6-b839-0f8be506728e',
    itemQuantity: 20,
    expiry: 'UNKNOWN',
    priceExcludingTax: 'UNKNOWN',
    priceIncludingTax: 'UNKNOWN'
  },
  {
    id: '9d1c7e32-bcf5-4a98-b9b9-72e21965118d',
    purchased: 'UNKNOWN',
    quantity: 1,
    supplier: 'UNKNOWN',
    supplierCode: 'UNKNOWN',
    itemId: '606e12d4-6367-4fc3-aa7a-92ee17ccac2c',
    itemQuantity: 2,
    expiry: 'UNKNOWN',
    priceExcludingTax: 'UNKNOWN',
    priceIncludingTax: 'UNKNOWN'
  },
  {
    id: '20a721b8-78be-4e5f-ad85-21284d560ddc',
    purchased: 'UNKNOWN',
    quantity: 1,
    supplier: 'UNKNOWN',
    supplierCode: 'UNKNOWN',
    itemId: '32919485-d806-4be6-824b-170f66371306',
    itemQuantity: 15,
    expiry: 'UNKNOWN',
    priceExcludingTax: 'UNKNOWN',
    priceIncludingTax: 'UNKNOWN'
  },
  {
    id: '284a7cf7-16c9-428f-8d95-8af82b0a1bd1',
    purchased: 'UNKNOWN',
    quantity: 1,
    supplier: 'UNKNOWN',
    supplierCode: 'UNKNOWN',
    itemId: 'e91e7274-fe28-405c-86c8-5768197eb6ac',
    itemQuantity: 16,
    expiry: 'UNKNOWN',
    priceExcludingTax: 'UNKNOWN',
    priceIncludingTax: 'UNKNOWN'
  },
  {
    id: 'c57f77b2-35b2-4283-a2e0-9f9c91afd71e',
    purchased: 'UNKNOWN',
    quantity: 1,
    supplier: 'UNKNOWN',
    supplierCode: 'UNKNOWN',
    itemId: '96ce1162-9188-41ac-9d35-8fc6a14783ef',
    itemQuantity: 20,
    expiry: '20170601',
    priceExcludingTax: '6.99',
    priceIncludingTax: '6.99'
  },

  // Chris initial costco purchase
  {
    id: '1bea7790-5c53-4bdc-91dd-21b004310ac1',
    purchased: '20170112',
    quantity: 1,
    supplier: 'Costco',
    supplierCode: 'UNKNOWN',
    itemId: '46ced0c0-8815-4ed2-bfb6-40537f5bd512',
    itemQuantity: 32,
    expiry: 'UNKNOWN',
    priceExcludingTax: '9.79',
    priceIncludingTax: '11.74'
  },
  {
    id: '03e918c6-8868-4682-9c40-43caebdfc5b7',
    purchased: '20170112',
    quantity: 2,
    supplier: 'Costco',
    supplierCode: '163126',
    itemId: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
    itemQuantity: 40,
    expiry: 'UNKNOWN',
    priceExcludingTax: '9.99',
    priceIncludingTax: '11.98'
  },
  {
    id: '664c275f-1f61-4a10-be53-7cb3cdeffa68',
    purchased: '20170112',
    quantity: 2,
    supplier: 'Costco',
    supplierCode: '68',
    itemId: 'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8',
    itemQuantity: 48,
    expiry: 'UNKNOWN',
    priceExcludingTax: '14.99',
    priceIncludingTax: '17.98'
  },
  {
    id: '5001ac6a-d026-49b4-9c7c-72a299245edc',
    purchased: '20170112',
    quantity: 2,
    supplier: 'Costco',
    supplierCode: '84',
    itemId: '78816fba-150d-4282-b43d-900df45cea8b',
    itemQuantity: 36,
    expiry: 'UNKNOWN',
    priceExcludingTax: '10.69',
    priceIncludingTax: '12.82'
  },
  {
    id: '47a13720-bbb4-4139-bd58-238b5b876fa1',
    purchased: '20170112',
    quantity: 2,
    supplier: 'Costco',
    supplierCode: '186578',
    itemId: '02bbc0fd-54c4-45bb-9b77-21b79b356aa6',
    itemQuantity: 96,
    expiry: 'UNKNOWN',
    priceExcludingTax: '18.99',
    priceIncludingTax: '22.78'
  },

  // Receipt: https://goo.gl/photos/tPtxxtSYaqFpj4oo7, paid: no
  {
    id: '3af2571d-abe2-49f3-849e-9f180a1a8f8f',
    purchased: '20170206',
    quantity: 3,
    supplier: 'Poundstretcher',
    supplierCode: '263178',
    itemId: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
    itemQuantity: 10,
    expiry: '20170801',
    priceExcludingTax: '2.49',
    priceIncludingTax: '2.99'
  },

  // Chris Costco purchase
  // Receipt: https://goo.gl/photos/iLP7HjdR5mucKcCb8, paid: no
  {
    id: 'cfb47dd9-78f0-4b50-9448-8e8916c0afb6',
    purchased: '20170206',
    quantity: 3,
    supplier: 'Costco',
    supplierCode: '186384',
    itemId: '3fa0db7c-3f90-404e-b875-3792eda3e185',
    itemQuantity: 48,
    expiry: '20170801',
    priceExcludingTax: '15.79',
    priceIncludingTax: '18.94'
  },
  {
    id: 'e506d540-4d6c-4199-a4c9-32418baa6191',
    purchased: '20170206',
    quantity: 3,
    supplier: 'Costco',
    supplierCode: '163126',
    itemId: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
    itemQuantity: 40,
    expiry: '20170919',
    priceExcludingTax: '6.49',
    priceIncludingTax: '7.78'
  },
  {
    id: 'e5e1ac40-1835-4d80-b1b2-af07d34860fd',
    purchased: '20170206',
    quantity: 2,
    supplier: 'Costco',
    supplierCode: '208528',
    itemId: '28b0a802-bef3-478b-81d0-034e3ac02092',
    itemQuantity: 32,
    expiry: '20170318',
    priceExcludingTax: '9.79',
    priceIncludingTax: '11.74'
  }
];

const stock = new Map<string, Stock>();
for (const item of items) {
  if (stock.has(item.id)) {
    throw new Error(`Duplicate ID ${item.id}`);
  }
  // ensure the itemId is valid
  getItem(item.itemId);
  stock.set(item.id, item);
}
