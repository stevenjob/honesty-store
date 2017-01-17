import React from 'react';
import { Link } from 'react-router';
import { BRAND_LIGHT } from '../chrome/colors';
import Page from '../chrome/page';
import success from './assets/success.svg';
import './success.css';

export default ({ params: { storeId } }) =>
    <Page storeId={storeId}
        invert={true}
        nav={false}
        fullscreen={true}>
        <Link to={`/${storeId}`} className="topup-success">
            <h2>Thank you for your top up!</h2>
            <img src={success} alt="Success"/>
            <div className="topup-success-balance">
                <h3>Your balance is now</h3>
                <h1 style={{color: BRAND_LIGHT}}><small>£</small>6.45</h1>
            </div>
        </Link>
    </Page>;