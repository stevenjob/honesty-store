import React from 'react';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';
import { BRAND_LIGHT } from '../chrome/colors';
import Page from '../chrome/page';
import currency from '../format/currency';
import success from './assets/success.svg';
import './success.css';

export const Success = ({ params: { storeId }, balance }) =>
    <Page storeId={storeId}
        invert={true}
        nav={false}
        fullscreen={true}>
        <div onClick={() => hashHistory.replace(`/${storeId}`)} className="topup-success">
            <h2>Thank you for your top up!</h2>
            <img src={success} alt="Success"/>
            <div className="topup-success-balance">
                <h3>Your balance is now</h3>
                <h1 style={{color: BRAND_LIGHT}}><small>£</small>{currency(balance)}</h1>
            </div>
        </div>
    </Page>;


const mapStateToProps = ({ user: { balance = 0 } }) => ({
    balance
});


export default connect(mapStateToProps)(Success);