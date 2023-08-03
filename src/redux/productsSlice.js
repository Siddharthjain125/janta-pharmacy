// productSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { mockData } from '../mockData/Products';

// Retrieve data from local storage
const getStoredProducts = () => {
  const storedData = localStorage.getItem('productsData');
  return storedData ? JSON.parse(storedData) : [...mockData];
};

const productsSlice = createSlice({
  name: 'productsSlice',
  initialState: {
    products: getStoredProducts(),
  },
  reducers: {
    updateProductQuantity: (state, action) => {
      const { productId, change } = action.payload;
      const clonedProducts = [...state.products];
      const updatedProductsData = clonedProducts.map((data) => {
        if (data.productId === productId) return { ...data, quantity: data.quantity + change };
        else return data;
      });
      state.products = updatedProductsData;
    },
  },
});

export const { updateProductQuantity } = productsSlice.actions;

export default productsSlice.reducer;
