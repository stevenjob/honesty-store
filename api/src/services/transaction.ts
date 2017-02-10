import { UserError } from '../../../service/src/errorDefinitions';
import { createTransaction, getAccount, TransactionDetails } from '../../../transaction/src/client/index';
import { getItem } from '../services/item';
import { getPrice } from './store';

const expandItemDetails = (transaction) => {
  const { itemId } = transaction.data;
  const item = itemId != null ? getItem(itemId) : null;
  return {
    ...transaction,
    data: {
      ...transaction.data,
      item
    }
  };
};

const pageItems = ({ items, page, perPage = 10 }) => {
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
    throw new UserError('TooManyPurchaseItems', `quantity ${quantity} too large`);
  }
};

export const purchase = async ({ key, itemID, userID, accountID, storeID, quantity }) => {
  assertValidQuantity(quantity);

  const price = quantity * getPrice(storeID, itemID);

  const transaction: TransactionDetails = {
    type: 'purchase',
    amount: -price,
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
    transaction: expandItemDetails(response.transaction)
  };
};

export const getExpandedTransactionsAndBalance = async ({ key, accountID, page = 0 }) => {
  const { balance, transactions: rawTransactions } = await getAccount(key, accountID);
  const transactions = pageItems({
      items: rawTransactions,
      page
    })
    .map(expandItemDetails);

  return {
    balance,
    transactions
  };
};
