import React from 'react';
import ReactDOM from 'react-dom';
import { IndexRedirect, Router, Route, hashHistory } from 'react-router';
import { Provider } from 'react-redux';
import Root from './chrome/root';
import Intro from './intro/intro';
import AboutInfo from './info/about';
import AppInfo from './info/app';
import PrivacyInfo from './info/privacy';
import TermsInfo from './info/terms';
import StoreTitle from './store/title';
import StoreList from './store/list';
import HistoryTitle from './history/title';
import HistoryList from './history/list';
import ProfileTitle from './profile/title';
import Profile from './profile/profile';
import CloseProfile from './profile/close';
import EditProfile from './profile/edit';
import LogoutProfile from './profile/logout';
import HelpTitle from './help/title';
import Help from './help/help';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
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
    <Router history={hashHistory} onUpdate={() => scrollTo(0, 0)}>
      <Route path="/" component={Intro}/>
      <Route path="/:storeId" component={Root}>
        <IndexRedirect to="store"/>
        <Route path="store" components={{title: StoreTitle, body: StoreList}}/>
        <Route path="history" components={{title: HistoryTitle, body: HistoryList}}/>
        <Route path="profile" components={{title: ProfileTitle, body: Profile}}/>
        <Route path="profile/close" components={{title: ProfileTitle, body: CloseProfile, nav: null}}/>
        <Route path="profile/edit" components={{title: ProfileTitle, body: EditProfile, nav: null}}/>
        <Route path="profile/logout" components={{title: ProfileTitle, body: LogoutProfile, nav: null}}/>
        <Route path="info/about" components={{title: ProfileTitle, body: AboutInfo, nav: null}}/>
        <Route path="info/terms" components={{title: ProfileTitle, body: TermsInfo, nav: null}}/>
        <Route path="info/privacy" components={{title: ProfileTitle, body: PrivacyInfo, nav: null}}/>
        <Route path="info/app" components={{title: ProfileTitle, body: AppInfo, nav: null}}/>
        <Route path="help" components={{title: HelpTitle, body: Help}}/>
      </Route>
    </Router>
  </Provider>
), document.getElementById('root'));