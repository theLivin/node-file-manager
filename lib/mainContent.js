// require node modules
const fs = require("fs");
const path = require("path");

// file imports
const { calculateSizeD, calculateSizeF } = require("./calculateSize.js");

const buildMainContent = (fullStaticPath, pathname) => {
  // error alert
  const errorAlert = `
    <div class="alert alert-danger">
        Internal Server Error
    </div>
    `;

  let mainContent = "";
  let items;

  // get all the items inside the folder
  try {
    items = fs.readdirSync(fullStaticPath);
  } catch (err) {
    console.log(`readdirSync error: ${err}`);
    return errorAlert;
  }

  // Remove src folder from home directory
  if (pathname === "/") {
    items = items.filter((element) => !["src"].includes(element));
  }

  //loop through the items and get the name, icon , link, size, last modified of items and then create row
  items.forEach((item) => {
    const itemDetails = {};
    const itemFullStaticPath = path.join(fullStaticPath, item);

    // name
    itemDetails.name = item;

    // link
    itemDetails.link = path.join(pathname, item);

    // icon
    try {
      // get status of item
      itemDetails.stats = fs.statSync(itemFullStaticPath);
    } catch (err) {
      console.log(`statSync Error: ${err}`);
      return errorAlert;
    }

    //   size
    if (itemDetails.stats.isDirectory()) {
      itemDetails.icon = `<ion-icon name="folder"></ion-icon>`;

      [itemDetails.size, itemDetails.sizeBytes] = calculateSizeD(
        itemFullStaticPath
      );
    } else if (itemDetails.stats.isFile()) {
      itemDetails.icon = `<ion-icon name="document"></ion-icon>`;

      [itemDetails.size, itemDetails.sizeBytes] = calculateSizeF(
        itemDetails.stats
      );
    }

    // last modified
    itemDetails.timestamp = itemDetails.stats.mtimeMs; // unix timestamp
    itemDetails.date = new Date(itemDetails.timestamp); // human readable date
    // -- change date to locale
    itemDetails.date = itemDetails.date.toLocaleString();

    //data-name was encoded to make sure characters after the first space are not neglected
    mainContent += `
    <tr data-name=${encodeURIComponent(itemDetails.name)} data-size=${
      itemDetails.sizeBytes
    } data-time=${parseInt(itemDetails.timestamp)}>
        <td>
            ${itemDetails.icon}
            <a href="${itemDetails.link}" class="uppercase"  target=${
      itemDetails.stats.isFile() ? "_blank" : ""
    }>${itemDetails.name}</a>
        </td>
        <td>${itemDetails.size}</td>
        <td>${itemDetails.date}</td>
    </tr>
    `;
  });

  return mainContent;
};

module.exports = buildMainContent;
