import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Divider, Grid, Typography } from "@mui/material";
import { updateProductQuantity } from "../../redux/productsSlice";
import {
  CartItem,
  CartItemsWrapper,
  CartWrapper,
  CouponCodeInput,
  DeleteButton,
  DeleteConfirmation,
  Discount,
  DiscountedPrice,
  ItemDetails,
  PackagingInfo,
  PricingInfo,
  ProductImage,
  QuantityButtons,
  SummaryWrapper,
  TitleWrapper,
} from "./styles/Cart.style";
import { Add, HorizontalRule, Remove } from "@mui/icons-material";

export function Cart() {
  const [deletionConfirmation, setDeletionConfirmation] = useState(null);
  const dispatch = useDispatch();
  const products = useSelector((state) => state.productsData.products);

  // Filter products with quantity greater than 0
  const cartItems = products.filter((product) => product.quantity > 0);

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.ourPrice * item.quantity, 0);
  };

  const getTotalMRP = () => {
    return cartItems.reduce((total, item) => total + item.mrp * item.quantity, 0);
  };

  const getTotalSavings = () => {
    return getTotalMRP() - getTotalPrice();
  };

  const handleIncreaseQuantity = (productId) => {
    dispatch(updateProductQuantity({ productId, change: 1 }));
    setDeletionConfirmation(null);
  };

  const handleDecreaseQuantity = (productId) => {
    const product = products.find((product) => product.productId === productId);
    if (product.quantity === 1) {
      setDeletionConfirmation(productId);
    } else {
      dispatch(updateProductQuantity({ productId, change: -1 }));
      setDeletionConfirmation(null);
    }
  };

  const handleConfirmDelete = (productId) => {
    dispatch(
      updateProductQuantity({
        productId,
        change: -products.find((product) => product.productId === productId).quantity,
      })
    );
    setDeletionConfirmation(null);
  };

  const handleCancelDelete = () => {
    setDeletionConfirmation(null);
  };

  const handleDeleteItem = (productId) => {
    setDeletionConfirmation(productId);
  };

  return (
    <CartWrapper>
      <CartItemsWrapper>
        <Typography variant="h5">Cart</Typography>
        <Grid container spacing={2}>
          {cartItems.map((item) => (
            <Grid item xs={12} key={item.productId}>
              <CartItem>
                <ProductImage component="img" image={item.image} alt={item.title} />
                <ItemDetails>
                  <TitleWrapper>
                    <Typography variant="body1">{item.title}</Typography>
                  </TitleWrapper>
                  <PackagingInfo variant="body2" color="text.secondary">
                    {item.packaging}
                  </PackagingInfo>
                  <QuantityButtons>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleDecreaseQuantity(item.productId)}
                    >
                      <Remove />
                    </Button>
                    <span>{item.quantity}</span>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleIncreaseQuantity(item.productId)}
                    >
                      <Add />
                    </Button>
                  </QuantityButtons>
                  <DiscountedPrice variant="body2" color="text.secondary">
                    Our Price: ₹{item.ourPrice}
                  </DiscountedPrice>

                  {deletionConfirmation === item.productId ? (
                    <DeleteConfirmation>
                      <Typography variant="body2" color="error">
                        Do you really want to delete the item?
                      </Typography>
                      <Button  className="delete-confirmation-button"
                        size="small"
                        color="primary"
                        onClick={() => handleConfirmDelete(item.productId)}
                      >
                        Delete
                      </Button>
                      <Button className="delete-confirmation-button"
                       size="small" color="primary" onClick={() => handleCancelDelete()}>
                        Cancel
                      </Button>
                    </DeleteConfirmation>
                  ) : (
                    <DeleteButton
                      size="small"
                      color="secondary"
                      onClick={() => handleDeleteItem(item.productId)}
                    >
                      Delete
                    </DeleteButton>
                  )}
                </ItemDetails>
                <Divider orientation="vertical" variant="middle" flexItem />
                <PricingInfo>
                  <Typography variant="body2" color="text.secondary">
                    MRP: ₹{item.mrp * item.quantity}
                  </Typography>
                  <Discount variant="body2" color="red">
                    Discount - ₹{item.mrp * item.quantity - item.ourPrice * item.quantity}
                  </Discount>
                  <HorizontalRule />
                  <Typography variant="body1" color="primary">
                    = ₹{item.quantity * item.ourPrice}
                  </Typography>
                </PricingInfo>
              </CartItem>
            </Grid>
          ))}
        </Grid>
      </CartItemsWrapper>
      <SummaryWrapper>
        <Typography variant="h5">Summary</Typography>
        <Typography variant="body1" style={{ marginTop: "10px" }}>
          Total MRP: ₹{getTotalMRP()}
        </Typography>
        <Typography variant="body1">
          Total Price: ₹{getTotalPrice()} (You Save: ₹{getTotalSavings()})
        </Typography>
        <CouponCodeInput label="Coupon Code" variant="outlined" fullWidth />
        <Button variant="text" color="primary">
          Apply Coupon
        </Button>
        <Button variant="contained" color="primary">
          Checkout
        </Button>
      </SummaryWrapper>
    </CartWrapper>
  );
}
