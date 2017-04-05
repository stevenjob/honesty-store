import { config } from 'aws-sdk';
import cruftDDB from 'cruft-ddb';
import bodyParser = require('body-parser');
import express = require('express');
import isUUID = require('validator/lib/isUUID');
import { storeList } from '../../api/src/services/store';
import { CodedError } from '../../service/src/error';
import { info } from '../../service/src/log';
import { serviceAuthentication, serviceRouter } from '../../service/src/router';
import { getUser } from '../../user/src/client';
import { Batch, getBatch, MARKETPLACE_ID } from './batch';
import { Box } from './client';
import calculateMarketplaceBoxPricing from './marketplace-box';
import calculateShippedBoxPricing from './shipped-box';

config.region = process.env.AWS_REGION;

const cruft = cruftDDB<Box>({
  tableName: process.env.TABLE_NAME
});

const assertValidStoreId = (storeId) => {
  if (!storeList.some((el) => el === storeId)) {
    throw new Error(`No store found with id '${storeId}'`);
  }
};

const assertValidBoxId = (boxId) => {
  if (boxId == null || !isUUID(boxId, 4)) {
    throw new Error(`Invalid boxId ${boxId}`);
  }
};

const assertValidShippedBatch = (batch: Batch) => {
  const { id: batchId, supplier } = batch;
  if (supplier === MARKETPLACE_ID) {
    throw new Error(`Referenced batch '${batchId}' cannot have supplier value '${MARKETPLACE_ID} for a shipped box`);
  }
};

const assertValidMarketplaceBatch = async (key, batch: Batch) => {
  const { id: batchId, supplier, supplierCode } = batch;
  if (supplier !== MARKETPLACE_ID) {
    throw new Error(
      `Referenced batch '${batchId}' must have supplier value '${MARKETPLACE_ID}' for a marketplace box, but found '${supplier}'`
    );
  }
  try {
    await getUser(key, supplierCode);
  } catch (e) {
    throw new Error(`Referenced batch '${batchId}' must have a valid userId assigned to supplierCode, ${e.message}`);
  }
};

const assertValidBatchReference = ({ id, count }) => {
  if (id == null || !isUUID(id, 4)) {
    throw new Error(`Invalid id ${id}`);
  }
  if (!Number.isInteger(count)) {
    throw new Error(`Non-integral count ${count}`);
  }
};

const assertValidBoxItemWithBatchReference = async (key, boxItem, isMarketplaceSubmission: boolean) => {
  if (!boxItem) {
    throw new Error('Box item cannot be undefined');
  }
  const { itemID, batches } = boxItem;
  if (itemID == null || !isUUID(itemID, 4)) {
    throw new Error(`Invalid itemID ${itemID}`);
  }
  if (!Array.isArray(batches)) {
    throw new Error(`Invalid batches ${batches}`);
  }
  for (const batchRef of batches) {
    assertValidBatchReference(batchRef);
    const batch = getBatch(batchRef.id);
    const { itemId: batchItemId } = batch;
    if (batchItemId !== itemID) {
      throw new Error(`Batch ${batchRef.id} does not contain item ${itemID}`);
    }
    if (isMarketplaceSubmission) {
      await assertValidMarketplaceBatch(key, batch);
    } else {
      assertValidShippedBatch(batch);
    }
  }
};

const assertValidDonationRate = (donationRate) => {
  if (!Number.isFinite(donationRate) || donationRate < 0) {
    throw new Error(`Donation rate '${donationRate}' should be a number >= 0`);
  }
};

