import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        }
      } catch (e) {
        console.error('Failed to parse saved cart', e);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cartItems]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        // For guests, keep the localStorage cart but don't fetch from server
        return;
      }

      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      const serverCart = Array.isArray(data) ? data : [];
      
      // Merge server cart with local cart
      setCartItems(prevItems => {
        const merged = [...prevItems];
        serverCart.forEach(serverItem => {
          const existingIndex = merged.findIndex(
            item => item.productId?._id === serverItem.productId?._id
          );
          if (existingIndex >= 0) {
            // Prefer server quantity if item exists in both
            merged[existingIndex] = serverItem;
          } else {
            merged.push(serverItem);
          }
        });
        return merged;
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const token = localStorage.getItem('token');
      
      // For guests, add to local cart only
      if (!token) {
        setCartItems(prev => {
          const existingItem = prev.find(item => item.productId._id === productId);
          if (existingItem) {
            return prev.map(item =>
              item.productId._id === productId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          }
          return [...prev, { productId: { _id: productId }, quantity }];
        });
        return;
      }

      // For logged-in users, sync with server
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      await fetchCartItems(); // Refresh cart from server
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      // Update local state immediately for better UX
      setCartItems(prev =>
        prev.map(item =>
          item.productId._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:5000/api/cart/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId, quantity: newQuantity })
        });
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      await fetchCartItems(); // Revert to server state if update fails
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      // Remove from local state immediately
      setCartItems(prev => prev.filter(item => item.productId._id !== productId));

      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:5000/api/cart/remove', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId })
        });
      }
    } catch (error) {
      console.error('Error removing item:', error);
      await fetchCartItems(); // Revert to server state if remove fails
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      setCartItems([]); // Clear local state immediately
      
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:5000/api/cart/clear', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      await fetchCartItems(); // Revert to server state if clear fails
      throw error;
    }
  };

  // Initialize cart on mount
  useEffect(() => {
    fetchCartItems();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCartItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};