const express = require("express");
const bodyParser = require("body-parser");
const mpdParser = require("mpd-parser");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");

ffmpeg.setFfmpegPath(ffmpegStatic);
const app = express();
const port = 3000;

app.engine("html", require("ejs").renderFile);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(express.static("files"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  console.log(req.body);
  res.render("reddit.html");
});

async function saveVideoFromURL(videoUrl, savePath) {
  try {
    // Fetch video data using axios
    const response = await axios.get(videoUrl, {
      responseType: "stream",
    });

    // Create a writable stream to save the video
    const writer = fs.createWriteStream(savePath);

    // Pipe the video data to the writable stream
    response.data.pipe(writer);

    // Return a promise that resolves when the video is saved
    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    throw error;
  }
}

app.post("/download", async (req, res) => {
  const inputValue = req.body.inputValue;

  const response = await axios.get(`${inputValue}.json`);
  const downloadURL =
    response.data[0].data.children[0].data.secure_media.reddit_video
      .fallback_url;

  // // https://v.redd.it/gm8a2g7t9ca01/DASHPlaylist.mpd 6 years old /audio

  const mpd = await axios.get(
    "https://v.redd.it/v7b97o4f4p4c1/DASHPlaylist.mpd"
  );

  const parsedManifest = mpdParser.parse(mpd.data, {
    manifestUri: "https://v.redd.it/v7b97o4f4p4c1/DASHPlaylist.mpd",
  });
  const audioURL =
    parsedManifest.mediaGroups.AUDIO.audio.main.playlists[0].resolvedUri;
  console.log(audioURL);

  await saveVideoFromURL(
    downloadURL,
    path.join(__dirname, "files/saved-video.mp4")
  );
  await saveVideoFromURL(
    audioURL,
    path.join(__dirname, "files/saved-audio.mp4")
  );

  await ffmpeg()
    .addInput(path.resolve(__dirname, "files/saved-video.mp4"))
    .addInput(path.resolve(__dirname, "files/saved-audio.mp4"))
    .addOptions(["-map 0:v", "-map 1:a", "-c:v copy"])
    .format("mp4")
    .on("error", (error) => console.log("FFMPEG ERROR", error))
    .on("end", () => console.log("finished!"))
    .saveToFile(path.join(__dirname, "files/merged.mp4"));

  res.render("download.html", {
    downloadURL: "saved-video.mp4",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
