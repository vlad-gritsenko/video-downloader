const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const mpdParser = require("mpd-parser");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

ffmpeg.setFfmpegPath(ffmpegStatic);

const { saveVideoFromURL } = require("../utils/saveVideoFromURL");
const { findFieldValue } = require("../utils/findFieldValue");

const REDDIT_VIDEO_PATH = "../files/reddit_video.mp4";
const REDDIT_AUDIO_PATH = "../files/reddit_audio.mp4";
const REDDIT_MERGED_PATH = "../files/reddit.mp4";

const downloadReddit = async (inputValue) => {
  const response = await axios.get(`${inputValue}.json`);
  const downloadURL = response.data[0].data.children[0].data.secure_media.reddit_video.fallback_url;
  const mpdURL = `https://v.redd.it/${downloadURL.split("/")[3]}/DASHPlaylist.mpd`;
  const mpd = await axios.get(mpdURL);

  const parsedManifest = mpdParser.parse(mpd.data, {
    manifestUri: mpdURL,
  });

  const audioURL = findFieldValue(parsedManifest, "playlists")[0].resolvedUri;

  await saveVideoFromURL(downloadURL, path.join(__dirname, REDDIT_VIDEO_PATH));
  await saveVideoFromURL(audioURL, path.join(__dirname, REDDIT_AUDIO_PATH));

  await ffmpeg()
    .addInput(path.resolve(__dirname, REDDIT_VIDEO_PATH))
    .addInput(path.resolve(__dirname, REDDIT_AUDIO_PATH))
    .withVideoCodec("copy")
    .withAudioCodec("copy")
    .saveToFile(path.join(__dirname, REDDIT_MERGED_PATH))
    .on("error", (error) => console.log("Merging failed:", error))
    .on("end", () => {
      fs.unlink(path.resolve(__dirname, REDDIT_VIDEO_PATH), () => {});
      fs.unlink(path.resolve(__dirname, REDDIT_AUDIO_PATH), () => {});
      console.log("Merging finished");
    });
};

exports.downloadReddit = downloadReddit;
