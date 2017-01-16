import React from 'react';
import { Link } from 'react-router';

export default ({ params: { storeId } }) =>
    <div>
        <h1>Terms &amp; Conditions</h1>
        <p>Lorem ipsum...</p>
        <p><Link to={`/${storeId}/profile`}>Close</Link></p>
    </div>;