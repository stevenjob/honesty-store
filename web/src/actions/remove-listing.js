import apifetch from './apirequest';

export const REMOVE_LISTING_REQUEST = 'REMOVE_LISTING_REQUEST';
export const REMOVE_LISTING_SUCCESS = 'REMOVE_LISTING_SUCCESS';
export const REMOVE_LISTING_FAILURE = 'REMOVE_LISTING_FAILURE';

const removeListingRequest = () => {
  return {
    type: REMOVE_LISTING_REQUEST
  };
};

const removeListingSuccess = itemId => {
  return {
    type: REMOVE_LISTING_SUCCESS,
    itemId
  };
};

const removeListingFailure = error => {
  return {
    type: REMOVE_LISTING_FAILURE,
    error
  };
};

export const performRemoveListing = ({ storeCode, itemId }) => async (
  dispatch,
  getState
) => {
  dispatch(removeListingRequest());

  try {
    await apifetch(
      {
        url: `/api/v1/store/${storeCode}/item/${itemId}/unlist`,
        getToken: () => getState().accessToken,
        method: 'POST'
      },
      dispatch,
      getState
    );

    dispatch(removeListingSuccess(itemId));
  } catch (e) {
    dispatch(removeListingFailure(e));
  }
};
