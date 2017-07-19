import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Full from '../../layout/full';
import { performRemoveListing } from '../../actions/remove-listing';

const ConfirmUnlist = ({
  params: { code: storeCode },
  item: { id: itemId, name, qualifier },
  performRemoveListing
}) => (
  <Full>
    <div className="absolute top-0 right-0 bottom-0 left-0 flex flex-column justify-center">
      <h2 className="mb0">Confirm unlist</h2>
      <p>
        Are you sure you want to unlist
        {' '}
        {name}
        {qualifier && ` ${qualifier}`}
        ?
      </p>
      <button
        className="btn btn-large btn-primary bg-red block mx-auto mb2"
        onClick={() => performRemoveListing({ storeCode, itemId })}
      >
        Unlist
      </button>
      <Link
        to={`/admin/listing/${storeCode}`}
        className="btn btn-large btn-primary mx-auto"
      >
        Cancel
      </Link>
    </div>
  </Full>
);

const mapStateToProps = ({ admin }, { params: { itemId } }) => {
  const items = admin.store.items || [];
  const item = items.find(({ id }) => id === itemId);
  return {
    item
  };
};

export default connect(mapStateToProps, { performRemoveListing })(
  ConfirmUnlist
);
