const express = require("express");

const { downloadReddit } = require("./scripts/reddit.js");

const app = express();
const port = 3000;

app.engine("html", require("ejs").renderFile);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(express.static("files"));
app.use(express.static("public"));
app.use(express.json());

/*
 * API
 */
app.get("/", (req, res) => {
  console.log(req.body);
  res.render("reddit.ejs");
});

app.post("/download", async (req, res) => {
  const inputValue = req.body.url;

  await downloadReddit(inputValue);

  res.json({ ready: true });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening on port ${port}`);
});
