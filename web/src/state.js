import { localStorageSaveError } from './actions/save-error';

export const getInitialState = () => {
  return {
    initialised: false,
    pending: [],
    user: {
      cardDetails: {}
    },
    store: {},
    register: {},
    error: {},
    accessToken: null,
    refreshToken: null,
    survey: undefined,
    likedItemIds: []
  };
};

export const loadState = () => {
  const deserializedState = JSON.parse(localStorage.getItem('state'));
  return {
    ...getInitialState(),
    ...deserializedState
  };
};

export const saveState = (state, dispatch) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);
  } catch (e) {
    dispatch(localStorageSaveError());
  }
};
