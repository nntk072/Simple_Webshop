const data = {
    products: require("../products.json").map((prd) => ({...prd}))
};

/**
 * Return all products
 * Returns copies of the products and not the originals
 * to prevent modifying them outside of this module.
 * 
 * @returns {Array<object>} all products
 */
const getAllProducts = () => data.products.map((prd) => ({ ...prd}));

module.exports = {
    getAllProducts,
};