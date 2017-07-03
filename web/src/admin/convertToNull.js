export default obj => {
  const objectWithConvertedValues = {};
  for (const key of Object.keys(obj)) {
    objectWithConvertedValues[key] = obj[key] === '' ? null : obj[key];
  }
  return objectWithConvertedValues;
};
