// sort status
const sortStatus = {
  name: "none", // none, ascending or descending
  size: "none",
  time: "none",
};

// loop through the children of tbody
const children = document.querySelector("tbody").children;
// convert children to an array
let children_array = [];

for (let i = 0; i < children.length; i++) {
  children_array.push(children[i]);
}

// build an array of objects for easy sorting
const items = [];
children_array.forEach((element) => {
  const rowDetails = {
    name: decodeURIComponent(element.getAttribute("data-name")).toUpperCase(), // name was previously encoded to prevent loss of characters after the first space
    //   was converted to uppercase for efficient sorting
    size: parseInt(element.dataset.size),
    time: parseInt(element.dataset.time),
    html: element.outerHTML, // outerHTML because innerHTML does not return the attributes
  };

  // NB: element.dataset.size === element.getAttribute('data-time');

  items.push(rowDetails);
});

// sorting functions
// since the array.sort() function mutates the array itself and does not return any array of any sort too, nothing will be returned in the custom sort functions

const sortBy = (type, arr, direction) => {
  arr.sort((item1, item2) => {
    if (item1[type] > item2[type]) return 1;
    if (item1[type] < item2[type]) return -1;
    return 0;
  });
  if (direction === "desc") {
    arr.reverse();
  }
};

// build the html of sorted items and relace it with the DOM table body
const buildTableBody = (arr) => {
  const tbody = document.querySelector("tbody");
  const content = arr.map((element) => element.html).join("");
  // replace the tbody with the sorted one
  tbody.innerHTML = content;
};

// add click listener to name header and sort the files/folder accordingly when clicked
document.getElementById("thead-row").addEventListener("click", (e) => {
  if (e.target) {
    const targetId = e.target.id; // get id of clicked element

    document.querySelector("ion-icon").remove();

    if (["none", "desc"].includes(sortStatus[targetId])) {
      // sort in ascending order if not sorted or in descending order

      sortBy(targetId, items, "asc");
      // change sort status
      sortStatus[targetId] = "asc";

      // add icon
      e.target.innerHTML += ` <ion-icon name="caret-up-circle-outline"></ion-icon>`;
    } else if (sortStatus[targetId] === "asc") {
      // sort in descending order
      sortBy(targetId, items, "desc");
      // change sort status
      sortStatus[targetId] = "desc";

      e.target.innerHTML += ` <ion-icon name="caret-down-circle-outline"></ion-icon>`;
    }

    // update the table body
    buildTableBody(items);
  }
});
