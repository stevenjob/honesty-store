import React from 'react';
import { Link, hashHistory } from 'react-router';
import Button from '../chrome/button';
import { BRAND_LIGHT, DANGER } from '../chrome/colors';
import { NotNow } from '../chrome/link';
import Page from '../chrome/page';
import isEmail from 'validator/lib/isEmail';
import './email.css';

export default class extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            emailAddress: ''
        };
    }

    handleChange(event) {
        const emailAddress = event.target.value;
        this.setState({ emailAddress });
    }

    handleSubmit() {
        const { params: { storeId, itemId } } = this.props;
        const { emailAddress } = this.state;
        const valid = isEmail(emailAddress);
        this.setState({ valid });
        if (valid) {
            hashHistory.push(`/${storeId}/register/${itemId}/${emailAddress}`);
        }
    }

    style() {
        const { valid } = this.state;
        return valid === false ? { borderBottomColor: DANGER } : {};
    }

    render() {
        const { params: { storeId } } = this.props;
        const { valid } = this.state;
        return <Page left={<NotNow/>}
            title={`Register`}
            storeId={storeId}
            invert={true}
            nav={false}
            fullscreen={true}>
            <div className="register-email">
                <h2>Want to sign up to {storeId}?</h2>
                {
                    valid !== false ?
                    <p>If you want to sign up for an account please enter your email address below</p>
                    :
                    <p style={{ color: DANGER }}>Please enter a valid email address</p>
                }
                <p>
                    <input type="email"
                        name="emailAddress"
                        placeholder="honest.jo@honesty.store"
                        onChange={(e) => this.handleChange(e)}
                        style={this.style()}/>
                </p>
                <p><Button onClick={() => this.handleSubmit()}>Continue to Top Up</Button></p>
                <p><Link to={`/${storeId}/signin`} style={{ color: BRAND_LIGHT }}>Already have an account?</Link></p>
            </div>
        </Page>;
    }
}
