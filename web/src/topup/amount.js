import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { BRAND_LIGHT } from '../chrome/colors';
import Page from '../chrome/page';
import Stepper from '../chrome/stepper';
import { Close } from '../chrome/link';
import Currency from '../format/Currency';
import './amount.css';

const Amount = ({ balance }) => {
    return (
        <Page left={<Close to={`/store`}/>}
            title="Balance"
            invert={true}
            nav={false}
            fullscreen={true}>
            <div className="topup-amount">
                <div className="topup-amount-balance">
                    <h3>Your balance is currently</h3>
                    <h1 style={{color: BRAND_LIGHT}}><Currency amount={balance} /></h1>
                </div>
                <Stepper
                    label="Would you like to top up?"
                    onIncrement={(amount) => amount}
                    incrementDisabled={() => true}
                    onDecrement={(amount) => amount}
                    decrementDisabled={() => true}
                    formatDescription={(amount) => <span>Your balance will be <Currency amount={balance + amount} /></span>}
                    formatValue={(amount) => <Currency amount={amount} />}
                    formatButton={(amount) => ({ text: 'Top Up using a Card', disabled: false })}
                    initialValue={500}
                    onClick={(amount) => { browserHistory.push(`/topup/${amount}`); }}
                />
            </div>
        </Page>
    );
};

const mapStateToProps = ({ user: { balance = 0 } }) => ({
    balance
});


export default connect(mapStateToProps)(Amount);
