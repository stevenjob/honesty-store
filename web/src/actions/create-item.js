import apifetch from './apirequest';
import history from '../history';

export const CREATE_ITEM_REQUEST = 'CREATE_ITEM_REQUEST';
export const CREATE_ITEM_SUCCESS = 'CREATE_ITEM_SUCCESS';
export const CREATE_ITEM_FAILURE = 'CREATE_ITEM_FAILURE';

const createItemRequest = () => {
  return {
    type: CREATE_ITEM_REQUEST
  };
};

const createItemSuccess = response => {
  return {
    type: CREATE_ITEM_SUCCESS,
    response
  };
};

const createItemFailure = error => {
  return {
    type: CREATE_ITEM_FAILURE,
    error
  };
};

export const performCreateItem = ({ details, storeCode }) => async (
  dispatch,
  getState
) => {
  dispatch(createItemRequest());

  try {
    const response = await apifetch(
      {
        url: `/api/v1/item`,
        body: details,
        getToken: () => getState().accessToken,
        method: 'POST'
      },
      dispatch,
      getState
    );

    dispatch(createItemSuccess(response));
    history.push(`/admin/listing/${storeCode}/item/${response.id}/success`);
  } catch (e) {
    dispatch(createItemFailure(e));
  }
};
