import React from 'react';
import Halo from '../chrome/halo';

const Like = ({ isLiked, onClick }) => {
  const classNames = `btn rounded ${isLiked ? 'btn-primary' : 'btn-primary-inverted'}`;
  return (
    <div className="relative">
      {isLiked && <Halo />}
      <button
        className={classNames}
        style={{ border: '1px solid #E8E8E8' }}
        onClick={onClick}
      >
        {isLiked ? 'Liked' : 'Like'}
      </button>
    </div>
  );
};

export default Like;
