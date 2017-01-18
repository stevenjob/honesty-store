import React from 'react';
import { hashHistory } from 'react-router';
import Button from '../chrome/button';
import { NotNow } from '../chrome/link';
import Page from '../chrome/page';
import success from '../topup/assets/success.svg';
import './success.css';

export default ({ params: { storeId, amount } }) =>
    <Page storeId={storeId}
        invert={true}
        nav={false}
        fullscreen={true}>
        <div className="signin-success">
            <h3>A magic link was sent to your email address</h3>
            <img src={success} alt="Success"/>
            <h2>Please follow the link in the email to continue</h2>
        </div>
    </Page>;