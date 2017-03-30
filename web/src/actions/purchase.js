import apifetch from './apirequest';
import history from '../history';

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

const purchaseFailure = (error) => {
  return {
    type: PURCHASE_FAILURE,
    error
  };
};

export const performPurchase = ({ itemId, quantity }) => async (dispatch, getState) => {
  dispatch(purchaseRequest());

  try {
    const response = await apifetch({
      url: '/api/v1/purchase',
      getToken: () => getState().accessToken,
      body: {
        itemID: itemId,
        quantity
      }
    }, dispatch, getState);

    dispatch(purchaseSuccess(response));
    history.push(`/item/${itemId}/${quantity}/success`);
  } catch (e) {
    dispatch(purchaseFailure(e));
  }
};
