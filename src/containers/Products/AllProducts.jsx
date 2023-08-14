import React from "react";
import { Products } from "./Products";
import { useSelector } from "react-redux";

export function AllProducts() {
  const products = useSelector((state) => state.productsData.products);
  return <Products products={products} />;
}
