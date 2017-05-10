export const baseUrl = process.env.BASE_URL;

// tslint:disable-next-line:triple-equals
if (baseUrl == undefined) {
  throw new Error('no $BASE_URL provided');
}

export const lambdaBaseUrl = process.env.LAMBDA_BASE_URL;

// tslint:disable-next-line:triple-equals
if (lambdaBaseUrl == undefined) {
  throw new Error('no $LAMBDA_BASE_URL provided');
}
