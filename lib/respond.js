// require node modules
const url = require("url");
const path = require("path");
const fs = require("fs");

// file imports
const buildBreadcrumb = require("./breadcrumb.js");
const buildMainContent = require("./mainContent.js");
const getMimeType = require("./getMimeType.js");

// static base path: location of static folders
const staticBasePath = path.join(__dirname, "..", "static");

// respond to request
// the following function will be passed to createServer used to create the server
const respond = (request, response) => {
  // parse the request url
  const parsedUrl = url.parse(request.url, true);
  let pathname = parsedUrl.pathname;

  // do not process /favicon.ico routes
  if (pathname === "/favicon.ico") return;

  // decode the pathname
  pathname = decodeURIComponent(pathname);

  // make the pathname lowercase
  pathname = pathname.toLowerCase();

  // get corresponding full path of pathname
  const fullStaticPath = path.join(staticBasePath, pathname);

  // does the path corresponds to an existing file?
  // no: nothing was found
  if (!fs.existsSync(fullStaticPath)) {
    response.write("404: File Not Found");
    response.end();
    return;
  }

  // yes: something was found
  // try to get the metadata of file/folder
  let stats;
  try {
    stats = fs.lstatSync(fullStaticPath);
  } catch (err) {
    console.log(`lstatSync error: ${err}`);
  }

  // it is a directory
  if (stats.isDirectory()) {
    // get content from the template ie: index.html
    let data = fs.readFileSync(
      path.join(staticBasePath, "src/index.html"),
      "utf-8"
    );

    // get the url path elements
    let pathElements = pathname.split("/");
    // -- remove empty strings from the title
    pathElements = pathElements.filter((element) => element !== "");

    // build the title ie. get the active folder name
    const folderName = pathElements[pathElements.length - 1];

    // build the breadcrumb using the path elements
    const breadcrumb = buildBreadcrumb(pathElements);

    // build main content ie. table rows
    const mainContent = buildMainContent(fullStaticPath, pathname);

    // fill the template data with the page title, breadcrumb and table rows(main content)
    data = data.replace("page_title_here", folderName || "Home");
    data = data.replace("breadcrumb_items_here", breadcrumb);
    data = data.replace("main_content_here", mainContent);

    // print data to webpage
    response.statusCode = 200;
    response.write(data);
    return response.end();
  }

  // it is neither a file nor a directory
  // send 401: access denied!
  if (!stats.isFile()) {
    response.statusCode = 401;
    response.write("401: Access denied!");
    return response.end();
  }

  // it is a file
  // get file details
  const fileDetails = {};
  // get file extension
  fileDetails.extension = path.extname(fullStaticPath);

  // get filesize
  let stat;
  try {
    stat = fs.statSync(fullStaticPath);
  } catch (err) {
    console.log("Error in getting file size");
    console.log(err);
  }
  fileDetails.size = stat.size;

  // get mime type and add it to the response header
  getMimeType(fileDetails.extension)
    .then((mime) => {
      // store headers here
      let head = {};
      let options = {};

      // response status code
      let statusCode = 200;

      // set "Content-Type" for all the file types
      head["Content-Type"] = mime;

      // get the file size and add it to the response header
      if (fileDetails.extname === ".pdf") {
        // open it in the browser
        head["Content-Disposition"] = "inline";
        // or download it
        // head["Content-Disposition"] = "attachment;filename=file.pdf";
      }

      // if audio or video file, stream in ranges
      if (RegExp("audio").test(mime) || RegExp("video").test(mime)) {
        // header
        head["Accept-Ranges"] = "bytes";

        // get range of 'Accept-Range'
        const range = request.headers.range; // [output] range: bytes=start-end

        if (range) {
          const start_end = range.replace("/bytes=/", "").split("-");

          const start = parseInt(start_end[0]);
          const end = start_end[1]
            ? parseInt(start_end[1])
            : fileDetails.size - 1;

          // headers
          // Content-Range
          head["Content-Range"] = `bytes ${start}-${end}/${fileDetails.size}`;
          // Content-head
          head["Content-Length"] = end - start + 1; // plus 1 because we want to count the final byte too
          statusCode = 206;

          // options
          options = { start, end };
        }
      }

      // reading file using the fs.readFile
      /*
      fs.readFile(fullStaticPath, "utf-8", (err, data) => {
        if (err) {
          response.statusCode = 200;
          response.write(`Status code in getMimeType function: ${mime}`);
          return response.end();
        } else {
          response.writeHead(200, head);
          response.write(data);
          return response.end();
        }
      });
      */

      // streaming method
      const fileStream = fs.createReadStream(fullStaticPath, options);

      // stream chunks to response object
      response.writeHead(statusCode, head);

      fileStream.pipe(response);

      // event: close and error
      fileStream.on("close", () => {
        return response.end();
      });

      fileStream.on("error", (error) => {
        console.log(error.code);
        response.statusCode = 404;
        response.write("404: Filestream error!");
        return response.end();
      });
    })
    .catch((err) => {
      response.statusCode = 500;
      response.write("500: Internal server error!");
      console.log(`getMimeType error ${err}`);
      return response.end();
    });
};

// make the respond function accessible to other files
module.exports = respond;
