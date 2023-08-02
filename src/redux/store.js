// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import productsSlice from './productsSlice';

const store = configureStore({
  reducer: {
    productsData: productsSlice, // Add the counterReducer to the store under the 'counter' slice
  },
});

export default store;
