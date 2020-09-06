// require node modules
const https = require("https");

// json file link
const mimeUrl =
  "https://gist.githubusercontent.com/AshHeskes/6038140/raw/27c8b1e28ce4c3aff0c0d8d3d7dbcb099a22c889/file-extension-to-mime-types.json";

const getMimeType = (extension) => {
  return new Promise((resolve, reject) => {
    https
      .get(mimeUrl, (response) => {
        if (response.statusCode < 200 || response.statusCode > 299) {
          // error
          reject(
            `Error: Failed to load mime types json file: ${response.statusCode}`
          );
          console.log(
            `Error: Failed to load mime types json file: ${response.statusCode}`
          );
          return;
        }

        // success
        let data = "";

        // receive data in chunks
        response.on("data", (chunk) => {
          //   process.stdout.write(chunk);
          data += chunk;
        });

        // once all chunks are received
        response.on("end", () => resolve(JSON.parse(data)[extension]));
      })
      .on("error", (err) => {
        console.log("Error in making https.get() for the mime type");
        console.log(err);
      });
  });
};

module.exports = getMimeType;
