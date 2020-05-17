import { assert } from "chai";

import Peelr from "../../src";

describe("Peelr.custom", function() {
  let html = `
    <form>
      <input name="foo" value="foos" />
      <input name="bar" value="bars" />
    </form>
  `;

  it("extracts data", async function() {
    assert.equal(
      await Peelr.custom("form", $el => $el.serialize()).extract(html),
      "foo=foos&bar=bars"
    );
  });

  it("awaits async extractor", async function() {
    assert.equal(
      await Peelr.custom("form", $el =>
        Promise.resolve($el.serialize())
      ).extract(html),
      "foo=foos&bar=bars"
    );
  });
});
