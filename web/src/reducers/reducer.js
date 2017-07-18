import { DISMISS_ERROR } from '../actions/dismissError';
import { INITIALISE } from '../actions/inititialise';
import {
  REGISTER_REQUEST,
  REGISTER_SUCESSS,
  REGISTER_FAILURE
} from '../actions/register';
import {
  REGISTER2_REQUEST,
  REGISTER2_SUCESSS,
  REGISTER2_FAILURE
} from '../actions/register2';
import {
  SESSION_REQUEST,
  SESSION_SUCCESS,
  SESSION_RESET,
  SESSION_FAILURE
} from '../actions/session';
import { TOPUP_REQUEST, TOPUP_SUCCESS, TOPUP_FAILURE } from '../actions/topup';
import {
  PURCHASE_REQUEST,
  PURCHASE_SUCCESS,
  PURCHASE_FAILURE
} from '../actions/purchase';
import { DESTROY_SESSION } from '../actions/destroy-session';
import {
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE
} from '../actions/logout';
import {
  SUPPORT_REQUEST,
  SUPPORT_SUCCESS,
  SUPPORT_FAILURE
} from '../actions/support';
import {
  SIGNIN_REQUEST,
  SIGNIN_SUCCESS,
  SIGNIN_FAILURE
} from '../actions/signin';
import {
  SIGNIN2_REQUEST,
  SIGNIN2_SUCCESS,
  SIGNIN2_FAILURE
} from '../actions/signin2';
import { STORE_REQUEST, STORE_SUCCESS, STORE_FAILURE } from '../actions/store';
import {
  MARKETPLACE_REQUEST,
  MARKETPLACE_SUCCESS,
  MARKETPLACE_FAILURE
} from '../actions/marketplace';
import {
  OUT_OF_STOCK_REQUEST,
  OUT_OF_STOCK_SUCCESS,
  OUT_OF_STOCK_FAILURE
} from '../actions/out-of-stock';
import { UNLIKE_ITEM, LIKE_ITEM } from '../actions/like-item';
import { LOCAL_STORAGE_SAVE_ERROR } from '../actions/save-error';
import {
  REFUND_REQUEST,
  REFUND_SUCCESS,
  REFUND_FAILURE
} from '../actions/refund';
import { LOGGED_OUT_IN_ANOTHER_SESSION } from '../actions/logged-out';
import {
  ALL_ITEMS_REQUEST,
  ALL_ITEMS_SUCCESS,
  ALL_ITEMS_FAILURE
} from '../actions/all-items';
import {
  UPDATE_ITEM_REQUEST,
  UPDATE_ITEM_SUCCESS,
  UPDATE_ITEM_FAILURE
} from '../actions/update-item';
import {
  CREATE_ITEM_REQUEST,
  CREATE_ITEM_SUCCESS,
  CREATE_ITEM_FAILURE
} from '../actions/create-item';
import {
  ALL_LISTINGS_REQUEST,
  ALL_LISTINGS_SUCCESS,
  ALL_LISTINGS_FAILURE
} from '../actions/all-listings';
import {
  UPDATE_LISTING_COUNT_REQUEST,
  UPDATE_LISTING_COUNT_SUCCESS,
  UPDATE_LISTING_COUNT_FAILURE
} from '../actions/update-listing-count';
import {
  UPDATE_LISTING_DETAILS_REQUEST,
  UPDATE_LISTING_DETAILS_SUCCESS,
  UPDATE_LISTING_DETAILS_FAILURE
} from '../actions/update-listing-details';
import {
  CREATE_LISTING_REQUEST,
  CREATE_LISTING_SUCCESS,
  CREATE_LISTING_FAILURE
} from '../actions/create-listing';
import {
  REMOVE_LISTING_REQUEST,
  REMOVE_LISTING_SUCCESS,
  REMOVE_LISTING_FAILURE
} from '../actions/remove-listing';
import {
  RELIST_REQUEST,
  RELIST_SUCCESS,
  RELIST_FAILURE
} from '../actions/relist';
import { getInitialState } from '../state';

