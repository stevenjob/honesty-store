import apifetch from './apirequest';
import history from '../history';

export const SIGNIN_REQUEST = 'SIGNIN_REQUEST';
export const SIGNIN_SUCCESS = 'SIGNIN_SUCCESS';
export const SIGNIN_FAILURE = 'SIGNIN_FAILURE';

const signinRequest = () => {
  return {
    type: SIGNIN_REQUEST,
  };
};

const signinSuccess = () => {
  return {
    type: SIGNIN_SUCCESS
  };
};

const signinFailure = (error) => {
  return {
    type: SIGNIN_FAILURE,
    error
  };
};

export const performSignin = ({ itemId, emailAddress, storeId }) => async (dispatch, getState) => {
  dispatch(signinRequest());

  try {
    const response = await apifetch({
      url: '/api/v1/signin',
      body: {
        emailAddress,
        storeId
      }
    }, dispatch, getState);

    dispatch(signinSuccess(response));
    history.push(`/signin/success`);

  } catch (e) {
    if (e.code === 'EmailNotFound') {
      dispatch(signinFailure(undefined));
      const itemParam = itemId || '';
      history.push(`/register/${itemParam}/${emailAddress}`);
    } else {
      dispatch(signinFailure(e));
    }
  }
};
