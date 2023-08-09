import { configureStore } from "@reduxjs/toolkit";
import productsSlice from "./productsSlice";

// const getStoredProductsQuantity = () => {
//   const storedProductsQuantity = localStorage.getItem("productsQuantity");
//   return storedProductsQuantity
//     ? { productsData: { productsQuantity: JSON.parse(storedProductsQuantity) } }
//     : { productsData: { productsQuantity: [] } };
// };

const store = configureStore({
  reducer: {
    productsData: productsSlice,
  },
//  preloadedState: getStoredProductsQuantity(),
});

store.subscribe(() => {
  const productsQuantity = store.getState();
  localStorage.setItem(
    "productsQuantity",
    JSON.stringify(productsQuantity.productsData.productsQuantity)
  );

});

export default store;
