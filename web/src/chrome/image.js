import React from 'react';

export const getAppropriateImage = (imgRef) => {
  try {
    return require(`../item/assets/${imgRef}`);
  } catch (e) {
    // If we can't load the image, then we'll just show a generic one
    return require(`../item/assets/not-found.svg`);
  }
};

export const Image = ({ className, imageName, alt }) => <div
  className={className}
  style={{ backgroundImage: `url(${getAppropriateImage(imageName) })` }}
  />;

export default Image;
