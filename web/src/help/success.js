import React from 'react';
import { hashHistory } from 'react-router';
import Page from '../chrome/page';
import success from '../topup/assets/success.svg';
import './success.css';

export default ({ params: { storeId, amount } }) =>
    <Page storeId={storeId}
        invert={true}
        nav={false}
        fullscreen={true}>
        <div onClick={() => hashHistory.replace(`/${storeId}/history`)} className="help-success">
            <h3>Sorry your having problems!</h3>
            <img src={success} alt="Success"/>
            <h2>We've received your message and will be back in touch shortly</h2>
        </div>
    </Page>;