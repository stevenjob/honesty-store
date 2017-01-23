import { hashHistory } from 'react-router';

export const REGISTER2_REQUEST = 'REGISTER2_REQUEST';
export const REGISTER2_SUCESSS = 'REGISTER2_SUCESSS';
export const REGISTER2_FAILURE = 'REGISTER2_FAILURE';

const register2Request = () => {
  return {
    type: REGISTER2_REQUEST
  };
};

const register2Success = ({ user, store }) => {
  return {
    type: REGISTER2_SUCESSS,
    response: {
      user,
      store
    }
  };
};

const register2Failure = () => {
  return {
    type: REGISTER2_FAILURE
  };
};

export const performRegister2 = ({ storeId, itemID, topUpAmount, stripeToken, emailAddress }) => async (dispatch, getState) => {
  dispatch(register2Request());
  const accessToken = getState().accessToken;
  try {
    const response = await fetch('/api/v1/register2', {
      method: 'POST',
      body: JSON.stringify({ itemID, topUpAmount, stripeToken, emailAddress }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer: ${accessToken}`
      }
    });
    const json = await response.json();
    if (json.error) {
      throw new Error(json.error.message);
    }
    const { user, store } = json.response;
    dispatch(register2Success({ user, store }));
    const path = user.transactions.length !== 2 ? `/${storeId}/register/success` : `/${storeId}/register/${itemID}/success`;
    hashHistory.push(path);
  }
  catch (e) {
    dispatch(register2Failure());
    hashHistory.push(`/error`);
  }
};
