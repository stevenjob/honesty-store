import React from 'react';
import { Link } from 'react-router';
import Full from '../layout/full';
import { Back } from '../chrome/link';

const Index = () =>
  <Full top={<Back />}>
    <h1>Listing Items</h1>
    <p>
      Unfortunately, there are certain items that we just can't ship to you in a cost-effective manner e.g. drinks, ice cream, etc.. However, so we don't restrict your choice, you're welcome to list your own items in the store.
      We're encouraging variety in your store rather than attempting to find the next Apprentice star, so remember to list items at cost price!
    </p>
    <h1>How It Works</h1>
    <ul>
      <li>You buy the items, tell us the details and we add our service fee of 10%.</li>
      <li>We list the item in the store and allow users to record their purchases through the app.</li>
      <li>You can see a full list of sales and access analytics through the app (coming soon!).</li>
      <li>Every week, we send you the money from the last week's sales minus our service fees.</li>
      <li>Once everything has sold, you'll have received the amount you paid for the items.</li>
    </ul>
    <h1>What next?</h1>
    <p>
      To list the items we need to take a few details (description, cost and location e.g. your desk, a fridge, etc.). We'll review the submission, add the listing then notify you and the agent. Normally this process takes a couple of hours but feel free to put the items out straight away and allow people to record their purchases later.
    </p>
    <Link to="marketplace/add" className="btn btn-primary btn-big">List my marketplace item</Link>
  </Full>;

export default Index;
