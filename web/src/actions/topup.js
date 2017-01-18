import { hashHistory } from 'react-router'

export const REQUEST_TOPUP = 'REQUEST_TOPUP';
export const RECEIVE_TOPUP = 'RECEIVE_TOPUP';

const receiveTopup = (response) => {
  return {
    type: RECEIVE_TOPUP,
    response
  };
};

const requestTopup = () => {
  return {
    type: REQUEST_TOPUP,
  };
};

export const performTopup = ({ storeId, stripeToken, amount }) => async (dispatch, getState) => {
  dispatch(requestTopup());
  // TODO: enable
//   const response = await fetch('/api/v1/topup', {
//     method: 'POST',
//     body: JSON.stringify({ stripeToken, amount }),
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   });
//   const json = await response.json();
  const json = {};
  dispatch(receiveTopup(json.response));
  if (false) {
    hashHistory.push(`/${storeId}/topup/error`);
  } else {
    hashHistory.push(`/${storeId}/topup/success`);
  }
};
