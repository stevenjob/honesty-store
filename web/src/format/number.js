export default (num) => {
  const prefix = num < 10 ? '0' : '';
  return `${prefix}${num}`;
};
