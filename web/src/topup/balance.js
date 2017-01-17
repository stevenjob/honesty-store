import React from 'react';
import { Link } from 'react-router';
import { BRAND_LIGHT, MUTED_TEXT } from '../chrome/colors';
import Button from '../chrome/button';
import Page from '../chrome/page';
import './balance.css';

export default ({ params: { storeId } }) =>
    <Page left={<Link style={{color: BRAND_LIGHT}} to={`/${storeId}/store`}>Close</Link>}
        title="Balance"
        storeId={storeId}
        invert={true}
        nav={false}
        fullscreen={true}>
        <div className="topup-balance">
            <div className="topup-balance-balance">
                <h3>Your balance is currently</h3>
                <h1 style={{color: BRAND_LIGHT}}><small>£</small>6.45</h1>
            </div>
            <div className="topup-balance-topup">
                <h2>Would you like to top up?</h2>
                <div className="topup-balance-topup-amount">
                    <Button>-</Button>
                    <h1 style={{color: BRAND_LIGHT}}><small>£</small>5</h1>
                    <Button>+</Button>
                </div>
                <p style={{color: MUTED_TEXT}}>Your balance will be<br/>£11.45</p>
                <p><Button to={`/${storeId}/topup/500`}>Top Up using a Card</Button></p>
            </div>
        </div>
    </Page>;