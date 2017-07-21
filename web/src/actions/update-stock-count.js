import apifetch from './apirequest';
import history from '../history';

export const UPDATE_STOCK_COUNT_REQUEST = 'UPDATE_STOCK_COUNT_REQUEST';
export const UPDATE_STOCK_COUNT_SUCCESS = 'UPDATE_STOCK_COUNT_SUCCESS';
export const UPDATE_STOCK_COUNT_FAILURE = 'UPDATE_STOCK_COUNT_FAILURE';

const updateStockCountRequest = () => {
  return {
    type: UPDATE_STOCK_COUNT_REQUEST
  };
};

const updateStockCountSuccess = (response, itemId) => {
  return {
    type: UPDATE_STOCK_COUNT_SUCCESS,
    itemId,
    response
  };
};

const updateStockCountFailure = error => {
  return {
    type: UPDATE_STOCK_COUNT_FAILURE,
    error
  };
};

export const performUpdateStockCount = ({ itemId, storeCode, count }) => async (
  dispatch,
  getState
) => {
  dispatch(updateStockCountRequest());

  try {
    const response = await apifetch(
      {
        url: `/api/v1/store/${storeCode}/item/${itemId}/count`,
        getToken: () => getState().accessToken,
        body: { count },
        method: 'POST'
      },
      dispatch,
      getState
    );

    dispatch(updateStockCountSuccess(response, itemId));

    history.push(`/item/${itemId}/update-stock-count/success`);
  } catch (e) {
    dispatch(updateStockCountFailure(e));
  }
};
