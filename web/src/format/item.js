export default (name) => {
  const lastChar = name.substring(name.length - 1);
  const possesiveChars = lastChar === 's' ? `'` : `'s`;
  return `${name}${possesiveChars}`;
};
