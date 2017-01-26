import React from 'react';
import ReactDOM from 'react-dom';
import { IndexRedirect, Router, Route, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import Root from './chrome/root';
import { Error } from './chrome/modal';
import Home from './home/index';
import HomeSuccess from './home/success';
import AboutInfo from './info/about';
import AppInfo from './info/app';
import PrivacyInfo from './info/privacy';
import TermsInfo from './info/terms';
import Store from './store/index';
import History from './history/index';
import Profile from './profile/index';
import CloseProfile from './profile/close';
import EditProfile from './profile/edit';
import LogoutProfile from './profile/logout';
import TopupAmount from './topup/amount';
import TopupExistingCard from './topup/existing-card';
import TopupNewCard from './topup/new-card';
import TopupSuccess from './topup/success';
import RegisterEmail from './register/email';
import RegisterCard from './register/card';
import RegisterSuccess from './register/success';
import RegisterPartialSuccess from './register/partial-success';
import SignInSuccess from './signin/success';
import Help from './help/index';
import HelpSuccess from './help/success';
import ItemDetail from './item/detail';
import ItemPurchaseSuccess from './item/success';
import reducer from './reducers/reducer';


const middlewares = [thunkMiddleware];

if (process.env.NODE_ENV === `development`) {
  const logger = createLogger();
  middlewares.push(logger);
}

const store = createStore(
  reducer,
  applyMiddleware(...middlewares)
);

ReactDOM.render((
  <Provider store={store}>
    <Router history={browserHistory} onUpdate={() => scrollTo(0, 0)}>
      <Route path="/" component={Home}/>
      <Route path="/success" component={HomeSuccess}/>
      <Route path="/error" component={Error}/>
      <Route path="/:storeId" component={Root}>
        <IndexRedirect to="store"/>
        <Route path="register/success" component={RegisterSuccess}/>
        <Route path="register/:itemId" component={RegisterEmail}/>
        <Route path="register/:itemId/success" component={RegisterPartialSuccess}/>
        <Route path="register/:itemId/:emailAddress" component={RegisterCard}/>
        <Route path="signin/success" component={SignInSuccess}/>
        <Route path="store" component={Store}/>
        <Route path="item/error" component={Error} />
        <Route path="item/:itemId" component={ItemDetail}/>
        <Route path="item/:itemId/success" component={ItemPurchaseSuccess}/>
        <Route path="topup" component={TopupAmount}/>
        <Route path="topup/success"component={TopupSuccess}/>
        <Route path="topup/error" component={Error}/>
        <Route path="topup/:amount"component={TopupExistingCard}/>
        <Route path="topup/:amount/new"component={TopupNewCard}/>
        <Route path="history" component={History}/>
        <Route path="profile" component={Profile}/>
        <Route path="profile/close" component={CloseProfile}/>
        <Route path="profile/edit" component={EditProfile}/>
        <Route path="profile/logout" component={LogoutProfile}/>
        <Route path="info/about" component={AboutInfo}/>
        <Route path="info/terms" component={TermsInfo}/>
        <Route path="info/privacy" component={PrivacyInfo}/>
        <Route path="info/app" component={AppInfo}/>
        <Route path="help" component={Help}/>
        <Route path="help/success" component={HelpSuccess}/>
      </Route>
    </Router>
  </Provider>
), document.getElementById('root'));
