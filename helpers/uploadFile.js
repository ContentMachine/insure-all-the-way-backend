const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadFile = (fileBuffer, folder, resource_type) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });

module.exports = { uploadFile };
