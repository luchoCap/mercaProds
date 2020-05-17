# Changelog

## v0.4.0 (2019-05-04)

* Added `onRequest` callback
* Added `offset` and `limit` parameters when using `multiple`

## v0.3.1 (2019-05-04)

* No new features
* Better test coverage
* Improved README

## v0.3.0 (2019-04-30)

* Fixed cookie jar passed to `extract` being overwritten
* Use express for the test server
* Added base PeelrNav to reimplement link
* Added form extractor implemented on PeelrNav

## v0.2.1 (2019-04-28)

* Fixed main module not exporting the right thing

## v0.2.0 (2019-04-27)

* Added a context object to track URLs and keep cookies between requests
* Added link extractor
* Added `nextPage` option for paginated data
* Non-multiple extractors return `undefined` when no target matches

## v0.1.0 (2019-04-27)

* First published version, with only data extractors
