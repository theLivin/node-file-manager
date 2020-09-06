const breadcrumb = (pathElements) => {
  const len = pathElements.length; // length of the array

  // home breadcrumb item
  let breadcrumbItems = `<li class="breadcrumb-item"><a href="/"> home</a></li>`;

  pathElements.forEach((element, index) => {
    // // capitalize the string
    // const lc = String(element).toLowerCase(); //lowercased string
    // const caps = String(element)[0].toUpperCase(); //capitalized first letter
    // const str = caps + lc.slice(1); //capitalized string

    // create breadcrumb items
    // -- make the last item the active item
    breadcrumbItems +=
      index < len - 1
        ? `<li class="breadcrumb-item"><a href="/${element}">${element}</a></li>`
        : `<li class="breadcrumb-item active" aria-current="page">${element}</li>`;
  });

  return breadcrumbItems;
};

module.exports = breadcrumb;
