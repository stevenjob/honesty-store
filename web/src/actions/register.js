export const RECEIVE_REGISTRATION_PHASE1 = 'RECEIVE_REGISTRATION_PHASE1';
export const RECEIVE_REGISTRATION_PHASE2 = 'RECEIVE_REGISTRATION_PHASE2';

const receiveRegistrationPhase1 = (response) => {
  return {
    type: RECEIVE_REGISTRATION_PHASE1,
    response
  };
};

const receiveRegistrationPhase2 = (response) => {
  return {
    type: RECEIVE_REGISTRATION_PHASE2,
    response
  };
};

const performRegistrationPhase2 = (accessToken, requestBody) => {
  return fetch('/api/v1/register2', {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer: ${accessToken}` 
    }
  })
    .then(r => r.json());
};

const performRegistrationPhase1 = (storeCode) => {
  return fetch('/api/v1/register', {
    method: 'POST',
    body: JSON.stringify({ storeCode }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(r => r.json());
};

export const performFullRegistration = storeCode => (dispatch, getState) => {
  performRegistrationPhase1(storeCode)
    .then(json => {
      dispatch(receiveRegistrationPhase1(json.response));
      const accessToken = getState().accessToken;
      const requestBody = {
        emailAddress: 'testuser@example.com',
        itemID: 0,
        cardDetails: '1234123412341234',
        topUpAmount: 500
      };
      return performRegistrationPhase2(accessToken, requestBody);
    })
    .then(json => {
      dispatch(receiveRegistrationPhase2(json.response));
    });
};
