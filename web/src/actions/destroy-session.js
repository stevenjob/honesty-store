import history from '../history';

export const DESTROY_SESSION = 'DESTROY_SESSION';

const destroySession = () => {
  return {
    type: DESTROY_SESSION
  };
};

export const performDestroySession = () => async (dispatch, getState) => {
  dispatch(destroySession());
  history.push(`/`);
};
