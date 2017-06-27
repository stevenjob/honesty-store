import apifetch from './apirequest';
import history from '../history';

export const STORE_REQUEST = 'STORE_REQUEST';
export const STORE_SUCCESS = 'STORE_SUCESSS';
export const STORE_FAILURE = 'STORE_FAILURE';

const storeRequest = () => ({
  type: STORE_REQUEST
});

const storeSuccess = response => ({
  type: STORE_SUCCESS,
  response
});

const storeFailure = error => ({
  type: STORE_FAILURE,
  error
});

export const performStoreChange = ({ storeCode }) => async (
  dispatch,
  getState
) => {
  dispatch(storeRequest());
  try {
    const response = await apifetch(
      {
        url: '/api/v1/store',
        body: {
          storeCode
        },
        getToken: () => getState().accessToken,
        method: 'POST'
      },
      dispatch,
      getState
    );

    dispatch(storeSuccess(response));
    history.push(`/store`);
  } catch (e) {
    dispatch(storeFailure(e));
  }
};
