import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory } from 'react-router'
import App from './App';
import BuyScreen from './buy-screen/BuyScreen';
import StoreScreen from './store-screen/StoreScreen';
import './index.css';

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <Route path="/:name" component={StoreScreen}/>
      <Route path="/:name/buy" component={BuyScreen}/>
    </Route>
  </Router>
), document.getElementById('root'));
