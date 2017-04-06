import { getItem } from '../../api/src/services/item';

export interface Batch {
  id: string;
  purchased?: number;
  quantity: number;
  supplier?: string;
  supplierCode?: string;
  itemId: string;
  itemQuantity: number;
  expiry?: number;
  priceExcludingVAT?: number;
  VATRate?: number;
}

export const MARKETPLACE_ID = 'HS_MARKETPLACE';

const batchesInternal: Batch[] = [
  // Residual from bulky
  {
    id: '782f0776-ccf3-43a8-9ba6-386e80b12dd3',
    purchased: null,
    quantity: 1,
    supplier: null,
    supplierCode: null,
    itemId: '8e9bb2db-9437-4733-acc1-f5e218e0a603',
    itemQuantity: 1,
    expiry: null,
    priceExcludingVAT: null,
    VATRate: null
  },
  {
    id: 'ae3c4d05-fb9c-48d7-b22f-6f8761636b88',
    purchased: null,
    quantity: 1,
    supplier: null,
    supplierCode: null,
    itemId: '272c6a59-9b4c-41b6-b839-0f8be506728e',
    itemQuantity: 20,
    expiry: null,
    priceExcludingVAT: null,
    VATRate: null
  },
  {
    id: '9d1c7e32-bcf5-4a98-b9b9-72e21965118d',
    purchased: null,
    quantity: 1,
    supplier: null,
    supplierCode: null,
    itemId: '606e12d4-6367-4fc3-aa7a-92ee17ccac2c',
    itemQuantity: 2,
    expiry: null,
    priceExcludingVAT: null,
    VATRate: null
  },
  {
    id: '20a721b8-78be-4e5f-ad85-21284d560ddc',
    purchased: null,
    quantity: 1,
    supplier: null,
    supplierCode: null,
    itemId: '32919485-d806-4be6-824b-170f66371306',
    itemQuantity: 15,
    expiry: null,
    priceExcludingVAT: null,
    VATRate: null
  },
  {
    id: '284a7cf7-16c9-428f-8d95-8af82b0a1bd1',
    purchased: null,
    quantity: 1,
    supplier: null,
    supplierCode: null,
    itemId: 'e91e7274-fe28-405c-86c8-5768197eb6ac',
    itemQuantity: 16,
    expiry: null,
    priceExcludingVAT: null,
    VATRate: null
  },
  {
    id: 'c57f77b2-35b2-4283-a2e0-9f9c91afd71e',
    purchased: null,
    quantity: 1,
    supplier: null,
    supplierCode: null,
    itemId: '96ce1162-9188-41ac-9d35-8fc6a14783ef',
    itemQuantity: 20,
    expiry: 1483660800000,
    priceExcludingVAT: 699,
    VATRate: null
  },

  // Chris initial costco purchase
  {
    id: '1bea7790-5c53-4bdc-91dd-21b004310ac1',
    purchased: 1484179200000,
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
    id: '03e918c6-8868-4682-9c40-43caebdfc5b7',
    purchased: 1484179200000,
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
    id: '664c275f-1f61-4a10-be53-7cb3cdeffa68',
    purchased: 1484179200000,
    quantity: 2,
    supplier: 'Costco',
    supplierCode: '68',
    itemId: 'b43c4a97-1112-41ce-8f91-5a8bda0dcdc8',
    itemQuantity: 48,
    expiry: null,
    priceExcludingVAT: 1499,
    VATRate: 0.2
  },
  {
    id: '5001ac6a-d026-49b4-9c7c-72a299245edc',
    purchased: 1484179200000,
    quantity: 2,
    supplier: 'Costco',
    supplierCode: '84',
    itemId: '78816fba-150d-4282-b43d-900df45cea8b',
    itemQuantity: 36,
    expiry: null,
    priceExcludingVAT: 1069,
    VATRate: 0.2
  },
  {
    id: '47a13720-bbb4-4139-bd58-238b5b876fa1',
    purchased: 1484179200000,
    quantity: 2,
    supplier: 'Costco',
    supplierCode: '186578',
    itemId: '02bbc0fd-54c4-45bb-9b77-21b79b356aa6',
    itemQuantity: 96,
    expiry: null,
    priceExcludingVAT: 1899,
    VATRate: 0.2
  },

  // Receipt: https://goo.gl/photos/tPtxxtSYaqFpj4oo7, paid: no
  {
    id: '3af2571d-abe2-49f3-849e-9f180a1a8f8f',
    purchased: 1486339200000,
    quantity: 3,
    supplier: 'Poundstretcher',
    supplierCode: '263178',
    itemId: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
    itemQuantity: 10,
    expiry: 1483833600000,
    priceExcludingVAT: 249,
    VATRate: 0.2
  },

  // Chris Costco purchase
  // Receipt: https://goo.gl/photos/iLP7HjdR5mucKcCb8, paid: no
  {
    id: 'cfb47dd9-78f0-4b50-9448-8e8916c0afb6',
    purchased: 1486339200000,
    quantity: 3,
    supplier: 'Costco',
    supplierCode: '186384',
    itemId: '3fa0db7c-3f90-404e-b875-3792eda3e185',
    itemQuantity: 48,
    expiry: 1483833600000,
    priceExcludingVAT: 1579,
    VATRate: 0.2
  },
  {
    id: 'e506d540-4d6c-4199-a4c9-32418baa6191',
    purchased: 1486339200000,
    quantity: 3,
    supplier: 'Costco',
    supplierCode: '163126',
    itemId: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
    itemQuantity: 40,
    expiry: 1505779200000,
    priceExcludingVAT: 649,
    VATRate: 0.2
  },
  {
    id: 'e5e1ac40-1835-4d80-b1b2-af07d34860fd',
    purchased: 1486339200000,
    quantity: 2,
    supplier: 'Costco',
    supplierCode: '208528',
    itemId: '28b0a802-bef3-478b-81d0-034e3ac02092',
    itemQuantity: 32,
    expiry: 1489795200000,
    priceExcludingVAT: 979,
    VATRate: 0.2
  },

  // Epicurium 17/02/17
  {
    id: '9064a75f-5200-4d95-8889-da67aa6041d5',
    purchased: 1487332800000,
    quantity: 1,
    supplier: 'Epicurium',
    supplierCode: 'EP-POP-S-008',
    itemId: '8fd928e0-06c9-4958-9259-719dc451a8c2',
    itemQuantity: 24,
    expiry: null,
    priceExcludingVAT: 777,
    VATRate: 0.2
  },
  {
    id: '6841c840-301b-4d41-b791-82135f287186',
    purchased: 1487332800000,
    quantity: 1,
    supplier: 'Epicurium',
    supplierCode: 'EP-POP-S-007',
    itemId: 'edef6848-f3d5-4733-babc-bc10bc3d257c',
    itemQuantity: 24,
    expiry: null,
    priceExcludingVAT: 777,
    VATRate: 0.2
  },
  {
    id: '6c2c6571-3b83-490c-b69a-7462e478a5b9',
    purchased: 1487332800000,
    quantity: 1,
    supplier: 'Epicurium',
    supplierCode: 'EP-LCN-I-003',
    itemId: '64e177af-6313-4d9e-b39a-8495c2f1d939',
    itemQuantity: 24,
    expiry: null,
    priceExcludingVAT: 896,
    VATRate: 0
  },
  {
    id: 'bfd9b46a-9ca6-48e2-89c1-ad4b4ba1b747',
    purchased: 1487332800000,
    quantity: 1,
    supplier: 'Epicurium',
    supplierCode: 'EP-PRO-S-003',
    itemId: '54e10706-284f-440f-82cb-0f8911a8424a',
    itemQuantity: 24,
    expiry: null,
    priceExcludingVAT: 1065,
    VATRate: 0.2
  },
  {
    id: 'cfb13f72-6c7b-4648-bc87-e705927f5179',
    purchased: 1487332800000,
    quantity: 1,
    supplier: 'Epicurium',
    supplierCode: 'EP-PRO-S-002',
    itemId: '80984458-bab9-4a8f-86a7-b3e46f62139d',
    itemQuantity: 24,
    expiry: null,
    priceExcludingVAT: 1065,
    VATRate: 0.2
  },
  {
    id: '06aaff31-b515-44b0-b113-6ea32193d9e7',
    purchased: 1487332800000,
    quantity: 1,
    supplier: 'Epicurium',
    supplierCode: 'EP-NKD-C-001',
    itemId: '32a9520f-f407-42ee-9bc5-ab9e2a9c76ea',
    itemQuantity: 18,
    expiry: null,
    priceExcludingVAT: 798,
    VATRate: 0.2
  },
  {
    id: 'b211bc07-af4c-455a-99da-e3fa7f72b8c7',
    purchased: 1487332800000,
    quantity: 1,
    supplier: 'Epicurium',
    supplierCode: 'EP-NKD-N-005',
    itemId: 'f0167eb4-f906-48d8-8067-6e3b646d8a19',
    itemQuantity: 18,
    expiry: null,
    priceExcludingVAT: 969,
    VATRate: 0.2
  },
  {
    id: '6811aacb-a33f-4bc1-91f9-2bd40aca0eb3',
    purchased: 1487332800000,
    quantity: 1,
    supplier: 'Epicurium',
    supplierCode: 'EP-CRN-I-004',
    itemId: 'fc3f3a7a-64bc-4f23-9a4e-c90f2536e56b',
    itemQuantity: 24,
    expiry: null,
    priceExcludingVAT: 1280,
    VATRate: 0.2
  },
  {
    id: 'd7fe0ede-4922-4ba1-b7db-a6e8c2e398aa',
    purchased: 1487332800000,
    quantity: 1,
    supplier: 'Epicurium',
    supplierCode: 'EP-GFU-S-003',
    itemId: 'b78c3975-eb7f-4eda-a3ea-d54d35e6471e',
    itemQuantity: 24,
    expiry: null,
    priceExcludingVAT: 907,
    VATRate: 0
  },
  {
    id: 'e9ea65b3-7ddc-47b7-a1d7-4183ee17f189',
    purchased: 1487332800000,
    quantity: 1,
    supplier: 'Epicurium',
    supplierCode: 'EP-TRK-F-001',
    itemId: '5298c925-9ae2-4017-a007-c1928c38ddc6',
    itemQuantity: 24,
    expiry: null,
    priceExcludingVAT: 958,
    VATRate: 0
  },

  // Costco - https://photos.google.com/photo/AF1QipOAhNmaq7aalcNCIl3ck5DTxYS9Kj1KMK47KelP
  {
    id: '97745489-d780-4f79-8bf6-03f0d4a7654f',
    purchased: 1490602405432,
    quantity: 1,
    supplier: 'Costco',
    supplierCode: '0223586',
    itemId: 'd8c73ee1-a9b1-4090-a6ad-ee4d778a852a',
    itemQuantity: 24,
    expiry: 1505602800000,
    priceExcludingVAT: 1289,
    VATRate: 0
  },
  {
    id: '0744da29-5d14-4727-878e-9958f1b2a45c',
    purchased: 1490602405432,
    quantity: 1,
    supplier: 'Costco',
    supplierCode: '0223589',
    itemId: '96262a5f-8646-4644-aacc-36a3c5e4443d',
    itemQuantity: 12,
    expiry: 1507330800000,
    priceExcludingVAT: 1139,
    VATRate: 0.2
  },
  {
    id: '9e1a0289-ca56-42d3-894e-b8247a4b9d40',
    purchased: 1490602405432,
    quantity: 2,
    supplier: 'Costco',
    supplierCode: '0180268',
    itemId: 'fac94d27-732e-4f2f-8f03-75c193093dbd',
    itemQuantity: 8,
    expiry: 1508713200000,
    priceExcludingVAT: 266,
    VATRate: 0.2
  },
  {
    id: 'a5aa3f97-3aa6-4c1f-8c9d-dde126dda723',
    purchased: 1490602405432,
    quantity: 2,
    supplier: 'Costco',
    supplierCode: '0180268',
    itemId: '249409b8-c7cc-4e2c-9a8b-e960c6b50029',
    itemQuantity: 8,
    expiry: 1508713200000,
    priceExcludingVAT: 266,
    VATRate: 0.2
  },
  {
    id: '83787404-43f9-4938-ab78-e5b823688ce1',
    purchased: 1490602405432,
    quantity: 2,
    supplier: 'Costco',
    supplierCode: '0180268',
    itemId: '8bd6f737-6f64-4c18-a8b8-15c7eb1f4a77',
    itemQuantity: 8,
    expiry: 1508713200000,
    priceExcludingVAT: 267,
    VATRate: 0.2
  },
  {
    id: 'fa1a0c2e-a693-4476-a304-7adde1288016',
    purchased: 1490602405432,
    quantity: 2,
    supplier: 'Costco',
    supplierCode: '0221941',
    itemId: '8268e7f5-0b53-48e7-b288-2251cd375e97',
    itemQuantity: 18,
    expiry: 1507071600000,
    priceExcludingVAT: 799,
    VATRate: 0.2
  },
  {
    id: 'c5f128a4-d1c3-43d0-82d4-8a8d68b90733',
    purchased: 1490602405432,
    quantity: 1,
    supplier: 'Costco',
    supplierCode: '0186384',
    itemId: '3fa0db7c-3f90-404e-b875-3792eda3e185',
    itemQuantity: 48,
    expiry: 1506812400000,
    priceExcludingVAT: 1729,
    VATRate: 0.2
  },
  {
    id: 'b03a2fab-2ae4-4f6a-b7e0-95baa2ff6edf',
    purchased: 1490602405432,
    quantity: 1,
    supplier: 'Costco',
    supplierCode: '0035800',
    itemId: '8e9bb2db-9437-4733-acc1-f5e218e0a603',
    itemQuantity: 48,
    expiry: 1501542000000,
    priceExcludingVAT: 1429,
    VATRate: 0.2
  },
  {
    id: '4ac60a3f-50ee-4034-a134-3406e96d7453',
    purchased: 1484179200000,
    quantity: 2,
    supplier: 'Costco',
    supplierCode: '186578',
    itemId: '02bbc0fd-54c4-45bb-9b77-21b79b356aa6',
    itemQuantity: 96,
    expiry: 1506812400000,
    priceExcludingVAT: 1899,
    VATRate: 0.2
  },
  {
    id: 'd835e290-49b7-4f5c-8124-30cdee5eb3a2',
    purchased: 1484179200000,
    quantity: 4,
    supplier: 'Costco',
    supplierCode: '0987663',
    itemId: 'a97f26bd-b03e-4cdb-8105-1353b00c728a',
    itemQuantity: 10,
    expiry: 1506812400000,
    priceExcludingVAT: 125,
    VATRate: 0.2
  },
  {
    id: '5a844e75-5c39-488d-8db3-3592ed6ad756',
    purchased: 1484179200000,
    quantity: 4,
    supplier: 'Costco',
    supplierCode: '0987663',
    itemId: '63e7f62e-e2a7-45e1-8e45-17cb42f08f80',
    itemQuantity: 10,
    expiry: 1506812400000,
    priceExcludingVAT: 125,
    VATRate: 0.2
  },
  {
    id: '2b02c59b-f7e0-4af0-b410-784f4b73989f',
    purchased: 1484179200000,
    quantity: 4,
    supplier: 'Costco',
    supplierCode: '0987663',
    itemId: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
    itemQuantity: 20,
    expiry: 1506812400000,
    priceExcludingVAT: 249,
    VATRate: 0.2
  },
  // For test purposes
  {
    id: '989721c5-b0db-43b0-8c49-0db83a1b3276',
    purchased: 1484179200000,
    quantity: 1,
    supplier: MARKETPLACE_ID,
    supplierCode: 'c50234ff-6c33-4878-a1ab-05f6b3e7b649',
    itemId: '32a9520f-f407-42ee-9bc5-ab9e2a9c76ea',
    itemQuantity: 20,
    expiry: 1506812400000,
    priceExcludingVAT: 1000,
    VATRate: 0
  },
  // batches generated from old marketplace boxes
  {
    id: '41736dae-e0bc-4fa3-82f9-44550e73fe52',
    quantity: 1,
    itemQuantity: 40,
    itemId: '3b7a6669-770c-4dbb-97e2-0e0aae3ca5ff',
    supplier: 'HS_MARKETPLACE',
    supplierCode: null
  },
  {
    id: 'b9cd14df-658e-4a58-96d9-3255e06381d1',
    quantity: 1,
    itemQuantity: 80,
    itemId: '3b7a6669-770c-4dbb-97e2-0e0aae3ca5ff',
    supplier: 'HS_MARKETPLACE',
    supplierCode: null
  },
  {
    id: '8d1c81cc-31e6-40ce-ab84-2749fb8b84a2',
    quantity: 1,
    itemQuantity: 36,
    itemId: 'ccad58e3-e27a-4463-9139-17a36ff7f7b8',
    supplier: 'HS_MARKETPLACE',
    supplierCode: '77a68b8a-97bb-4c04-a823-31e6fd8d7df5'
  },
  {
    id: '24ecf25b-feb2-4121-ae14-3da9a1f1aa74',
    quantity: 1,
    itemQuantity: 54,
    itemId: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
    supplier: 'HS_MARKETPLACE',
    supplierCode: '77a68b8a-97bb-4c04-a823-31e6fd8d7df5'
  },
  {
    id: 'aae5f080-a851-4a92-a5fb-7339b2cfd879',
    quantity: 1,
    itemQuantity: 90,
    itemId: 'd5d10152-3f8a-419b-9abd-6d6e916ea64a',
    supplier: 'HS_MARKETPLACE',
    supplierCode: '77a68b8a-97bb-4c04-a823-31e6fd8d7df5'
  },
  {
    id: '6045cfe6-d76b-4329-b200-8882b1f7d9e3',
    quantity: 1,
    itemQuantity: 24,
    itemId: 'e615de4e-ce10-451b-80ad-9717662a904a',
    supplier: 'HS_MARKETPLACE',
    supplierCode: '77a68b8a-97bb-4c04-a823-31e6fd8d7df5'
  },
  {
    id: 'bcffd319-247d-40a1-aa91-9c0d7f6e9378',
    quantity: 1,
    itemQuantity: 60,
    itemId: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
    supplier: 'HS_MARKETPLACE',
    supplierCode: null
  },
  {
    id: '74f33be4-259c-4a7f-bcb6-f68e0392bbbb',
    quantity: 1,
    itemQuantity: 60,
    itemId: 'd5d10152-3f8a-419b-9abd-6d6e916ea64a',
    supplier: 'HS_MARKETPLACE',
    supplierCode: null
  },
  {
    id: '1f69d93f-2a99-4c85-9b8d-7dc20b1fdc79',
    quantity: 1,
    itemQuantity: 30,
    itemId: 'ccad58e3-e27a-4463-9139-17a36ff7f7b8',
    supplier: 'HS_MARKETPLACE',
    supplierCode: null
  },
  {
    id: '75eab145-df7d-4b51-a1d3-2e5f09468807',
    quantity: 1,
    itemQuantity: 96,
    itemId: '02bbc0fd-54c4-45bb-9b77-21b79b356aa6',
    supplier: 'HS_MARKETPLACE',
    supplierCode: 'f9c8b541-0a30-4adc-8e0d-887e6db9f301'
  },
  {
    id: '7ddba287-a297-4d7e-bbe7-53529be5dd79',
    quantity: 1,
    itemQuantity: 10,
    expiry: 1554505200000,
    itemId: '190ee06f-455f-4778-b3db-1dfc74c3e966',
    supplier: 'HS_MARKETPLACE',
    supplierCode: 'a3d9667e-a947-441a-8efd-b71e51beca02',
    priceExcludingVAT: 480
  },
  {
    id: '8b9f81c9-afda-4cf7-a1d4-df8b75f7f70b',
    quantity: 1,
    itemQuantity: 4,
    expiry: 1509840000000,
    itemId: '88efb45b-2d7a-4b75-9a57-7c2ef3b784a8',
    supplier: 'HS_MARKETPLACE',
    supplierCode: 'a3d9667e-a947-441a-8efd-b71e51beca02',
    priceExcludingVAT: 100
  },
  {
    id: '9b211b3d-249a-4e30-be51-06248ae61da7',
    quantity: 1,
    itemQuantity: 4,
    expiry: 1519689600000,
    itemId: 'f01f533f-8bf6-4291-8fb8-a76c3bedc276',
    supplier: 'HS_MARKETPLACE',
    supplierCode: 'a3d9667e-a947-441a-8efd-b71e51beca02',
    priceExcludingVAT: 100
  }
];

const batches = new Map<string, Batch>();
for (const batch of batchesInternal) {
  if (batches.has(batch.id)) {
    throw new Error(`Duplicate ID ${batch.id}`);
  }
  // ensure the itemId is valid
  getItem(batch.itemId);
  batches.set(batch.id, batch);
}

export const getBatch = (batchId: string) => {
  const batch = batches.get(batchId);
  if (batch == null) {
    throw new Error(`No batch found with id ${batchId}`);
  }
  return batch;
};

export const getItemCost = (batchId: string): number => {
  const { priceExcludingVAT, itemQuantity } = getBatch(batchId);
  return priceExcludingVAT / itemQuantity;
};

export const getVATRate = (batchId: string): number => {
  const { VATRate } = getBatch(batchId);
  return VATRate;
};

export const isMarketplaceBatch = (batchId: string): boolean => {
  const { supplier } = getBatch(batchId);
  return supplier === MARKETPLACE_ID;
};
