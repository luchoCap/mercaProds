import { assert } from "chai";

import Peelr from "../../src";
import PeelrNav from "../../src/base/nav";

describe("PeelrNav", function() {
  it("extracts from url", async function() {
    let nav = new PeelrNav("a", Peelr.text("h1"));
    nav.getRequestParams = function() {
      return "http://localhost:8000";
    };

    assert.equal(await nav.extract("<a>"), "h1 text content");
  });

  it("extracts from request params", async function() {
    let nav = new PeelrNav("a", Peelr.text("h1"));
    nav.getRequestParams = function() {
      return { uri: "http://localhost:8000" };
    };

    assert.equal(await nav.extract("<a>"), "h1 text content");
  });

  it("extracts from transformed url", async function() {
    let nav = new PeelrNav("a", Peelr.text("h1"), {
      buildRequest: url => `${url}://localhost:8000`
    });
    nav.getRequestParams = function() {
      return "http";
    };

    assert.equal(await nav.extract("<a>"), "h1 text content");
  });

  it("extracts from async transformed url", async function() {
    let nav = new PeelrNav("a", Peelr.text("h1"), {
      buildRequest: url => Promise.resolve(`${url}://localhost:8000`)
    });
    nav.getRequestParams = function() {
      return "http";
    };

    assert.equal(await nav.extract("<a>"), "h1 text content");
  });

  it("extracts from transformed request params", async function() {
    let nav = new PeelrNav("a", Peelr.text("h1"), {
      buildRequest: url => {
        return { uri: `${url}://localhost:8000` };
      }
    });
    nav.getRequestParams = function() {
      return "http";
    };

    assert.equal(await nav.extract("<a>"), "h1 text content");
  });
});
