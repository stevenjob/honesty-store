import builtinModules from 'builtin-modules';
import json from 'rollup-plugin-json';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

const externalModules = [...builtinModules, 'aws-sdk', 'aws-xray-sdk'];

const isExternalModule = module => {
  const basename = module.replace(/\/.*/, '');
  return externalModules.indexOf(basename) > -1;
};

const hacksPrefix = '\0hacks:';
const hackedModules = {
  'moment': 'export default { }'
};

const options = {
  entry: 'lib/src/lambda.js',
  exports: 'named',
  format: 'cjs',
  sourceMap: true,
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
    commonjs({
      include: 'node_modules/**'
    }),
    json()
  ],
  external: isExternalModule
};

export default options;
