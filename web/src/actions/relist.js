import apifetch from './apirequest';
import history from '../history';

export const RELIST_REQUEST = 'RELIST_REQUEST';
export const RELIST_SUCCESS = 'RELIST_SUCCESS';
export const RELIST_FAILURE = 'RELIST_FAILURE';

const relistRequest = () => {
  return {
    type: RELIST_REQUEST
  };
};

const relistSuccess = response => {
  return {
    type: RELIST_SUCCESS,
    response
  };
};

const relistFailure = error => {
  return {
    type: RELIST_FAILURE,
    error
  };
};

export const performRelist = ({ storeCode, itemId, additionalCount }) => async (
  dispatch,
  getState
) => {
  dispatch(relistRequest());

  try {
    const response = await apifetch(
      {
        url: `/api/v1/store/${storeCode}/item/${itemId}/relist`,
        getToken: () => getState().accessToken,
        method: 'POST',
        body: {
          additionalCount
        }
      },
      dispatch,
      getState
    );

    dispatch(relistSuccess(response));
    history.push(`/admin/listing/${storeCode}`);
  } catch (e) {
    dispatch(relistFailure(e));
  }
};
