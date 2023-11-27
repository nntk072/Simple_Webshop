const Order = require("../models/order");
const responseUtils = require("../utils/responseUtils");

/**
 * Send all orders as JSON
 *
 * @param {http.ServerResponse} response
 */
const getAllOrders = async (response) => {
  const orders = await Order.find({});
  return responseUtils.sendJson(response, orders);
};

/**
 * Retrieve orders for a specific customer by customerId and send them as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} customerId ID of the customer to fetch orders for
 */
const getCustomerOrders = async (response, customerId) => {
  const customerOrders = await Order.find({ customerId });
  return responseUtils.sendJson(response, customerOrders);
};

/**
 * Retrieve an order by ID and send it as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} orderId ID of the order to retrieve
 * @param {Object} currentUser Current user object with role information
 */
const getOrderById = async (response, orderId, currentUser) => {
    const order = await Order.findById(orderId);

    if (!order) {
      return responseUtils.notFound(response);
    }

    // Check if the current user is an admin or if the order belongs to the current user (customer)
    if (currentUser.role === "admin" || order.customerId === currentUser._id) {
      // Return the order if it belongs to the user or if the user is an admin
      return responseUtils.sendJson(response, order);
    } else {
      // Unauthorized access for customer trying to access someone else's order
      return responseUtils.notFound(response);
    }
};

/**
 * Create a new order and send it back as JSON
 *
 * @param {http.ServerResponse} response
 * @param {Object} orderData JSON data from request body
 * @param {string} customerId ID of the customer to place orders for
 */
const createNewOrder = async (response, orderData, userId) => {

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

  const newOrder = new Order({
    customerId: userId,
    items: orderData.items 
  });

  await newOrder.save();
  return responseUtils.sendJson(response, newOrder, 201);
};

module.exports = {
  getAllOrders,
  getCustomerOrders,
  getOrderById,
  createNewOrder,
};
