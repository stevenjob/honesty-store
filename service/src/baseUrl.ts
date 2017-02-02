export const baseUrl = process.env.BASE_URL;

if (!baseUrl) {
  throw new Error('no $BASE_URL provided');
}
