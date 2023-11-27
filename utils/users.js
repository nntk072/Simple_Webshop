/**
 * Week 08 utility file for user related operations
 *
 * NOTE: This file will be abandoned during week 09 when a database will be used
 * to store all data.
 */

/**
 * Use this object to store users
 *
 * An object is used so that users can be reset to known values in tests
 * a plain const could not be redefined after initialization but object
 * properties do not have that restriction.
 */
const data = {
    // make copies of users (prevents changing from outside this module/file)
    users: require("../users.json").map((user) => ({ ...user })),
    roles: ["customer", "admin"],
};

/**
 * Reset users back to their initial values (helper function for tests)
 *
 * NOTE: DO NOT EDIT OR USE THIS FUNCTION THIS IS ONLY MEANT TO BE USED BY TESTS
 * Later when database is used this will not be necessary anymore as tests can reset
 * database to a known state directly.
 */
const resetUsers = () => {
    // make copies of users (prevents changing from outside this module/file)
    data.users = require("../users.json").map((user) => ({ ...user }));
};

/**
 * Generate a random string for use as user ID
 * 
 * @returns {string} random string
 */
const generateId = () => {
    // let id;

    // do {
    //     // Generate unique random id that is not already in use
    //     // Shamelessly borrowed from a Gist. See:
    //     // https://gist.github.com/gordonbrander/2230317

    //     id = Math.random().toString(36).substr(2, 9);
    // } 
    // while (data.users.some((u) => u._id === id));
    // return id;
    
    const id = Math.random().toString(36).substr(2, 9);
    
    if (data.users.some((u) => u._id === id)) {
        // If the generated ID is already in use, call the function recursively
        return generateUniqueId();
    } else {
        // If the generated ID is unique, return it
        return id;
    }
};

/**
 * Check if email is already in use by another user
 * 
 * @param {string} email The email to check
 * @returns {boolean} True if email is already in use, false otherwise
 */
const emailInUse = (email) => data.users.some((user) => user.email === email);

/**
 * Return user object with the matching email and password or undefined if not found
 *
 * Returns a copy of the found user and not the original
 * to prevent modifying the user outside of this module.
 * 
 * @param {string} email The email to check
 * @param {string} password The password to check
 * @returns {object|undefined} user object or undefined if user not found
 */
const getUser = (email, password) => {
    const user = data.users.find(
        (usr) => usr.email === email && usr.password === password
    );
    return user && { ...user };
};

/**
 * Return user object with the matching ID or undefined if not found.
 * 
 * Returns a copy of the user and not the original
 * to prevent modifying the user outside of this module.
 * 
 * @param {string} userId The user ID to check
 * @returns {object|undefined} The user object or undefined if user not found
 */
const getUserById = (userId) => {
    // TODO: 8.4 Find user by user id
    const user = data.users.find((usr) => usr._id === userId);
    return user && { ...user };
};

/**
 * Delete user by its ID and return the deleted user
 * 
 * @param {string} userId The user ID to check
 * @returns {object|undefined} deleted user or undefined if user does not exist
 */
const deleteUserById = (userId) => {
    // TODO: 8.4 Delete user with a given id
    // Hint: Array's findIndex() with user ID can could be used to find the user, and Array's splice() method can be used to "extract" the user object.
    const index = data.users.findIndex((user) => user._id === userId);
    if (index === -1) return undefined;

    const deletedUser = { ...data.users[index] };
    data.users.splice(index, 1);
    return deletedUser;
};

/**
 * Return all users
 *
 * Returns copies of the users and not the originals
 * to prevent modifying them outside of this module.
 * 
 * @returns {Array<object>} Array of user objects
 */
const getAllUsers = () => data.users.map((user) => ({ ...user }));

/**
 * Save new user
 *
 * Saves user only in memory until node process exits (no data persistence)
 * Save a copy and return a (different) copy of the created user
 * to prevent modifying the user outside this module.
 *
 * DO NOT MODIFY OR OVERWRITE users.json
 * 
 * @param {object} user object containing at least name, email and password
 * @returns {object} copy of the created user
 */
const saveNewUser = (user) => {
    // Use generateId() to assign a unique id to the newly created user.
    const newUser = { ...user };
    newUser._id = generateId();
    if (!newUser.role) newUser.role = "customer";
    newUser.role = "customer";
    data.users.push(newUser);
    return { ...newUser };
};

/**
 * Update user's role
 *
 * Updates user's role or throws an error if role is unknown (not "customer" or "admin")
 *
 * Returns a copy of the user and not the original
 * to prevent modifying the user outside of this module.
 * 
 * @param {string} userId The user ID to check
 * @param {string} role "customer" or "admin"
 * @returns {object|undefined} copy of the updated user or undefined if user does not exist
 * @throws {Error} error object with message "Unknown role"
 */
const updateUserRole = (userId, role) => {
    // TODO: 8.4 Update user's role
    const index = data.users.findIndex((user) => user._id === userId);
    if (index === -1) return undefined;
    if (!data.roles.includes(role)) throw new Error("Unknown role");
    const updatedUser = { ...data.users[index] };
    updatedUser.role = role;
    data.users[index] = updatedUser;
    return { ...updatedUser };
};

/**
 * Validate user object (Very simple and minimal validation)
 *
 * This function can be used to validate that user has all required
 * fields before saving it.
 * 
 * @param {object} user user object to be validated
 * @returns {Array<string>} Array of error messages or empty array if user is valid.
 */
const validateUser = (user) => {
    const errors = [];

    if (!user.name) errors.push("Missing name");
    if (!user.email) errors.push("Missing email");
    if (!user.password) errors.push("Missing password");
    if (user.role && !data.roles.includes(user.role))
        errors.push("Unknown role");

    return errors;
};

module.exports = {
    deleteUserById,
    emailInUse,
    getAllUsers,
    getUser,
    getUserById,
    resetUsers,
    saveNewUser,
    updateUserRole,
    validateUser,
};
