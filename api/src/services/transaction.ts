import { getItem } from '@honesty-store/item';
import { CodedError } from '@honesty-store/service/lib/error';
import {
  createTransaction,
  getAccount,
  issueUserRequestedRefund,
  TransactionBody
} from '@honesty-store/transaction';
import { calculateDonation, getItemPriceFromStore } from './store';

const expandItemDetails = async (key, transaction) => {
  const { itemId } = transaction.data;
  const item = itemId && await getItem(key, itemId);
  return {
    ...transaction,
    data: {
      ...transaction.data,
      item
    }
  };
};

const pageItems = <T>({ items, page, perPage = 10 }: { items: T[], page: number, perPage?: number }) => {
  const startIndex = perPage * page;
  const endIndex = Math.min(startIndex + perPage, items.length);
  return items.slice(startIndex, endIndex);
};

const assertValidQuantity = (quantity) => {
  if (!Number.isInteger(quantity)) {
    throw new Error(`quantity ${quantity} isn't an integer`);
  }
  if (quantity <= 0) {
    throw new Error(`quantity ${quantity} too small`);
  }
  if (quantity > 10) {
    throw new CodedError('TooManyPurchaseItems', `quantity ${quantity} too large`);
  }
};

export const purchase = async ({ key, itemID, userID, accountID, storeID, quantity }) => {
  assertValidQuantity(quantity);

  const subtotal = quantity * await getItemPriceFromStore(key, storeID, itemID);
  const donation = calculateDonation(storeID, subtotal);
  const total = subtotal + donation;

  const transaction: TransactionBody = {
    type: 'purchase',
    amount: -total,
    data: {
      quantity: String(quantity),
      itemId: itemID,
      userId: userID,
      storeId: storeID
    }
  };

  const response = await createTransaction(key, accountID, transaction);
  return {
    balance: response.balance,
    transaction: await expandItemDetails(key, response.transaction)
  };
};

export const refund = async ({ key, transactionId, userId, reason }) => {
  const { transaction, balance } = await issueUserRequestedRefund(key, transactionId, userId, reason);
  return {
    balance,
    transaction: await expandItemDetails(key, transaction)
  };
};

export const getExpandedTransactionsAndBalance = async ({ key, accountID, page = 0 }) => {
  const { balance, transactions: rawTransactions } = await getAccount(key, accountID);
  const transactionPromises = pageItems({
      items: rawTransactions,
      page
    })
    .map(item => expandItemDetails(key, item));

  return {
    balance,
    transactions: await Promise.all(transactionPromises)
  };
};
