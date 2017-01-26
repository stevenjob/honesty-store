import React from 'react';
import { NotNow } from '../chrome/link';
import Button from '../chrome/button';
import Page from '../chrome/page';

export default () =>
    <Page left={<NotNow/>}
        title="Close Account"
        invert={true}
        nav={false}>
        <div>
            <h1>Want to close your account?</h1>
            <p>If you want to close your account and receive a refund of your remaining balance please chat with customer support.</p>
            <p><Button to={`/help`}>Chat to Customer Support</Button></p>
        </div>
    </Page>;