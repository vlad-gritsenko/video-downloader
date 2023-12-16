const fs = require("fs");
const axios = require("axios");

const saveVideoFromURL = async (videoUrl, savePath) => {
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
};

exports.saveVideoFromURL = saveVideoFromURL;
