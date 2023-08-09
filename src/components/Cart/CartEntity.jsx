import React, { useState } from "react";
import {
  CartItem,
  DeleteButton,
  DeleteConfirmation,
  Discount,
  DiscountedPrice,
  ItemDetails,
  PackagingInfo,
  PricingInfo,
  ProductImage,
  QuantityButtons,
  TitleWrapper,
} from "./styles/Cart.style";
import { Button, Divider, Typography } from "@mui/material";
import { Add, HorizontalRule, Remove } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { updateProductQuantity } from "../../redux/productsSlice";

export function CartEntity(props) {
  const { item } = props;
  const [deletionConfirmation, setDeletionConfirmation] = useState(null);
  const dispatch = useDispatch();
  const products = useSelector((state) => state.productsData.products);
  const productsQuantity = useSelector((state) => state.productsData.productsQuantity);

  function getQuantity(item) {
    return productsQuantity.find((pq) => pq.productId === item.productId)?.quantity;
  }

  const handleIncreaseQuantity = (productId) => {
    dispatch(updateProductQuantity({ productId, change: 1 }));
    setDeletionConfirmation(null);
  };

  const handleDecreaseQuantity = (productId) => {
    const product = products.find((product) => product.productId === productId);
    if (getQuantity(product) === 1) {
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
        change: -productsQuantity.find((product) => product.productId === productId).quantity,
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
          <span>{getQuantity(item)}</span>
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
            <Button
              className="delete-confirmation-button"
              size="small"
              color="primary"
              onClick={() => handleConfirmDelete(item.productId)}
            >
              Delete
            </Button>
            <Button
              className="delete-confirmation-button"
              size="small"
              color="primary"
              onClick={() => handleCancelDelete()}
            >
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
          MRP: ₹{item.mrp * getQuantity(item)}
        </Typography>
        <Discount variant="body2" color="red">
          Discount - ₹{item.mrp * getQuantity(item) - item.ourPrice * getQuantity(item)}
        </Discount>
        <HorizontalRule />
        <Typography variant="body1" color="primary">
          = ₹{getQuantity(item) * item.ourPrice}
        </Typography>
      </PricingInfo>
    </CartItem>
  );
}
