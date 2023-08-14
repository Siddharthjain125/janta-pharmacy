import styled from "@emotion/styled";

export const FooterWrapper = styled.div`
  margin-top: 50px;
  align-items: center;
`;

export const FooterTextWrapper = styled.div`
  background-color: #f6f6f8;
  width: 100%;

  .footer-contactUs-btn {
    background-color: #35897e;
    margin: 10px;
  }

  .footer-whatsapp-icon {
    padding-right: 5px;
  }

  .footer-text {
    margin: 10px;
    //color: black;
  }

  .footer-box {
    display: flex;
    flex-direction: column; /* Default: Stacking elements vertically */
    align-items: center; /* Default: Aligning elements to the start */
    width: 100%;
  }

  @media (min-width: 768px) {
    .footer-box {
      flex-direction: row; /* Aligning elements side by side on larger screens */
      justify-content: flex-end;
      margin-left: -5%;
    }
  }
`;
