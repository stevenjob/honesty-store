export const apifetch = ({ url, token, body }) =>
  fetch(
    url,
    {
      method: 'POST',
      body: body && JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer: ${token}` } : {})
      }
    });

export const unpackJson = async (response) => {
  const json = await response.json();
  if (json.error) {
    const error = new Error(json.error.message);
    if (json.error.code) {
      throw Object.assign(error, { code: json.error.code });
    }
    throw error;
  }
  return json;
};
