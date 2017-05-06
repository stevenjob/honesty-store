import * as AsyncCache from 'async-cache';

interface Options<Key, Value> {
  max?: number;
  maxAge?: number;
  load: (key: Key) => Promise<Value>;
}

export default <Key, Value>(options: Options<Key, Value>) => {
  const cache = AsyncCache({
    ...options,
    load: (key, cb) => {
      options.load(key)
        .then(result => cb(null, result))
        .catch(cb);
    }
  });

  // tslint:disable-next-line:no-reserved-keywords
  const get = (key: Key): Promise<Value> =>
    new Promise<Value>(
      (resolve, reject) =>
        cache.get(key, (error, result: Value) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        })
    );

  return {
    get
  };
};
