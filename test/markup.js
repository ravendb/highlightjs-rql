import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';
import 'should';
import hljs from 'highlight.js/lib/core';
import rql from '../dist/rql.es.js';

hljs.registerLanguage('rql', rql);

const here = path.dirname(fileURLToPath(import.meta.url));
const expects = globSync('markup/rql/*.expect.txt', { cwd: here, absolute: true });

describe('rql', () => {
  expects.forEach((filename) => {
    const name = path.basename(filename, '.expect.txt');
    const skipped = name.endsWith('.skip');
    const run = skipped ? it.skip : it;
    run(`should markup ${name}`, () => {
      const source = fs.readFileSync(filename.replace(/\.expect/, ''), 'utf8');
      const expected = fs.readFileSync(filename, 'utf8');
      hljs.highlight(source, { language: 'rql' }).value.trim()
        .should.equal(expected.trim());
    });
  });
});
