import { DISMISS_ERROR } from '../actions/dismissError';
import { INITIALISE } from '../actions/inititialise';
import { REGISTER_REQUEST, REGISTER_SUCESSS, REGISTER_FAILURE } from '../actions/register';
import { REGISTER2_REQUEST, REGISTER2_SUCESSS, REGISTER2_FAILURE } from '../actions/register2';
import { SESSION_REQUEST, SESSION_SUCCESS, SESSION_RESET, SESSION_FAILURE } from '../actions/session';
import { TOPUP_REQUEST, TOPUP_SUCCESS, TOPUP_FAILURE } from '../actions/topup';
import { PURCHASE_REQUEST, PURCHASE_SUCCESS, PURCHASE_FAILURE } from '../actions/purchase';
import { DESTROY_SESSION } from '../actions/destroy-session';
import { LOGOUT_REQUEST, LOGOUT_SUCCESS, LOGOUT_FAILURE } from '../actions/logout';
import { SUPPORT_REQUEST, SUPPORT_SUCCESS, SUPPORT_FAILURE } from '../actions/support';
import { SIGNIN_REQUEST, SIGNIN_SUCCESS, SIGNIN_FAILURE } from '../actions/signin';
import { SIGNIN2_REQUEST, SIGNIN2_SUCCESS, SIGNIN2_FAILURE } from '../actions/signin2';
import { STORE_REQUEST, STORE_SUCCESS, STORE_FAILURE } from '../actions/store';
import { SURVEY_REQUEST, SURVEY_SUCCESS, SURVEY_FAILURE } from '../actions/survey';
import { MARKETPLACE_REQUEST, MARKETPLACE_SUCCESS, MARKETPLACE_FAILURE } from '../actions/marketplace';
import { OUT_OF_STOCK_REQUEST, OUT_OF_STOCK_SUCCESS, OUT_OF_STOCK_FAILURE } from '../actions/out-of-stock';
import { LIKE_ITEM } from '../actions/like-item';

const util = require('util');

const getLikedItemsFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('likedItemIds'));
  } catch (e) {
    return [];
  }
};

const getInitialState = () => {
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
    refreshToken: localStorage.refreshToken,
    survey: undefined,
    likedItemIds: getLikedItemsFromStorage()
  };
};

const save = (props) => {
  try {
    for (const prop in props) {
      if (props[prop] === undefined) {
        delete localStorage[prop];
      } else {
        localStorage[prop] = props[prop];
      }
    }

    return undefined;

  } catch (e) {
    return Object.assign(new Error('local storage failure'), { code: 'LocalStorageBlocked' });
  }
};

