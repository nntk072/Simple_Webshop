/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
const responseUtils = require("./utils/responseUtils");
const { acceptsJson, isJson, parseBodyJson } = require("./utils/requestUtils");
const { renderPublic } = require("./utils/render");
const User = require("./models/user");
const {
    validateUser,
} = require("./utils/users");
const { getAllProducts } = require("./utils/products");
const { getCurrentUser } = require("./auth/auth");

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
    "/api/register": ["POST"],
    "/api/users": ["GET"],
    "/api/products": ["GET"],
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response
 */
const sendOptions = (filePath, response) => {
    if (filePath in allowedMethods) {
        response.writeHead(204, {
            "Access-Control-Allow-Methods": allowedMethods[filePath].join(","),
            "Access-Control-Allow-Headers": "Content-Type,Accept",
            "Access-Control-Max-Age": "86400",
            "Access-Control-Expose-Headers": "Content-Type,Accept",
        });
        return response.end();
    }

    return responseUtils.notFound(response);
};

/**
 * Does the url have an ID component as its last part? (e.g. /api/users/dsf7844e)
 *
 * @param {string} url filePath
 * @param {string} prefix
 * @returns {boolean}
 */
const matchIdRoute = (url, prefix) => {
    const idPattern = "[0-9a-z]{8,24}";
    const regex = new RegExp(`^(/api)?/${prefix}/${idPattern}$`);
    return regex.test(url);
};

/**
 * Does the URL match /api/users/{id}
 *
 * @param {string} url filePath
 * @returns {boolean}
 */
const matchUserId = (url) => {
    return matchIdRoute(url, "users");
};

const extractUserId = (url) => {
    const parts = url.split("/");
    return parts[parts.length - 1];
};

const handleRequest = async (request, response) => {
    const { url, method, headers } = request;
    const filePath = new URL(url, `http://${headers.host}`).pathname;

    // serve static files from public/ and return immediately
    if (method.toUpperCase() === "GET" && !filePath.startsWith("/api")) {
        const fileName =
            filePath === "/" || filePath === "" ? "index.html" : filePath;
        return renderPublic(fileName, response);
    }

    if (matchUserId(filePath)) {
        // TODO: 8.6 Implement view, update and delete a single user by ID (GET, PUT, DELETE)
        // You can use parseBodyJson(request) from utils/requestUtils.js to parse request body
        // If the HTTP method of a request is OPTIONS you can use sendOptions(filePath, response) function from this module
        // If there is no currently logged in user, you can use basicAuthChallenge(response) from /utils/responseUtils.js to ask for credentials
        //  If the current user's role is not admin you can use forbidden(response) from /utils/responseUtils.js to send a reply
        // Useful methods here include:
        // - getUserById(userId) from /utils/users.js
        // - notFound(response) from  /utils/responseUtils.js
        // - sendJson(response,  payload)  from  /utils/responseUtils.js can be used to send the requested data in JSON format
        const currentUser = await getCurrentUser(request);
        if (!currentUser) return responseUtils.basicAuthChallenge(response);

        if (currentUser && currentUser.role !== "admin") {
            return responseUtils.forbidden(response);
        }

        if (method.toUpperCase() === "OPTIONS")
            return sendOptions(filePath, response);

        const userId = extractUserId(filePath);
        const user = await User.findById(userId).exec();
        if (!user) return responseUtils.notFound(response);

        if (method.toUpperCase() === "GET"){

            if (!acceptsJson(request)) {
                return responseUtils.contentTypeNotAcceptable(response);
            }

            return responseUtils.sendJson(response, user);
        }

        if (method.toUpperCase() === "PUT") {
            const json = await parseBodyJson(request);
            if (!json.role)
                return responseUtils.badRequest(response, "Message");
            if (json.role !== "admin" && json.role !== "customer")
                return responseUtils.badRequest(response, "message");
            if (json.role === "admin") {
                user.role = "admin";
                await user.save();
            }
            return responseUtils.sendJson(response, user);
        }

        if (method.toUpperCase() === "DELETE") {
            if (currentUser.role === "admin") {
                user.deleteOne({});

            }
            return responseUtils.sendJson(response, user);
        }
    }

    // Default to 404 Not Found if unknown url
    if (!(filePath in allowedMethods)) return responseUtils.notFound(response);

    // See: http://restcookbook.com/HTTP%20Methods/options/
    if (method.toUpperCase() === "OPTIONS")
        return sendOptions(filePath, response);

    // Check for allowable methods
    if (!allowedMethods[filePath].includes(method.toUpperCase())) {
        return responseUtils.methodNotAllowed(response);
    }

    // Require a correct accept header (require 'application/json' or '*/*')
    if (!acceptsJson(request)) {
        return responseUtils.contentTypeNotAcceptable(response);
    }

    // GET all users
    if (filePath === "/api/users" && method.toUpperCase() === "GET") {
        // TODO: 8.5 Add authentication (only allowed to users with role "admin")
        const currentUser = await getCurrentUser(request);

        if (!currentUser) return responseUtils.basicAuthChallenge(response);

        if (currentUser && currentUser.role === "customer") {
            return responseUtils.forbidden(response);
        }

        const users = await User.find({});
        return responseUtils.sendJson(response, users);
    }

    // register new user
    if (filePath === "/api/register" && method.toUpperCase() === "POST") {
        if (!isJson(request)) {
            return responseUtils.badRequest(
                response,
                "Invalid Content-Type. Expected application/json"
            );
        }

        // TODO: 8.4 Implement registration
        // You can use parseBodyJson(request) method from utils/requestUtils.js to parse request body.
        // Useful methods here include:
        // - validateUser(user) from /utils/users.js
        // - emailInUse(user.email) from /utils/users.js
        // - badRequest(response, message) from /utils/responseUtils.js

        const body = await parseBodyJson(request);
        const errors = validateUser(body);
        if (errors.length > 0) {
            return responseUtils.badRequest(response, errors);
        }
        const existingUser = await User.findOne({ email: body.email }).exec();
        if (existingUser) {
            return responseUtils.badRequest(response, "Email already in use");
        }

        const newUser = new User(body);
        newUser.role = "customer";
        await newUser.save();
        return responseUtils.sendJson(response, newUser, 201);
    }

    if (filePath === "/api/products" && method.toUpperCase() === "GET") {
        const currentUser = await getCurrentUser(request);

        if (!currentUser) return responseUtils.basicAuthChallenge(response);

        return responseUtils.sendJson(response, getAllProducts());
    }
};

module.exports = { handleRequest };
