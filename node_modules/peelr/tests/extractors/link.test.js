import { assert } from "chai";
import request from "request-promise-native";

import Peelr from "../../src";

describe("Peelr.link", function() {
  it("extracts from href attribute", async function() {
    assert.equal(
      await Peelr.link("a", Peelr.text("h1")).extract(`
        <a href="http://localhost:8000/">link</a>
      `),
      "h1 text content"
    );
  });

  it("extracts from other attribute", async function() {
    assert.equal(
      await Peelr.link("a", Peelr.text("h1"), { attr: "src" }).extract(`
          <a src="http://localhost:8000/">link</a>
        `),
      "h1 text content"
    );
  });

  it("extracts from transformed url", async function() {
    assert.equal(
      await Peelr.link("a", Peelr.text("h1"), {
        buildRequest: url => url.replace(/removeme$/, "")
      }).extract(`
        <a href="http://localhost:8000/removeme">link</a>
      `),
      "h1 text content"
    );
  });

  it("extracts from async transformed url", async function() {
    assert.equal(
      await Peelr.link("a", Peelr.text("h1"), {
        buildRequest: url => Promise.resolve(url.replace(/removeme$/, ""))
      }).extract(`
        <a href="http://localhost:8000/removeme">link</a>
      `),
      "h1 text content"
    );
  });

  it("extracts from request parameters", async function() {
    assert.equal(
      await Peelr.link("a", Peelr.text("h1"), {
        buildRequest: url => {
          return { uri: url.replace(/removeme$/, "") };
        }
      }).extract(`
        <a href="http://localhost:8000/removeme">link</a>
      `),
      "h1 text content"
    );
  });

  it("keeps cookies", async function() {
    let value = Math.floor(Math.random() * 1000000);
    assert.equal(
      await Peelr.link("*", Peelr.text(".result"), {
        buildRequest: () => "http://localhost:8000/getcookie"
      }).extract(`http://localhost:8000/setcookie/${value}`),
      `${value}`
    );
  });

  it("keeps cookies in user jar", async function() {
    let value = Math.floor(Math.random() * 1000000);
    let jar = request.jar();

    assert.equal(
      await Peelr.link("*", Peelr.text(".result"), {
        buildRequest: () => "http://localhost:8000/getcookie"
      }).extract({ url: `http://localhost:8000/setcookie/${value}`, jar }),
      `${value}`
    );

    assert.equal(
      jar.getCookies("http://localhost:8000").find(c => c.key === "testcookie")
        .value,
      `${value}`
    );
  });
});
