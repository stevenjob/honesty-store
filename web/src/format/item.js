export default (name) => {
  const possesiveChars =  name.substring(name.length - 1) === 's' ? `'` : `'s`;
  return `${name}${possesiveChars}`;
};
