import apifetch from './apirequest';
import history from '../history';

export const OUT_OF_STOCK_REQUEST = 'OUT_OF_STOCK_REQUEST';
export const OUT_OF_STOCK_SUCCESS = 'OUT_OF_STOCK_SUCCESS';
export const OUT_OF_STOCK_FAILURE = 'OUT_OF_STOCK_FAILURE';

const outOfStockRequest = () => {
  return {
    type: OUT_OF_STOCK_REQUEST
  };
};

const outOfStockSuccess = (response, itemId) => {
  return {
    type: OUT_OF_STOCK_SUCCESS,
    itemId,
    response
  };
};

const outOfStockFailure = error => {
  return {
    type: OUT_OF_STOCK_FAILURE,
    error
  };
};

export const performOutOfStock = ({ itemId }) => async (dispatch, getState) => {
  dispatch(outOfStockRequest());

  try {
    const response = await apifetch(
      {
        url: '/api/v1/out-of-stock',
        getToken: () => getState().accessToken,
        body: { itemId },
        method: 'POST'
      },
      dispatch,
      getState
    );

    dispatch(outOfStockSuccess(response, itemId));

    history.push(`/item/${itemId}/out-of-stock/success`);
  } catch (e) {
    dispatch(outOfStockFailure(e));
  }
};
