import React from 'react';
import { hashHistory } from 'react-router';
import Page from './page';
import error from './assets/error.svg';
import './error.css';

export default ({ params: { storeId }, route: { returnPage } }) =>
    <Page storeId={storeId}
        invert={true}
        nav={false}
        fullscreen={true}
    >
        <div onClick={() => hashHistory.goBack()} className="chrome-error">
            <div>
                <h3>Oops! Something went wrong...</h3>
                <img src={error} alt="error"/>
                <h2>Can you try that again, please?</h2>
            </div>
        </div>
    </Page>;