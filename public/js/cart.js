const addToCart = productId => {
  // TODO 9.2
  // use addProductToCart(), available already from /public/js/utils.js
  // call updateProductAmount(productId) from this file
  addProductToCart(productId);
  updateProductAmount(productId);
};

const decreaseCount = productId => {
  // TODO 9.2
  // Decrease the amount of products in the cart, /public/js/utils.js provides decreaseProductCount()
  // Remove product from cart if amount is 0,  /public/js/utils.js provides removeElement = (containerId, elementId
  const count = decreaseProductCount(productId);
  if (count <= 0) {
    removeElement('cart-container', productId);
  }
  else {
    updateProductAmount(productId)
  }
};

const updateProductAmount = productId => {
  // TODO 9.2
  // - read the amount of products in the cart, /public/js/utils.js provides getProductCountFromCart(productId)
  // - change the amount of products shown in the right element's innerText
  const count = getProductCountFromCart(productId);
  const element = document.querySelector(`#amount-${productId}`);
  element.textContent = `${count}x`;
};

const placeOrder = async() => {
  // TODO 9.2
  // Get all products from the cart, /public/js/utils.js provides getAllProductsFromCart()
  // show the user a notification: /public/js/utils.js provides createNotification = (message, containerId, isSuccess = true)
  // for each of the products in the cart remove them, /public/js/utils.js provides removeElement(containerId, elementId)
  const notification = createNotification('msg', 'cart-container', true);
  const productsInCart = getAllProductsFromCart();
  productsInCart.forEach(product => {
    removeElement('cart-container', product.name);
  });
  clearCart();
};

(async() => {
  // TODO 9.2
  // - get the 'cart-container' element
  // - use getJSON(url) to get the available products
  // - get all products from cart
  // - get the 'cart-item-template' template
  // - for each item in the cart
  //    * copy the item information to the template
  //    * hint: add the product's ID to the created element's as its ID to 
  //        enable editing ith 
  //    * remember to add event listeners for cart-minus-plus-button
  //        cart-minus-plus-button elements. querySelectorAll() can be used 
  //        to select all elements with each of those classes, then its 
  //        just up to finding the right index.  querySelectorAll() can be 
  //        used on the clone of "product in the cart" template to get its two
  //        elements with the "cart-minus-plus-button" class. Of the resulting
  //        element array, one item could be given the ID of 
  //        `plus-${product_id`, and other `minus-${product_id}`. At the same
  //        time we can attach the event listeners to these elements. Something 
  //        like the following will likely work:
  //          clone.querySelector('button').id = `add-to-cart-${prodouctId}`;
  //          clone.querySelector('button').addEventListener('click', () => addToCart(productId, productName));
  //
  // - in the end remember to append the modified cart item to the cart 

  const cartContainer = document.getElementById('cart-container');
  const products = await getJSON('/api/products');
  const cartProduct = getAllProductsFromCart();
  const cartItemTemplate = document.getElementById('cart-item-template');
  cartProduct.forEach(cacheProd => {
      const product = products.find(item => item._id === cacheProd.name);

      const cartItemClone = cartItemTemplate.content.cloneNode(true);

      const row = cartItemClone.querySelector('.item-row');
      row.id = `${product._id}`;

      const nameElement = cartItemClone.querySelector('.product-name');
      nameElement.textContent = product.name;
      nameElement.id = `name-${product._id}`;

      const priceElement = cartItemClone.querySelector('.product-price');
      priceElement.textContent = product.price;
      priceElement.id = `price-${product._id}`;

      const amountElement = cartItemClone.querySelector('.product-amount');
      amountElement.textContent = `${sessionStorage.getItem(product._id)}x`;
      amountElement.id = `amount-${product._id}`;

      cartItemClone.id = `cart-item-${product._id}`;

      const buttons = cartItemClone.querySelectorAll('.cart-minus-plus-button');
      const plusButton = buttons[0];
      const minusButton = buttons[1];

      plusButton.id = `plus-${product._id}`;
      plusButton.addEventListener('click', () => {
          addToCart(product._id);
      });
      minusButton.id = `minus-${product._id}`;
      minusButton.addEventListener('click', () => {
          decreaseCount(product._id);
      });
      cartContainer.appendChild(cartItemClone);
  });

  const placeOrderButton = document.querySelector('#place-order-button');
  placeOrderButton.addEventListener('click', () => {
    placeOrder();
  })
})();