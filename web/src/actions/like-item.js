export const LIKE_ITEM = 'LIKE_ITEM';

const likeItem = (itemId) => {
  return {
    type: LIKE_ITEM,
    itemId
  };
};

export const performLikeItem = (itemId) => async (dispatch, getState) => {
  dispatch(likeItem(itemId));
};
