import React from 'react';
import { Link } from 'react-router';
import Button from '../chrome/button';
import Page from '../chrome/page';

export default ({ params: { storeId } }) =>
    <Page left={<Link to={`/${storeId}/profile`}>Not Now</Link>}
        title="Log Out"
        storeId={storeId}
        invert={true}
        nav={false}>
        <div>
            <h1>Want to log out?</h1>
            <p>You can always login again using your email address.</p>
            <p><Button to={`/logout`} type="danger">Log Out</Button></p>
        </div>
    </Page>;