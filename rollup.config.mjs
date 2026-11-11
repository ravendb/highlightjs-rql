import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const hljsVersion = require('highlight.js/package.json').version;
const banner = `/*! \`rql\` grammar built and tested with Highlight.js ${hljsVersion} */\n`;

export default {
  input: 'src/languages/rql.js',
  output: [
    {
      file: 'dist/rql.es.js',
      format: 'es',
      banner
    },
    {
      file: 'dist/rql.cjs',
      format: 'cjs',
      exports: 'default',
      banner
    },
    {
      file: 'dist/rql.js',
      format: 'iife',
      name: 'hljsRql',
      banner,
      footer: 'hljs.registerLanguage("rql", hljsRql);'
    }
  ]
};
