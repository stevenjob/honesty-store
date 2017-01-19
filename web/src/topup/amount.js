import React from 'react';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';
import { BRAND_LIGHT } from '../chrome/colors';
import Page from '../chrome/page';
import Stepper from '../chrome/stepper';
import { Close } from '../chrome/link';
import currency from '../format/currency';
import './amount.css';

const Amount = ({ params: { storeId }, balance }) => {
    return (
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
                <Stepper 
                    label="Would you like to top up?"
                    onIncrement={(amount) => amount}
                    onDecrement={(amount) => amount}
                    formatDescription={(amount) => `Your balance will be £${currency(balance + amount)}`}
                    formatValue={(amount) => `£${currency(amount)}`}
                    formatButton={(amount) => ({ text: 'Top Up using a Card', disabled: false })}
                    initialValue={500}
                    onClick={(amount) => { hashHistory.push(`/${storeId}/topup/${amount}`); }}
                />
            </div>
        </Page>
    );
};

const mapStateToProps = ({ user: { balance = 0 } }) => ({
    balance
});


export default connect(mapStateToProps)(Amount);