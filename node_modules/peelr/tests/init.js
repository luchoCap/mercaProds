import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

let app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

let staticPages = {
  "/": "<h1>h1 text content</h1>",

  "/baserel": '<base href="/details/">',
  "/baseabs": '<base href="http://localhost:8000/details/">',

  "/details": "<h1>details</h1>",
  "/details/sub": "<h1>sub</h1>",

  "/page1": `
    <div class="item">item 1</div>
    <div class="item">item 2</div>
    <a class="next" href="/page2"></a>
  `,
  "/page2": `
    <div class="item">item 3</div>
    <div class="item">item 4</div>
    <a class="next" href="/page3"></a>
  `,
  "/page3": `
    <div class="item">item 5</div>
    <div class="item">item 6</div>
  `
};

app.get("/dump", (req, res) => {
  let response = Object.keys(req.headers)
    .map(k => `<div class="header" id="${k}">${req.headers[k]}</div>`)
    .join("\n");

  res.send(response);
});

app.post("/dumpform", (req, res) => {
  let response = Object.keys(req.body)
    .map(k => `<div class="body" id="${k}">${req.body[k]}</div>`)
    .join("\n");

  res.send(response);
});

app.get("/dumpquery", (req, res) => {
  let response = Object.keys(req.query)
    .map(k => `<div class="query" id="${k}">${req.query[k]}</div>`)
    .join("\n");

  res.send(response);
});

let counter = 0;
app.get("/count", (req, res) => {
  res.send(`<div class="counter">${counter++}</div>`);
});

app.get("/setcookie/:value", (req, res) => {
  let value = req.params.value;
  res.cookie("testcookie", value);
  res.send('<div class="result">ok</div>');
});

app.get("/getcookie", (req, res) => {
  res.send(`<div class="result">${req.cookies.testcookie}</div>`);
});

app.get("*", (req, res) => {
  if (req.path in staticPages) {
    res.send(staticPages[req.path]);
  } else {
    // eslint-disable-next-line no-console
    console.log(`Unknown path ${req.path}`);
    res.status(404).send("not found");
  }
});

let server;
before(function() {
  server = app.listen(8000, "localhost");
});

after(function() {
  server.close();
});
