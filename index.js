const bodyParser = require("body-parser");
const express = require("express");

const { downloadReddit } = require("./scripts/reddit.js");

const app = express();
const port = 3000;

app.engine("html", require("ejs").renderFile);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(express.static("files"));
app.use(bodyParser.urlencoded({ extended: true }));

/*
 * API
 */
app.get("/", (req, res) => {
  console.log(req.body);
  res.render("reddit.html");
});

app.post("/download", async (req, res) => {
  const inputValue = req.body.inputValue;

  await downloadReddit(inputValue);

  res.render("download.html", {
    downloadURL: "reddit.mp4",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
