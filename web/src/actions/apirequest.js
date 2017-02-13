export const apifetch = async ({ url, token, body }) => {
  const headers = {};

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer: ${token}`;
  }

  const response = await fetch(
    url,
    {
      method: 'POST',
      body: body && JSON.stringify(body),
      headers
    });

  if (response.status !== 200) {
    const error = new Error(`POST returned ${response.status}`);

    error.code = 'NetworkError';
    error.status = response.status;

    throw error;
  }

  const json = await response.json();
  if (json.error) {
    const error = new Error(json.error.message);
    if (json.error.code) {
      throw Object.assign(error, { code: json.error.code });
    }
    throw error;
  }
  return json.response;
};
