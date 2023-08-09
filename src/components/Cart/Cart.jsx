import React from "react";
import { useSelector } from "react-redux";
import { Grid, Typography } from "@mui/material";
import { CartItemsWrapper, CartWrapper } from "./styles/Cart.style";
import { CartSummary } from "./CartSummary";
import { CartEntity } from "./CartEntity";

export function Cart() {
  const products = useSelector((state) => state.productsData.products);
  const productsQuantity = useSelector((state) => state.productsData.productsQuantity);

  // Filter products with quantity greater than 0
  const cartItems = products.filter((product) =>
    productsQuantity.some((productQuantity) => productQuantity.productId === product.productId)
  );
  
  function getQuantity(item) {
    return productsQuantity.find((pq) => pq.productId === item.productId)?.quantity;
  }

  return (
    <CartWrapper>
      <CartItemsWrapper>
        <Typography variant="h5">Cart</Typography>
        { cartItems.length ? (
        <Grid container spacing={2}>
          {cartItems.map((cartItem) => (
            <Grid item xs={12} key={cartItem.productId}>
              <CartEntity 
              item={cartItem} />
            </Grid>
          ))}
        </Grid>
         ): (
          <>Your Cart is Empty. Go back to Products to add items to Cart.</>
          )  }
      </CartItemsWrapper>
       
      <CartSummary cartItems={cartItems} getQuantity={(item) => getQuantity(item)} />
    </CartWrapper>
  );
}
