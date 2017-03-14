import history from '../history';

export const GO_HOME = 'GO_HOME';

const goHome = () => {
  return {
    type: GO_HOME
  };
};

export const performGoHome = () => async (dispatch, getState) => {
  dispatch(goHome());
  history.push(`/`);
};
