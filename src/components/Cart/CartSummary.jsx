import React from 'react'
import { CouponCodeInput, SummaryWrapper } from './styles/Cart.style'
import { Button, Typography } from '@mui/material'
import { Link } from 'react-router-dom';

export function CartSummary(props) {

    const { cartItems, getQuantity } = props;

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + item.ourPrice * getQuantity(item), 0);
      };
    
      const getTotalMRP = () => {
        return cartItems.reduce((total, item) => total + item.mrp * getQuantity(item), 0);
      };
    
      const getTotalSavings = () => {
        return getTotalMRP() - getTotalPrice();
      };

  return (
    <SummaryWrapper>
        <Typography variant="h5">Summary</Typography>
        <Typography variant="body1" style={{ marginTop: "10px" }}>
          Total MRP: ₹{getTotalMRP()}
        </Typography>
        <Typography variant="body1"  style={{ marginBottom: "10px" }}>
          Total Price: ₹{getTotalPrice()} (You Save: ₹{getTotalSavings()})
        </Typography>
        <CouponCodeInput label="Coupon Code" variant="outlined" fullWidth />
        <Button variant="text" color="primary">
          Apply Coupon
        </Button>
        <Button 
        component={Link}
        to='/checkout'
        variant="contained" 
        color="primary">
          Checkout
        </Button>
      </SummaryWrapper>
  )
}