const requestState = (requestId, updatedProps, state) => ({
  ...state,
  ...updatedProps,
  pending: [...state.pending, requestId]
});

const fullPageErrorState = (requestId, error, state) => ({
  ...state,
  error: {
    ...state.error,
    fullPage: state.error.fullPage || error
  },
  pending: state.pending.filter(e => e !== requestId)
});

const completionState = (requestId, updatedProps, state) => ({
  ...state,
  ...updatedProps,
  pending: state.pending.filter(e => e !== requestId)
});

export default (state, action) => {
  switch (action.type) {
    case INITIALISE: {
      return {
        ...state,
        initialised: true
      };
    }
    case DISMISS_ERROR: {
      return {
        ...state,
        error: {
          ...state.error,
          fullPage: undefined
        }
      };
    }
    case REGISTER_REQUEST:
      return requestState('register', {}, state);
    case REGISTER_SUCESSS:
      return completionState('register', action.response, state);
    case REGISTER_FAILURE:
      return fullPageErrorState('register', action.error, state);
    case SIGNIN_REQUEST:
      return requestState('signin', {}, state);
    case SIGNIN_SUCCESS:
      return completionState('signin', getInitialState(), state);
    case SIGNIN_FAILURE:
      return fullPageErrorState('signin', action.error, state);
    case SIGNIN2_REQUEST:
      return requestState('signin2', {}, state);
    case SIGNIN2_SUCCESS:
      return completionState('signin2', action.response, state);
    case SIGNIN2_FAILURE:
      return fullPageErrorState('signin2', action.error, state);
    case DESTROY_SESSION:
      return {
        ...getInitialState(),
        error: state.error
      };
    case REGISTER2_REQUEST: {
      const updatedStateProps = {
        register: {}
      };
      return requestState('register2', updatedStateProps, state);
    }
    case REGISTER2_SUCESSS: {
      const updatedStateProps = {
        ...action.response,
        error: {
          ...state.error,
          inline: undefined
        }
      };
      return completionState('register2', updatedStateProps, state);
    }
    case REGISTER2_FAILURE: {
      const { cardError, error } = action;
      const updatedStateProps = {
        error: {
          inline: cardError,
          fullPage: state.error.fullPage || error
        }
      };
      return completionState('register2', updatedStateProps, state);
    }
    case SESSION_REQUEST:
      return requestState('session', {}, state);
    case SESSION_SUCCESS:
      return completionState('session', action.response, state);
    case SESSION_RESET:
      return {
        ...getInitialState(),
        error: state.error
      };
    case SESSION_FAILURE:
      return fullPageErrorState('session', action.error, state);
    case OUT_OF_STOCK_REQUEST:
      return requestState('outofstock', {}, state);
    case OUT_OF_STOCK_SUCCESS: {
      const { itemId } = action;
      const tagItemAsDepleted = item =>
        item.id === itemId ? { ...item, count: 0 } : item;
      const updatedStateProps = {
        store: {
          ...state.store,
          items: state.store.items.map(tagItemAsDepleted)
        }
      };
      return completionState('outofstock', updatedStateProps, state);
    }
    case OUT_OF_STOCK_FAILURE:
      return fullPageErrorState('outofstock', action.error, state);
    case SUPPORT_REQUEST:
      return requestState('support', {}, state);
    case SUPPORT_SUCCESS:
      return completionState('support', {}, state);
    case SUPPORT_FAILURE:
      return fullPageErrorState('support', action.error, state);
    case LOGOUT_REQUEST:
      return requestState('logout', {}, state);
    case LOGOUT_SUCCESS:
      return completionState('logout', getInitialState(), state);
    case LOGOUT_FAILURE:
      return fullPageErrorState('logout', action.error, state);
    case TOPUP_REQUEST:
      return requestState('topup', {}, state);
    case TOPUP_SUCCESS: {
      const { balance, transaction, cardDetails } = action.response;
      const { user } = state;
      const updatedStateProps = {
        user: {
          ...state.user,
          balance,
          cardDetails,
          transactions: transaction != null
            ? [transaction, ...user.transactions]
            : user.transactions
        }
      };
      return completionState('topup', updatedStateProps, state);
    }
    case TOPUP_FAILURE: {
      const { error, cardError } = action;
      const updatedStateProps = {
        error: {
          inline: cardError,
          fullPage: state.error.fullPage || error
        }
      };
      return completionState('topup', updatedStateProps, state);
    }
    case PURCHASE_REQUEST:
      return requestState('purchase', {}, state);
    case PURCHASE_SUCCESS: {
      const { balance, transaction } = action.response;
      const { user } = state;
      const updatedStateProps = {
        user: {
          ...user,
          balance,
          transactions: [transaction, ...user.transactions]
        }
      };
      return completionState('purchase', updatedStateProps, state);
    }
    case PURCHASE_FAILURE:
      return fullPageErrorState('purchase', action.error, state);
    case STORE_REQUEST:
      return requestState('store', {}, state);
    case STORE_SUCCESS:
      return completionState('store', action.response, state);
    case STORE_FAILURE:
      return fullPageErrorState('store', action.error, state);
    case MARKETPLACE_REQUEST:
      return requestState('marketplace', {}, state);
    case MARKETPLACE_SUCCESS:
      return completionState('marketplace', {}, state);
    case MARKETPLACE_FAILURE:
      return fullPageErrorState('marketplace', action.error, state);
    case LIKE_ITEM: {
      const { itemId } = action;
      const { likedItemIds } = state;
      const updatedItemIds = [...new Set(likedItemIds.concat(itemId))];

      return {
        ...state,
        likedItemIds: updatedItemIds
      };
    }
    case UNLIKE_ITEM: {
      const { itemId } = action;
      const { likedItemIds } = state;
      const updatedLikedItemIds = [...new Set(likedItemIds)].filter(
        el => el !== itemId
      );

      return {
        ...state,
        likedItemIds: updatedLikedItemIds
      };
    }
    case LOCAL_STORAGE_SAVE_ERROR:
      return {
        ...state,
        error: {
          fullPage: action.error
        }
      };
    case REFUND_REQUEST:
      return requestState('refund', {}, state);
    case REFUND_SUCCESS: {
      const { balance, transaction } = action.response;
      const { user } = state;
      const updatedStateProps = {
        user: {
          ...user,
          balance,
          transactions: [transaction, ...user.transactions]
        }
      };
      return completionState('refund', updatedStateProps, state);
    }
    case REFUND_FAILURE:
      return fullPageErrorState('refund', action.error, state);
    case LOGGED_OUT_IN_ANOTHER_SESSION: {
      const updatedState = {
        ...getInitialState(),
        error: {
          ...state.error,
          fullPage: state.error.fullPage
        }
      };
      return fullPageErrorState(null, action.error, updatedState);
    }
    case ALL_ITEMS_REQUEST:
      return requestState('all-items', {}, state);
    case ALL_ITEMS_SUCCESS: {
      const { response } = action;
      const updatedStateProps = {
        admin: {
          ...state.admin,
          items: response
        }
      };
      return completionState('all-items', updatedStateProps, state);
    }
    case ALL_ITEMS_FAILURE:
      return fullPageErrorState('all-items', action.error, state);
    case UPDATE_ITEM_REQUEST:
      return requestState('update-item', {}, state);
    case UPDATE_ITEM_SUCCESS: {
      const updatedItem = action.response;
      const { items } = state.admin || [];
      const updatedState = {
        admin: {
          ...state.admin,
          items: [
            ...items.filter(({ id }) => id !== updatedItem.id),
            updatedItem
          ]
        }
      };
      return completionState('update-item', updatedState, state);
    }
    case UPDATE_ITEM_FAILURE:
      return fullPageErrorState('update-item', action.error, state);
    case CREATE_ITEM_REQUEST:
      return requestState('create-item', {}, state);
    case CREATE_ITEM_SUCCESS: {
      const updatedItem = action.response;
      const { items } = state.admin || [];
      const updatedState = {
        admin: {
          ...state.admin,
          items: [...items, updatedItem]
        }
      };
      return completionState('create-item', updatedState, state);
    }
    case CREATE_ITEM_FAILURE:
      return fullPageErrorState('create-item', action.error, state);
    case ALL_LISTINGS_REQUEST:
      return requestState('all-listings', {}, state);
    case ALL_LISTINGS_SUCCESS: {
      const { response: { items, revenue } } = action;
      const updatedState = {
        admin: {
          ...state.admin,
          store: {
            items,
            revenue
          }
        }
      };
      return completionState('all-listings', updatedState, state);
    }
    case ALL_LISTINGS_FAILURE:
      return fullPageErrorState('all-listings', action.error, state);
    case UPDATE_LISTING_COUNT_REQUEST:
      return requestState('update-listing-count', {}, state);
    case UPDATE_LISTING_COUNT_SUCCESS: {
      const updatedListing = action.response;
      const { admin } = state;
      const updatedState = {
        admin: {
          ...admin,
          store: {
            ...admin.store,
            items: [
              ...admin.store.items.filter(({ id }) => id !== updatedListing.id),
              updatedListing
            ]
          }
        }
      };
      return completionState('update-listing-count', updatedState, state);
    }
    case UPDATE_LISTING_COUNT_FAILURE:
      return fullPageErrorState('update-listing-count', action.error, state);
    case UPDATE_LISTING_DETAILS_REQUEST:
      return requestState('update-listing-details', {}, state);
    case UPDATE_LISTING_DETAILS_SUCCESS: {
      const updatedListing = action.response;
      const { admin } = state;
      const updatedState = {
        admin: {
          ...admin,
          store: {
            ...admin.store,
            items: [
              ...admin.store.items.filter(({ id }) => id !== updatedListing.id),
              updatedListing
            ]
          }
        }
      };
      return completionState('update-listing-details', updatedState, state);
    }
    case UPDATE_LISTING_DETAILS_FAILURE:
      return fullPageErrorState('update-listing-details', action.error, state);
    case CREATE_LISTING_REQUEST:
      return requestState('create-listing', {}, state);
    case CREATE_LISTING_SUCCESS: {
      const { admin } = state;
      const updatedState = {
        admin: {
          ...admin,
          store: {
            ...admin.store,
            items: [...admin.store.items, action.response]
          }
        }
      };
      return completionState('create-listing', updatedState, state);
    }
    case CREATE_LISTING_FAILURE:
      return fullPageErrorState('create-listing', action.error, state);
    case REMOVE_LISTING_REQUEST:
      return requestState('remove-listing', {}, state);
    case REMOVE_LISTING_SUCCESS: {
      const { admin } = state;
      const updatedState = {
        admin: {
          ...admin,
          store: {
            ...admin.store,
            items: [
              ...admin.store.items.filter(({ id }) => id !== action.itemId)
            ]
          }
        }
      };
      return completionState('remove-listing', updatedState, state);
    }
    case REMOVE_LISTING_FAILURE:
      return fullPageErrorState('remove-listing', action.error, state);
    case RELIST_REQUEST:
      return requestState('relist', {}, state);
    case RELIST_SUCCESS: {
      const { admin } = state;
      const relistedItem = action.response;
      const updatedState = {
        admin: {
          ...admin,
          store: {
            ...admin.store,
            items: [
              ...admin.store.items.filter(({ id }) => id !== relistedItem.id),
              relistedItem
            ]
          }
        }
      };
      return completionState('relist', updatedState, state);
    }
    case RELIST_FAILURE:
      return fullPageErrorState('relist', action.error, state);
    default:
      return state;
  }
};
