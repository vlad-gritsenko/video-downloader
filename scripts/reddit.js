const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const mpdParser = require("mpd-parser");
const axios = require("axios");
const axiosSupport = require("axios-cookiejar-support");
const tough = require("tough-cookie");
const random_ua = require("modern-random-ua");
const path = require("path");
const fs = require("fs");
const nodeFetch = require("node-fetch");
const proxyAgent = require("https-proxy-agent");

ffmpeg.setFfmpegPath(ffmpegStatic);

const jar = new tough.CookieJar();
const client = axiosSupport.wrapper(axios.create({ jar }));

const { saveVideoFromURL } = require("../utils/saveVideoFromURL");
const { findFieldValue } = require("../utils/findFieldValue");

const REDDIT_VIDEO_PATH = "../files/reddit_video.mp4";
const REDDIT_AUDIO_PATH = "../files/reddit_audio.mp4";
const REDDIT_MERGED_PATH = "../files/reddit.mp4";

const downloadReddit = async (inputValue) => {
  const proxy = new proxyAgent.HttpsProxyAgent("111.20.217.178:9091");

  const response = await nodeFetch.fetch(`${inputValue}.json`, {
    agent: proxy,
    headers: {
      "User-Agent": random_ua.generate(),
    },
  });
  // const response = await client.get(`${inputValue}.json`, {
  //   headers: {
  //     "User-Agent": random_ua.generate(),
  //   },
  // });
  const downloadURL = response.data[0].data.children[0].data.secure_media.reddit_video.fallback_url;
  const mpdURL = `https://v.redd.it/${downloadURL.split("/")[3]}/DASHPlaylist.mpd`;
  const mpd = await client.get(mpdURL);

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
