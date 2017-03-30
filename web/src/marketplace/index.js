import React from 'react';
import { Link } from 'react-router';
import Full from '../layout/full';
import { BackToPage } from '../chrome/link';

const Index = () =>
  <Full top={<BackToPage title="Store" path="/store"/>}>
    <h1>Marketplace</h1>
    <p>We want to make sure your store has as much variety as possible.</p>
    <p>
      Unfortunately, there are certain items that just aren't feasible for us to ship (e.g. drinks, ice cream or those
      nice flapjacks from the bakery around the corner).
    </p>
    <p>
      To get around this, we're giving you the ability to list your own items. Please note that we're not auditioning for the next Apprentice star, so remember to list items at the price you purchased them!
    </p>
    <h2 className="mt3">How It Works</h2>
    <ul className="pl2 left-align">
      <li className="pb1">You buy the items, tell us the details and we add our service fee of 10%.</li>
      <li className="pb1">We list the item in the store and allow users to record their purchases through the app.</li>
      <li className="pb1">You can see a full list of sales and access analytics through the app (coming soon!).</li>
      <li className="pb1">Every week, we send you the money from the last week's sales, minus our service fees.</li>
      <li className="pb1">Once everything has sold, you'll have received the amount you paid for the items.</li>
    </ul>
    <h2 className="mt3">What Next?</h2>
    <p>
      To list the items we need to take a few details (description, cost and location e.g. your desk, a fridge, etc.). We'll review the
      submission, add the listing and then notify you and the agent.
    </p>
    <p>
       Normally this process takes a couple of hours, but feel free to put the items out straight away and allow people to record their
       purchases later.
    </p>
    <p className="my3">
      <Link to="/marketplace/new" className="btn btn-primary btn-big">List My Items</Link>
    </p>
  </Full>;

export default Index;
