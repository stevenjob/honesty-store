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

const userIds = {
  heather: '77a68b8a-97bb-4c04-a823-31e6fd8d7df5',
  chris: 'f9c8b541-0a30-4adc-8e0d-887e6db9f301',
  rob: 'a8960624-7558-468c-9791-984ca0c620ba',
  graham: 'a3d9667e-a947-441a-8efd-b71e51beca02',
  sam: 'c71733c4-dc05-42f9-848e-fb53bf08a2d7'
};

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
    expiry: 1501545600000,
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
    supplier: MARKETPLACE_ID,
    supplierCode: null
  },
  {
    id: 'b9cd14df-658e-4a58-96d9-3255e06381d1',
    quantity: 1,
    itemQuantity: 80,
    itemId: '3b7a6669-770c-4dbb-97e2-0e0aae3ca5ff',
    supplier: MARKETPLACE_ID,
    supplierCode: null
  },
  {
    id: '8d1c81cc-31e6-40ce-ab84-2749fb8b84a2',
    quantity: 1,
    itemQuantity: 36,
    itemId: 'ccad58e3-e27a-4463-9139-17a36ff7f7b8',
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.heather
  },
  {
    id: '24ecf25b-feb2-4121-ae14-3da9a1f1aa74',
    quantity: 1,
    itemQuantity: 54,
    itemId: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.heather
  },
  {
    id: 'aae5f080-a851-4a92-a5fb-7339b2cfd879',
    quantity: 1,
    itemQuantity: 90,
    itemId: 'd5d10152-3f8a-419b-9abd-6d6e916ea64a',
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.heather
  },
  {
    id: '6045cfe6-d76b-4329-b200-8882b1f7d9e3',
    quantity: 1,
    itemQuantity: 24,
    itemId: 'e615de4e-ce10-451b-80ad-9717662a904a',
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.heather
  },
  {
    id: 'bcffd319-247d-40a1-aa91-9c0d7f6e9378',
    quantity: 1,
    itemQuantity: 60,
    itemId: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
    supplier: MARKETPLACE_ID,
    supplierCode: null
  },
  {
    id: '74f33be4-259c-4a7f-bcb6-f68e0392bbbb',
    quantity: 1,
    itemQuantity: 60,
    itemId: 'd5d10152-3f8a-419b-9abd-6d6e916ea64a',
    supplier: MARKETPLACE_ID,
    supplierCode: null
  },
  {
    id: '1f69d93f-2a99-4c85-9b8d-7dc20b1fdc79',
    quantity: 1,
    itemQuantity: 30,
    itemId: 'ccad58e3-e27a-4463-9139-17a36ff7f7b8',
    supplier: MARKETPLACE_ID,
    supplierCode: null
  },
  {
    id: '75eab145-df7d-4b51-a1d3-2e5f09468807',
    quantity: 1,
    itemQuantity: 96,
    itemId: '02bbc0fd-54c4-45bb-9b77-21b79b356aa6',
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.chris
  },
  {
    id: '7ddba287-a297-4d7e-bbe7-53529be5dd79',
    quantity: 1,
    itemQuantity: 10,
    expiry: 1554505200000,
    itemId: '190ee06f-455f-4778-b3db-1dfc74c3e966',
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.graham,
    priceExcludingVAT: 480
  },
  {
    id: '8b9f81c9-afda-4cf7-a1d4-df8b75f7f70b',
    quantity: 1,
    itemQuantity: 4,
    expiry: 1509840000000,
    itemId: '88efb45b-2d7a-4b75-9a57-7c2ef3b784a8',
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.graham,
    priceExcludingVAT: 100
  },
  {
    id: '9b211b3d-249a-4e30-be51-06248ae61da7',
    quantity: 1,
    itemQuantity: 4,
    expiry: 1519689600000,
    itemId: 'f01f533f-8bf6-4291-8fb8-a76c3bedc276',
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.graham,
    priceExcludingVAT: 100
  },

  // sl office order 2017-04-11
  {
    // 90 Coke Zero £21
    id: 'eafa239d-7db2-408e-8520-ace24a002da5',
    quantity: 1,
    itemQuantity: 90,
    expiry: 1506726000000,
    itemId: 'd5d10152-3f8a-419b-9abd-6d6e916ea64a',
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.heather,
    priceExcludingVAT: 2100 + 25 // delivery
  },
  {
    // 60 Pepsi Max £20
    id: '26da093d-3b41-405b-8703-6682eb070df5',
    quantity: 1,
    itemQuantity: 60,
    expiry: 1509494400000,
    itemId: 'e615de4e-ce10-451b-80ad-9717662a904a',
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.heather,
    priceExcludingVAT: 2000 + 25 // delivery
  },
  {
    // 30 Diet Coke £7
    id: 'df1209e5-b2cb-48ac-9e49-6451f38a292e',
    quantity: 1,
    itemQuantity: 30,
    expiry: 1506726000000,
    itemId: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.heather,
    priceExcludingVAT: 700 + 25 // delivery
  },
  {
    // 30 Fat Coke £7
    id: 'd3a01851-1d62-4196-83b6-172ac45f0a1d',
    quantity: 1,
    itemQuantity: 30,
    expiry: 1522450800000,
    itemId: 'ccad58e3-e27a-4463-9139-17a36ff7f7b8',
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.heather,
    priceExcludingVAT: 700 + 25 // delivery
  },
  {
    // 14 pk walkers
    id: 'f8e31950-2181-4ce4-aabe-957d4248e259',
    quantity: 1,
    itemQuantity: 14,
    expiry: 1497052800000,
    itemId: '364677fc-f0d0-427a-976f-962be7345a6a',
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.rob,
    priceExcludingVAT: 200
  },

  // graham's edn marketplace
  {
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.graham,
    id: '0f948624-3d06-40a7-abde-39a40c7fb846',
    quantity: 1,
    priceExcludingVAT: 150,
    itemQuantity: 4,
    expiry: 1519516800000,
    itemId: '5b96e539-a33c-40b1-8c2d-3ab388d03ba1'
  },
  {
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.graham,
    id: 'e4914d81-4f22-4c83-a432-3f29bf224f5b',
    quantity: 1,
    priceExcludingVAT: 150,
    itemQuantity: 4,
    expiry: 1517356800000,
    itemId: '4c2697cc-f84e-4b0b-9547-05cff5ea41fc'
  },
  {
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.graham,
    id: '3f694636-4d98-4791-bbd2-a61fdc8c9f7c',
    quantity: 1,
    priceExcludingVAT: 100,
    itemQuantity: 4,
    expiry: 1515542400000,
    itemId: 'e7d57402-6f60-4fb3-a585-7651cebbd4fa'
  },
  {
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.graham,
    id: 'acc7834b-0940-42fd-b040-037953c99538',
    quantity: 1,
    priceExcludingVAT: 250,
    itemQuantity: 12,
    expiry: 1498867200000,
    itemId: '0e9401fb-e5b0-4ee1-8904-1e98ec46a244'
  },
  {
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.graham,
    id: '41607902-435e-4081-9cf4-67455cc82f81',
    quantity: 1,
    priceExcludingVAT: 100,
    itemQuantity: 5,
    expiry: 1516406400000,
    itemId: '50878e68-08b1-4ef0-8ea0-f26c3d00259a'
  },
  {
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.graham,
    id: '6c43d562-f30a-40ff-8c32-3a1d971a8b3c',
    quantity: 1,
    priceExcludingVAT: 100,
    itemQuantity: 5,
    expiry: 1516406400000,
    itemId: '36e8008f-b077-4498-848d-c69568c13b5a'
  },
  {
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.graham,
    id: '0cbccd6b-8fc6-41a3-bb44-3f6a97b22abf',
    quantity: 1,
    priceExcludingVAT: 100,
    itemQuantity: 6,
    expiry: 1512172800000,
    itemId: '200880b9-b4a2-4d08-95b6-4fc1280ad743'
  },
  {
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.graham,
    id: '6788772f-ddda-448a-82b9-fd05033a6f82',
    quantity: 1,
    priceExcludingVAT: 100,
    itemQuantity: 6,
    expiry: 1512172800000,
    itemId: '3c7b3f8d-ba8e-4d5e-a550-81fb9ccef11c'
  },
  {
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.sam,
    id: '4f50b9a1-76a5-42d6-852e-696a9f299d96',
    quantity: 1,
    priceExcludingVAT: 289,
    itemQuantity: 24,
    expiry: 1512172800000,
    itemId: '4b41c613-d0a9-474c-be38-f6c89f4df582'
  },
  {
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.chris,
    id: '692ec7e0-81a8-45df-9b3c-549bcb52680f',
    quantity: 1,
    priceExcludingVAT: 600,
    itemQuantity: 72,
    expiry: 1497571200000,
    itemId: '0d7c0ddb-cfc7-43ff-bdea-f255a66b21b6'
  },
  {
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.chris,
    id: '8407cf78-95a5-4fb1-a266-29aa1e6cee64',
    quantity: 1,
    priceExcludingVAT: 335,
    itemQuantity: 40,
    expiry: 1499468400000,
    itemId: '3b7a6669-770c-4dbb-97e2-0e0aae3ca5ff'
  },

  // costco 25/04/17 - https://goo.gl/photos/4YXvSv5BLFpHDY5g6
  {
    supplier: 'Costco',
    supplierCode: '0046244',
    purchased: 1493074800000,
    id: 'afbb9341-499c-4614-8208-38f0a33bf3d4',
    priceExcludingVAT: 1489,
    quantity: 1,
    VATRate: 0.2,
    expiry: 1519862400000,
    itemId: 'e91e7274-fe28-405c-86c8-5768197eb6ac',
    itemQuantity: 48
  },
  {
    supplier: 'Costco',
    supplierCode: '0011745',
    purchased: 1493074800000,
    id: '8c197c2b-ff2f-4efb-9036-01b6b6952e33',
    priceExcludingVAT: 479,
    quantity: 1,
    VATRate: 0,
    expiry: 1527721200000,
    itemId: '9aa6305f-370a-4d39-8baa-c67ac35b0dfc',
    itemQuantity: 24
  },
  {
    supplier: 'Costco',
    supplierCode: '0223586',
    purchased: 1493074800000,
    id: 'd7ac9f55-8d9b-4acc-bf91-8a9caa22a8d6',
    priceExcludingVAT: 1289,
    quantity: 3,
    VATRate: 0,
    expiry: 1505948400000,
    itemId: 'd8c73ee1-a9b1-4090-a6ad-ee4d778a852a',
    itemQuantity: 24
  },
  {
    supplier: 'Costco',
    supplierCode: '0000009',
    purchased: 1493074800000,
    id: 'e03926a4-fb2b-4223-8e30-0f82169cb625',
    priceExcludingVAT: 1499,
    quantity: 1,
    VATRate: 0.2,
    expiry: 1515888000000,
    itemId: '1eb45850-3bb1-4b66-a816-27d856f03afe',
    itemQuantity: 48
  },
  {
    supplier: 'Costco',
    supplierCode: '0180268',
    purchased: 1493074800000,
    id: '6b9be50d-2d76-4a2f-8887-0d4a020f60ce',
    priceExcludingVAT: 799 / 3,
    quantity: 4,
    VATRate: 0.2,
    expiry: 1519603200000,
    itemId: '249409b8-c7cc-4e2c-9a8b-e960c6b50029',
    itemQuantity: 8
  },
  {
    supplier: 'Costco',
    supplierCode: '0180268',
    purchased: 1493074800000,
    id: '63fc9d19-cb5a-4eed-a10d-810c3d0b0aaf',
    priceExcludingVAT: 799 / 3,
    quantity: 4,
    VATRate: 0.2,
    expiry: 1519603200000,
    itemId: 'fac94d27-732e-4f2f-8f03-75c193093dbd',
    itemQuantity: 8
  },
  {
    supplier: 'Costco',
    supplierCode: '0180268',
    purchased: 1493074800000,
    id: '57cfb66c-e813-49da-9669-8117c4f869b1',
    priceExcludingVAT: 799 / 3,
    quantity: 4,
    VATRate: 0.2,
    expiry: 1519603200000,
    itemId: '8bd6f737-6f64-4c18-a8b8-15c7eb1f4a77',
    itemQuantity: 8
  },
  {
    supplier: 'Costco',
    supplierCode: '0180268',
    purchased: 1493074800000,
    id: 'aeb2ec43-912c-480d-b1f6-5850e0e78553',
    priceExcludingVAT: 799,
    quantity: 2,
    VATRate: 0.2,
    expiry: 1507071600000,
    itemId: '8268e7f5-0b53-48e7-b288-2251cd375e97',
    itemQuantity: 18
  },
  {
    supplier: 'Costco',
    supplierCode: '0180268',
    purchased: 1493074800000,
    id: '7fbcd3ac-1888-4cb3-a0f1-0c9abbcda330',
    priceExcludingVAT: 499,
    quantity: 3,
    VATRate: 0.2,
    expiry: 1518998400000,
    itemId: 'faeda516-bd9f-41ec-b949-7a676312b0ae',
    itemQuantity: 40
  },

  // Epicurium 28/04/17
  {
    id: 'd6f870e4-f9cc-485f-a22f-9614bfeeb6e9',
    itemId: '64e177af-6313-4d9e-b39a-8495c2f1d939',
    expiry: 1506812400000,
    purchased: 1493391145967,
    priceExcludingVAT: 1120,
    VATRate:   0,
    quantity: 1,
    itemQuantity: 24,
    supplier: 'Epicurium',
    supplierCode: 'EP-LCN-I-003'
  },
  {
    id: '7880bb6f-1024-493e-be5e-7e88ba51d2bb',
    itemId: '80984458-bab9-4a8f-86a7-b3e46f62139d',
    expiry: 1504220400000,
    purchased: 1493391145967,
    priceExcludingVAT:  799,
    VATRate: 0.2,
    quantity: 1,
    itemQuantity: 24,
    supplier: 'Epicurium',
    supplierCode: 'EP-PRO-S-002'
  },
  {
    id: '5be84d18-cd50-420d-83d7-d737633c8054',
    itemId: 'bed229db-3d36-4bbb-b45d-a799421431fd',
    expiry: 1516752000000,
    purchased: 1493391145967,
    priceExcludingVAT: 1035,
    VATRate: 0.2,
    quantity: 1,
    itemQuantity: 24,
    supplier: 'Epicurium',
    supplierCode: 'EP-POP-S-006'
  },
  {
    id: 'b6be26cb-8944-4498-8443-40404f4cf79d',
    itemId: 'ea44a2b2-bbb9-4a9a-89f2-9de52d0bfcf0',
    expiry: 1521158400000,
    purchased: 1493391145967,
    priceExcludingVAT: 1035,
    VATRate: 0.2,
    quantity: 1,
    itemQuantity: 24,
    supplier: 'Epicurium',
    supplierCode: 'EP-POP-S-004'
  },
  {
    id: '0db83730-d7a0-4dce-bf14-1d7188cde83e',
    itemId: 'b410f4ad-a379-43fe-aca9-76d2143a20b9',
    expiry: 1506812400000,
    purchased: 1493391145967,
    priceExcludingVAT: 1120,
    VATRate:   0,
    quantity: 1,
    itemQuantity: 24,
    supplier: 'Epicurium',
    supplierCode: 'EP-LCN-I-002'
  },
  {
    id: '6d54a2a9-d8d8-4d80-b27a-02b8b05eb23f',
    itemId: '92d7f78b-bd6c-4764-87a4-1b27bfa97cd7',
    expiry: 1506812400000,
    purchased: 1493391145967,
    priceExcludingVAT: 1120,
    VATRate:   0,
    quantity: 1,
    itemQuantity: 24,
    supplier: 'Epicurium',
    supplierCode: 'EP-LCN-I-001'
  },
  {
    id: '924439e3-24c1-406a-8aff-59570faaef23',
    itemId: '8dec0c6f-1bb3-433e-944f-52fe478efc32',
    expiry: 1504220400000,
    purchased: 1493391145967,
    priceExcludingVAT:  799,
    VATRate: 0.2,
    quantity: 1,
    itemQuantity: 24,
    supplier: 'Epicurium',
    supplierCode: 'EP-PRO-S-005'
  },
  {
    id: '99a99fa4-b9ba-40be-88db-d630b201194d',
    itemId: 'eddeb014-4ae9-4983-b2c9-f2911e5b9def',
    expiry: 1501455600000,
    purchased: 1493391145967,
    priceExcludingVAT: 1216,
    VATRate: 0.2,
    quantity: 1,
    itemQuantity: 24,
    supplier: 'Epicurium',
    supplierCode: 'EP-CRN-I-003'
  },
  {
    id: 'f27aad47-5639-40ac-9db3-517d5726b0b7',
    itemId: '827d7305-ee8c-4d1d-b5a1-82973c35d2db',
    expiry: 1512000000000,
    purchased: 1493391145967,
    priceExcludingVAT: 1280,
    VATRate: 0.2,
    quantity: 1,
    itemQuantity: 24,
    supplier: 'Epicurium',
    supplierCode: 'EP-CRN-I-004'
  },

  // sl office order 2017-05-02
  {
    // 90 Coke Zero £25
    id: '17f7d9ef-192e-4025-894f-9067c9695619',
    quantity: 1,
    itemQuantity: 90,
    expiry: 1506812400000,
    itemId: 'd5d10152-3f8a-419b-9abd-6d6e916ea64a',
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.heather,
    priceExcludingVAT: 2500
  },
  {
    // 60 Pepsi Max £8.50
    id: 'd3a8289b-a267-4627-add3-d047b70f0c81',
    quantity: 1,
    itemQuantity: 24,
    expiry: 1512086400000,
    itemId: 'e615de4e-ce10-451b-80ad-9717662a904a',
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.heather,
    priceExcludingVAT: 850
  },
  {
    // 30 Diet Coke £25
    id: 'd68fcc1f-aeb3-4f5a-9a7b-fa49b6705455',
    quantity: 1,
    itemQuantity: 90,
    expiry: 1506812400000,
    itemId: 'cf7a7886-c30d-4760-8c15-39adb2dc8649',
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.heather,
    priceExcludingVAT: 2500
  },
  {
    // 30 Fat Coke £10
    id: 'acd2584e-beb4-4d92-9b31-fadc1c3ba553',
    quantity: 1,
    itemQuantity: 36,
    expiry: 1522710000000,
    itemId: 'ccad58e3-e27a-4463-9139-17a36ff7f7b8',
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.heather,
    priceExcludingVAT: 1000
  },
  {
    supplier: MARKETPLACE_ID,
    supplierCode: userIds.chris,
    id: '84fbd053-a71f-42f8-a78c-25eadf4e0a45',
    quantity: 1,
    priceExcludingVAT: 335,
    itemQuantity: 40,
    expiry: 1499468400000,
    itemId: '3b7a6669-770c-4dbb-97e2-0e0aae3ca5ff'
  },
  {
    supplier: MARKETPLACE_ID,
    supplierCode: '45dd50e5-04c5-4390-b760-75f141b28901',
    id: 'ead35e4a-0ed6-4de1-aa41-68fdd161be1a',
    quantity: 1,
    priceExcludingVAT: 4140,
    itemQuantity: 32,
    expiry: 1505001600000,
    itemId: 'e838ba40-a6db-4556-beb6-ef433c26d5ff'
  },

  // stu frost 5 May 2017
  {
    supplier: MARKETPLACE_ID,
    supplierCode: '318ff9ec-4cd3-4eff-8f12-76f1e3ffa835',
    id: '0a7c13db-80f9-4f26-99dc-cda846789b27',
    quantity: 1,
    priceExcludingVAT: 120,
    itemQuantity: 2,
    expiry: 1514764800000,
    itemId: 'ab36b496-125f-44f6-921a-4e64d25ffc5b'
  }
];

const batches = new Map<string, Batch>();

for (const batch of batchesInternal) {
  if (batches.has(batch.id)) {
    throw new Error(`Duplicate ID ${batch.id}`);
  }
  batches.set(batch.id, batch);
}

export const getBatch = (batchId: string) => {
  const batch = batches.get(batchId);
  if (batch == null) {
    throw new Error(`No batch found with id ${batchId}`);
  }
  return batch;
};

export const getExpiry = (batchId: string): number => {
  const { expiry } = batches.get(batchId);
  return expiry;
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
