import builtinModules from 'builtin-modules';
import json from 'rollup-plugin-json';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

const externalModules = [...builtinModules, 'aws-sdk', 'aws-xray-sdk'];

const hacksPrefix = '\0hacks:';
const hackedModules = {
  'moment': 'export default { }',
  'pkginfo': 'export default function() { }',
  'winston': 'export default { Logger: function() {} }'
};

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
    {
      name: 'hacks',
      resolveId: (name) => {
        const hackModule = Object.keys(hackedModules)
          .some(key => new RegExp('(^|:)' + key + '$').test(name));
        if (hackModule) {
          return hacksPrefix + name;
        }
      },
      load: (id) => {
        if (!new RegExp(hacksPrefix).test(id)) {
          return;
        }
        const parts = id.split(':');
        const name = parts[parts.length - 1];
        const value = hackedModules[name];
        if (!value) {
          throw new Error('Unknown module ' + name);
        }
        return value;
      }
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

