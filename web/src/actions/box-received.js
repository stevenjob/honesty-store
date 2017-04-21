import apifetch from './apirequest';
import history from '../history';

export const BOX_RECEIVED_REQUEST = 'BOX_RECEIVED_REQUEST';
export const BOX_RECEIVED_SUCCESS = 'BOX_RECEIVED_SUCCESS';
export const BOX_RECEIVED_FAILURE = 'BOX_RECEIVED_FAILURE';

const boxReceivedRequest = () => {
  return {
    type: BOX_RECEIVED_REQUEST,
  };
};

const boxReceivedSuccess = () => {
  return {
    type: BOX_RECEIVED_SUCCESS
  };
};

const boxReceivedFailure = (error) => {
  return {
    type: BOX_RECEIVED_FAILURE,
    error
  };
};

export const performBoxReceived = ({ boxId }) => async (dispatch, getState) => {
  dispatch(boxReceivedRequest());

  try {
    await apifetch({
      url: `/api/v1/received/${boxId}`,
      getToken: () => getState().accessToken
    }, dispatch, getState);

    dispatch(boxReceivedSuccess());
    history.push('/box/received/success');
  } catch (e) {
    dispatch(boxReceivedFailure(e));
  }
};
