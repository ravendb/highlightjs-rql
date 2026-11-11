# highlightjs-rql

[RQL](https://docs.ravendb.net/7.2/querying/rql/what-is-rql) (Raven Query Language) grammar for [highlight.js](https://highlightjs.org/).

RQL is the SQL-like query language of [RavenDB](https://ravendb.net), a document database. It is used in the RavenDB Studio, the client APIs, the documentation and community answers.

## What is highlighted

- Comments (`//` and `/* */`) and strings (double, single and backtick quotes)
- Clauses and keywords: `from`, `where`, `group by`, `order by`, `select`, `load`, `include`, `update`, `declare`, `with`, `limit`, ...
- Logical operators, type casts (`as string/long/double/alphaNumeric`) and order options (`asc`, `desc`, `nulls first/last`)
- Functions usable in `where` and `order by`, including the vector search and AI functions (`vector.search`, `embedding.*`, `ai.task`)
- Literals, numbers, and the special tokens `@metadata` and `@all_docs`

Matching is case insensitive, like RQL.

The keyword, function and operator lists are derived from RavenDB's own tooling: the tokenizer of the Studio query editor and the ANTLR4 grammar of its autocomplete service, both in [ravendb/ravendb](https://github.com/ravendb/ravendb).

### Known limitation

`select { ... }` and `update { ... }` can embed JavaScript patch scripts. They are highlighted as plain RQL, without a JavaScript sub-mode.

## Usage

### Static website

Load the module after highlight.js. It registers itself.

```html
<script src="/path/to/highlight.min.js"></script>
<script src="/path/to/rql.js"></script>
<script>
  hljs.highlightAll();
</script>
```

### From the unpkg CDN

```html
<script src="https://unpkg.com/highlightjs-rql/dist/rql.js"></script>
```

### Node or a bundler

```bash
npm install highlight.js highlightjs-rql
```

ESM:

```javascript
import hljs from 'highlight.js/lib/core';
import rql from 'highlightjs-rql';

hljs.registerLanguage('rql', rql);
hljs.highlightAll();
```

CommonJS:

```javascript
const hljs = require('highlight.js/lib/core');
const rql = require('highlightjs-rql');

hljs.registerLanguage('rql', rql);
```

Then use `<pre><code class="language-rql">...</code></pre>`.

## Develop

```bash
npm install
npm test        # builds and runs the markup tests in test/markup/rql
npm run build   # writes dist/rql.es.js, dist/rql.cjs, dist/rql.js
```

Commit the generated `dist/` files.

## License

MIT. See [LICENSE](LICENSE).
