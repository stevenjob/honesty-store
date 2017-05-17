import { performSession, sessionReset } from './session';
import history from '../history';

const apifetch = async ({ url, getToken, body }) => {
  const headers = {};

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  if (getToken) {
    headers['Authorization'] = `Bearer: ${getToken()}`;
  }

  let response;
  try {
    response = await fetch(`${process.env.PUBLIC_URL}${url}`, {
      method: 'POST',
      body: body && JSON.stringify(body),
      headers
    });
  } catch (e) {
    throw Object.assign(new Error('failed to fetch'), { code: 'NetworkError' });
  }

  let json;
  try {
    json = await response.json();
  } catch (e) {
    throw Object.assign(e, {
      code: 'JsonParseError',
      status: response.status
    });
  }

  if (json.error) {
    throw Object.assign(new Error(json.error.message), {
      code: json.error.code,
      status: response.status
    });
  }

  return json.response;
};

export default async (params, dispatch, getState) => {
  try {
    return await apifetch(params);
  } catch (error) {
    if (error.code === 'AccessTokenExpired') {
      await performSession()(dispatch, getState);
      return await apifetch(params);
    }
    if (error.code === 'TokenError') {
      // Our refresh token hasn't expired (that's RefreshTokenExpired),
      // it's just totally mangled (for example, a non-live token used on live).

      dispatch(sessionReset(error));
      history.push(`/`);
      // fall through
    }

    throw error;
  }
};
