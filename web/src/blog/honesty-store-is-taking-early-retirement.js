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
          <h1 className="mt1 mb4">is taking early retirement</h1>
          <p>
            We have some sad news to share...
          </p>
          <p>
            honesty.store wasn’t just about cheap snacks for the SL offices, the board believed it could have been a viable business model in its own right. So they made a modest investment to develop it in an attempt to validate this belief.
          </p>
          <p>
            The original idea of honesty.store sending out bespoke boxes offered compelling reasons for new agents to set up stores and many opportunities for innovative uses of technology. However, as time’s gone on those reasons and opportunities have slowly been eroded as we’ve tried to pull back from fulfilment due to our lack of experience in that area.
          </p>
          <p>
            Unfortunately it’s now hard to see a viable route to market or a unique feature that competitors would struggle to replicate. Therefore the board have decided to stop investing in honesty.store as a business which means the development team will now wind down.
          </p>
          <hr className="md-col-6 mt3 mb3" />
          <h2>Is this the end of honesty.store?</h2>
          <p>
            Short answer: No.
          </p>
          <p>
            Long answer: The honesty.store app (in its current form), the marketplace and supermarket orders will continue in the Scott Logic offices whilst there’s demand but no more boxes will be dispatched.
          </p>
          <p>
            Admin will take over the full ordering process including listing items. Before moving on, the development team will make the necessary changes to allow this. Chris will continue to provide limited support and minimal maintenance. The infrastructure costs will be covered by the existing service fee.
          </p>
          <h2>What happens to my credit?</h2>
          <p>
            Nothing. The stores will remain open and your account will be unaffected. You can continue to pay for items or topup as normal.
          </p>
          <p>
            If you do still wish to close your account, as before you can raise a support request and a refund of your remaining funds will be issued to your card.
          </p>
          <h2>Something else on your mind?</h2>
          <p>
            Please feel free to share any questions, comments or ideas you have
            with us in the existing
            {' '}
            <a href="https://scottlogic.slack.com/messages/C5EDYBH5L/">
              #honesty-store Slack channel.
            </a>
          </p>
          <p>
            Alternatively if you'd rather chat in private, you can still send us a message
            through the support tab in the app or email us at
            {' '}
            <a href="mailto:support@honesty.store">support@honesty.store</a>.
          </p>
          <hr className="md-col-6 mt3 mb3" />
          <h2>Thank you!</h2>
          <p>
            We want to thank everyone who's signed up for their custom, especially those who've suggested ideas or reported bugs. Thanks also to the agents in each office (Chloe, Dan, Debbie, Georgiana, Graham & Tamara) who have done an awesome job, we know things haven't always run smoothly and very much appreciate their patience.
          </p>
          <p>
            I want to also personally thank Chloe and Graham for their amazing crayon skills and Rob and Sam for their unrelenting ability to fling code at a problem.
          </p>
          <p className="mt4">
            <i>Chris Price</i>
          </p>
        </div>
      </div>
    </div>
  </div>
);
