import React from 'react';
import { Link } from 'react-router';
import Page from '../chrome/page';

export default ({ params: { storeId } }) =>
    <Page left={<Link to={`/${storeId}/profile`}>Close</Link>}
        title="Terms &amp; Conditions"
        storeId={storeId}
        invert={true}
        nav={false}>
        <div>
            <p>Lorem ipsum...</p>
        </div>
    </Page>;