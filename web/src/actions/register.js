import history from '../history';
import apifetch from './apirequest';

export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCESSS = 'REGISTER_SUCESSS';
export const REGISTER_FAILURE = 'REGISTER_FAILURE';

const registerRequest = () => ({
  type: REGISTER_REQUEST
});

const registerSuccess = ({ user, store, accessToken, refreshToken }) => ({
  type: REGISTER_SUCESSS,
  response: {
    user,
    store,
    accessToken,
    refreshToken
  }
});

const registerFailure = error => ({
  type: REGISTER_FAILURE,
  error
});

export const performRegister = ({ storeCode }) => async (
  dispatch,
  getState
) => {
  dispatch(registerRequest());
  try {
    const response = await apifetch(
      {
        url: '/api/v1/register',
        body: {
          storeCode
        }
      },
      dispatch,
      getState
    );

    dispatch(registerSuccess(response));
    history.push(`/store`);
  } catch (e) {
    dispatch(registerFailure(e));
  }
};
