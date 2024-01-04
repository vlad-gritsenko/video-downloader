const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");
const axios = require("axios");

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
  // const inputValue = req.body.url;

  // await downloadReddit(inputValue);

  try {
    const data = await axios.get(
      `https://www.reddit.com/r/CrazyFuckingVideos/comments/18y4oxn/irl_streamer_swatted_while_drunk_streaming_hes_so/.json`
    );
    console.log("DDATA", data);
  } catch (e) {
    console.log("EERROR", e);
  }

  res.render("reddit.ejs");
  // res.json({ ready: true });
  // res.render("download.ejs", {
  //   downloadURL: 'reddit.mp4'
  // });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`App listening on port ${PORT}`);
});
