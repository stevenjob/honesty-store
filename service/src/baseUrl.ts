export const baseUrl = process.env.BASE_URL;

if (!baseUrl) {
  throw new Error('no $BASE_URL provided');
}

export const lambdaBaseUrl = process.env.LAMBDA_BASE_URL;

if (!lambdaBaseUrl) {
  throw new Error('no $LAMBDA_BASE_URL provided');
}
