import React from 'react';
import { Link } from 'react-router';
import { BRAND_LIGHT } from '../chrome/colors';
import Button from '../chrome/button';
import { Back } from '../chrome/link';
import Page from '../chrome/page';
import './index.css';

export default ({ params: { storeId, amount } }) =>
    <Page left={<Back>Register</Back>}
        title={`Sign In`}
        storeId={storeId}
        invert={true}
        nav={false}
        fullscreen={true}>
        <div className="signin">
            <h3>Want to sign in?</h3>
            <p>Please enter you email address below to receive a magic link email</p>
            <p><input type="email" placeholder="honest.jo@honesty.store"/></p>
            <p><Button to={`/${storeId}/signin/success`}>Send Magic Link Email</Button></p>
            <p><Link to={`/${storeId}/help`} style={{ color: BRAND_LIGHT }}>Problems signing in?</Link></p>
        </div>
    </Page>;