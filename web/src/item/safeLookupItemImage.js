export default (path) => {
  try {
    return require(`../item/assets/${path}`);
  } catch (e) {
    // If we can't load the image, then we'll just show a generic one
    return require(`../item/assets/misc-bar.svg`);
  }
};
