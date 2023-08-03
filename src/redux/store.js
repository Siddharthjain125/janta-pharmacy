// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import productsSlice from './productsSlice';

// Retrieve data from local storage
const getStoredState = () => {
  const storedState = localStorage.getItem('reduxState');
  return storedState ? JSON.parse(storedState) : undefined;
};

const store = configureStore({
  reducer: {
    productsData: productsSlice, // Add the productsSlice reducer to the store under the 'productsData' slice
  },
  preloadedState: getStoredState(), // Initialize store with stored data if available
});

// Save data to local storage whenever store state changes
store.subscribe(() => {
  const state = store.getState();
  localStorage.setItem('reduxState', JSON.stringify(state));
});

export default store;
