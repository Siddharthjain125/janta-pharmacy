import styled from "@emotion/styled";

export const FooterWrapper = styled.div`
  height: 25%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 5px;
  align-items: center;
  background-color: #f5f5f5;
  position: relative;
`;

export const FooterButtons = styled.div`
  display: flex;
  width: 100%;
  margin-right: 10px;

  .product-quantity-btn {
    border: 1px solid;
    margin-left: 30px;
  }
`;

export const PriceDiscount = styled.div`
  display: flex;
  flex-direction: row;
`;

export const PriceInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: left;
  padding: 10px;

  .our-price {
    font-size: 18px;
    font-weight: bold;
  }

  .mrp {
    font-size: 14px;
    text-decoration: line-through;
  }

  .percentage-saving {
    font-size: 12px;
    color: green;
    margin-left: 5px;
    margin-top: 3px;
  }
`;
