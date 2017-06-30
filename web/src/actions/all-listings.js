import apifetch from './apirequest';

export const ALL_LISTINGS_REQUEST = 'ALL_LISTINGS_REQUEST';
export const ALL_LISTINGS_SUCCESS = 'ALL_LISTINGS_SUCCESS';
export const ALL_LISTINGS_FAILURE = 'ALL_LISTINGS_FAILURE';

const allListingsRequest = () => {
  return {
    type: ALL_LISTINGS_REQUEST
  };
};

const allListingsSuccess = response => {
  return {
    type: ALL_LISTINGS_SUCCESS,
    response
  };
};

const allListingsFailure = error => {
  return {
    type: ALL_LISTINGS_FAILURE,
    error
  };
};

export const performAllListings = ({ storeCode }) => async (
  dispatch,
  getState
) => {
  dispatch(allListingsRequest());

  try {
    const response = await apifetch(
      {
        url: `/api/v1/store/${storeCode}/item/all`,
        getToken: () => getState().accessToken,
        method: 'GET'
      },
      dispatch,
      getState
    );

    dispatch(allListingsSuccess(response));
  } catch (e) {
    dispatch(allListingsFailure(e));
  }
};
