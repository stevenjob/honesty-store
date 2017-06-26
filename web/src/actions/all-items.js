import apifetch from './apirequest';

export const ALL_ITEMS_REQUEST = 'ALL_ITEMS_REQUEST';
export const ALL_ITEMS_SUCCESS = 'ALL_ITEMS_SUCCESS';
export const ALL_ITEMS_FAILURE = 'ALL_ITEMS_FAILURE';

const allItemsRequest = () => {
  return {
    type: ALL_ITEMS_REQUEST
  };
};

const allItemsSuccess = response => {
  return {
    type: ALL_ITEMS_SUCCESS,
    response
  };
};

const allItemsFailure = error => {
  return {
    type: ALL_ITEMS_FAILURE,
    error
  };
};

export const performAllItems = () => async (dispatch, getState) => {
  dispatch(allItemsRequest());

  try {
    const response = await apifetch(
      {
        url: `/api/v1/item/all`,
        getToken: () => getState().accessToken
      },
      dispatch,
      getState,
      'GET'
    );

    dispatch(allItemsSuccess(response));
  } catch (e) {
    dispatch(allItemsFailure(e));
  }
};
