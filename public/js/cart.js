const addToCart = productId => {
  addProductToCart(productId);
  updateProductAmount(productId);
};

const decreaseCount = productId => {
  const count = decreaseProductCount(productId);
  if (count <= 0) {
    const element = document.getElementById(productId);
    element.remove();
  }
  else {
    updateProductAmount(productId)
  }
};

const updateProductAmount = productId => {
  const count = getProductCountFromCart(productId);
  const element = document.querySelector(`#amount-${productId}`);
  element.textContent = `${count}x`;
};

const placeOrder = async() => {
  const notification = createNotification('msg', 'cart-container', true);
  const productsInCart = getAllProductsFromCart();
  productsInCart.forEach(product => {
    removeElement('cart-container', product.name);
  });
  clearCart();
};

(async() => {
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