import { createSlice } from '@reduxjs/toolkit';
import { mockData } from '../mockData/Products';

// Retrieve data from local storage
const getStoredProductsQuantity = () => {
  const storedProductsQuantity = localStorage.getItem('productsQuantity');
  return storedProductsQuantity ? JSON.parse(storedProductsQuantity) : [];
};

const productsSlice = createSlice({
  name: 'productsSlice',
  initialState: {
    products: [...mockData],
    productsQuantity: getStoredProductsQuantity()
  },
  reducers: {
    updateProductQuantity: (state, action) => {
      const { productId, change } = action.payload;
      const clonedProductsQuantity = [...state.productsQuantity];
      const updatedProductsData = clonedProductsQuantity.map((data) => {
        if (data.productId === productId) {
          const newQuantity = data.quantity + change;
          if(newQuantity === 0) {
              return undefined;
          }
          else
          return { ...data, quantity: newQuantity};
        }
        else return data;
      });
      state.productsQuantity = updatedProductsData.filter(Boolean); 
    },
    addFirstProductQuantity: (state, action) => {
      const {productId} = action.payload;
      const clonedProductsQuantity = state.productsQuantity;
      const updatedProductsData =[
        ...clonedProductsQuantity,
        {
          'productId': productId,
          quantity: 1
        }
      ];
      state.productsQuantity = updatedProductsData;
    },
    deleteProductsQuantity: (state, action) => {
      const {productId} = action.payload;
      const indexToDelete = state.productsQuantity.findIndex(item => item.productId === productId);
      if (indexToDelete !== -1) {
        state.productsQuantity.splice(indexToDelete, 1);
      }
    }
  },
});

export const { updateProductQuantity, addFirstProductQuantity,deleteProductsQuantity } = productsSlice.actions;

export default productsSlice.reducer;
