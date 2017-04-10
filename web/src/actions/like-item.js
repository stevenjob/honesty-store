export const LIKE_ITEM = 'LIKE_ITEM';
export const UNLIKE_ITEM = 'UNLIKE_ITEM';

const likeItem = (itemId) => {
  return {
    type: LIKE_ITEM,
    itemId
  };
};

const unlikeItem = (itemId) => {
  return {
    type: UNLIKE_ITEM,
    itemId
  };
};

export const performLikeItem = (itemId) => async (dispatch, getState) => {
  dispatch(likeItem(itemId));
};

export const performUnlikeItem = (itemId) => async (dispatch, getState) => {
  dispatch(unlikeItem(itemId));
};
