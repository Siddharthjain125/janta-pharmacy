// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';

const store = configureStore({
  reducer: {
    counter: counterReducer, // Add the counterReducer to the store under the 'counter' slice
  },
});

export default store;
