import React from 'react';
import { Link } from 'react-router';
import { BRAND_LIGHT } from '../chrome/colors';
import Page from '../chrome/page';

export default ({ params: { storeId } }) =>
    <Page left={<Link style={{color: BRAND_LIGHT}} to={`/${storeId}/profile`}>Close</Link>}
        title="About"
        subtitle="honesty.store"
        storeId={storeId}
        invert={true}
        nav={false}>
        <div>
            <p>Lorem ipsum...</p>
        </div>
    </Page>;