import { browserHistory } from 'react-router';
import { apifetch, unpackJson } from './apirequest';

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

export const performPurchase = ({ itemId, quantity }) => async (dispatch, getState) => {
  dispatch(purchaseRequest());

  try {
    const response = await apifetch({
      url: '/api/v1/purchase',
      token: getState().accessToken,
      body: {
        itemID: itemId,
        quantity
      }
    });

    dispatch(purchaseSuccess(await unpackJson(response)));
    browserHistory.push(`/item/${itemId}/success`);
  } catch (e) {
    dispatch(purchaseFailure(e));
    browserHistory.push(`/error`);
  }
};
