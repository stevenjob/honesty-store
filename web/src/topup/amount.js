import React from 'react';
import { connect } from 'react-redux';
import { BRAND_LIGHT, MUTED_TEXT } from '../chrome/colors';
import Button from '../chrome/button';
import Page from '../chrome/page';
import { Close } from '../chrome/link';
import currency from '../format/currency';
import './amount.css';

const Amount = ({ params: { storeId }, balance }) =>
    <Page left={<Close to={`/${storeId}/store`}/>}
        title="Balance"
        storeId={storeId}
        invert={true}
        nav={false}
        fullscreen={true}>
        <div className="topup-amount">
            <div className="topup-amount-balance">
                <h3>Your balance is currently</h3>
                <h1 style={{color: BRAND_LIGHT}}><small>£</small>{currency(balance)}</h1>
            </div>
            <div className="topup-amount-topup">
                <h2>Would you like to top up?</h2>
                <div className="topup-amount-topup-amount">
                    <Button type="disabled">-</Button>
                    <h1 style={{color: BRAND_LIGHT}}><small>£</small>5</h1>
                    <Button type="disabled">+</Button>
                </div>
                <p style={{color: MUTED_TEXT}}>
                    Your balance will be<br/>
                    £{currency(balance + 500)}
                </p>
                <p>
                    <Button to={`/${storeId}/topup/${500}`}>
                        Top Up using a Card
                    </Button>
                </p>
            </div>
        </div>
    </Page>;

const mapStateToProps = ({ user: { balance = 0 } }) => ({
    balance
});


export default connect(mapStateToProps)(Amount);