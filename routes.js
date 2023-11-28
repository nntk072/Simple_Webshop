/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
const responseUtils = require("./utils/responseUtils");
const { acceptsJson, isJson, parseBodyJson } = require("./utils/requestUtils");
const { renderPublic } = require("./utils/render");
const User = require("./models/user");
const {
    validateUser,
} = require("./utils/users");
const { getAllProducts,
        getProductById,
        updateProductById,
        deleteProductById,
        createProduct } = require("./controllers/products");
const { getCurrentUser } = require("./auth/auth");
const { getAllOrders, 
    getCustomerOrders, 
    getOrderById, 
    createNewOrder } = require("./controllers/orders");
const Order = require("./models/order");
const http = require("http");

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
    "/api/register": ["POST"],
    "/api/users": ["GET"],
    "/api/products": ["GET", "POST"],
    "/api/orders": ["GET", "POST"],
};

/**
 * Send response to client options request.
 * 
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response The server response object
 * @returns {Promise<void>} Promise resolved when response has been sent
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
 * @param {string} prefix filePath prefix
 * @returns {boolean} true if matches, false otherwise
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
 * @returns {boolean} true if matches, false otherwise
 */
const matchUserId = (url) => {
    return matchIdRoute(url, "users");
};

/**
 * Does the URL match /api/products/{id}
 * 
 * @param {string} url filePath
 * @returns {boolean} true if matches, false otherwise
 */
const matchProductsId = (url) => {
    return matchIdRoute(url, "products");
};

/**
 * Does the URL match /api/orders/{id}
 * 
 * @param {string} url filePath
 * @returns {boolean} true if matches, false otherwise
 */
const matchOrdersId = (url) => {
    return matchIdRoute(url, "orders");
};

const extractUserId = (url) => {
    const parts = url.split("/");
    return parts[parts.length - 1];
};

/**
 * Does the URL match 
 * 
 * @param {string} url filePath
 * @returns {boolean} true if matches, false otherwise
 */
function IsExistingPath(url) {
    if (matchUserId(url)){
        return true;
    }
    if (matchProductsId(url)) {
        return true;
    }
    if (matchOrdersId(url)) {
        return true;
    }

    if ((url in allowedMethods)) {
        return true;
    }
    return false;
}

/**
 * Checks if the method is allowed for the given URL
 * 
 * @param {string} url filePath
 * @param {string} method HTTP method
 * @returns {boolean} true if matches, false otherwise
 */
function IsAllowedMethod(url, method) {
    if (matchUserId(url) || matchProductsId(url) || matchOrdersId(url)) {
        return true;
    }
    return allowedMethods[url].includes(method.toUpperCase());
}

