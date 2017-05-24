import { createAssertValidUuid } from '@honesty-store/service/src/assert';
import { CodedError } from '@honesty-store/service/src/error';
import { info } from '@honesty-store/service/src/log';
import { lambdaRouter } from '@honesty-store/service/src/router';
import { getStoreFromId, migrateStoreCodeToId } from '@honesty-store/store/src/client';
import { getUser } from '@honesty-store/user/src/client';
import { config, SES } from 'aws-sdk';
import cruftDDB from 'cruft-ddb';

import { BatchReference, Box, BoxItem } from './client';
import calculateMarketplaceBoxPricing from './marketplace-box';
import calculateShippedBoxPricing from './shipped-box';

config.region = process.env.AWS_REGION;

const cruft = cruftDDB<Box>({
  tableName: process.env.TABLE_NAME
});

const assertValidBoxId = createAssertValidUuid('boxId');
const assertValidBatchId = createAssertValidUuid('batchId');
const assertValidItemId = createAssertValidUuid('boxItemId');
const assertValidStoreId = createAssertValidUuid('storeId');

const assertValidBatchReference = ({ id, count }: BatchReference) => {
  assertValidBatchId(id);
  if (!Number.isInteger(count)) {
    throw new Error(`Non-integral count ${count}`);
  }
};

const assertValidBoxItemWithBatchReference = (boxItem: BoxItem) => {
  if (!boxItem) {
    throw new Error('Box item cannot be undefined');
  }
  const { itemID, batches: batchReferences } = boxItem;
  assertValidItemId(itemID);
  if (!Array.isArray(batchReferences)) {
    throw new Error(`Invalid batches ${batchReferences}`);
  }

  for (const batchReference of batchReferences) {
    assertValidBatchReference(batchReference);
  }
};

const assertValidDonationRate = (donationRate) => {
  if (!Number.isFinite(donationRate) || donationRate < 0) {
    throw new Error(`Donation rate '${donationRate}' should be a number >= 0`);
  }
};

const assertValidShippedBoxSubmission = ({ shippingCost, boxItems, packed, shipped, received, closed, donationRate }) => {
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
    assertValidBoxItemWithBatchReference(boxItem);
  }
  assertValidDonationRate(donationRate);
};

const assertValidMarketplaceBoxSubmission = (submission) => {
  if (!submission) {
    throw new Error('Submission cannot be undefined');
  }

  const { boxItem, donationRate } = submission;
  assertValidDonationRate(donationRate);
  assertValidBoxItemWithBatchReference(boxItem);

  const { batches } = boxItem;
  if (batches.length !== 1) {
    throw new Error(`Marketplace box can only contain a single batch reference`);
  }
};

const getBox = async (boxId) => {
  assertValidBoxId(boxId);

  const box = await cruft.read({ id: boxId });

  return {
    ...box,
    storeId: migrateStoreCodeToId(box.storeId)
  };
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
    entry.depleted = Number(depleted);
    await cruft.update(box);
  }

  return {};
};

const sendShippedNotification = async ({ key, emailAddress, boxId }) => {
  const message = `( https://honesty.store )

*********************************************************************
Your honesty.store box is on its way to you!

When it arrives, please tap the button below to make the items available to purchase.
*********************************************************************

( https://honesty.store/agent/received/${boxId} )
`;
  const { MessageId } = await new SES({ apiVersion: '2010-12-01' })
    .sendEmail({
      Destination: {
        ToAddresses: [emailAddress]
      },
      Source: 'no-reply@honesty.store',
      Message: {
        Subject: { Charset: 'UTF-8', Data: 'Your box is on its way!' },
        Body: { Text: { Charset: 'UTF-8', Data: message } }
      }
    })
    .promise();

  info(key, `Shipped box notification email sent to ${emailAddress}: ${MessageId}`);

  return MessageId;
};

const markBoxAsShipped = async ({ key, boxId, date }) => {
  info(key, `Marking box as shipped`, { boxId, date });

  const box = await getBox(boxId);

  box.shipped = Number(date);

  await cruft.update(box);

  const { storeId } = box;
  const { agentId } = await getStoreFromId(key, storeId);
  const { emailAddress } = await getUser(key, agentId);
  await sendShippedNotification({ key, emailAddress, boxId });

  return {};
};

const markBoxAsReceived = async ({ key, boxId }) => {
  info(key, `Marking box as received`, { boxId });

  const box = await getBox(boxId);

  if (box.received != null) {
    throw new CodedError('BoxAlreadyMarkedAsReceived', `Box ${boxId} already marked as received`);
  }

  box.received = Date.now();

  await cruft.update(box);

  return {};
};

const assertValidlyPricedBox = (box: Box) => {
  if (box.count <= 0 || box.boxItems.length <= 0) {
    throw new Error('Box has items <= 0');
  }
  for (const { itemID: itemId, total } of box.boxItems) {
    if (total <= 0) {
      throw new Error(`Box item '${itemId}' has a price of ${total}`);
    }
  }
};

const createMarketplaceBox = async ({ key, storeId, submission, dryRun }): Promise<Box> => {
  info(key, `New marketplace submission received for store ${storeId}`, { submission });

  assertValidStoreId(storeId);
  assertValidMarketplaceBoxSubmission(submission);

  const box = await calculateMarketplaceBoxPricing(key, storeId, submission);
  assertValidlyPricedBox(box);

  if (!dryRun) {
    await cruft.create(box);
  }

  return box;
};

const createShippedBox = async ({ key, storeId, submission, dryRun }): Promise<Box> => {
  info(key, `New box submission received for store ${storeId}`, { submission });

  await getStoreFromId(key, storeId);
  await assertValidShippedBoxSubmission(submission);

  const box = await calculateShippedBoxPricing(key, storeId, submission);
  assertValidlyPricedBox(box);

  if (!dryRun) {
    await cruft.create(box);
  }

  return box;
};

export const router = lambdaRouter('box', 1);

router.get(
  '/store/:storeId',
  async (_key, { storeId }) => getBoxesForStore(storeId)
);

router.post(
  '/store/:storeId/shipped',
  async (key, { storeId }, { dryRun, ...submission }) =>
    // tslint:disable-next-line:triple-equals
    createShippedBox({ key, storeId, submission, dryRun: dryRun != false })
);

router.post(
  '/store/:storeId/marketplace',
  async (key, { storeId }, { dryRun, ...submission }) =>
    // tslint:disable-next-line:triple-equals
    createMarketplaceBox({ key, storeId, submission, dryRun: dryRun != false })
);

router.post(
  '/:boxId/out-of-stock/:itemId/:depleted',
  async (key, { boxId, itemId, depleted }) => flagOutOfStock({ key, boxId, itemId, depleted })
);

router.post(
  '/:boxId/received',
  async (key, { boxId }) => markBoxAsReceived({ key, boxId })
);

router.put(
  '/:boxId/shipped/:date',
  async (key, { boxId, date }) => markBoxAsShipped({ key, boxId, date })
);

router.get(
  '/:boxId',
  async (_key, { boxId }) => getBox(boxId)
);
