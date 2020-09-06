// require node modules
const { execSync } = require("child_process");

// calculate size of file and folder/directory

// calculate size of folder/dirctory
const calculateSizeD = (itemFullStaticPath) => {
  // escape all spaces, tabs, etc. in the path
  const itemFullStaticPathCleaned = itemFullStaticPath.replace(/\s/g, " ");

  // run terminal command that calculates the size of folder
  // -- in readable format
  const commandOutputSize = execSync(
    `du -sh "${itemFullStaticPathCleaned}"`
  ).toString();
  // -- in bytes
  const commandOutputSizeBytes = execSync(
    `du -s "${itemFullStaticPathCleaned}"`
  ).toString();

  const fileSize = commandOutputSize.split("\t")[0];
  const fileSizeBytes = commandOutputSizeBytes.split("\t")[0];

  return [fileSize, fileSizeBytes];
};

// calculate size of file
const calculateSizeF = (stats) => {
  // units
  let unit = "BKMGT"; // Bytes, KiloBytes, MegaBytes, TeraBytes

  // file size in bytes
  const fileSizeBytes = stats.size;

  const index = Math.floor(Math.log10(fileSizeBytes) / 3);

  // file size in human readable format
  const fileSizeHuman = (fileSizeBytes / Math.pow(1000, index)).toFixed(1);

  unit = unit[index];

  const fileSize = `${fileSizeHuman}${unit}`;
  return [fileSize, fileSizeBytes];
};

module.exports = { calculateSizeD, calculateSizeF };
