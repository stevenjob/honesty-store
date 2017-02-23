import React from 'react';
import { Link } from 'react-router';
import { Back } from '../chrome/link';
import Full from '../layout/full';

export default ({ params: { amount } }) =>
  <Full top={<Back>Card</Back>}>
    <h1>Want to add a card?</h1>
    <p>If you want to add or change your card details please chat with customer support.</p>
    <p><Link className="btn btn-primary" to={`/help`}>Chat to Customer Support</Link></p>
  </Full>;
