import apifetch from './apirequest';
import history from '../history';

export const CREATE_LISTING_REQUEST = 'CREATE_LISTING_REQUEST';
export const CREATE_LISTING_SUCCESS = 'CREATE_LISTING_SUCCESS';
export const CREATE_LISTING_FAILURE = 'CREATE_LISTING_FAILURE';

const createListingRequest = () => {
  return {
    type: CREATE_LISTING_REQUEST
  };
};

const createListingSuccess = response => {
  return {
    type: CREATE_LISTING_SUCCESS,
    response
  };
};

const createListingFailure = error => {
  return {
    type: CREATE_LISTING_FAILURE,
    error
  };
};

export const performCreateListing = ({ storeCode, itemId, details }) => async (
  dispatch,
  getState
) => {
  dispatch(createListingRequest());

  try {
    const response = await apifetch(
      {
        url: `/api/v1/store/${storeCode}/item/${itemId}/list`,
        body: details,
        getToken: () => getState().accessToken,
        method: 'POST'
      },
      dispatch,
      getState
    );

    dispatch(createListingSuccess(response));
    history.push(`/admin/listing/${storeCode}`);
  } catch (e) {
    dispatch(createListingFailure(e));
  }
};
