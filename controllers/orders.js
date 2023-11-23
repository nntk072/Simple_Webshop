const responseUtils = require("../utils/responseUtils");
const Order = require('../models/order');

/**
 * Send all orders as JSON
 *
 * @param {http.ServerResponse} response
 */
const getAllOrdersForAdmin = async response => {
  const adminOrders = await Order.find({});
  return responseUtils.sendJson(response, adminOrders, 200);
};

const Order = require("../models/order");

const getOrdersForCustomer = async (customerId) => {
  const customerOrders = await Order.find({ customerId });
  return responseUtils.sendJson(response, customerOrders, 200);
};

module.exports = { getAllOrdersForAdmin, getOrdersForCustomer };
