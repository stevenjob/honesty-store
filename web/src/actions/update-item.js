import apifetch from './apirequest';

export const UPDATE_ITEM_REQUEST = 'UPDATE_ITEM_REQUEST';
export const UPDATE_ITEM_SUCCESS = 'UPDATE_ITEM_SUCCESS';
export const UPDATE_ITEM_FAILURE = 'UPDATE_ITEM_FAILURE';

const updateItemRequest = () => {
  return {
    type: UPDATE_ITEM_REQUEST
  };
};

const updateItemSuccess = response => {
  return {
    type: UPDATE_ITEM_SUCCESS,
    response
  };
};

const updateItemFailure = error => {
  return {
    type: UPDATE_ITEM_FAILURE,
    error
  };
};

export const performUpdateItem = ({ id, details }) => async (
  dispatch,
  getState
) => {
  dispatch(updateItemRequest());

  try {
    const response = await apifetch(
      {
        url: `/api/v1/item/${id}`,
        body: details,
        getToken: () => getState().accessToken
      },
      dispatch,
      getState
    );

    dispatch(updateItemSuccess(response));
  } catch (e) {
    dispatch(updateItemFailure(e));
  }
};
