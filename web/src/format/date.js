import zeroPad from '../format/number';

export default (timestamp) => {
  const date = new Date(timestamp);
  const dayInMonth = zeroPad(date.getDate());
  const month = zeroPad(date.getMonth());
  return `${dayInMonth}/${month}/${date.getFullYear()}`;
};