export default (state = getInitialState(), action) => {
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
    case REGISTER_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'register']
      };
    }
    case REGISTER_SUCESSS: {
      const { refreshToken } = action.response;
      const error = save({ refreshToken });

      return {
        ...state,
        ...action.response,
        error: {
          ...state.error,
          fullPage: error || state.error.fullPage
        },
        pending: state.pending.filter(e => e !== 'register')
      };
    }
    case REGISTER_FAILURE: {
      return {
        ...state,
        error: {
          ...state.error,
          fullPage: action.error
        },
        pending: state.pending.filter(e => e !== 'register')
      };
    }
    case SIGNIN_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'signin']
      };
    }
    case SIGNIN_SUCCESS: {
      const error = save({ refreshToken: undefined });

      return {
        ...getInitialState(),
        error: {
          ...state.error,
          fullPage: error
        }
      };
    }
    case SIGNIN_FAILURE: {
      return {
        ...state,
        error: {
          ...state.error,
          fullPage: action.error
        },
        pending: state.pending.filter(e => e !== 'signin')
      };
    }
    case SIGNIN2_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'signin2']
      };
    }
    case SIGNIN2_SUCCESS: {
      const { refreshToken } = action.response;
      const error = save({ refreshToken });

      return {
        ...state,
        ...action.response,
        error: {
          ...state.error,
          fullPage: error || state.error.fullPage
        },
        pending: state.pending.filter(e => e !== 'signin2')
      };
    }
    case SIGNIN2_FAILURE: {
      return {
        ...state,
        error: {
          ...state.error,
          fullPage: action.error
        },
        pending: state.pending.filter(e => e !== 'signin2')
      };
    }
    case DESTROY_SESSION: {
      const error = save({ refreshToken: undefined });

      return {
        ...getInitialState(),
        error: {
          ...state.error,
          fullPage: error
        }
      };
    }
    case REGISTER2_REQUEST: {
      return {
        ...state,
        register: {},
        pending: [...state.pending, 'register2']
      };
    }
    case REGISTER2_SUCESSS: {
      const { user } = action.response;
      return {
        ...state,
        error: {
          ...state.error,
          inline: undefined
        },
        user: user,
        pending: state.pending.filter(e => e !== 'register2')
      };
    }
    case REGISTER2_FAILURE: {
      const { cardError, error } = action;
      return {
        ...state,
        error: {
          inline: cardError,
          fullPage: error
        },
        pending: state.pending.filter(e => e !== 'register2')
      };
    }
    case SESSION_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'session']
      };
    }
    case SESSION_SUCCESS: {
      return {
        ...state,
        ...action.response,
        pending: state.pending.filter(e => e !== 'session')
      };
    }
    case SESSION_RESET: {
      const error = save({ refreshToken: undefined });

      return {
        ...getInitialState(),
        error: {
          ...state.error,
          fullPage: action.error || error
        }
      };
    }
    case SESSION_FAILURE: {
      return {
        ...state,
        error: {
          ...state.error,
          fullPage: action.error
        },
        pending: state.pending.filter(e => e !== 'session')
      };
    }
    case OUT_OF_STOCK_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'outofstock']
      };
    }
    case OUT_OF_STOCK_SUCCESS: {
      const { itemId } = action;
      const tagItemAsDepleted = item => item.id === itemId ? { ...item, count: 0 } : item;
      return {
        ...state,
        store: {
          ...state.store,
          items: state.store.items.map(tagItemAsDepleted),
        },
        pending: state.pending.filter(e => e !== 'outofstock')
      };
    }
    case OUT_OF_STOCK_FAILURE: {
      return {
        ...state,
        pending: state.pending.filter(e => e !== 'outofstock'),
        error: {
          ...state.error,
          fullPage: action.error
        }
      };
    }
    case SUPPORT_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'support']
      };
    }
    case SUPPORT_SUCCESS: {
      return {
        ...state,
        pending: state.pending.filter(e => e !== 'support')
      };
    }
    case SUPPORT_FAILURE: {
      return {
        ...state,
        error: {
          ...state.error,
          fullPage: action.error
        },
        pending: state.pending.filter(e => e !== 'support')
      };
    }
    case LOGOUT_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'logout']
      };
    }
    case LOGOUT_SUCCESS: {
      const error = save({ refreshToken: undefined });

      return {
        ...getInitialState(),
        error: {
          ...state.error,
          fullPage: error
        }
      };
    }
    case LOGOUT_FAILURE: {
      return {
        ...state,
        error: {
          ...state.error,
          fullPage: action.error
        },
        pending: state.pending.filter(e => e !== 'logout')
      };
    }
    case TOPUP_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'topup']
      };
    }
    case TOPUP_SUCCESS: {
      const { balance, transaction, cardDetails } = action.response;
      const { user } = state;
      return {
        ...state,
        user: {
          ...state.user,
          balance,
          cardDetails,
          transactions: [transaction, ...user.transactions]
        },
        pending: state.pending.filter(e => e !== 'topup')
      };
    }
    case TOPUP_FAILURE: {
      const { error, cardError } = action;
      return {
        ...state,
        error: {
          inline: cardError,
          fullPage: error
        },
        pending: state.pending.filter(e => e !== 'topup')
      };
    }
    case PURCHASE_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'purchase']
      };
    }
    case PURCHASE_SUCCESS: {
      const { balance, transaction } = action.response;
      const { user } = state;
      return {
        ...state,
        user: {
          ...user,
          balance,
          transactions: [transaction, ...user.transactions]
        },
        pending: state.pending.filter(e => e !== 'purchase')
      };
    }
    case PURCHASE_FAILURE: {
      return {
        ...state,
        error: {
          ...state.error,
          fullPage: action.error
        },
        pending: state.pending.filter(e => e !== 'purchase')
      };
    }
    case STORE_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'store']
      };
    }
    case STORE_SUCCESS: {
      return {
        ...state,
        ...action.response,
        pending: state.pending.filter(e => e !== 'store')
      };
    }
    case STORE_FAILURE: {
      return {
        ...state,
        error: {
          ...state.error,
          fullPage: action.error
        },
        pending: state.pending.filter(e => e !== 'store')
      };
    }
    case SURVEY_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'survey']
      };
    }
    case SURVEY_SUCCESS: {
      return {
        ...state,
        survey: action.response,
        pending: state.pending.filter(e => e !== 'survey')
      };
    }
    case SURVEY_FAILURE: {
      return {
        ...state,
        error: {
          ...state.error,
          fullPage: action.error
        },
        pending: state.pending.filter(e => e !== 'survey')
      };
    }
    case MARKETPLACE_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'marketplace']
      };
    }
    case MARKETPLACE_SUCCESS: {
      return {
        ...state,
        pending: state.pending.filter(e => e !== 'marketplace')
      };
    }
    case MARKETPLACE_FAILURE: {
      return {
        ...state,
        error: {
          ...state.error,
          fullPage: action.error
        },
        pending: state.pending.filter(e => e !== 'marketplace')
      };
    }
    case LIKE_ITEM: {
      const { itemId } = action;
      const { likedItemIds } = state;
      const updatedItemIds = [...new Set(likedItemIds.concat(itemId))];
      const error = save({ likedItemIds: JSON.stringify(updatedItemIds) });

      return {
        ...state,
        likedItemIds: updatedItemIds,
        error: {
          fullPage: error
        }
      };
    }
    default:
      return state;
  }
};
