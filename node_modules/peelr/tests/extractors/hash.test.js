import { assert } from "chai";

import Peelr from "../../src";

describe("Peelr.hash", function() {
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

  it("extracts hash", async function() {
    assert.deepEqual(
      await Peelr.hash(".mycls", {
        field1: Peelr.text(".field1"),
        field2: Peelr.attr(".field2", "foo")
      }).extract(html),
      {
        field1: "field 1 value",
        field2: "field 2 value"
      }
    );
  });

  it("extracts multiple hashes", async function() {
    assert.deepEqual(
      await Peelr.hash(
        ".mycls",
        {
          field1: Peelr.text(".field1"),
          field2: Peelr.attr(".field2", "foo")
        },
        { multiple: true }
      ).extract(html),
      [
        {
          field1: "field 1 value",
          field2: "field 2 value"
        },
        {
          field1: "second field 1 value",
          field2: "second field 2 value"
        }
      ]
    );
  });

  it("extracts deeply", async function() {
    assert.deepEqual(
      await Peelr.hash(".mycls", {
        field1: Peelr.text(".field1"),
        deep: {
          field2: Peelr.attr(".field2", "foo"),
          cls: Peelr.attr(".field2", "class")
        }
      }).extract(html),
      {
        field1: "field 1 value",
        deep: { field2: "field 2 value", cls: "field2" }
      }
    );
  });

  it("extracts using ::root", async function() {
    assert.deepEqual(
      await Peelr.hash(".mycls", {
        field1: Peelr.attr("::root", "foo")
      }).extract(html),
      { field1: "bar" }
    );
  });

  it("extracts multiple hashes using ::root", async function() {
    assert.deepEqual(
      await Peelr.hash(
        ".mycls",
        {
          field1: Peelr.attr("::root", "foo")
        },
        { multiple: true }
      ).extract(html),
      [{ field1: "bar" }, { field1: "baz" }]
    );
  });

  it("extracts recursively", async function() {
    assert.deepEqual(
      await Peelr.hash(".mycls", {
        sub: Peelr.hash(".field1", {
          text: Peelr.text("::root")
        })
      }).extract(html),
      { sub: { text: "field 1 value" } }
    );
  });

  it("keeps non-PeelrValue items", async function() {
    assert.deepEqual(
      await Peelr.hash(".mycls", {
        field1: Peelr.text(".field1"),
        field2: "string",
        field3: 42,
        field4: true,
        field5: { foo: "bar" }
      }).extract(html),
      {
        field1: "field 1 value",
        field2: "string",
        field3: 42,
        field4: true,
        field5: { foo: "bar" }
      }
    );
  });

  it("transforms hashes", async function() {
    assert.deepEqual(
      await Peelr.hash(
        ".mycls",
        {
          field1: Peelr.text(".field1"),
          field2: Peelr.attr(".field2", "foo")
        },
        { transform: o => Object.values(o).sort() }
      ).extract(html),
      ["field 1 value", "field 2 value"]
    );
  });
});
