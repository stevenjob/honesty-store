import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { BRAND_LIGHT, DANGER } from '../chrome/colors';
import Button from '../chrome/button';
import { Back } from '../chrome/link';
import Page from '../chrome/page';
import isEmail from 'validator/lib/isEmail';
import { performSignin } from '../actions/signin';
import './index.css';

class Signin extends React.Component {

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

    handleSubmit(e) {
        e.preventDefault();
        const { params: { storeId } } = this.props;
        const { emailAddress } = this.state;
        const valid = isEmail(emailAddress);
        this.setState({ valid });
        if (valid) {
            this.props.performSignin({ storeId, emailAddress });
        }
    }

    style() {
        const { valid } = this.state;
        return valid === false ? { borderBottomColor: DANGER } : {};
    }

    render() {
        const { params: { storeId } } = this.props;
        const { valid } = this.state;
        return <Page left={<Back>Register</Back>}
            title={`Sign In`}
            storeId={storeId}
            invert={true}
            nav={false}
            fullscreen={true}>
            <form className="signin" onSubmit={(e) => this.handleSubmit(e)}>
                <h2>Want to sign in?</h2>
                {
                    valid !== false ?
                    <p>Please enter you email address below to receive a magic link email</p>
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
                <p><Button onClick={(e) => this.handleSubmit(e)}>Send Magic Link Email</Button></p>
                <p><Link to={`/${storeId}/help`} style={{ color: BRAND_LIGHT }}>Problems signing in?</Link></p>
            </form>
        </Page>;
    }
}

const mapStateToProps = (_, { params: { storeId }}) => ({
    storeId
});

const mapDispatchToProps = { performSignin };

export default connect(mapStateToProps, mapDispatchToProps)(Signin);