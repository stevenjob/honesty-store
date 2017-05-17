import { browserHistory, hashHistory } from 'react-router';

export default (window.cordova ? hashHistory : browserHistory);
