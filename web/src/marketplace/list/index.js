import React from 'react';
import { Link } from 'react-router';
import { Back } from '../../chrome/link';
import MiscSelection from '../../item/misc-selection';
import Full from '../../layout/full';

export default () => (
  <Full left={<Back />}>
    <div className="col-4 mx-auto">
      <MiscSelection />
    </div>
    <h2>honesty.store <span className="aqua">&</span> more!</h2>
    <p className="bold">Fancy adding your own items to the store?</p>
    <p>
      Just fill in the details and choose a price. We recommend adding a little
      extra to each item to cover shrinkage.
    </p>
    <p>
      At the end of each month we'll send you the money from the last month's
      sales, minus our service fees. Don't worry, you won't pay any service fees
      when you purchase your own items.
    </p>
    <p className="my3">
      <Link to="/more/list/details" className="btn btn-primary btn-big">
        Add an item
      </Link>
    </p>
  </Full>
);
