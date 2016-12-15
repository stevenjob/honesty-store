export const awsCheckFailures = (response) => {
  if (!response.failures) {
    return;
  }
  if (response.failures.length === 0) {
    return;
  }

  throw new Error(
    `response contains ${response.failures.length} failure(s):\n`
    + JSON.stringify(response.failures));
};