/**
 * Handle incoming HTTP request
 * 
 * @param {http.IncomingMessage} request request object
 * @param {http.ServerResponse} response response object
 * @returns {Promise<void>} Promise resolved when response has been sent
 */
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
        const currentUser = await getCurrentUser(request);
        if (!currentUser) {
            return responseUtils.basicAuthChallenge(response);
        }

        if (currentUser && currentUser.role !== "admin") {
            return responseUtils.forbidden(response);
        }

        if (method.toUpperCase() === "OPTIONS")
            return sendOptions(filePath, response);

        // Require a correct accept header (require 'application/json' or '*/*')
        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }

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

            if (!acceptsJson(request)) {
                return responseUtils.contentTypeNotAcceptable(response);
            }
            
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

            if (!acceptsJson(request)) {
                return responseUtils.contentTypeNotAcceptable(response);
            }

            if (currentUser.role === "admin") {
                user.deleteOne({});
            }
            return responseUtils.sendJson(response, user);
        }
    }

    // Default to 404 Not Found if unknown url
    if (!IsExistingPath(filePath)) return responseUtils.notFound(response);

    // See: http://restcookbook.com/HTTP%20Methods/options/
    if (method.toUpperCase() === "OPTIONS")
        return sendOptions(filePath, response);

    // Check for allowable methods
    if (!IsAllowedMethod(filePath, method)) {
        return responseUtils.methodNotAllowed(response);
    }

    // GET all users
    if (filePath === "/api/users" && method.toUpperCase() === "GET") {

        // Require a correct accept header (require 'application/json' or '*/*')
        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }

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

        // Require a correct accept header (require 'application/json' or '*/*')
        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }

        if (!isJson(request)) {
            return responseUtils.badRequest(
                response,
                "Invalid Content-Type. Expected application/json"
            );
        }

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
        // Require a correct accept header (require 'application/json' or '*/*')
        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }

        const currentUser = await getCurrentUser(request);
        if (!currentUser)
            return responseUtils.basicAuthChallenge(response);
        return getAllProducts(response);
    }

    if (filePath === "/api/products" && method.toUpperCase() === "POST") {
        // Require a correct accept header (require 'application/json' or '*/*')
        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }

        const currentUser = await getCurrentUser(request);
        if (!currentUser) {
            return responseUtils.basicAuthChallenge(response);
        }

        if (currentUser.role === "customer") {
            return responseUtils.forbidden(response);
        }

        if (!isJson(request)) {
            return responseUtils.badRequest(response, "Not a JSON");
        }

        parseBodyJson(request)
            .then((jsonData) => {
                return createProduct(response, jsonData);
            })
            .catch((error) => {
                return responseUtils.badRequest(response, "Failed to Parse JSON");
            });
    }

    if (matchProductsId(filePath)) {
        const currentUser = await getCurrentUser(request);
        if (!currentUser){
            return responseUtils.basicAuthChallenge(response);
        }

        // Require a correct accept header (require 'application/json' or '*/*')
        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }

        const productId = extractUserId(filePath);

        if (method.toUpperCase() === "GET") {
            return getProductById(response, productId);
        }

        if (currentUser && currentUser.role === "customer") {
            return responseUtils.forbidden(response);
        }

        if (method.toUpperCase() === "PUT") {
            const body = await parseBodyJson(request);
            return updateProductById(response, productId, body);
        }

        if (method.toUpperCase() === "DELETE") {
            if (currentUser.role !== "admin") {
                return responseUtils.badRequest(response, "Can't delete product by no Admin user");
            }
            return deleteProductById(response, productId);
        }
    }

    //GET all orders
    if (filePath === "/api/orders" && method.toUpperCase() === "GET") {
        
        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }

        const currentUser = await getCurrentUser(request);
        if (!currentUser) 
        return responseUtils.basicAuthChallenge(response);

        let orders;

        if (currentUser.role === "admin")
            orders = await getAllOrders(response);

        else if(currentUser.role === "customer")
            orders = await getCustomerOrders(response, currentUser._id);

        // return responseUtils.sendJson(response, orders);
        return orders;
    }

    //GET single order with OrderID
    if (matchOrdersId(filePath)) {

        const currentUser = await getCurrentUser(request);

        if (!currentUser) {
            return responseUtils.basicAuthChallenge(response);
        }

        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }

        const orderId = extractUserId(filePath); // Extract orderId from URL
        const order = await getOrderById(orderId);

        if (!order) {
            return responseUtils.notFound(response);
        } else {
            // Check if the user is an admin or the order owner (customer)
            if (currentUser.role === "admin") {
                return responseUtils.sendJson(response, order);
            }

            if (currentUser.role === "customer" && order.customerId === currentUser._id.toString()) {
                return responseUtils.sendJson(response, order);
            } else {
                // If the user doesn't have permissions, return 404
                return responseUtils.notFound(response);
            }
        }
            
    }

    //POST a new order
    if (filePath === "/api/orders" && method.toUpperCase() === "POST") {

        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }
        
        const currentUser = await getCurrentUser(request);
        if (!currentUser) {
            return responseUtils.basicAuthChallenge(response);
        }

        if (currentUser.role !== "customer") {
            return responseUtils.forbidden(response);
        }

        if (!isJson(request)) {
            return responseUtils.badRequest(
                response,
                "Invalid Content-Type. Expected application/json"
            );
        }

        const orderData = await parseBodyJson(request);

        // Check for empty items array
        if (!orderData.items || orderData.items.length === 0) {
            return responseUtils.badRequest(response, "Items array is empty");
        }

        // Check for missing fields in each item of items array
        if (!orderData.items.every(item =>
            item.product &&
            item.product._id &&
            item.product.name &&
            item.product.price !== undefined &&
            item.quantity !== undefined
            )) 
            {
            return responseUtils.badRequest(response, "Missing or invalid fields in items");
        }      

        try {
            const newOrder = await createNewOrder(response, orderData, currentUser._id);
            if (newOrder.statusCode === 201) {
                return newOrder;
            } else {
                return responseUtils.badRequest(response, "Failed to create order");
            }
        } catch (error) {
            return responseUtils.badRequest(response, "Failed to create order");
        }
 
    }
};
module.exports = { handleRequest };
