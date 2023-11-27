const User = require("../models/user");
const responseUtils = require("../utils/responseUtils");
const { validateUser, } = require("../utils/users");
const http = require("http");

/**
 * Send all users as JSON
 * 
 * @param {http.ServerResponse} response The server response object
 * @returns {Promise<void>} Promise resolved when users have been sent
 */
const getAllUsers = async response => {
  const users = await User.find({});
  return responseUtils.sendJson(response, users);
};

/**
 * Delete user and send deleted user as JSON
 * 
 * @param {http.ServerResponse} response The server response object
 * @param {string} userId The user ID to delete
 * @param {object} currentUser (mongoose document object)
 * @returns {Promise<void>} Promise resolved when user has been deleted
 */
const deleteUser = async (response, userId, currentUser) => {
  if (currentUser.id === userId)
    return responseUtils.badRequest(response, "Deleting own data is not allowed");

  const user = await User.findById(userId).exec();
  if (!user) {
    return responseUtils.notFound(response);
  }
  await User.deleteOne({ _id: user._id });
  return responseUtils.sendJson(response, user, 200, "Deleted user Customer");
};

/**
 * Update user and send updated user as JSON
 * 
 * @param {http.ServerResponse} response The server response object
 * @param {string} userId User ID to update
 * @param {object} currentUser (mongoose document object)
 * @param {object} userData JSON data from request body
 * @returns {Promise<void>} Promise resolved when user has been updated
 */
const updateUser = async (response, userId, currentUser, userData) => {
  if (currentUser.id === userId)
    return responseUtils.badRequest(response, "Updating own data is not allowed");

  const user = await User.findById(userId).exec();
  if (!user) {
    return responseUtils.notFound(response);
  }

  if (!userData.role) {
    return responseUtils.badRequest(response, "");
  }

  if (userData.role !== "admin" && userData.role !== "customer") {
    return responseUtils.badRequest(response, "");
  }

  user.role = userData.role;
  await user.save();
  return responseUtils.sendJson(response, user, 200);
};

/**
 * Send user data as JSON
 * 
 * @param {http.ServerResponse} response response object to send the JSON to
 * @param {string} userId user ID to retrieve
 * @param {object} currentUser (mongoose document object)
 * @returns {Promise<void>} Promise resolved when user has been sent
 */
const viewUser = async (response, userId, currentUser) => {
  const user = await User.findById(userId).exec();
  if (!user) {
    return responseUtils.notFound(response);
  }
  return responseUtils.sendJson(response, user, 200);
};

/**
 * Register new user and send created user back as JSON
 * 
 * @param {http.ServerResponse} response The server response object
 * @param {object} userData JSON data from request body
 * @returns {Promise<void>} Promise resolved when user has been created
 */
const registerUser = async (response, userData) => {
  const errors = validateUser(userData);
  if (errors.length > 0) {
    return responseUtils.badRequest(response, errors);
  }
  const existingUser = await User.findOne({ email: userData.email }).exec();
  if (existingUser) {
    return responseUtils.badRequest(response, "Email already in use");
  }
  

  const isEmailOk = String(userData.email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  if (!isEmailOk) {
    return responseUtils.badRequest(response, "");
  }

  if (userData.password.length < 10) {
    return responseUtils.badRequest(response, "");
  }

  const newUser = new User(userData);
  newUser.role = "customer";
  await newUser.save();
  return responseUtils.sendJson(response, newUser, 201);
};

module.exports = { getAllUsers, registerUser, deleteUser, viewUser, updateUser };