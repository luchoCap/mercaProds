import { assert } from "chai";

import Peelr from "../../src";
import PeelrValue from "../../src/base/value";

let html = `
  <p>
    <div class="mycls" id="child1"></div>
    <div class="mycls" id="child2"></div>
  </p>
`;

async function getValue() {
  let val = new PeelrValue(...arguments);
  val.getValue = function($el) {
    return $el.attr("id");
  };
  return await val.extract(html);
}

describe("PeelrValue", function() {
  it("extracts value", async function() {
    assert.equal(await getValue(".mycls"), "child1");
  });

  it("transforms value", async function() {
    assert.equal(
      await getValue(".mycls", { transform: v => v.toUpperCase() }),
      "CHILD1"
    );
  });

  it("awaits async transform", async function() {
    assert.equal(
      await getValue(".mycls", {
        transform: v => Promise.resolve(v.toUpperCase())
      }),
      "CHILD1"
    );
  });

  it("extracts multiple values", async function() {
    assert.deepEqual(await getValue(".mycls", { multiple: true }), [
      "child1",
      "child2"
    ]);
  });

  it("transforms multiple values", async function() {
    assert.deepEqual(
      await getValue(".mycls", {
        multiple: true,
        transform: v => v.toUpperCase()
      }),
      ["CHILD1", "CHILD2"]
    );
  });

  it("extracts from url", async function() {
    let val = new PeelrValue("h1");
    val.getValue = function($el) {
      return $el.text();
    };
    assert.equal(await val.extract("http://localhost:8000"), "h1 text content");
  });

  it("calls onRequest when making requests", async function() {
    let log = [];
    let val = new PeelrValue("h1", {
      onRequest: (params, cacheHit) => log.push([params, cacheHit])
    });
    val.getValue = function($el) {
      return $el.text();
    };

    await val.extract("http://localhost:8000");
    assert.deepEqual(log, [[{ url: "http://localhost:8000" }, false]]);
  });

  it("extracts from request parameters", async function() {
    let val = new PeelrValue(".header#x-my-header");
    val.getValue = function($el) {
      return $el.text();
    };
    assert.equal(
      await val.extract({
        url: "http://localhost:8000/dump",
        headers: { "X-My-Header": "myvalue" }
      }),
      "myvalue"
    );
  });

  it("extracts paginated values with nextPage selector", async function() {
    let val = new PeelrValue(".item", {
      multiple: true,
      nextPage: ".next"
    });
    val.getValue = function($el) {
      return $el.text();
    };
    assert.deepEqual(await val.extract("http://localhost:8000/page1"), [
      "item 1",
      "item 2",
      "item 3",
      "item 4",
      "item 5",
      "item 6"
    ]);
  });

  it("extracts paginated values with nextPage extractor", async function() {
    let val = new PeelrValue(".item", {
      multiple: true,
      nextPage: Peelr.attr(".next", "href")
    });
    val.getValue = function($el) {
      return $el.text();
    };
    assert.deepEqual(await val.extract("http://localhost:8000/page1"), [
      "item 1",
      "item 2",
      "item 3",
      "item 4",
      "item 5",
      "item 6"
    ]);
  });

  it("slices paginated values", async function() {
    let val = new PeelrValue(".item", {
      multiple: true,
      nextPage: Peelr.attr(".next", "href"),
      offset: 1,
      limit: 4
    });
    val.getValue = function($el) {
      return $el.text();
    };
    assert.deepEqual(await val.extract("http://localhost:8000/page1"), [
      "item 2",
      "item 3",
      "item 4",
      "item 5"
    ]);
  });

  it("does not run extractor for items outside sliced range", async function() {
    let val = new PeelrValue(".item", {
      multiple: true,
      nextPage: Peelr.attr(".next", "href"),
      offset: 1,
      limit: 4
    });

    let called = [];
    val.getValue = function($el) {
      called.push($el.text());
      return $el.text();
    };

    await val.extract("http://localhost:8000/page1");

    assert.deepEqual(called, ["item 2", "item 3", "item 4", "item 5"]);
  });

  it("stops pagination when limit has been reached", async function() {
    let requests = [];
    let val = new PeelrValue(".item", {
      multiple: true,
      nextPage: Peelr.attr(".next", "href"),
      offset: 1,
      limit: 2,
      onRequest: params => requests.push(params.url)
    });

    val.getValue = function($el) {
      return $el.text();
    };

    await val.extract("http://localhost:8000/page1");

    assert.deepEqual(requests, [
      "http://localhost:8000/page1",
      "http://localhost:8000/page2"
    ]);
  });
});
