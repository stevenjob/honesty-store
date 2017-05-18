import builtinModules from 'builtin-modules';
import ignore from 'rollup-plugin-ignore';
import json from 'rollup-plugin-json';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

const externalModules = [...builtinModules, 'aws-sdk'];

const options = {
  entry: 'lib/src/lambda.js',
  exports: 'named',
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
    ignore(['moment']),
    json()
  ],
  external: name => externalModules.indexOf(name) > -1
};

export default options;

