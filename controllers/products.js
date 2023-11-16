const responseUtils = require("../utils/responseUtils");

/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response
 */
const getAllProducts = async response => {
  data = require("../utils/products").getAllProducts();
  return responseUtils.sendJson(response, data, 200);
};

module.exports = { getAllProducts };