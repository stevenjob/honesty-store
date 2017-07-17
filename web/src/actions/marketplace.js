import apifetch from './apirequest';
import history from '../history';

export const MARKETPLACE_REQUEST = 'MARKETPLACE_REQUEST';
export const MARKETPLACE_SUCCESS = 'MARKETPLACE_SUCCESS';
export const MARKETPLACE_FAILURE = 'MARKETPLACE_FAILURE';

const marketplaceRequest = () => {
  return {
    type: MARKETPLACE_REQUEST
  };
};

const marketplaceSuccess = () => {
  return {
    type: MARKETPLACE_SUCCESS
  };
};

const marketplaceFailure = error => {
  return {
    type: MARKETPLACE_FAILURE,
    error
  };
};

export const performMarketplace = ({
  name,
  qualifier,
  itemPrice,
  quantity,
  storeCode
}) => async (dispatch, getState) => {
  dispatch(marketplaceRequest());

  try {
    const response = await apifetch(
      {
        url: '/api/v1/marketplace',
        body: {
          storeCode,
          item: {
            name,
            qualifier,
            itemPrice,
            quantity
          }
        },
        getToken: () => getState().accessToken,
        method: 'POST'
      },
      dispatch,
      getState
    );

    dispatch(marketplaceSuccess(response));
    history.push(`/more/list/success`);
  } catch (e) {
    dispatch(marketplaceFailure(e));
  }
};
