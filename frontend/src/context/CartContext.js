import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  loading: false,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'CALCULATE_TOTALS':
      const total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
      return {
        ...state,
        total,
        itemCount,
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Fetch cart from backend on mount or when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      dispatch({ type: 'SET_CART', payload: [] });
    }
    // eslint-disable-next-line
  }, [isAuthenticated]);

  useEffect(() => {
    dispatch({ type: 'CALCULATE_TOTALS' });
  }, [state.items]);

  const fetchCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await api.get('/cart');
      dispatch({ type: 'SET_CART', payload: res.data });
    } catch (err) {
      toast.error('Failed to fetch cart');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToCart = async (product, quantity = 1) => {
    // No redirect logic here; handle in page components
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await api.post('/cart/add', { productId: product._id, quantity });
      dispatch({ type: 'SET_CART', payload: res.data });
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message === 'Product is out of stock') {
        toast.error('This product is out of stock!');
      } else {
        toast.error('Failed to add to cart');
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await api.put('/cart/update', { productId, quantity });
      dispatch({ type: 'SET_CART', payload: res.data });
    } catch (err) {
      toast.error('Failed to update cart');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeFromCart = async (productId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await api.delete('/cart/remove', { data: { productId } });
      dispatch({ type: 'SET_CART', payload: res.data });
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await api.delete('/cart/clear');
      dispatch({ type: 'SET_CART', payload: res.data });
      toast.success('Cart cleared');
    } catch (err) {
      toast.error('Failed to clear cart');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        fetchCart,
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