import React from 'react';
import { Link } from 'react-router';
import Button from '../chrome/button';
import { BRAND_LIGHT } from '../chrome/colors';
import { NotNow } from '../chrome/link';
import Page from '../chrome/page';
import './email.css';

export default class extends React.Component {
    render() {
        const { params: { storeId, itemId } } = this.props;
        const emailAddress = 'foo@example.com';
        return <Page left={<NotNow/>}
            title={`Register`}
            storeId={storeId}
            invert={true}
            nav={false}
            fullscreen={true}>
            <div className="register-email">
                <h2>Want to sign up to {storeId}?</h2>
                <p>If you want to sign up for an account please enter your email address below</p>
                <p><input type="email" placeholder="honest.jo@honesty.store"/></p>
                <p><Button to={`/${storeId}/register/${itemId}/${emailAddress}`}>Continue to Top Up</Button></p>
                <p><Link to={`/${storeId}/signin`} style={{ color: BRAND_LIGHT }}>Already have an account?</Link></p>
            </div>
        </Page>;
    }
}
