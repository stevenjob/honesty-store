import React from 'react';
import { browserHistory } from 'react-router';
import { BRAND_LIGHT } from '../chrome/colors';
import Page from '../chrome/page';
import success from '../topup/assets/success.svg';
import currency from '../format/currency';
import './partial-success.css';

export default ({ params: { storeId, itemId }, balance = 1234 }) =>
    <Page storeId={storeId}
        invert={true}
        nav={false}
        fullscreen={true}>
        <div className="register-partial-success" onClick={() => browserHistory.replace(`/${storeId}/item/${itemId}`)}>
            <h2>Thank you for your signing up to {storeId}!</h2>
            <h3>Your topup succeeded but we had trouble recording your purchase, please try again</h3>
            <img src={success} alt="Success"/>
            <div className="register-partial-success-balance">
                <h3>Your balance is now</h3>
                <h1 style={{color: BRAND_LIGHT}}><small>£</small>{currency(balance)}</h1>
            </div>
        </div>
    </Page>;