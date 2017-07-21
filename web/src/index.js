import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute } from 'react-router';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import throttle from 'lodash.throttle';
import App from './app';
import Home from './home/index';
import HomeSuccess from './home/success';
import Store from './store/index';
import TransactionHistory from './profile/transaction-history';
import Marketplace from './marketplace/index';
import MarketplaceList from './marketplace/list';
import MarketplaceListAddItemDetails from './marketplace/list/item-details';
import MarketplaceListAddItemPricing from './marketplace/list/item-pricing';
import MarketplaceListComplete from './marketplace/list/complete';
import Profile from './profile/index';
import CloseProfile from './profile/close';
import EditProfile from './profile/edit';
import LogoutProfile from './profile/logout';
import TopupExistingCard from './topup/existing-card';
import TopupNewCard from './topup/new-card';
import TopupSuccess from './topup/success';
import RegisterEmail from './register/email';
import RegisterCard from './register/card';
import RegisterSuccessWithPurchase from './register/success-with-purchase';
import RegisterSuccessWithoutPurchase
  from './register/success-without-purchase';
import RegisterPartialSuccess from './register/partial-success';
import SignInSuccess from './signin/success';
import Help from './help/index';
import HelpItem from './help/item';
import { HelpCardExpired, HelpCardNoDetails } from './help/card';
import HelpSuccess from './help/success';
import ItemDetail from './item/detail';
import ItemGuard from './item/guard';
import ItemStockReport from './item/update-stock-count';
import ItemStockReportSuccess from './item/update-stock-count-success';
import ItemPurchaseSuccess from './item/success';
import ConfirmStoreChange from './confirm-store-change/index';
import RefundGuard from './refund-request/guard';
import RefundRequest from './refund-request/index';
import RefundSuccess from './refund-request/success';
import reducer from './reducers/reducer';
import { performInitialise } from './actions/inititialise';
import './chrome/style';
import history from './history';
import { loadState, saveState } from './state';
import registerServiceWorker from './registerServiceWorker';
import BlogHonestyStoreIsGettingALotCheaper
  from './blog/honesty-store-is-getting-a-lot-cheaper';
import BlogHonestyStoreIsTakingEarlyRetirement
  from './blog/honesty-store-is-taking-early-retirement';
import Balance from './balance';
import BalanceNewCard from './balance/new-card';
import BalanceNewCardSuccess from './balance/success';
import asyncComponent from './asyncComponent';

const middlewares = [thunkMiddleware];

if (process.env.NODE_ENV === `development`) {
  const logger = createLogger();
  middlewares.push(logger);
}

const store = createStore(
  reducer,
  loadState(),
  applyMiddleware(...middlewares)
);

const throttledSaveState = throttle(() => {
  const { refreshToken, likedItemIds, error: { fullPage } } = store.getState();
  if (fullPage) {
    return;
  }
  saveState(
    {
      refreshToken,
      likedItemIds
    },
    store.dispatch
  );
}, 1000);

store.subscribe(throttledSaveState);

const redirectUnauthorised = (nextState, replace) => {
  const { refreshToken } = store.getState();

  if (!refreshToken) {
    replace('/');
  }
};

const initialiseWithParams = nextState => {
  const {
    params: { storeCode },
    location: { query: { code: emailToken }, pathname }
  } = nextState;
  store.dispatch(performInitialise({ pathname, storeCode, emailToken }));
};

ReactDOM.render(
  <Provider store={store}>
    <Router
      history={history}
      onUpdate={() => {
        const nav = document.querySelector('nav');
        window.scrollTo(0, nav ? nav.offsetTop : 0);
      }}
    >
      <Route
        path="blog/2017/05/29/honesty-store-is-getting-a-lot-cheaper"
        component={BlogHonestyStoreIsGettingALotCheaper}
      />
      <Route
        path="blog/2017/07/11/honesty-store-is-taking-early-retirement"
        component={BlogHonestyStoreIsTakingEarlyRetirement}
      />
      <Route path="/" component={App} onEnter={initialiseWithParams}>
        <IndexRoute component={Home} />
        <Route path="success" component={HomeSuccess} />
        <Route onEnter={redirectUnauthorised}>
          <Route path="register" component={RegisterEmail} />
          <Route path="register/:itemId" component={RegisterEmail} />
          <Route
            path="register//success"
            component={RegisterSuccessWithoutPurchase}
          />
          <Route
            path="register/:itemId/success"
            component={RegisterSuccessWithPurchase}
          />
          <Route
            path="register/:itemId/partial"
            component={RegisterPartialSuccess}
          />
          <Route path="register//:emailAddress" component={RegisterCard} />
          <Route
            path="register/:itemId/:emailAddress"
            component={RegisterCard}
          />
          <Route path="store" component={Store} />
          <Route
            path="store/change/:storeCode"
            component={ConfirmStoreChange}
          />
          <Route path="item/:itemId" component={ItemGuard}>
            <IndexRoute component={ItemDetail} />
            <Route path="update-stock-count" component={ItemStockReport} />
            <Route
              path="update-stock-count/success"
              component={ItemStockReportSuccess}
            />
            <Route path=":quantity/success" component={ItemPurchaseSuccess} />
          </Route>
          <Route path="balance" component={Balance} />
          <Route path="balance/new-card" component={BalanceNewCard} />
          <Route path="balance/success" component={BalanceNewCardSuccess} />
          <Route path="topup/success" component={TopupSuccess} />
          <Route path="topup/:amount" component={TopupExistingCard} />
          <Route path="topup/:amount/new" component={TopupNewCard} />
          <Route path="profile/history" component={TransactionHistory} />
          <Route path="more">
            <IndexRoute component={Marketplace} />
            <Route path="list" component={MarketplaceList} />
            <Route
              path="list/details"
              component={MarketplaceListAddItemDetails}
            />
            <Route
              path="list/pricing/:name(/:qualifier)/:quantity/:totalPaid"
              component={MarketplaceListAddItemPricing}
            />
            <Route path="list/success" component={MarketplaceListComplete} />
          </Route>
          <Route
            path="admin*"
            component={asyncComponent(() => import('./admin/routes'))}
          />
          <Route path="profile" component={Profile} />
          <Route path="profile/close" component={CloseProfile} />
          <Route path="profile/edit" component={EditProfile} />
          <Route path="profile/logout" component={LogoutProfile} />
          <Route path="refund/:transactionId" component={RefundGuard}>
            <Route path="request" component={RefundRequest} />
            <Route path="success" component={RefundSuccess} />
          </Route>
          <Route path="help">
            <IndexRoute component={Help} />
            <Route path="item/:itemId" component={HelpItem} />
            <Route path="card/expired" component={HelpCardExpired} />
            <Route path="card/no-details" component={HelpCardNoDetails} />
            <Route path="success" component={HelpSuccess} />
          </Route>
        </Route>
        <Route path="signin/success" component={SignInSuccess} />
        <Route path=":storeCode" />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
);

requestAnimationFrame(() => {
  document.documentElement.className = 'loaded';
});

registerServiceWorker();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistration().then(registration => {
    if (registration && registration.active) {
      if (registration.active.scriptURL.indexOf('sw.js') > -1) {
        registration.unregister();
      }
    }
  });
}
