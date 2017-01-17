import React from 'react';
import { Link } from 'react-router';
import { BRAND_LIGHT } from '../chrome/colors';
import Button from '../chrome/button';
import Page from '../chrome/page';
import error from './assets/error.svg';
import './error.css';

export default ({ params: { storeId } }) =>
    <Page storeId={storeId}
        invert={true}
        nav={false}
        fullscreen={true}>
        <Link to={`/${storeId}/topup/balance`} className="topup-error">
            <div>
                <h3>Opps! Something went wrong...</h3>
                <img src={error} alt="error"/>
                <h2>Can you try that again, please?</h2>
            </div>
        </Link>
    </Page>;