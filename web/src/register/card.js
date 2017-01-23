import React from 'react';
import { connect } from 'react-redux';
import Button from '../chrome/button';
import { DANGER } from '../chrome/colors';
import { Back } from '../chrome/link';
import Page from '../chrome/page';
import { performRegister2 } from '../actions/register2';
import './card.css';

const TOPUP_AMOUNT = 500;

class Card extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    handleExpiryChange(event) {
        let { value: exp } = event.target;
        exp = exp.replace(/[^0-9]/, '');
        const exp_month = exp.substr(0, 2);
        const exp_year = exp.substr(2, 2);
        this.setState({
            exp: `${exp_month}${exp_year}`,
            exp_month,
            exp_year
        });
    }

    handleSubmit() {
        const { storeId, itemId, emailAddress, performRegister2 } = this.props;
        const { name, number, cvc, exp_month, exp_year, address_zip } = this.state;
        const cardDetails = { name, number, cvc, exp_month, exp_year, address_zip };
        performRegister2({ storeId, itemID: itemId, topUpAmount: TOPUP_AMOUNT, emailAddress, cardDetails });
    }

    style(name, error) {
        return (error != null && error.param === name) ? { borderBottomColor: DANGER } : {};
    }

    render() {
        const  { storeId, error } = this.props;
        const  { exp = '' } = this.state;
        return <Page left={<Back>Register</Back>}
            title={`Top Up`}
            storeId={storeId}
            invert={true}
            nav={false}
            fullscreen={true}>
            <div className="register-card">
                {
                    error ?
                    <div style={{ color: DANGER }}>
                        <p>There was a problem collecting payment from your card, please check the details</p>
                        <p>{error.message}</p>
                    </div>
                    :
                    <div>
                        <p>Please enter the details of the card you want us to collect your first £5 top up from</p>
                        <p>Don't worry, your balance won't expire, we'll never perform a top up without your
                        permission and you can close your account at any time</p>
                    </div>
                }
                <p>
                    <input name="name"
                        type="text"
                        placeholder="Name"
                        style={this.style('name', error)}
                        onChange={(e) => this.handleChange(e)}/>
                </p>
                <p>
                    <input name="number"
                        type="number"
                        placeholder="1111 2222 3333 4444"
                        style={this.style('number', error)}
                        onChange={(e) => this.handleChange(e)}/>
                </p>
                <p className="register-card-tight">
                    <input name="exp"
                        value={exp}
                        type="number"
                        placeholder="MMYY"
                        style={this.style('exp', error)}
                        onChange={(e) => this.handleExpiryChange(e)}/>
                    <input name="cvc"
                        type="number"
                        placeholder="CVC"
                        style={this.style('cvc', error)}
                        onChange={(e) => this.handleChange(e)}/>
                    <input name="address_zip"
                        type="string"
                        placeholder="Postcode"
                        style={this.style('address_zip', error)}
                        onChange={(e) => this.handleChange(e)}/>
                </p>
                <p><Button onClick={() => this.handleSubmit()}>Confirm £5 Top Up & Purchase</Button></p>
            </div>
        </Page>;
    }
}

const mapStateToProps = ({ register: { error } }, { params: { storeId, itemId, emailAddress }}) => ({
    storeId,
    itemId,
    emailAddress,
    error
});

const mapDispatchToProps = { performRegister2 };


export default connect(mapStateToProps, mapDispatchToProps)(Card);