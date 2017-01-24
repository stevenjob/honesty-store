import React from 'react';
import Page from '../chrome/page';
import success from '../topup/assets/success.svg';
import './success.css';

export default ({ params: { storeId, amount } }) =>
    <Page storeId={storeId}
        invert={true}
        nav={false}
        fullscreen={true}>
        <div className="home-success">
            <h3>Thanks for registering your interest</h3>
            <img src={success} alt="Success"/>
            <h2>Please follow the link in the email to confirm your subscription</h2>
        </div>
    </Page>;