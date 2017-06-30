import apifetch from './apirequest';

export const UPDATE_LISTING_COUNT_REQUEST = 'UPDATE_LISTING_COUNT_REQUEST';
export const UPDATE_LISTING_COUNT_SUCCESS = 'UPDATE_LISTING_COUNT_SUCCESS';
export const UPDATE_LISTING_COUNT_FAILURE = 'UPDATE_LISTING_COUNT_FAILURE';

const updateListingCountRequest = () => {
  return {
    type: UPDATE_LISTING_COUNT_REQUEST
  };
};

const updateListingCountSuccess = response => {
  return {
    type: UPDATE_LISTING_COUNT_SUCCESS,
    response
  };
};

const updateListingCountFailure = error => {
  return {
    type: UPDATE_LISTING_COUNT_FAILURE,
    error
  };
};

export const performUpdateListingCount = ({
  storeCode,
  itemId,
  count
}) => async (dispatch, getState) => {
  dispatch(updateListingCountRequest());

  try {
    const response = await apifetch(
      {
        url: `/api/v1/store/${storeCode}/item/${itemId}/count`,
        body: {
          count
        },
        getToken: () => getState().accessToken,
        method: 'POST'
      },
      dispatch,
      getState
    );

    dispatch(updateListingCountSuccess(response));
  } catch (e) {
    dispatch(updateListingCountFailure(e));
  }
};
