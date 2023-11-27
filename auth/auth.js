const { getCredentials } = require("../utils/requestUtils");
const User = require("../models/user");
const http = require("http");
// const { getUser } = require("../utils/users");

/**
 * Get current user based on the request headers
 * 
 * @param {http.IncomingMessage} request the request object
 * @returns {object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async (request) => {
    // TODO: 8.5 Implement getting current user based on the "Authorization" request header
    // NOTE: You can import two methods which can be useful here:
    // - getCredentials(request) function from utils/requestUtils.js
    // - getUser(email, password) function from utils/users.js to get the currently logged in user

    const credentials = getCredentials(request);
    if (!credentials || !credentials[0] || !credentials[1]) return null;
    // const user = await getUser(credentials[0], credentials[1]);
    const user = await User.findOne({ email: credentials[0] }).exec();
    if (!user) return null;
    const passwordCorrect = await user.checkPassword(credentials[1]);
    if (!passwordCorrect) return null;
    return user;
};

module.exports = { getCurrentUser };
