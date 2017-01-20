import {
    RECEIVE_REGISTRATION_PHASE1, RECEIVE_REGISTRATION_PHASE2,
    REQUEST_REGISTRATION_PHASE1, REQUEST_REGISTRATION_PHASE2 } from '../actions/register';
import { STRIPE_REQUEST, STRIPE_SUCCESS, STRIPE_FAILURE } from '../actions/stripe';
import { TOPUP_REQUEST, TOPUP_SUCCESS, TOPUP_FAILURE } from '../actions/topup';
import { PURCHASE_REQUEST, PURCHASE_SUCCESS, PURCHASE_FAILURE } from '../actions/purchase';

const getInitialState = () => {
  return {
    pending: [],
    user: {},
    store: {},
    stripe: {},
    accessToken: null,
    refreshToken: null
  };
};

export default (state = getInitialState(), action) => {
  switch (action.type) {
    case REQUEST_REGISTRATION_PHASE1: {
      return {
        ...state,
        pending: [...state.pending, 'register']
      };
    }
    case REQUEST_REGISTRATION_PHASE2: {
      return {
        ...state,
        pending: [...state.pending, 'register2']
      };
    }
    case  RECEIVE_REGISTRATION_PHASE1: {
      return {
        ...state,
        ...action.response,
        pending: state.pending.filter(e => e !== 'register')
      };
    }
    case RECEIVE_REGISTRATION_PHASE2: {
      const { user, store } = action.response;
      return {
        ...state,
        user: user,
        store: store,
        pending: state.pending.filter(e => e !== 'register2')
      };
    }
    case STRIPE_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'stripe']
      };
    }
    case STRIPE_SUCCESS: {
      const { token } = action;
      return {
        ...state,
        stripe: {
          token
        },
        pending: state.pending.filter(e => e !== 'stripe')
      };
    }
    case STRIPE_FAILURE: {
      const { error } = action;
      return {
        ...state,
        stripe: {
          error
        },
        pending: state.pending.filter(e => e !== 'stripe')
      };
    }
    case TOPUP_REQUEST: {
      return {
        ...state,
        pending: [...state.pending, 'topup']
      };
    }
    case TOPUP_SUCCESS: {
      const { balance, transaction } = action.response;
      const { user } = state;
      return {
        ...state,
        user: {
          ...user,
          balance,
          transactions: [transaction, ...user.transactions]
        },
        pending: state.pending.filter(e => e !== 'topup')
      };
    }
    case TOPUP_FAILURE: {
      return {
        ...state,
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
        pending: state.pending.filter(e => e !== 'purchase')
      };
    }
    default:
      return state;
  }
};
