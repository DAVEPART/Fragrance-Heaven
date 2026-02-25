import { createContext, useEffect, useState, useCallback } from "react";
import { products } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useAlert } from "./AlertContext";
import api, { getImageUrl } from "../api/api";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = '₹';
    const delivery_fee = 100;
    const navigate = useNavigate();
    const alert = useAlert();
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [cartCount, setCartCount] = useState(0);
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [userData, setUserData] = useState(null);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/api/product/list');
            if (response.data.success) {
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchUserData = useCallback(async (authToken) => {
        if (!authToken) return;
        try {
            const response = await api.get('/api/user/profile', {
                headers: { token: authToken }
            });
            if (response.data.success) {
                setUserData(response.data.user);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            if (error.response?.status === 401) {
                logout();
            }
        }
    }, []);

    const login = (token) => {
        setToken(token);
        localStorage.setItem('token', token);
        fetchUserData(token);
    };

    const logout = () => {
        setToken('');
        setUserData(null);
        setCartItems({});
        setCartCount(0);
        localStorage.removeItem('token');
        navigate('/login');
    };

    useEffect(() => {
        fetchProducts();
        if (token) {
            fetchUserData(token);
        }
    }, [token, fetchUserData]);

    const fetchCartCount = async () => {
        if (!token) return;
        try {
            const response = await api.post('/api/cart/get',
                {},
                {
                    headers: {
                        'token': token
                    }
                }
            );
            if (response.data.success) {
                const cartData = response.data.cartData;
                setCartItems(cartData);

                let count = 0;
                Object.keys(cartData).forEach(itemId => {
                    Object.values(cartData[itemId]).forEach(quantity => {
                        count += quantity;
                    });
                });
                setCartCount(count);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchCartCount();
        }
    }, [token]);

    const addToCart = async (itemId, size, quantity = 1) => {
        if (!size) {
            alert.error('Select product size');
            return;
        }

        if (!token) {
            alert.error('Please login to add items to cart');
            navigate('/login');
            return;
        }

        try {
            const response = await api.post('/api/cart/add',
                { itemId, size, quantity },
                { headers: { token } }
            );

            if (response.data.success) {
                alert.success(response.data.message);
                await fetchCartCount();
            } else {
                alert.error(response.data.message);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert.error('Failed to add to cart');
        }
    }

    const updateQuantity = async (itemId, size, quantity) => {
        try {
            const response = await api.post('/api/cart/update',
                {
                    itemId: itemId,
                    size: size,
                    quantity: quantity
                },
                {
                    headers: {
                        'token': token
                    }
                }
            );

            if (response.data.success) {
                await fetchCartCount();
            } else {
                alert.error(response.data.message);
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            alert.error('Failed to update cart');
        }
    };

    const deleteCartItem = async (itemId) => {
        try {
            const response = await api.delete(`/api/cart/delete/${itemId}`,
                {
                    headers: {
                        'token': token
                    }
                }
            );

            if (response.data.success) {
                alert.success('Item removed');
                await fetchCartCount();
            } else {
                alert.error(response.data.message);
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            alert.error('Failed to delete cart item');
        }
    }

    const getCartCount = () => {
        return cartCount;
    };

    const getCartAmount = useCallback(() => {
        let totalAmount = 0;
        if (products.length > 0 && cartItems) {
            Object.entries(cartItems).forEach(([itemId, sizes]) => {
                const product = products.find(p => p.id === Number(itemId));
                if (product) {
                    Object.entries(sizes).forEach(([size, quantity]) => {
                        // In the new schema, product.sizes is a list of objects { sizeMl, price, ... }
                        // Fallback to old schema if needed for backward compatibility during transition
                        let price = 0;
                        if (Array.isArray(product.sizes) && typeof product.sizes[0] === 'object') {
                            const sizeObj = product.sizes.find(s => s.sizeMl === size);
                            price = sizeObj ? sizeObj.price : (product.priceBase || 0);
                        } else if (Array.isArray(product.price)) {
                            const sizeIndex = product.sizes?.findIndex((s) => s === size);
                            price = product.price[sizeIndex] || 0;
                        }
                        totalAmount += price * quantity;
                    });
                }
            });
        }
        return totalAmount;
    }, [cartItems, products]);

    const value = {
        currency, delivery_fee,
        products,
        navigate,
        search, setSearch,
        showSearch, setShowSearch,
        addToCart, updateQuantity, deleteCartItem,
        cartItems,
        getCartCount, getCartAmount,
        fetchCartCount, getImageUrl,
        token, setToken, login, logout, userData
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;