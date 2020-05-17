import { assert } from "chai";

import Peelr from "../../src";

describe("Peelr.form", function() {
  it("submits GET form", async function() {
    assert.deepEqual(
      await Peelr.form(
        "form",
        Peelr.hash(
          ".query",
          {
            id: Peelr.attr("::root", "id"),
            value: Peelr.text("::root")
          },
          { multiple: true }
        ),
        {
          fields: {
            '[name="text"]': "text value",
            '[name="checkbox"]': true,
            '[name="select"]': "a"
          }
        }
      ).extract(`
        <form method="GET" action="http://localhost:8000/dumpquery">
          <input type="text" name="text">
          <input type="checkbox" name="checkbox" value="checkbox">
          <select name="select">
            <option value="a"></option>
            <option value="b"></option>
          </select>
          <input type="submit" value="submit">
        </form>
      `),
      [
        { id: "text", value: "text value" },
        { id: "checkbox", value: "checkbox" },
        { id: "select", value: "a" }
      ]
    );
  });

  it("submits GET form with existing queryparams on the action", async function() {
    assert.deepEqual(
      await Peelr.form(
        "form",
        Peelr.hash(
          ".query",
          {
            id: Peelr.attr("::root", "id"),
            value: Peelr.text("::root")
          },
          { multiple: true }
        ),
        {
          fields: {
            '[name="text"]': "text value"
          }
        }
      ).extract(`
        <form method="GET" action="http://localhost:8000/dumpquery?param=value">
          <input type="text" name="text">
          <input type="submit" value="submit">
        </form>
      `),
      [{ id: "param", value: "value" }, { id: "text", value: "text value" }]
    );
  });

  it("submits POST form", async function() {
    assert.deepEqual(
      await Peelr.form(
        "form",
        Peelr.hash(
          ".body",
          {
            id: Peelr.attr("::root", "id"),
            value: Peelr.text("::root")
          },
          { multiple: true }
        ),
        {
          fields: {
            '[name="text"]': "text value",
            '[name="checkbox"]': false,
            '[name="select"]': "a"
          }
        }
      ).extract(`
        <form method="POST" action="http://localhost:8000/dumpform">
          <input type="text" name="text">
          <input type="checkbox" name="checkbox" value="checkbox">
          <select name="select">
            <option value="a"></option>
            <option value="b"></option>
          </select>
          <input type="submit" value="submit">
        </form>
      `),
      [{ id: "text", value: "text value" }, { id: "select", value: "a" }]
    );
  });

  it.skip("submits POST form with multipart enctype", async function() {
    assert.deepEqual(
      await Peelr.form(
        "form",
        Peelr.hash(
          ".body",
          {
            id: Peelr.attr("::root", "id"),
            value: Peelr.text("::root")
          },
          { multiple: true }
        ),
        {
          fields: {
            '[name="text"]': "text value",
            '[name="checkbox"]': false,
            '[name="select"]': "a"
          }
        }
      ).extract(`
        <form method="POST" action="http://localhost:8000/dumpform" enctype="multipart/form-data">
          <input type="text" name="text">
          <input type="checkbox" name="checkbox" value="checkbox">
          <select name="select">
            <option value="a"></option>
            <option value="b"></option>
          </select>
          <input type="submit" value="submit">
        </form>
      `),
      [{ id: "text", value: "text value" }, { id: "select", value: "a" }]
    );
  });

  it("submits form with values from html", async function() {
    assert.deepEqual(
      await Peelr.form(
        "form",
        Peelr.hash(
          ".body",
          {
            id: Peelr.attr("::root", "id"),
            value: Peelr.text("::root")
          },
          { multiple: true }
        )
      ).extract(`
        <form method="POST" action="http://localhost:8000/dumpform">
          <input type="text" name="text" value="initial text value">
          <input type="checkbox" name="checkbox" value="checkbox">
          <select name="select">
            <option value="a"></option>
            <option value="b" selected></option>
          </select>
          <input type="submit" value="submit">
        </form>
      `),
      [
        { id: "text", value: "initial text value" },
        { id: "select", value: "b" }
      ]
    );
  });

  it("fails submitting form with unknown enctype", async function() {
    try {
      await Peelr.form("form", Peelr.html(".body")).extract(`
        <form method="POST" action="http://localhost:8000/dumpform" enctype="foo/bar">
          <input type="submit" value="submit">
        </form>
      `);
      assert.notOk(true);
    } catch (e) {
      assert.include(e.message, "Unsupported form enctype");
    }
  });
});
