import React from "react";
import { Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { FooterButtons, FooterWrapper, PriceDiscount, PriceInfo } from "./styles/ProductsFooter.style";

export function ProductsFooter(props) {
  const { productQuantity, onAdd, onDecreaseQuantity, onIncreaseQuantity, mrp, ourPrice } = props;
  const percentageSaving = ((mrp - ourPrice) / mrp) * 100;

  return (
    <FooterWrapper>
      <PriceInfo>
        <PriceDiscount>
          <Typography variant="body2" color="text.secondary" className="mrp">
            MRP: ₹{mrp}
          </Typography>
          {percentageSaving > 0 && (
            <Typography variant="body2" className="percentage-saving">
              {percentageSaving.toFixed(2)}% off
            </Typography>
          )}
        </PriceDiscount>
        <Typography variant="body2" color="text.secondary" className="our-price">
          Our Price: ₹{ourPrice}
        </Typography>
      </PriceInfo>
      <FooterButtons>
        {productQuantity === 0 ? (
          <Button className="product-quantity-btn" size="small" color="primary" onClick={onAdd}>
            ADD
          </Button>
        ) : (<>
            <Button
              className="product-remove-btn"
              size="small"
              color="primary"
              onClick={onDecreaseQuantity}
            >
              <RemoveIcon fontSize="small"/>
            </Button>
            <span>{productQuantity}</span>
            <Button
              className="product-add-btn"
              size="small"
              color="primary"
              onClick={onIncreaseQuantity}
            >
              <AddIcon fontSize="small"/>
            </Button>
          </>
        )}
      </FooterButtons>
    </FooterWrapper>
  );
}