const assertValidShippedBoxSubmission = async ({ shippingCost, boxItems, packed, shipped, received, closed, donationRate }) => {
  if (!Number.isInteger(shippingCost)) {
    throw new Error(`Non-integral shipping cost ${shippingCost}`);
  }
  if (packed != null && !Number.isInteger(packed)) {
    throw new Error(`Invalid timestamp for packed ${packed}`);
  }
  if (shipped != null && !Number.isInteger(shipped)) {
    throw new Error(`Invalid timestamp for shipped ${shipped}`);
  }
  if (received != null && !Number.isInteger(received)) {
    throw new Error(`Invalid timestamp for received ${received}`);
  }
  if (closed != null && !Number.isInteger(closed)) {
    throw new Error(`Invalid timestamp for closed ${closed}`);
  }
  if (!Array.isArray(boxItems)) {
    throw new Error(`Invalid boxItems ${boxItems}`);
  }
  for (const boxItem of boxItems) {
    await assertValidBoxItemWithBatchReference(null, boxItem, false);
  }
  assertValidDonationRate(donationRate);
};

const assertValidMarketplaceBoxSubmission = async (key, submission) => {
  if (!submission) {
    throw new Error('Submission cannot be undefined');
  }

  const  { boxItem, donationRate } = submission;
  assertValidDonationRate(donationRate);
  await assertValidBoxItemWithBatchReference(key, boxItem, true);

  const { batches } = boxItem;
  if (batches.length !== 1) {
    throw new Error(`Marketplace box can only contain a single batch reference`);
  }
};

const getBox = async (boxId) => {
  assertValidBoxId(boxId);

  return await cruft.read({ id: boxId });
};

const getBoxesForStore = async (storeId) => {
  assertValidStoreId(storeId);

  return await cruft.__findAll({ storeId });
};

const flagOutOfStock = async ({ key, boxId, itemId, depleted }) => {
  info(key, `Flagging item out of stock`, { boxId, itemId, depleted });

  const box = await getBox(boxId);

  const entry = box.boxItems.find(item => item.itemID === itemId);
  if (!entry) {
    throw new CodedError('ItemNotInBox', `item ${itemId} not found in box ${boxId}`);
  }

  if (!entry.depleted) {
    entry.depleted = depleted;
    await cruft.update(box);
  }

  return {};
};

const createMarketplaceBox = async ({ key, storeId, submission, dryRun}): Promise<Box> => {
  info(key, `New marketplace submission received for store ${storeId}`, { submission });

  assertValidStoreId(storeId);
  await assertValidMarketplaceBoxSubmission(key, submission);

  const box = calculateMarketplaceBoxPricing(storeId, submission);

  if (!dryRun) {
    await cruft.create(box);
  }

  return box;
};

const createShippedBox = async ({ key, storeId, submission, dryRun }): Promise<Box> => {
  info(key, `New box submission received for store ${storeId}`, { submission });

  assertValidStoreId(storeId);
  await assertValidShippedBoxSubmission(submission);

  const box = calculateShippedBoxPricing(storeId, submission);

  if (!dryRun) {
    await cruft.create(box);
  }

  return box;
};

const assertConnectivity = async () => {
  await cruft.read({ id: '06439c6c-57c9-4a17-b218-2018ea8dae55' });
};

const app = express();

app.use(bodyParser.json());

const router = serviceRouter('box', 1);

router.get(
  '/:boxId',
  serviceAuthentication,
  async (_key, { boxId }) => getBox(boxId)
);

router.get(
  '/store/:storeId',
  serviceAuthentication,
  async (_key, { storeId }) => getBoxesForStore(storeId)
);

router.post(
  '/store/:storeId/shipped',
  serviceAuthentication,
  async (key, { storeId }, submission, { query: { dryRun } }) =>
    createShippedBox({ key, storeId, submission, dryRun: dryRun !== 'false' })
);

router.post(
  '/store/:storeId/marketplace',
  serviceAuthentication,
  async (key, { storeId }, submission, { query: { dryRun } }) =>
    createMarketplaceBox({ key, storeId, submission, dryRun: dryRun !== 'false' })
);

router.post(
  '/out-of-stock/:boxId/:itemId/:depleted',
  serviceAuthentication,
  async (key, { boxId, itemId, depleted }) => flagOutOfStock({ key, boxId, itemId, depleted })
);

app.use(router);

// send healthy response to load balancer probes
app.get('/', (_req, res) => {
  assertConnectivity()
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500));
});

app.listen(3000);
