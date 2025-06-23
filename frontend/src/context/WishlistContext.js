import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

const initialState = {
  wishlist: [],
  loading: false,
};

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case 'SET_WISHLIST':
      return {
        ...state,
        wishlist: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      dispatch({ type: 'SET_WISHLIST', payload: [] });
    }
    // eslint-disable-next-line
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await api.get('/wishlist');
      dispatch({ type: 'SET_WISHLIST', payload: res.data });
    } catch (err) {
      toast.error('Failed to fetch wishlist');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToWishlist = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your wishlist.');
      return;
    }
    try {
      const res = await api.post('/wishlist', { productId: product._id });
      dispatch({ type: 'SET_WISHLIST', payload: res.data });
      toast.success(`${product.name} added to wishlist`);
    } catch (err) {
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return; 
    try {
      const res = await api.delete(`/wishlist/${productId}`);
      dispatch({ type: 'SET_WISHLIST', payload: res.data });
      toast.success('Item removed from wishlist');
    } catch (err) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const toggleWishlist = (product) => {
    if (!isAuthenticated) {
      toast.error('Please log in to manage your wishlist.');
      return;
    }
    if (state.wishlist.find((item) => item._id === product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const isWishlisted = (productId) => {
    if (!isAuthenticated) return false;
    return state.wishlist.some((item) => item._id === productId);
  }

  return (
    <WishlistContext.Provider value={{ ...state, addToWishlist, removeFromWishlist, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}; 