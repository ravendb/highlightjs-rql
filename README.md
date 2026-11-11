# highlightjs-rql

[RQL](https://docs.ravendb.net/7.2/querying/rql/what-is-rql) (Raven Query Language) grammar for [highlight.js](https://highlightjs.org/).

RQL is the SQL-like query language of [RavenDB](https://ravendb.net), a document database. It is used in the RavenDB Studio, the client APIs, the documentation and community answers.

## What is highlighted

- Comments (`//` and `/* */`) and strings (double, single and backtick quotes)
- Clauses and keywords: `from`, `where`, `group by`, `order by`, `select`, `load`, `include`, `update`, `declare`, `with`, `limit`, ...
- Logical operators, type casts (`as string/long/double/alphaNumeric`) and order options (`asc`, `desc`, `nulls first/last`)
- Functions usable in `where` and `order by`, including the vector search and AI functions (`vector.search`, `embedding.*`, `ai.task`)
- Query parameters (`$name`, `$p0`), literals, numbers, and the special tokens `@metadata` and `@all_docs`
- Spatial functions (`spatial.within`, `spatial.point`, `spatial.circle`, ...)
- Time series queries, both `timeseries( from ... )` and `declare timeseries name(x) { ... }`, with their own keywords (`between`, `first`/`last N days`, `group by '1 days'`, `with interpolation(...)`, `load Tag`, `scale`) and methods (`min()`, `max()`, `average()`, `percentile(n)`, ...)
- The JavaScript blocks of `select { ... }`, `update { ... }` and `declare function name(x) { ... }`, with light JavaScript highlighting (strings, comments, numbers, common keywords, nested braces)

Matching is case insensitive, like RQL.

The keyword, function and operator lists are derived from RavenDB's own tooling: the lexer and parser of the Studio query editor (identical in v7.2 and v8.0), in [ravendb/ravendb](https://github.com/ravendb/ravendb). The grammar was also run against the 2,258 queries of the Studio's own language-service test data, without errors.

The examples in `test/markup/rql` use the Northwind sample database that ships with the RavenDB Studio.

### Known limitation

The embedded JavaScript is highlighted with a small built-in rule set, not with the full highlight.js JavaScript grammar. Template literals with `${...}` and regex literals are not parsed.

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

## Releasing (maintainers)

1. Bump `version` in `package.json`, run `npm test` and commit the updated `dist/`.
2. Create a GitHub release with the tag `v<version>` (for example `v1.0.1`).
3. The `Publish to npm` workflow tests the package and publishes it. It needs the `NPM_TOKEN` repository secret.
