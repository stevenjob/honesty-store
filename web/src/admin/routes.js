import React from 'react';
import { Router, Route, IndexRoute } from 'react-router';
import history from '../history';
import AdminItemDetailsEdit from './item/edit';
import AdminItemDetailsNew from './item/new';
import AdminItemDetailsSuccess from './item/success';
import AdminItemFetch from './item/fetch';
import AdminItemsList from './item/index';
import AdminListingsFetch from './listing/fetch';
import AdminItemListings from './listing/index';
import AdminItemListingsNew from './listing/new';
import AdminItemListingEdit from './listing/edit';
import AdminItemListingItemSelect from './listing/item-select';
import AdminItemListingRelist from './listing/relist';
import AdminItemListingAvailable from './listing/available';
import AdminItemListingRemove from './listing/unlist';

const routes = (
  <Route path="admin" component={AdminItemFetch}>
    <Route path="item">
      <IndexRoute component={AdminItemsList} />
      <Route path=":itemId" component={AdminItemDetailsEdit} />
      <Route path=":itemId/success" component={AdminItemDetailsSuccess} />
    </Route>
    <Route path="listing/:code" component={AdminListingsFetch}>
      <IndexRoute component={AdminItemListings} />
      <Route path="item" component={AdminItemListingItemSelect} />
      <Route path="item/new" component={AdminItemDetailsNew} />
      <Route path="item/:itemId">
        <IndexRoute component={AdminItemListingsNew} />
        <Route path="edit" component={AdminItemListingEdit} />
        <Route path="add-more" component={AdminItemListingRelist} />
        <Route path="available" component={AdminItemListingAvailable} />
        <Route path="unlist" component={AdminItemListingRemove} />
      </Route>
    </Route>
  </Route>
);

export default () => (
  <Router history={history}>
    {routes}
  </Router>
);
