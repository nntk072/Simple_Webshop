/**
 * @param {string} productId The product ID to add to the cart
 * @param {string} productName The product name to show in the notification
 * @returns {HTMLElement} button element
 */
const addToCart = (productId, productName) => {
  const count = addProductToCart(productId);
  return createNotification(`Added ${productName} to cart!`, 'notifications-container', false);
};
(async () => {
  const productsContainer = document.getElementById('products-container');
  const productTemplate = document.getElementById('product-template');
  const products = await getJSON('/api/products');
  products.forEach(product => {
    const productClone = productTemplate.content.cloneNode(true);

    // Product assign
    const name = productClone.querySelector('.product-name');
    name.textContent = product.name;
    name.id = `name-${product._id}`;

    // Price assign
    const price = productClone.querySelector('.product-price');
    price.textContent = product.price;
    price.id = `price-${product._id}`;

    // Production assign
    const description = productClone.querySelector('.product-description');
    description.textContent = product.description;
    description.id = `description-${product._id}`;

    const addToCartButton = productClone.querySelector('button');
    addToCartButton.id = `add-to-cart-${product._id}`;
    addToCartButton.addEventListener('click', () => {
      addToCart(product._id, product.name);
    });

    productsContainer.appendChild(productClone);
  });
})();