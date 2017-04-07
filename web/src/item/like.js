import React from 'react';

const Like = ({ isLiked }) => {
  const classNames = `btn rounded ${isLiked ? 'btn-primary' : 'btn-primary-inverted'}`;
  return (
    <button
      className={classNames}
      style={{ border: '1px solid #E8E8E8' }}
    >
      {isLiked ? 'Liked' : 'Like'}
    </button>
  );
};

Like.propTypes = {
  isLiked: React.PropTypes.bool.isRequired
};

export default Like;
