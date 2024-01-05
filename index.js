const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");

const { downloadReddit } = require("./scripts/reddit.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.engine("html", require("ejs").renderFile);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(cors());
app.use(express.static("files"));
app.use(express.static("public"));
app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));

/*
 * API
 */
app.get("/", (req, res) => {
  res.render("reddit.ejs");
});

app.post("/download", async (req, res) => {
  // const inputValue = req.body.inputValue;
  const inputValue = req.body.url;

  await downloadReddit(inputValue);

  res.send({ ready: true });
  // res.render("download.ejs", {
  //   downloadURL: 'reddit.mp4'
  // });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`App listening on port ${PORT}`);
});
