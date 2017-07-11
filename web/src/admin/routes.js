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

const routes = (
  <Route path="admin" component={AdminItemFetch}>
    <Route path="item">
      <IndexRoute component={AdminItemsList} />
      <Route path="new" component={AdminItemDetailsNew} />
      <Route path=":itemId" component={AdminItemDetailsEdit} />
      <Route path=":itemId/success" component={AdminItemDetailsSuccess} />
    </Route>
    <Route path="listing/:code" component={AdminListingsFetch}>
      <IndexRoute component={AdminItemListings} />
      <Route path="item" component={AdminItemListingItemSelect} />
      <Route path="item/:itemId/edit" component={AdminItemListingEdit} />
      <Route path="item/:itemId/add-more" component={AdminItemListingRelist} />
      <Route path="item/:itemId" component={AdminItemListingsNew} />
    </Route>
  </Route>
);

export default () => (
  <Router history={history}>
    {routes}
  </Router>
);
