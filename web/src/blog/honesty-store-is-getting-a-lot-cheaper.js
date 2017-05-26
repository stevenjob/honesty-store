import React from 'react';
import logo from '../chrome/assets/logo.svg';

export default () => (
  <div className="center navy col-12">
    <div className="bg-white py4">
      <div className="col-10 md-col-8 lg-col-6 mx-auto">

        <div>
          <h1 className="my0 sm-mx4">
            <a href="/">
              <img src={logo} alt="honesty.store" />
            </a>
          </h1>
          <h1 className="mt1 mb4">is getting (a lot!) cheaper</h1>
          <p>
            We’ve been trialling honesty.store in its current form for the last 3 months and thanks to your custom we’ve learnt (and continue to learn!) a lot about what works, what doesn’t and what can be improved. We’re always tweaking the service to try and improve things however, we’ve decided that now’s the time to try tweaking something more fundamental in a bid to save you a lot of money.
          </p>
          <p>Here are some of the new prices -</p>
          <ul className="left-align">
            <li>
              <b>32p</b>
              {' '}
              for a
              {' '}
              <b>Pepsi-Max</b>
              {' '}
              330ml can (previously unavailable)
            </li>
            <li>
              <b>32p</b> for a <b>KitKat Chunky</b> 40g bar (previously 60p)
            </li>
            <li>
              <b>16p</b> for a <b>Walkers</b> 22g bag (previously 65p for 32.5g)
            </li>
          </ul>
          <hr className="md-col-6 mt3 mb3" />
          <h2 className="my0">Sound like a good deal?</h2>
          <p className="mb0">
            <a href="/">Jump over to the app</a>
            {' '}
            to see the real prices for your store or read on for more details
          </p>
          <hr className="md-col-6 mt3 mb3" />
          <p>
            As well as changing the model, we’re also going to try our best to be a lot more open about what we’re doing and why we’re doing it. This post is hopefully an example of that but we also want to encourage you to share any questions, comments or ideas you have with us in the new #honesty-store channel we’ve set up on SL’s Slack.
          </p>
          <h2>Why are the items so cheap?</h2>
          <p>There are a few reasons -</p>
          <ul className="left-align">
            <li>
              Previously we were buying wholesale packs of items designed for individual sale, now we’re buying multipacks and splitting them to sell the individual items.
            </li>
            <li>
              Previously we’d repack the items into the boxes we sent out, now we’re asking the agent (Dan in Bristol, Graham in Edinburgh) to just put out the items in their existing packaging as they arrive.
            </li>
            <li>
              Previously we had to pay for the boxes to be delivered, now we’re piggybacking on the existing supermarket orders.
            </li>
          </ul>
          <h2>Splitting multipacks? Sounds dodgy…</h2>
          <p>
            Actually it’s completely legitimate. It’s also far cheaper per item than buying the same item individually, even at wholesale prices!
          </p>
          <p>
            <a href="https://www.quora.com/Why-do-manufacturers-label-multi-pack-items-as-%E2%80%9Cnot-for-sale-separately%E2%80%9D">
              There is no law preventing a business or individual buying a multipack, splitting its contents and then selling on the individual items
            </a>
            . The only relevant laws relate to the
            {' '}
            <a href="https://www.businesscompanion.info/en/quick-guides/food-and-drink/labelling-of-prepacked-foods">
              labelling requirements for pre-packed foods
            </a>
            {' '}
            which stipulate what information must be present on an item’s labelling. In many cases manufacturers do print the required information on both the outer and inner packaging. However, in some cases manufacturers choose (e.g. because there isn’t enough space) to only print the relevant information on the outer packaging rather than each individual item.
          </p>
          <h2>What's happening to the boxes?</h2>
          <p>
            Nothing for now. We’re going to continue to deliver the boxes as before although we’ll try to avoid duplicating items from the supermarket order. We’re not yet sure what will happen in the future but we’ll definitely let you know if anything changes.
          </p>
          <h2>Why are SL investing in honesty.store?</h2>
          <p>
            honesty.store isn’t just about cheap snacks for the SL offices, the board believe it could be a viable business model in its own right. The board are therefore making a modest investment, measuring and adjusting, to validate this belief.
          </p>
          <h2>Something else on your mind?</h2>
          <p>
            Please feel free to share any questions, comments or ideas you have with us in the new #honesty-store channel we’ve set up on SL’s Slack.
            {' '}
          </p>
          <p>
            Alternatively if you'd rather chat in private, you can talk to us through the support tab in the app, email us at
            {' '}
            <a href="mailto:support@honesty.store">support@honesty.store</a>
            {' '}
            or speak to your local agent (Dan in Bristol, Graham in Edinburgh) who can contact us on your behalf.
          </p>
          <p className="mt4">
            <i>Chris Price</i>
          </p>
        </div>
      </div>
    </div>
  </div>
);
