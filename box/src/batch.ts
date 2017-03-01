import { getItem } from '../../api/src/services/item';

interface Batch {
  id: string;
  purchased?: number;
  quantity: number;
  supplier: string;
  supplierCode?: string;
  itemId: string;
  itemQuantity: number;
  expiry: string;
  priceExcludingTax?: number;
  priceIncludingTax?: number;
}

const batchesInternal: Batch[] = [
  // Residual from bulky
  {
    id: '782f0776-ccf3-43a8-9ba6-386e80b12dd3',
    purchased: null,
    quantity: 1,
    supplier: 'UNKNOWN',
    supplierCode: 'UNKNOWN',
    itemId: '8e9bb2db-9437-4733-acc1-f5e218e0a603',
    itemQuantity: 1,
    expiry: 'UNKNOWN',
    priceExcludingTax: null,
    priceIncludingTax: null
  },
  {
    id: 'ae3c4d05-fb9c-48d7-b22f-6f8761636b88',
    purchased: null,
    quantity: 1,
    supplier: 'UNKNOWN',
    supplierCode: 'UNKNOWN',
    itemId: '272c6a59-9b4c-41b6-b839-0f8be506728e',
    itemQuantity: 20,
    expiry: 'UNKNOWN',
    priceExcludingTax: null,
    priceIncludingTax: null
  },
  {
    id: '9d1c7e32-bcf5-4a98-b9b9-72e21965118d',
    purchased: null,
    quantity: 1,
    supplier: 'UNKNOWN',
    supplierCode: 'UNKNOWN',
    itemId: '606e12d4-6367-4fc3-aa7a-92ee17ccac2c',
    itemQuantity: 2,
    expiry: 'UNKNOWN',
    priceExcludingTax: null,
    priceIncludingTax: null
  },
  {
    id: '20a721b8-78be-4e5f-ad85-21284d560ddc',
    purchased: null,
    quantity: 1,
    supplier: 'UNKNOWN',
    supplierCode: 'UNKNOWN',
    itemId: '32919485-d806-4be6-824b-170f66371306',
    itemQuantity: 15,
    expiry: 'UNKNOWN',
    priceExcludingTax: null,
    priceIncludingTax: null
  },
  {
    id: '284a7cf7-16c9-428f-8d95-8af82b0a1bd1',
    purchased: null,
    quantity: 1,
    supplier: 'UNKNOWN',
    supplierCode: 'UNKNOWN',
    itemId: 'e91e7274-fe28-405c-86c8-5768197eb6ac',
    itemQuantity: 16,
    expiry: 'UNKNOWN',
    priceExcludingTax: null,
    priceIncludingTax: null
  },
  {
    id: 'c57f77b2-35b2-4283-a2e0-9f9c91afd71e',
    purchased: null,
    quantity: 1,
    supplier: 'UNKNOWN',
    supplierCode: 'UNKNOWN',
    itemId: '96ce1162-9188-41ac-9d35-8fc6a14783ef',
    itemQuantity: 20,
    expiry: '20170601',
    priceExcludingTax: 699,
    priceIncludingTax: 699
  },

  // Chris initial costco purchase
  {
    id: '1bea7790-5c53-4bdc-91dd-21b004310ac1',
    purchased: 1484179200,
    quantity: 1,
    supplier: 'Costco',
    supplierCode: 'UNKNOWN',
    itemId: '46ced0c0-8815-4ed2-bfb6-40537f5bd512',
    itemQuantity: 32,
    expiry: 'UNKNOWN',
    priceExcludingTax: 979,
    priceIncludingTax: 1174
  },
  {
    id: '03e918c6-8868-4682-9c40-43caebdfc5b7',
    purchased: 1484179200,
    quantity: 2,
    supplier: 'Costco',
    supplierCode: '163126',
    itemId: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
    itemQuantity: 40,
    expiry: 'UNKNOWN',
    priceExcludingTax: 999,
    priceIncludingTax: 1198
  },
  {
    id: '664c275f-1f61-4a10-be53-7cb3cdeffa68',
    purchased: 1484179200,
    quantity: 2,
    supplier: 'Costco',
    supplierCode: '68',
    itemId: 'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8',
    itemQuantity: 48,
    expiry: 'UNKNOWN',
    priceExcludingTax: 1499,
    priceIncludingTax: 1798
  },
  {
    id: '5001ac6a-d026-49b4-9c7c-72a299245edc',
    purchased: 1484179200,
    quantity: 2,
    supplier: 'Costco',
    supplierCode: '84',
    itemId: '78816fba-150d-4282-b43d-900df45cea8b',
    itemQuantity: 36,
    expiry: 'UNKNOWN',
    priceExcludingTax: 1069,
    priceIncludingTax: 1282
  },
  {
    id: '47a13720-bbb4-4139-bd58-238b5b876fa1',
    purchased: 1484179200,
    quantity: 2,
    supplier: 'Costco',
    supplierCode: '186578',
    itemId: '02bbc0fd-54c4-45bb-9b77-21b79b356aa6',
    itemQuantity: 96,
    expiry: 'UNKNOWN',
    priceExcludingTax: 1899,
    priceIncludingTax: 2278
  },

  // Receipt: https://goo.gl/photos/tPtxxtSYaqFpj4oo7, paid: no
  {
    id: '3af2571d-abe2-49f3-849e-9f180a1a8f8f',
    purchased: 1486339200,
    quantity: 3,
    supplier: 'Poundstretcher',
    supplierCode: '263178',
    itemId: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
    itemQuantity: 10,
    expiry: '20170801',
    priceExcludingTax: 249,
    priceIncludingTax: 299
  },

  // Chris Costco purchase
  // Receipt: https://goo.gl/photos/iLP7HjdR5mucKcCb8, paid: no
  {
    id: 'cfb47dd9-78f0-4b50-9448-8e8916c0afb6',
    purchased: 1486339200,
    quantity: 3,
    supplier: 'Costco',
    supplierCode: '186384',
    itemId: '3fa0db7c-3f90-404e-b875-3792eda3e185',
    itemQuantity: 48,
    expiry: '20170801',
    priceExcludingTax: 1579,
    priceIncludingTax: 1894
  },
  {
    id: 'e506d540-4d6c-4199-a4c9-32418baa6191',
    purchased: 1486339200,
    quantity: 3,
    supplier: 'Costco',
    supplierCode: '163126',
    itemId: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
    itemQuantity: 40,
    expiry: '20170919',
    priceExcludingTax: 649,
    priceIncludingTax: 778
  },
  {
    id: 'e5e1ac40-1835-4d80-b1b2-af07d34860fd',
    purchased: 1486339200,
    quantity: 2,
    supplier: 'Costco',
    supplierCode: '208528',
    itemId: '28b0a802-bef3-478b-81d0-034e3ac02092',
    itemQuantity: 32,
    expiry: '20170318',
    priceExcludingTax: 979,
    priceIncludingTax: 1174
  },

  // Epicurium 17/02/17
  {
    id: '9064a75f-5200-4d95-8889-da67aa6041d5',
    purchased: '20170217',
    quantity: 1,
    supplier: 'Epicurium',
    supplierCode: 'EP-POP-S-008',
    itemId: '8fd928e0-06c9-4958-9259-719dc451a8c2',
    itemQuantity: 24,
    expiry: 'UNKNOWN',
    priceExcludingTax: 622,
    priceIncludingTax: 777
  },
  {
    id: '6841c840-301b-4d41-b791-82135f287186',
    purchased: '20170217',
    quantity: 1,
    supplier: 'Epicurium',
    supplierCode: 'EP-POP-S-007',
    itemId: 'edef6848-f3d5-4733-babc-bc10bc3d257c',
    itemQuantity: 24,
    expiry: 'UNKNOWN',
    priceExcludingTax: 622,
    priceIncludingTax: 777
  },
  {
    id: '6c2c6571-3b83-490c-b69a-7462e478a5b9',
    purchased: '20170217',
    quantity: 1,
    supplier: 'Epicurium',
    supplierCode: 'EP-LCN-I-003',
    itemId: '64e177af-6313-4d9e-b39a-8495c2f1d939',
    itemQuantity: 24,
    expiry: 'UNKNOWN',
    priceExcludingTax: 896,
    priceIncludingTax: 896
  },
  {
    id: '6c2c6571-3b83-490c-b69a-7462e478a5b9',
    purchased: '20170217',
    quantity: 1,
    supplier: 'Epicurium',
    supplierCode: 'EP-PRO-S-003',
    itemId: '54e10706-284f-440f-82cb-0f8911a8424a',
    itemQuantity: 24,
    expiry: 'UNKNOWN',
    priceExcludingTax: 852,
    priceIncludingTax: 1065
  },
  {
    id: 'cfb13f72-6c7b-4648-bc87-e705927f5179',
    purchased: '20170217',
    quantity: 1,
    supplier: 'Epicurium',
    supplierCode: 'EP-PRO-S-002',
    itemId: '80984458-bab9-4a8f-86a7-b3e46f62139d',
    itemQuantity: 24,
    expiry: 'UNKNOWN',
    priceExcludingTax: 852,
    priceIncludingTax: 1065
  },
  {
    id: '06aaff31-b515-44b0-b113-6ea32193d9e7',
    purchased: '20170217',
    quantity: 1,
    supplier: 'Epicurium',
    supplierCode: 'EP-NKD-C-001',
    itemId: '32a9520f-f407-42ee-9bc5-ab9e2a9c76ea',
    itemQuantity: 18,
    expiry: 'UNKNOWN',
    priceExcludingTax: 743,
    priceIncludingTax: 929
  },
  {
    id: 'b211bc07-af4c-455a-99da-e3fa7f72b8c7',
    purchased: '20170217',
    quantity: 1,
    supplier: 'Epicurium',
    supplierCode: 'EP-NKD-N-005',
    itemId: 'f0167eb4-f906-48d8-8067-6e3b646d8a19',
    itemQuantity: 18,
    expiry: 'UNKNOWN',
    priceExcludingTax: 775,
    priceIncludingTax: 969
  },
  {
    id: '6811aacb-a33f-4bc1-91f9-2bd40aca0eb3',
    purchased: '20170217',
    quantity: 1,
    supplier: 'Epicurium',
    supplierCode: 'EP-CRN-I-004',
    itemId: 'fc3f3a7a-64bc-4f23-9a4e-c90f2536e56b',
    itemQuantity: 24,
    expiry: 'UNKNOWN',
    priceExcludingTax: 1024,
    priceIncludingTax: 1280
  },
  {
    id: 'd7fe0ede-4922-4ba1-b7db-a6e8c2e398aa',
    purchased: '20170217',
    quantity: 1,
    supplier: 'Epicurium',
    supplierCode: 'EP-GFU-S-003',
    itemId: 'b78c3975-eb7f-4eda-a3ea-d54d35e6471e',
    itemQuantity: 24,
    expiry: 'UNKNOWN',
    priceExcludingTax: 907,
    priceIncludingTax: 907
  },
  {
    id: 'e9ea65b3-7ddc-47b7-a1d7-4183ee17f189',
    purchased: '20170217',
    quantity: 1,
    supplier: 'Epicurium',
    supplierCode: 'EP-TRK-F-001',
    itemId: '5298c925-9ae2-4017-a007-c1928c38ddc6',
    itemQuantity: 24,
    expiry: 'UNKNOWN',
    priceExcludingTax: 1130,
    priceIncludingTax: 1130
  }
];

export const batches = new Map<string, Batch>();
for (const batch of batchesInternal) {
  if (batches.has(batch.id)) {
    throw new Error(`Duplicate ID ${batch.id}`);
  }
  // ensure the itemId is valid
  getItem(batch.itemId);
  batches.set(batch.id, batch);
}
