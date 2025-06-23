import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const SESSION_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: action.payload,
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

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check session expiry
  const checkSessionExpiry = () => {
    const loginTime = localStorage.getItem('loginTime');
    if (loginTime) {
      const now = Date.now();
      const timeDiff = now - parseInt(loginTime);
      
      if (timeDiff > SESSION_DURATION) {
        // Session expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('loginTime');
        dispatch({ type: 'LOGOUT' });
        toast.error('Session expired. Please login again.');
        return false;
      }
    }
    return true;
  };

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const loginTime = localStorage.getItem('loginTime');
      
      // Check if token exists and session is valid
      if (token && loginTime && checkSessionExpiry()) {
        try {
          const response = await api.get('/users/profile');
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: response.data,
              token,
            },
          });
        } catch (error) {
          console.log('Token validation failed, clearing auth data');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('loginTime');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        // No valid token, set loading to false
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();

    // Set up periodic session check (every 5 minutes)
    const sessionCheckInterval = setInterval(() => {
      if (state.isAuthenticated) {
        checkSessionExpiry();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(sessionCheckInterval);
  }, [state.isAuthenticated]);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post('/auth/login', { email, password });
      const { _id, name, email: userEmail, isAdmin, token, phone, address } = response.data;
      const user = { _id, name, email: userEmail, isAdmin, phone, address };
      const loginTime = Date.now();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('loginTime', loginTime.toString());
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
      toast.success('Login successful!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post('/auth/register', userData);
      const { _id, name, email: userEmail, isAdmin, token, phone } = response.data;
      const user = { _id, name, email: userEmail, isAdmin, phone };
      const loginTime = Date.now();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('loginTime', loginTime.toString());
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      const { _id, name, email, isAdmin, phone, address } = response.data;
      const user = { _id, name, email, isAdmin, phone, address };
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: user,
      });
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Profile update failed');
      return false;
    }
  };

  // Get remaining session time
  const getSessionTimeRemaining = () => {
    const loginTime = localStorage.getItem('loginTime');
    if (loginTime) {
      const now = Date.now();
      const timeDiff = SESSION_DURATION - (now - parseInt(loginTime));
      return Math.max(0, timeDiff);
    }
    return 0;
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
        getSessionTimeRemaining,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 