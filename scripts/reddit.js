const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const mpdParser = require("mpd-parser");
const axios = require("axios");
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegStatic);

const { saveVideoFromURL } = require("../utils/saveVideoFromURL");
const { findFieldValue } = require("../utils/findFieldValue");

const REDDIT_VIDEO = "reddit_video";
const REDDIT_AUDIO = "reddit_audio";
const REDDIT_MERGED = "reddit";

const downloadReddit = async (inputValue) => {
  const response = await axios.get(`${inputValue}.json`);
  const downloadURL = response.data[0].data.children[0].data.secure_media.reddit_video.fallback_url;
  const mpdURL = `https://v.redd.it/${downloadURL.split("/")[3]}/DASHPlaylist.mpd`;
  const mpd = await axios.get(mpdURL);

  const parsedManifest = mpdParser.parse(mpd.data, {
    manifestUri: mpdURL,
  });

  const audioURL = findFieldValue(parsedManifest, "playlists")[0].resolvedUri;

  await saveVideoFromURL(downloadURL, path.join(__dirname, `../files/${REDDIT_VIDEO}.mp4`));
  await saveVideoFromURL(audioURL, path.join(__dirname, `../files/${REDDIT_AUDIO}.mp4`));

  await ffmpeg()
    .addInput(path.resolve(__dirname, `../files/${REDDIT_VIDEO}.mp4`))
    .addInput(path.resolve(__dirname, `../files/${REDDIT_AUDIO}.mp4`))
    .addOptions(["-map 0:v", "-map 1:a", "-c:v copy"])
    .format("mp4")
    .on("error", (error) => console.log("Merging failed:", error))
    .on("end", () => console.log("Merging finished"))
    .saveToFile(path.join(__dirname, `../files/${REDDIT_MERGED}.mp4`));
};

exports.downloadReddit = downloadReddit;
