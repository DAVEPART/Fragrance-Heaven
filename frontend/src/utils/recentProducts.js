export const RECENT_PRODUCTS_KEY = 'recentViewedProducts';
export const MAX_RECENT_PRODUCTS = 8;

/**
 * Saves a minimal product object to local storage.
 * @param {Object} product - The product data to save.
 */
export const saveRecentProduct = (product) => {
  if (!product || (!product._id && !product.id)) return;

  try {
    const storedProducts = getRecentProducts();
    
    // Create a minimal product object to save space
    const minimalProduct = {
      id: product.id || product._id,
      name: product.name,
      priceBase: product.priceBase || product.price || product.sizes?.[0]?.price,
      price: product.priceBase || product.price || product.sizes?.[0]?.price, 
      imageMain: product.imageMain || (Array.isArray(product.image) ? product.image[0] : product.image),
      image: product.imageMain || (Array.isArray(product.image) ? product.image[0] : product.image),
      category: product.category?.name || product.category || '',
      viewedAt: Date.now()
    };

    // Remove the product if it already exists to avoid duplicates and move to top
    const filteredProducts = storedProducts.filter(p => 
      String(p.id || p._id) !== String(minimalProduct.id)
    );
    
    // Add to the beginning of the array
    filteredProducts.unshift(minimalProduct);

    // Keep only the maximum allowed products
    const limitedProducts = filteredProducts.slice(0, MAX_RECENT_PRODUCTS);

    localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(limitedProducts));
  } catch (error) {
    console.error("Error saving recent product to local storage:", error);
  }
};

/**
 * Retrieves the list of recently viewed products from local storage.
 * @returns {Array} List of recently viewed products.
 */
export const getRecentProducts = () => {
  try {
    const stored = localStorage.getItem(RECENT_PRODUCTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error retrieving recent products from local storage:", error);
    return [];
  }
};

/**
 * Clears the recently viewed products from local storage.
 */
export const clearRecentProducts = () => {
  try {
    localStorage.removeItem(RECENT_PRODUCTS_KEY);
  } catch (error) {
    console.error("Error clearing recent products from local storage:", error);
  }
};
