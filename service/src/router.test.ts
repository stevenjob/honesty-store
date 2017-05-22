jest.mock('./log');

import { expect } from 'chai';
import { createServiceKey } from './key';
import { lambdaRouter, LambdaRouter } from './router';
import { signServiceSecret } from './serviceSecret';

describe('Lambda Router', () => {

  const key = createServiceKey({ service: 'service' });
  // tslint:disable-next-line no-shadowed-variable
  const endpoint = jest.fn((key, params, body) => Promise.resolve({ key, params, body }));

  let router: LambdaRouter;
  let invoke: (method, path, body) => Promise<any>;

  beforeEach(() => {
    router = lambdaRouter('service', 1);
    invoke = (method, path, body) =>
      new Promise<any>((resolve) => {
        router(
          {
            serviceSecret: signServiceSecret(),
            key,
            method,
            path,
            body
          },
          {
            succeed: resolve
          }
        );
      });
  });

  it('should throw if no routes defined', async () => {
    const result = await invoke('get', '/service/v1/foo', null);
    expect(result.error.message).to.match(/unhandled/i);
  });

  it('should handle an unparameterised get request', async () => {
    router.get('/foo', endpoint);
    const result = await invoke('get', '/service/v1/foo', null);
    expect(result.response).to.deep.equal({ key, params: {}, body: null });
  });

  it('should handle a parameterised get request', async () => {
    router.get('/foo/:bar', endpoint);
    const result = await invoke('get', '/service/v1/foo/bar', null);
    expect(result.response).to.deep.equal({ key, params: { bar: 'bar' }, body: null });
  });
});
