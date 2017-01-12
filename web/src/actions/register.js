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

const performRegistrationPhase2 = async (accessToken, requestBody) => {
  const response = await fetch('/api/v1/register2', {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer: ${accessToken}` 
    }
  });
  return await response.json();
};

const performRegistrationPhase1 = async (storeCode) => {
  const response = await fetch('/api/v1/register', {
    method: 'POST',
    body: JSON.stringify({ storeCode }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};

export const performFullRegistration = (storeCode) => async (dispatch, getState) => {
  const phase1Response = await performRegistrationPhase1(storeCode);
  dispatch(receiveRegistrationPhase1(phase1Response.response));

  const accessToken = getState().accessToken;
  const requestBody = {
    emailAddress: `${Date.now()}@example.com`,
    itemID: 0,
    cardDetails: '1234123412341234',
    topUpAmount: 500
  };
  const phase2Response = await performRegistrationPhase2(accessToken, requestBody);
  dispatch(receiveRegistrationPhase2(phase2Response.response));
};
