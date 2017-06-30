import apifetch from './apirequest';
import history from '../history';

export const UPDATE_LISTING_DETAILS_REQUEST = 'UPDATE_LISTING_DETAILS_REQUEST';
export const UPDATE_LISTING_DETAILS_SUCCESS = 'UPDATE_LISTING_DETAILS_SUCCESS';
export const UPDATE_LISTING_DETAILS_FAILURE = 'UPDATE_LISTING_DETAILS_FAILURE';

const updateListingDetailsRequest = () => {
  return {
    type: UPDATE_LISTING_DETAILS_REQUEST
  };
};

const updateListingDetailsSuccess = response => {
  return {
    type: UPDATE_LISTING_DETAILS_SUCCESS,
    response
  };
};

const updateListingDetailsFailure = error => {
  return {
    type: UPDATE_LISTING_DETAILS_FAILURE,
    error
  };
};

export const performUpdateListingDetails = ({
  storeCode,
  itemId,
  details
}) => async (dispatch, getState) => {
  dispatch(updateListingDetailsRequest());

  try {
    const response = await apifetch(
      {
        url: `/api/v1/store/${storeCode}/item/${itemId}`,
        body: details,
        getToken: () => getState().accessToken,
        method: 'POST'
      },
      dispatch,
      getState
    );

    dispatch(updateListingDetailsSuccess(response));
    history.push(`/admin/listing/${storeCode}`);
  } catch (e) {
    dispatch(updateListingDetailsFailure(e));
  }
};
