import React from 'react';
import Button from '../chrome/button';
import { Back } from '../chrome/link';
import Page from '../chrome/page';
import './card.css';

export default ({ params: { storeId, amount, itemId } }) =>
    <Page left={<Back>Register</Back>}
        title={`Top Up`}
        storeId={storeId}
        invert={true}
        nav={false}
        fullscreen={true}>
        <div className="register-card">
            <p>Please enter the details of the card you want us to collect your first £5 top up from</p>
            <p>Don't worry, your balance won't expire, we'll never perform a top up without your
            permission and you can close your account at any time</p>
            <p>
                <input name="name" type="text" placeholder="Name"/>
            </p>
            <p>
                <input name="card-number" type="number" placeholder="1111 2222 3333 4444"/>
            </p>
            <p className="register-card-tight">
                <input name="card-expiry" type="number" placeholder="Expiry"/>
                <input name="card-cvv" type="number" placeholder="CVV"/>
                <input name="postcode" type="string" placeholder="Postcode"/>
            </p>
            <p><Button to={`/${storeId}/register/success`}>Confirm £5 Top Up & Purchase</Button></p>
        </div>
    </Page>;