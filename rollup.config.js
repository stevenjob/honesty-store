import builtinModules from 'builtin-modules';
import json from 'rollup-plugin-json';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

const externalModules = [...builtinModules, 'aws-sdk'];

const options = {
  entry: 'lib/src/lambda.js',
  format: 'cjs',
  dest: 'lib/bundle.js',
  plugins: [
    {
      name: 'resolve-external',
      resolveId: (name) => options.external(name) ? name : null
    },
    resolve({
      preferBuiltins: true
    }),
    commonjs(),
    json()
  ],
  external: name => externalModules.indexOf(name) > -1
};

export default options;

