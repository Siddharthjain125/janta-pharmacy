// src/redux/counterSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { mockData } from '../mockData/Products';

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    products: [...mockData],
  },
  reducers: {
    updateProductQuantity: (state, action) => {
      const { productId, change } = action.payload;
      const clonedProducts = [...state.products];
      const updatedProductsData = clonedProducts.map((data) => {
        if (data.productId === productId)
          return { ...data, quantity: data.quantity + change };
        else return data;
      });
      state.products = updatedProductsData;
    },
  },
});

export const { updateProductQuantity } = counterSlice.actions;

export default counterSlice.reducer;
