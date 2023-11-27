const responseUtils = require("../utils/responseUtils");
const Product = require('../models/product');

/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response
 */
const getAllProducts = async response => {
  const data = await Product.find({});
  return responseUtils.sendJson(response, data, 200);
};

const getProductById = async (response, productId) => {
  const data =  await Product.findById(productId).exec();
  if (!data) {
    return responseUtils.notFound(response);
  }
  return responseUtils.sendJson(response, data, 200);
};

const updateProductById = async (response, productId, newData) => {
  const data =  await Product.findById(productId).exec();
  if (!data) {
    return responseUtils.notFound(response);
  }

  if ('name' in newData) {
    if (newData.name === '') {
      return responseUtils.badRequest(response, "New name is empty");
    }
  }

  if ('price' in newData) {
    if (isNaN(newData.price) || newData.price <= 0.0) {
      return responseUtils.badRequest(response, "New price is invalid");
    }
  }

  const filter = { _id: productId};
  const updated = await Product.findOneAndUpdate(filter, newData, {
    new: true
  });
  return responseUtils.sendJson(response, updated, 200);
}

const deleteProductById = async (response, productId) => {
  const product = await Product.findById(productId).exec();
  if (!product) {
    return responseUtils.notFound(response);
  }
  await Product.deleteOne({_id: product._id});
  return responseUtils.sendJson(response, product, 200);
};

const createProduct = async (response, productData) => {
  if (!('name' in productData)) {
    return responseUtils.badRequest(response, "Name not found");
  }

  if (!('price' in productData)) {
    return responseUtils.badRequest(response, "Price not found");
  }

  const newProduct = new Product(productData);
  await newProduct.save();
  return responseUtils.sendJson(response, newProduct, 201);
}

module.exports = { getAllProducts, getProductById, updateProductById, deleteProductById, createProduct };