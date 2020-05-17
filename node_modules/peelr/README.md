# Peelr

[![CircleCI](https://circleci.com/gh/njoyard/peelr.svg?style=svg)](https://circleci.com/gh/njoyard/peelr)
[![Coverage Status](https://coveralls.io/repos/github/njoyard/peelr/badge.svg?branch=master)](https://coveralls.io/github/njoyard/peelr?branch=master)
[![NPM](https://img.shields.io/npm/v/peelr.svg)](https://www.npmjs.com/package/peelr)

Peelr is a versatile web data extraction (or scraping) library for NodeJS.

```js
const Peelr = require('peelr');

await Peelr.hash(
  'article.fhitem-story',
  {
    title: Peelr.text('.story-title > a'),
    link: Peelr.attr('.story-title > a', 'href'),
    comments: Peelr.text('.comment-bubble a', { transform: n => Number(n) }),
    time: Peelr.attr('.story-byline time', 'datetime'),
    source: Peelr.attr('.story-sourcelnk', 'href'),
    text: Peelr.html('.body .p', { transform: t => t.trim() }),
    related: Peelr.link(
      '.story-title > a',
      Peelr.attr('#newa2footerv2 .c h3 a', 'href', { multiple: true })
    )
  },
  { multiple: true }
).extract('https://slashdot.org');
```

It uses [request][rqst] to make http requests and [cheerio][cheerio] to extract
things from HTML.

## Installation

```sh
yarn add Peelr
```

## Introduction

This documentation is written bottom-up, presenting simpler concepts and
features first, later building on them to reach more complex goals.  In a
nutshell it describes the following tasks, in order:

* Extracting simple values from HTML snippets
* Building more complex values using simple extractors
* Combining data from multiple pages

## Peelr extractors

The root concept in Peelr is an extractor.  An extractor is defined using a
target CSS selector and a few parameters, and they all share the same syntax:

```js
let extractor = Peelr.something(
  '.my-target', extractorSpecificParameters[, options]
);
```

They all accept a selector as their first argument, and an optional common
options object as their last argument, which may contain the following values:
* `multiple`: a boolean to indicate whether to extract a list of values, one for
  each matching target element, or a single value only, from the first matching
  element.  Defaults to `false`.
* `offset` and `limit`: used when `multiple` is `true` to limit the list of
  results returned.  Default to `0` and `Infinity`.
* `transform`: a function to apply to extracted values before returning them.
  That function can be `async`.  When `multiple` is `true`, it will be called
  once for each value.
* `nextPage`: used when `multiple` is `true` to
  [extract paginated data](#extracting-paginated-data), see below.
* `onRequest`: specify an event handler when requests are made, see
  [Logging requests](#logging-requests) below.

Once defined, an extractor can be applied to HTML snippets or webpage URLs:

```js
let result1 = await extractor.extract('<html>...</html>');
let result2 = await extractor.extract('https://example.com');
```

Instead of a URL, you may also pass a full options object for [request][rqst].
This is useful if you need to pass specific headers, use an other method than
GET, or for example if the target website requires signing in:

```js
const request = require('request-promise-native');
const cookieJar = request.jar()

await request.post({
  uri: 'https://example.com/login',
  jar: cookieJar,
  form: { login: 'john', password: 'hunter3' }
});

let result = await extractor.extract({
  uri: 'https://example.com/data',
  jar: cookieJar
});
```

Extractors that cannot find their target return `undefined`, or an empty array
when called with the `multiple` option.

## Simple extractors

Simple extractors extract values from target elements.

* `Peelr.attr(selector, name)` extracts attribute values
* `Peelr.data(selector, name)` extracts data-attribute values
* `Peelr.hasClass(selector, className)` extracts booleans from class presence
* `Peelr.html(selector)` extracts inner HTML
* `Peelr.is(selector, selector)` extracts booleans from matching selectors
* `Peelr.text(selector)` extracts text content
* `Peelr.val(selector)` extracts `<input>` values

A few quick examples:

```js
await Peelr.attr('p', 'id')
  .extract('<div><p id="foo"></p><p id="bar"></p></div>');
// "foo"

await Peelr.is('p', '.visible', { multiple: true })
  .extract(`
    <p class="visible"></p>
    <p class="invisible"></p>
    <p class="visible"></p>
  `);
// [true, false, true]

await Peelr.html('div', { transform: t => t.toUpperCase() })
  .extract('<div><p id="foo"></p></div>');
// "<P ID="FOO"></P>"
```

For more specific needs you can use a custom extractor.  Pass a custom
extraction function, which will receive a [cheerio][cheerio] matched set with
only 1 element.  When using `{ multiple: true }`, the extraction function will
be called once for each matched element.  This function can be `async`.

```js
await Peelr.custom('form', ($target) => $target.serialize())
  .extract(`
    <form>
      <input name="foo" value="foos" />
      <input name="bar" value="bars" />
    </form>
  `);
// "foo=foos&bar=bars"
```

## Complex extractors

Complex extractors combine simple extractors to build complex data structures.

### List extractor

List extractors can be used to build arrays containing the results of many other
extractors.

A quick example:

```js
await Peelr.list(
  '.item',
  [Peelr.text('.description'), Peelr.text('.price')],  
).extract(`
  <div class="item">
    <span class="description">Item 1</span>
    <span class="price">12.00</span>
  </div>
`);
// ["Item 1", "12.00"]
```

You can still use the `multiple` option, of course:

```js
await Peelr.list(
  '.item',
  [Peelr.text('.description'), Peelr.text('.price')],
  { multiple: true }
).extract(`
  <div class="item">
    <span class="description">Item 1</span>
    <span class="price">12.00</span>
  </div>
  <div class="item">
    <span class="description">Item 2</span>
    <span class="price">36.50</span>
  </div>
`);
// [["Item 1", "12.00"], ["Item 2", "36.50"]]
```

Selectors used in the list parameter will only target children of the root
element.  However, you can use the `::root` selector to target the root
element itself:

```js
await Peelr.list(
  '.article',
  [Peelr.attr('::root', 'href'), Peelr.text('.title')],
  { multiple: true }
).extract(`
  <a class="article" href="/article/1">
    <span class="title">You will not believe this</span>
  </a>
  <a class="article" href="/article/2">
    <span class="title">Wow, this is crazy</span>
  </a>
`);
// [["/article/1", "You will not believe this"],
//  ["/article/2", "Wow, this is crazy"]]
```

Using the `transform` option with a list extractor allows building arbitrary
structures with each list of results:

```js
await Peelr.list(
  '.article',
  [Peelr.attr('::root', 'href'), Peelr.text('.title')],
  {
    multiple: true,
    transform: ([link, title]) => `[${title}](${link})`
  }
).extract(`
  <a class="article" href="/article/1">
    <span class="title">You will not believe this</span>
  </a>
  <a class="article" href="/article/2">
    <span class="title">Wow, this is crazy</span>
  </a>
`);
// ["[You will not believe this](/article/1)",
//  "[Wow, this is crazy](/article/2)"]
```

### Hash extractor

Hash extractors can be used to build POJOs by combining the results from other
extractors.  They are implemented as list extractors with a predefined
`transform` option (but you can add your own on top of it, of course).

A quick example:

```js
await Peelr.hash(
  '.item',
  {
    desc: Peelr.text('.description'),
    price: Peelr.text('.price', { transform: p => Number(p) })
  },
  { multiple: true }
).extract(`
  <section class="items">
    <div class="item">
      <span class="description">Item 1</span>
      <span class="price">12.00</span>
    </div>
    <div class="item">
      <span class="description">Item 2</span>
      <span class="price">36.50</span>
    </div>
  </section>
`);
// [{ desc: "Item 1", price: 12 }, { desc: "Item 2", price: 36.5 }]
```

The hash parameter is not limited to a flat list of key/value pairs, it can also
have a deeply nested structure including extractors at any level, as well as
non-extractor values that will just be copied to the result:

```js
await Peelr.hash(
  '.item',
  {
    type: 'item',
    desc: Peelr.text('.description'),
    price: {
      amount: Peelr.text('.price', { transform: p => Number(p) }),
      currency: Peelr.text('.currency')
    }
  }
).extract(`
  <div class="item">
    <span class="description">Item 1</span>
    <span class="price">12.00</span>
    <span class="currency">EUR</span>
  </div>
`);
// { type: "item", desc: "Item 1", price: { amount: 12, currency: "EUR" } }
```

You can still use the `::root` selector to target the root element:

```js
await Peelr.hash(
  '.article',
  {
    link: Peelr.attr('::root', 'href'),
    title: Peelr.text('.title')
  },
  { multiple: true }
).extract(`
  <a class="article" href="/article/1">
    <span class="title">You will not believe this</span>
  </a>
  <a class="article" href="/article/2">
    <span class="title">Wow, this is crazy</span>
  </a>
`);
// [{ link: '/article/1', title: "You will not believe this" },
//  { link: '/article/2', title: "Wow, this is crazy" }]
```

> **Caveat:** do not include arrays in the hash, or objects that are neither
> extractors nor POJOs, as this will mess up the hash parsing stage.  If you
> need those, use a transform function to add them after extraction.

## Extracting data from multiple webpages

### Following links

You could use a `Peelr.attr` extractor to get the value of an `href` attribute
with an async `transform` function to get more data from the link, but there is
an easier way.

Link extractors allows following links and extracting more data from them:

```js
await Peelr.link('a', Peelr.text('h1'))
  .extract(`<a href="/path/to/page">link</a>`);
// "H1 content from linked page"
```

By default, link extractors use the `href` attribute on the target, but you
can pass an other attribute as an option:

```js
await Peelr.link('link', Peelr.text('h1'), { attr: 'src' })
  .extract(`<link rel="related" src="/path/to/page" />`);
```

If you need to alter the URL or build yourself, you can pass a (possibly async)
`buildRequest` function as an option, that should return a URL or a parameters
object for [requests][rqst].

```js
await Peelr.link('.item', Peelr.text('h1'), {
  attr: 'id',
  buildRequest: (id) => `https://example.com/item/${id}`
}).extract(`<div class="item" id="2"/>`);
```

### Submitting forms

Similarly, `Peelr.form` can be used to submit a form and extract data from the
target page:

```js
await Peelr.link('form.login', Peelr.text('h1'), {
  fields: {
    '[name="user"]': "john",
    '[name="password"]': "hunter3"
    '[name="rememberme"]': true
  }
}).extract("https://example.com/login");
// "Welcome, john"
```

There is no input type detection or validation when submitting forms.  Passing
a boolean value will set or unset the `checked` attribute on the corresponding
field, and passing any other value type will set the value.  And of course, if
the HTML markup specifies any javascript submit handler, it will *not* be run.

### Extracting paginated data

When using the `multiple` option on any extractor, you can use the `nextPage`
option to specify a selector that will be used to get the URL for the next page.

```js
await Peelr.text('.item', {
  multiple: true,
  nextPage: 'a.next'
}).extract(`
  <section>
    <div class="item">item 1</div>
    <div class="item">item 2</div>
    <div class="item">item 3</div>
  </section>
  <nav>
    <a class="next" href="/items?page=2">next page</a>
  </nav>
`);
// ["item 1", "item 2", "item 3", "item 4", "item 5"...]
```

For more complex cases, you can also use an extractor as `nextPage`:

```js
await Peelr.text('.item', {
  multiple: true,
  nextPage: Peelr.attr('link[rel=next]', 'src')
}).extract(/* ... */);
```

### Specific considerations when extracting from multiple webpages

When you make a `.extract()` call, Peelr instanciates a context object to help
make HTTP requests.  This context object is mainly useful when following links
with `Peelr.link` or extracting paginated data with the `nextPage` option, as
it will keep track of a few things across requests made from the same
`.extract()` call.

* Headers: some HTTP headers can be kept across requests
* Cookies: the same cookie jar is used for all requests
* Auth: the same authentication parameters are used for all requests
* Cache: the context ensures identical GET requests are made only once
* Base URL: used to resolve relative URLs

#### Logging requests

Peelr allows setting a callback to be informed when a request has been made or
when it was avoided thanks to the cache.  You can pass that callback as a
`onRequest` option to any extractor.  The callback will receive parameters
passed to [request][rqst] and a boolean indicating whether that request went
through (`false`) or was already in the cache (`true`).

```js
await Peelr.text('.item', {
  onRequest: ({ method, url }, cacheHit) => {
    if (cacheHit) {
      console.log(`${method || 'GET'} ${url} hit cache`);
    } else {
      console.log(`${method || 'GET'} ${url} hit network`);
    }
  }
}).extract(/* ... */);
```

The callback is automatically passed on to derived contexts when following
links, submitting forms, or using pagination.

#### Passing headers and other request options

Wherever Peelr expects a URL, it also accepts an object with parameters for
[request][rqst].  This includes the `.extract()` method, the `buildRequest`
option return value for `Peelr.link` and the `nextPage` option return value.  So
let's say we have a URL that only returns HTML when called with a `text/html`
accept header and returns JSON otherwise, you could do:

```js
await Peelr.text('h1').extract({
  uri: 'https://example.com/jsonbydefault',
  headers: {
    'Accept': 'text/html'
  }
});

await Peelr.link('a', Peelr.text('h1'), {
  buildRequest: (url) => { return {
    uri: url,
    headers: {
      'Accept': 'text/html'
    }
  }}
}).extract(`<a href="https://example.com/jsonbydefault">`);

await Peelr.text('.item', {
  multiple: true,
  nextPage: Peelr.attr('.next', 'href', {
    transform: (url) => { return {
      uri: url,
      headers: {
        'Accept': 'text/html'
      }
    }}
  })
}).extract({
  url: "https://example.com/jsonitems",
  headers: {
    'Accept': 'text/html'
  }
});
```

However, it can be pretty tedious if you're building a complex extractor and you
have to repeat the same headers all the time, as in the last example above.  To
avoid that, you can pass a `keepHeaders` option so that Peelr will reuse the
same headers on all derived requests.  The value for this option can either be
a list of header names to keep, or `true` to keep them all:

```js
await Peelr.text('.item', {
  multiple: true,
  nextPage: Peelr.attr('.next', 'href')
}).extract({
  url: "https://example.com/jsonitems",
  headers: {
    'Accept': 'text/html'
  },
  keepHeaders: ['Accept']
});
```

Headers can still be overriden for a specific query by returning them from a
`buildRequest` or `nextPage` option if neeeded.

#### Cookies and authentication

There is no builtin mechanism in Peelr to handle authentication, however you can
use the [`auth`][rqst-auth] and [`oauth`][rqst-oauth] parameters for request.
Those parameters will be forwarded by the context to derived requests in a given
`.extract()` call.  If you want to remove or change those for a certain request,
you can return them from the `buildRequest` or `nextPage` options (set them to
`null` to remove them).

Similarly, Peelr context ensures all derived requests use the same cookie jar.
If you don't pass a `jar` parameter to the initial `.extract()` call, it will
create an empty one.  This means you can handle authentication yourself prior
to calling Peelr, and then reuse the same cookie jar.  Here is a quick example
with a login form:


```js
const request = require('request-promise-native');
const cookieJar = request.jar()

await request.post({
  uri: 'https://example.com/login',
  jar: cookieJar,
  form: { login: 'john', password: 'hunter3' }
});

let result = await extractor.extract({
  uri: 'https://example.com/data',
  jar: cookieJar
});
```

#### Duplicate requests

Peelr will cache responses for all GET requests made with the same URL and the
same set of headers, derived from a single `.extract()` call.  This means the
following code will only make 1 request:

```js
await Peelr.hash('.item', {
  title: Peelr.link('a.details', Peelr.text('.title')),
  price: Peelr.link('a.details', Peelr.text('.price'))
}).extract(`
  <div class="item">
    <a href="https://example.com/details" class="details">details</a>
  </div>
`);
```

Keep in mind that the cache is scoped to a `.extract()` call, so using that
extractor again would make a new request.

#### Caveat: relative URLs

Peelr resolves relative URLs in the following situations, and will throw an
error otherwise:

* When the markup contains a `<base>` tag with an absolute `href` attribute;
* When the markup contains a `<base>` tag with a relative `href` attribute and a
  URL was passed to the `.extract()` call;
* When no `<base>` tag is present but a URL was passed to the `.extract()` call.

If you're passing HTML to the `.extract()` method and want to follow relative
links, you have to either include a `<base>` tag in the markup with an absolute
`href`, or transform URLs from relative to absolute yourself (using the
`buildRequest` option with `Peelr.link`, or using the `transform` option on the
`nextPage` extractor for paginated data):

```js
await Peelr.link('a', Peelr.text('h1'), {
  buildRequest: (url) => `https://example.com${url}`
}).extract(`<a href="/path/to/page">link</a>`);

await Peelr.text('.item', {
  multiple: true,
  nextPage: Peelr.attr('.next', 'href', {
    transform: (url) => `https://example.com${url}`
  })
}).extract(`
  <section>
    <div class="item">item 1</div>
    <div class="item">item 2</div>
    <div class="item">item 3</div>
  </section>
  <nav>
    <a class="next" href="/items?page=2">next page</a>
  </nav>
`);
```

### A complete example

The following example will submit a login form, then extract paginated items
from a list on the page reached after submission, and populate each item with
details from a linked page.

Let's say `https://example.com/login` has the following markup:

```html
<form class="login-form" method="POST" action="/login">
  <input type="text" name="user" />
  <input type="password" name="password" />
  <input type="submit" value="Log in" />
</form>
```

Submitting the form lands us on `https://example.com/page1`, which is a listing
page with the following markup:

```html
<div class="item">
  <div class="label">Item 1</div>
  <a class="details" href="/items/1">details</a>
</div>
<div class="item">
  <div class="label">Item 2</div>
  <a class="details" href="/items/2">details</a>
</div>
<a class="next-page" href="https://example.com/page2">next page</a>
```

`page2` has a similar markup, with other items and a link to the next page, and
so on.

Item detail pages have the following markup:

```html
<body>
  <h1>Description</h1>
  <div class="description">Item number one</div>
  <h1>Price</h1>
  <div class="price">
    <span class="amount">15</span>
    <span class="currency">€</span>
  </div>
</body>
```

The following extractor would extract everything from those pages:

```js
await Peelr.form(
  '.login-form',
  Peelr.hash(
    '.item',
    {
      label: Peelr.text('.label'),
      link: Peelr.attr('a.details', 'href'),
      id: Peelr.attr('a.details', 'href', {
        transform: (url) => Number(url.replace(/^\/page\//, ''))
      }),
      details: Peelr.link(
        'a.details',
        Peelr.hash(
          'body',
          {
            description: Peelr.text('.description'),
            price: Peelr.text('.price .amount', { transform: p => Number(p) })
            currency: Peelr.text('.price .currency')
          }
        )
      )
    },
    {
      multiple: true,
      nextPage: 'a.next-page'
    }
  ),
  {
    fields: {
      '[name="user"]': "john",
      '[name="password"]': "hunter3"
    }
  }
).extract('https://example.com/login');
```

If we wanted to flatten hashes returned for each item (so that we no longer had
a `details` sub-hash), we could use a transform function on the topmost
`Peelr.hash` as follows:

```js
await Peelr.form(
  '.login-form',
  Peelr.hash(
    // ...
    {
      multiple: true,
      nextPage: 'a.next-page',
      transform: (item) => {
        Object.assign(item, item.details);
        delete item.details;
        return item;
      }
    }
  )
  // ...
).extract(/* ... */);
```

## Development

### Running tests

`yarn test` runs the full test suite.  Note that it requires port 8000 to be
available, as it spawns a test web server listening on that port.

---

[cheerio]: https://github.com/cheeriojs/cheerio
[rqst]: https://github.com/request/request
[rqst-auth]: https://github.com/request/request#http-authentication
[rqst-oauth]: https://github.com/request/request#oauth-signing
