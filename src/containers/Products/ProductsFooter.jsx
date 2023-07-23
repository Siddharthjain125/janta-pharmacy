import React from "react";
import PropTypes from "prop-types";
import { Button } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import { FooterWrapper } from "./styles/ProductsFooter.style";

export function ProductsFooter(props) {
  const { productQuantity,  onAdd, onDecreaseQuantity, onIncreaseQuantity } = props;
  if (productQuantity === 0)
    return (
        <FooterWrapper>
      <Button className="product-quantity-btn" size="small" color="primary" onClick={onAdd}>
        ADD
      </Button>
      </FooterWrapper>
    );
  return (
    <FooterWrapper>
      <Button className="product-remove-btn" size="small" color="primary" onClick={onDecreaseQuantity}>
        <RemoveIcon/>
      </Button>
      <span>{productQuantity}</span>
      <Button className="product-add-btn" size="small" color="primary" onClick={onIncreaseQuantity}>
        <AddIcon/>
      </Button>
    </FooterWrapper>
  );
}

ProductsFooter.propTypes = {
  productQuantity: PropTypes.number,
  onAdd: PropTypes.func,
  onDecreaseQuantity: PropTypes.func,
  onIncreaseQuantity: PropTypes.func
};
ProductsFooter.defaultProps = {
  productQuantity: 0,
  onAdd: null,
  onDecreaseQuantity: null,
  onIncreaseQuantity: null
};
