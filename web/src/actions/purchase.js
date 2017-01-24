import { hashHistory } from 'react-router';

export const PURCHASE_REQUEST = 'PURCHASE_REQUEST';
export const PURCHASE_SUCCESS = 'PURCHASE_SUCCESS';
export const PURCHASE_FAILURE = 'PURCHASE_FAILURE';

const purchaseRequest = () => {
  return {
    type: PURCHASE_REQUEST
  };
};

const purchaseSuccess = (response) => {
  return {
    type: PURCHASE_SUCCESS,
    response
  };
};

const purchaseFailure = () => {
  return {
    type: PURCHASE_FAILURE
  };
};

export const performPurchase = ({ storeId, itemId, quantity }) => async (dispatch, getState) => {
  dispatch(purchaseRequest());
  try {
    const { accessToken } = getState();
    const response = await fetch('/api/v1/purchase', {
      method: 'POST',
      body: JSON.stringify({ itemID: itemId, quantity }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer: ${accessToken}`
      }
    });
    const json = await response.json();
    if (json.error) {
      throw new Error(json.error.message);
    }
    dispatch(purchaseSuccess(json.response));
    hashHistory.push(`${storeId}/item/${itemId}/success`);
  }
  catch (e) {
    dispatch(purchaseFailure());
    hashHistory.push(`${storeId}/item/error`);
  }
};