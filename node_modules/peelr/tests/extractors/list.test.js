import { assert } from "chai";

import Peelr from "../../src";

describe("Peelr.list", function() {
  let html = `
    <p>
      <div class="mycls" foo="bar">
        <span class="field1">field 1 value</span>
        <span class="field2" foo="field 2 value"></span>
      </div>
      <div class="mycls" foo="baz">
        <span class="field1">second field 1 value</span>
        <span class="field2" foo="second field 2 value"></span>
      </div>
    </p>
  `;

  it("extracts list of values", async function() {
    assert.deepEqual(
      await Peelr.list(".mycls", [
        Peelr.text(".field1"),
        Peelr.attr(".field2", "foo")
      ]).extract(html),
      ["field 1 value", "field 2 value"]
    );
  });

  it("extracts multiple lists of values", async function() {
    assert.deepEqual(
      await Peelr.list(
        ".mycls",
        [Peelr.text(".field1"), Peelr.attr(".field2", "foo")],
        { multiple: true }
      ).extract(html),
      [
        ["field 1 value", "field 2 value"],
        ["second field 1 value", "second field 2 value"]
      ]
    );
  });

  it("extracts using ::root", async function() {
    assert.deepEqual(
      await Peelr.list(".mycls", [
        Peelr.attr("::root", "foo"),
        Peelr.attr(".field2", "foo")
      ]).extract(html),
      ["bar", "field 2 value"]
    );
  });

  it("extracts multiple lists of values using ::root", async function() {
    assert.deepEqual(
      await Peelr.list(
        ".mycls",
        [Peelr.attr("::root", "foo"), Peelr.attr(".field2", "foo")],
        { multiple: true }
      ).extract(html),
      [["bar", "field 2 value"], ["baz", "second field 2 value"]]
    );
  });

  it("transforms list of values", async function() {
    assert.deepEqual(
      await Peelr.list(
        ".mycls",
        [Peelr.text(".field1"), Peelr.attr(".field2", "foo")],
        { transform: a => a.reverse() }
      ).extract(html),
      ["field 2 value", "field 1 value"]
    );
  });
});
