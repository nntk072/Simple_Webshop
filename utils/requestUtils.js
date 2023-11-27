const http = require("http");
/**
 * Decode, parse and return user credentials (username and password)
 * from the Authorization header.
 * 
 * @param {http.incomingMessage} request Request object
 * @returns {Array|null} array [username, password] from Authorization header, or null if header is missing
 */
const getCredentials = (request) => {
    // TODO: 8.5 Parse user credentials from the "Authorization" request header
    // NOTE: The header is base64 encoded as required by the http standard.
    //       You need to first decode the header back to its original form ("email:password").
    //  See: https://attacomsian.com/blog/nodejs-base64-encode-decode
    //       https://stackabuse.com/encoding-and-decoding-base64-strings-in-node-js/
    // throw new Error("Not Implemented");

    const authHeader = request.headers.authorization;
    if (!authHeader) {
        return null;
    }
    const authParts = authHeader.split(" ");
    if (authParts[0].toLowerCase() !== "basic") {
        return null;
    }
    if (authParts.length !== 2) {
        return null;
    }
    const base64Credentials = authParts[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
        "utf8"
    );
    const [email, password] = credentials.split(":");
    if (!email || !password) {
        return null;
    }
    return [email, password];
};

/**
 * Does the client accept JSON responses?
 * 
 * @param {http.incomingMessage} request The incoming message object
 * @returns {boolean} True if the client accepts JSON, false otherwise
 */
const acceptsJson = (request) => {
    //Check if the client accepts JSON as a response based on "Accept" request header
    // NOTE: "Accept" header format allows several comma separated values simultaneously
    // as in "text/html,application/xhtml+xml,application/json,application/xml;q=0.9,*/*;q=0.8"
    // Do not rely on the header value containing only single content type!
    const acceptHeader = request.headers.accept || "";
    return (
        acceptHeader.includes("application/json") ||
        acceptHeader.includes("*/*")
    );
};

/**
 * Is the client request content type JSON? Return true if it is.
 * 
 * @param {http.incomingMessage} request The incoming message object
 * @returns {boolean} true if the request content type is JSON, false otherwise
 */
const isJson = (request) => {
    // TODO: 8.4 Check whether request "Content-Type" is JSON or not
    const contentType = request.headers["content-type"] || "";
    return contentType.includes("application/json");
};

/**
 * Asynchronously parse request body to JSON
 *
 * Remember that an async function always returns a Promise which
 * needs to be awaited or handled with then() as in:
 *
 *   const json = await parseBodyJson(request);
 *
 *   -- OR --
 *
 *   parseBodyJson(request).then(json => {
 *     // Do something with the json
 *   })
 * 
 * @param {http.IncomingMessage} request The request object
 * @returns {Promise<*>} Promise resolves to JSON content of the body
 */
const parseBodyJson = (request) => {
    return new Promise((resolve, reject) => {
        let body = "";

        request.on("error", (err) => reject(err));

        request.on("data", (chunk) => {
            body += chunk.toString();
        });

        request.on("end", () => {
            try {
                const jsonData = JSON.parse(body);
        
                // Check if the parsed data is valid JSON
                if (jsonData && typeof jsonData === "object") {
                  resolve(jsonData);
                } else {
                  reject(new Error("Invalid JSON received"));
                }
            } catch (error) {
                reject(new Error("Invalid JSON received"));
            }
        });
    });
};

module.exports = { acceptsJson, getCredentials, isJson, parseBodyJson };
