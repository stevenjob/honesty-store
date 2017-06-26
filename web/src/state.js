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
    likedItemIds: [],
    lastBoxIdMarkedAsReceived: null,
    marketplace: {}
  };
};

export const loadState = () => {
  const deserializedState = JSON.parse(localStorage.getItem('state'));
  const state = {
    ...getInitialState(),
    ...deserializedState
  };

  // backwards-compat for refreshToken
  const oldRefreshToken = localStorage.getItem('refreshToken');
  if (!state.refreshToken && oldRefreshToken) {
    state.refreshToken = oldRefreshToken;
  }

  // backwards-compat for likedItemIds
  const oldLikedItemIds = localStorage.getItem('likedItemIds');
  if (
    (!state.likedItemIds || state.likedItemIds.length === 0) &&
    oldLikedItemIds
  ) {
    state.likedItemIds = oldLikedItemIds;
  }

  return state;
};

export const saveState = (state, dispatch) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);

    // migration
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('likedItemIds');
  } catch (e) {
    dispatch(localStorageSaveError());
  }
};
