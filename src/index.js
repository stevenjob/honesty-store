import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory } from 'react-router'
import App from './app';
import BuyScreen from './buy-screen/buy-screen';
import StoreScreen from './store-screen/store-screen';
import './index.css';

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <Route path="/:storeName" component={StoreScreen}/>
      <Route path="/:storeName/buy/:productId" component={BuyScreen}/>
    </Route>
  </Router>
), document.getElementById('root'));
