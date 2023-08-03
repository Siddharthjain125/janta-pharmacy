import styled from "@emotion/styled";
import { Button, Card, CardContent, CardMedia, TextField, Typography } from "@mui/material";

export const CartWrapper = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: row;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

export const CartItemsWrapper = styled.div`
  width: 80%;
  padding-right: 16px;
  @media (max-width: 600px) {
    width: 100%;
  }
`;

export const CartItem = styled(Card)`
  display: flex;
  flex-direction: row;
  padding: 16px;
  margin-bottom: 16px;
`;

export const ItemDetails = styled(CardContent)`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 50%;
`;

export const QuantityButtons = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;

  button {
    margin-right: 4px;
    margin-left: 4px;
  }
`;

export const DeleteButton = styled(Button)`
  align-self: left;
  margin-left: 10%;
`;

export const DeleteConfirmation = styled.div`
  color: red;
  margin-top: 8px;
  display: flex;

  justify-content: flex-end;
  align-items: center;

  button {
    margin-left: 8px;
  }

  @media(max-width:750px){
    flex-direction: column;
  }  
`;

export const ProductImage = styled(CardMedia)`
  width: 20%;
  flex-shrink: 0;
  margin-right: 2%;
`;

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

export const PackagingInfo = styled(Typography)`
  margin-bottom: 8px;
`;

export const SummaryWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 25%;

  @media (max-width: 600px) {
    width: 100%;
  }
`;

export const CouponCodeInput = styled(TextField)`
  margin-right: 50%;
`;

export const PricingInfo = styled.div`
  width: 20%;
  margin-left: 3%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: end;
`;

export const DiscountedPrice = styled(Typography)``;

export const Discount = styled(Typography)``;
