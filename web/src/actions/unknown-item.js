import history from '../history';

export const UNKNOWN_ITEM = 'UNKNOWN_ITEM';

const unknown = () => {
  return {
    type: UNKNOWN_ITEM
  };
};

export const unknownItem = itemId => async dispatch => {
  history.push('/store');
  dispatch(unknown());
};
