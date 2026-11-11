/*! `rql` grammar built and tested with Highlight.js 11.12.0 */

var hljsRql = (function () {
  'use strict';

  /*
   Language: RQL
   Description: RQL (Raven Query Language) is the SQL-like query language used by RavenDB,
                a document database. Queries written with RavenDB's high-level client APIs
                are translated into RQL under the hood, and RQL can also be written directly
                in the RavenDB Studio and via the low-level client API.
   Author: Lucas R. Tavares <https://github.com/leadsoftlucas>
   Website: https://docs.ravendb.net/7.2/querying/rql/what-is-rql
   Category: database

   Goals:

   This grammar aims to cover the language surface documented at
   https://docs.ravendb.net/7.2/querying/rql/what-is-rql, plus the newer
   vector-search / AI functions documented at
   https://docs.ravendb.net/7.2/ai-integration/vector-search/start.

   The keyword, function and operator lists are derived from RavenDB's own production
   RQL tokenizer (the RavenDB Studio's query editor) and its ANTLR4 lexer/parser
   (used by the Studio's autocomplete/syntax-check service), both in
   https://github.com/ravendb/ravendb (src/Raven.Studio, identical in v7.2 and v8.0).

   Time series queries (`timeseries(...)` and `declare timeseries ...`) have their own
   keyword set, as in the Studio lexer. The embedded JavaScript blocks opened by
   `select { ... }`, `update { ... }` and `declare function ...` get a lightweight
   JavaScript highlighting (strings, comments, numbers, common keywords, nested braces).
   */

  function rql(hljs) {
    const regex = hljs.regex;

    const CLAUSES = [
      "declare",
      "from",
      "group",
      "where",
      "order",
      "load",
      "select",
      "update",
      "match",
      "with",
      "limit",
      "filter",
      "filter_limit",
      "offset",
      "include",
      "facet",
      "timeseries",
      "function",
      "index",
      "by",
      "as",
      "to",
      "distinct"
    ];

    const LOGICAL_OPS = [ "and", "or", "not", "in", "between", "all" ];

    const WHERE_FUNCTIONS = [
      "search",
      "boost",
      "startsWith",
      "endsWith",
      "lucene",
      "exact",
      "within",
      "exists",
      "contains",
      "disjoint",
      "intersects",
      "moreLikeThis",
      "intersect",
      "fuzzy",
      "circle"
    ];

    // Functions usable in select / where: count(), sum(), id(), key(), facet(), spatial.*
    const GENERAL_FUNCTIONS = [
      "count",
      "sum",
      "id",
      "key",
      "facet",
      "spatial.point",
      "spatial.wkt",
      "spatial.circle",
      "spatial.within",
      "spatial.contains",
      "spatial.disjoint",
      "spatial.intersects"
    ];

    // Vector search / AI functions, added in recent RQL versions.
    // See https://docs.ravendb.net/7.2/ai-integration/vector-search/start
    const AI_FUNCTIONS = [
      "vector.search",
      "embedding.i1",
      "embedding.i8",
      "embedding.f32_i8",
      "embedding.f32_i1",
      "embedding.text",
      "embedding.text_i8",
      "embedding.text_i1",
      "embedding.for",
      "ai.task"
    ];

    const ORDER_BY_FUNCTIONS = [ "random", "score" ];
    const ORDER_BY_OPTIONS = [ "asc", "ascending", "desc", "descending" ];
    const TYPE_CAST = [ "string", "long", "double", "alphaNumeric" ];
    const LITERALS = [ "null", "true", "false" ];

    // --- time series (BaseRqlLexer.g4, mode TIME_SERIES) ---
    const TS_KEYWORDS = [
      "from",
      "where",
      "group",
      "by",
      "between",
      "and",
      "or",
      "not",
      "as",
      "first",
      "last",
      "with",
      "interpolation",
      "select",
      "load",
      "scale",
      "offset"
    ];
    const TS_TYPES = [
      "linear",
      "nearest",
      "next",
      "second", "seconds",
      "minute", "minutes",
      "hour", "hours",
      "day", "days",
      "month", "months",
      "quarter", "quarters",
      "year", "years"
    ];
    const TS_METHODS = [
      "min",
      "max",
      "sum",
      "average",
      "avg",
      "first",
      "last",
      "count",
      "percentile",
      "slope",
      "standardDeviation"
    ];

    const NULLS_ORDER = {
      scope: "keyword",
      match: /\bnulls\s+(?:first|last)\b/
    };

    const STRING = {
      scope: "string",
      variants: [
        { begin: '"', end: '"', contains: [ hljs.BACKSLASH_ESCAPE ] },
        { begin: "'", end: "'", contains: [ hljs.BACKSLASH_ESCAPE ] },
        // apache-drill style string, also used by RQL
        { begin: "`", end: "`" }
      ]
    };

    const SPECIAL_TOKEN = {
      scope: "symbol",
      match: /@(?:metadata|all_docs)\b/
    };

    // Query parameters: $p0, $name
    const PARAMETER = {
      scope: "variable",
      match: /\$[a-zA-Z_][a-zA-Z0-9_]*/
    };

    const FUNCTION_CALL = {
      scope: "built_in",
      match: regex.concat(
        /\b/,
        regex.either(...WHERE_FUNCTIONS, ...GENERAL_FUNCTIONS, ...AI_FUNCTIONS, ...ORDER_BY_FUNCTIONS),
        /\s*(?=\()/
      ),
      relevance: 0
    };

    const COMMENTS = [
      hljs.COMMENT("//", "$"),
      hljs.COMMENT(/\/\*/, /\*\//)
    ];

    // ---- time series blocks ----
    const TS_METHOD_CALL = {
      scope: "built_in",
      match: regex.concat(/\b/, regex.either(...TS_METHODS), /\s*(?=\()/),
      relevance: 0
    };

    // `load tag` is a single token in the Studio lexer; `tag` alone is just an identifier
    const TS_LOAD_TAG = {
      scope: "keyword",
      match: /\bload\s+tag\b/
    };

    const TS_CONTENT = [
      ...COMMENTS,
      TS_LOAD_TAG,
      STRING,
      PARAMETER,
      hljs.C_NUMBER_MODE,
      TS_METHOD_CALL
    ];

    const TS_PARENS = {
      begin: /\(/,
      end: /\)/,
      keywords: { $pattern: /[a-zA-Z_][a-zA-Z0-9_]*/, keyword: TS_KEYWORDS, type: TS_TYPES },
      contains: []
    };
    TS_PARENS.contains = TS_CONTENT.concat([ TS_PARENS ]);

    // select timeseries( from ... ) / include timeseries( ... )
    const TS_QUERY = {
      begin: [ /\btimeseries\b/, /\s*/, /\(/ ],
      beginScope: { 1: "keyword" },
      end: /\)/,
      keywords: { $pattern: /[a-zA-Z_][a-zA-Z0-9_]*/, keyword: TS_KEYWORDS, type: TS_TYPES },
      contains: TS_CONTENT.concat([ TS_PARENS ])
    };

    // declare timeseries name(arg) { from ... }
    const TS_FUNCTION = {
      begin: [ /\bdeclare\b/, /\s+/, /timeseries\b/, /\s+/, /[a-zA-Z_][a-zA-Z0-9_]*/, /\s*\([^)]*\)\s*/, /\{/ ],
      beginScope: { 1: "keyword", 3: "keyword", 5: "title.function", 7: "punctuation" },
      end: /\}/,
      endScope: "punctuation",
      keywords: { $pattern: /[a-zA-Z_][a-zA-Z0-9_]*/, keyword: TS_KEYWORDS, type: TS_TYPES },
      contains: TS_CONTENT.concat([ TS_PARENS ])
    };

    // ---- embedded JavaScript blocks ----
    const JS_KEYWORDS = {
      $pattern: /[a-zA-Z_$][a-zA-Z0-9_$]*/,
      keyword: [
        "function", "return", "var", "let", "const", "if", "else", "for", "while",
        "do", "switch", "case", "break", "continue", "new", "typeof", "in", "of",
        "try", "catch", "finally", "throw", "delete", "void", "instanceof", "this"
      ],
      literal: [ "true", "false", "null", "undefined" ],
      built_in: [ "load", "id", "Math", "Object", "Array", "String", "Number", "Date", "JSON" ]
    };

    const JS_STRING = {
      scope: "string",
      variants: [
        { begin: '"', end: '"', contains: [ hljs.BACKSLASH_ESCAPE ] },
        { begin: "'", end: "'", contains: [ hljs.BACKSLASH_ESCAPE ] },
        { begin: "`", end: "`", contains: [ hljs.BACKSLASH_ESCAPE ] }
      ]
    };

    const JS_NESTED = {
      begin: /\{/,
      end: /\}/,
      keywords: JS_KEYWORDS,
      contains: []
    };
    const JS_CONTENT = [
      ...COMMENTS,
      JS_STRING,
      hljs.C_NUMBER_MODE,
      JS_NESTED
    ];
    JS_NESTED.contains = JS_CONTENT;

    // select { ... } / update { ... }
    const JS_PROJECTION = {
      begin: [ /\b(?:select|update)\b/, /\s*/, /\{/ ],
      beginScope: { 1: "keyword", 3: "punctuation" },
      end: /\}/,
      endScope: "punctuation",
      keywords: JS_KEYWORDS,
      contains: JS_CONTENT
    };

    // declare function name(args) { ... }
    const JS_FUNCTION = {
      begin: [ /\bdeclare\b/, /\s+/, /function\b/, /\s+/, /[a-zA-Z_$][a-zA-Z0-9_$]*/, /\s*\([^)]*\)\s*/, /\{/ ],
      beginScope: { 1: "keyword", 3: "keyword", 5: "title.function", 7: "punctuation" },
      end: /\}/,
      endScope: "punctuation",
      keywords: JS_KEYWORDS,
      contains: JS_CONTENT
    };

    return {
      name: "RQL",
      aliases: [ "rql" ],
      case_insensitive: true,
      keywords: {
        $pattern: /[a-zA-Z_][a-zA-Z0-9_.]*/,
        keyword: CLAUSES.concat(LOGICAL_OPS),
        type: ORDER_BY_OPTIONS.concat(TYPE_CAST),
        literal: LITERALS
      },
      contains: [
        ...COMMENTS,
        TS_FUNCTION,
        JS_FUNCTION,
        TS_QUERY,
        JS_PROJECTION,
        NULLS_ORDER,
        FUNCTION_CALL,
        STRING,
        PARAMETER,
        hljs.C_NUMBER_MODE,
        SPECIAL_TOKEN
      ]
    };
  }

  return rql;

})();
hljs.registerLanguage("rql", hljsRql);
