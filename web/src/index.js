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
import History from './history/index';
import Marketplace from './marketplace';
import MarketplaceNew from './marketplace/new';
import MarketplaceComplete from './marketplace/complete';
import AdminItemsList from './admin/item/index';
import AdminItemDetailsEdit from './admin/item/edit';
import AdminItemDetailsNew from './admin/item/new';
import AdminItemDetailsSuccess from './admin/item/success';
import AdminFetch from './admin/fetch';
import AdminItemListings from './admin/listing/index';
import AdminItemListingsNew from './admin/listing/new';
import AdminItemListingEdit from './admin/listing/edit';
import AdminItemListingItemSelect from './admin/listing/item-select';
import Profile from './profile/index';
import CloseProfile from './profile/close';
import EditProfile from './profile/edit';
import LogoutProfile from './profile/logout';
import Survey from './survey/index';
import SurveyQuestions from './survey/questions';
import SurveyComplete from './survey/complete';
import TopupAmount from './topup/amount';
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
import ItemStockReport from './item/stockreport';
import ItemPurchaseSuccess from './item/success';
import ConfirmStoreChange from './confirm-store-change/index';
import ReceivedBoxReport from './received-box/index';
import ReceivedBoxSuccess from './received-box/success';
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
            <Route path="out-of-stock" component={ItemStockReport} />
            <Route path=":quantity/success" component={ItemPurchaseSuccess} />
          </Route>
          <Route path="survey" component={Survey} />
          <Route path="survey/questions" component={SurveyQuestions} />
          <Route path="survey/complete" component={SurveyComplete} />
          <Route path="topup" component={TopupAmount} />
          <Route path="topup/success" component={TopupSuccess} />
          <Route path="topup/:amount" component={TopupExistingCard} />
          <Route path="topup/:amount/new" component={TopupNewCard} />
          <Route path="history" component={History} />
          <Route path="more" component={Marketplace} />
          <Route path="more/new" component={MarketplaceNew} />
          <Route path="more/success" component={MarketplaceComplete} />
          <Route path="admin" component={AdminFetch}>
            <Route path="item">
              <IndexRoute component={AdminItemsList} />
              <Route path="new" component={AdminItemDetailsNew} />
              <Route path=":itemId" component={AdminItemDetailsEdit} />
              <Route
                path=":itemId/success"
                component={AdminItemDetailsSuccess}
              />
            </Route>
            <Route path="listing/:code">
              <IndexRoute component={AdminItemListings} />
              <Route path="item" component={AdminItemListingItemSelect} />
              <Route
                path="item/:itemId/edit"
                component={AdminItemListingEdit}
              />
              <Route path="item/:itemId" component={AdminItemListingsNew} />
            </Route>
          </Route>
          <Route path="profile" component={Profile} />
          <Route path="profile/close" component={CloseProfile} />
          <Route path="profile/edit" component={EditProfile} />
          <Route path="profile/logout" component={LogoutProfile} />
          <Route path="agent/received/success" component={ReceivedBoxSuccess} />
          <Route path="agent/received/:boxId" component={ReceivedBoxReport} />
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
