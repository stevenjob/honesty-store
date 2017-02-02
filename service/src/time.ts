export default () => {
  const hrtime = process.hrtime();
  return () => {
    const diff = process.hrtime(hrtime);
    return diff[0] * 1e9 + diff[1];
  };
};
