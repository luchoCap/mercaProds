import { assert } from "chai";
import cheerio from "cheerio";

import Peelr from "../../src";

function domTest({ title, subject, html, args, expected }) {
  let transform =
    typeof expected[0] === "string" ? t => t.toUpperCase() : t => !t;

  describe(title, function() {
    it("extracts single value", async function() {
      assert.equal(await subject(...args).extract(html), expected[0]);
    });

    it("transforms single value", async function() {
      assert.equal(
        await subject(...args, { transform }).extract(html),
        transform(expected[0])
      );
    });

    it("extracts multiple values", async function() {
      assert.deepEqual(
        await subject(...args, { multiple: true }).extract(html),
        expected
      );
    });

    it("transforms multiple values", async function() {
      assert.deepEqual(
        await subject(...args, { transform, multiple: true }).extract(html),
        expected.map(transform)
      );
    });
  });
}

domTest({
  title: "Peelr.attr",
  subject: Peelr.attr,
  args: [".mycls", "foo"],
  html: `
    <p>
      <div class="mycls" foo="bar"></div>
      <div class="mycls" foo="baz"></div>
    </p>`,
  expected: ["bar", "baz"]
});

domTest({
  title: "Peelr.data",
  subject: Peelr.data,
  args: [".mycls", "foo"],
  html: `
    <p>
      <div class="mycls" data-foo="bar"></div>
      <div class="mycls" data-foo="baz"></div>
    </p>`,
  expected: ["bar", "baz"]
});

domTest({
  title: "Peelr.hasClass",
  subject: Peelr.hasClass,
  args: [".mycls", "foo"],
  html: `
    <p>
      <div class="mycls foo"></div>
      <div class="mycls bar"></div>
    </p>`,
  expected: [true, false]
});

domTest({
  title: "Peelr.html",
  subject: Peelr.html,
  args: [".mycls"],
  html: `
    <p>
      <div class="mycls"><foo></foo></div>
      <div class="mycls"><bar></bar></div>
    </p>`,
  expected: ["<foo></foo>", "<bar></bar>"]
});

domTest({
  title: "Peelr.is (selector)",
  subject: Peelr.is,
  args: [".mycls", ".foo"],
  html: `
    <p>
      <div class="mycls foo"></div>
      <div class="mycls bar"></div>
    </p>`,
  expected: [true, false]
});

domTest({
  title: "Peelr.is (predicate)",
  subject: Peelr.is,
  args: [
    ".mycls",
    function() {
      return cheerio(this).hasClass("foo");
    }
  ],
  html: `
    <p>
      <div class="mycls foo"></div>
      <div class="mycls bar"></div>
    </p>`,
  expected: [true, false]
});

domTest({
  title: "Peelr.text",
  subject: Peelr.text,
  args: [".mycls"],
  html: `
    <p>
      <div class="mycls">foo</div>
      <div class="mycls">bar</div>
    </p>`,
  expected: ["foo", "bar"]
});

domTest({
  title: "Peelr.val",
  subject: Peelr.val,
  args: [".mycls"],
  html: `
    <p>
      <input class="mycls" value="foo"/>
      <input class="mycls" value="bar"/>
    </p>`,
  expected: ["foo", "bar"]
});
