import React from "react";
import { FooterTextWrapper, FooterWrapper } from "./styles/Footer.style";
import { Box, Button, Chip, Typography } from "@mui/material";
import { Divider } from "@mui/material";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

export function Footer() {
  return (
    <FooterWrapper>
      <Divider>
        <Chip label="Contact Us" />
      </Divider>
      <FooterTextWrapper>
        <Box sx={{ width: "100%"}}>
          <Typography variant="h4" gutterBottom className="footer-text">
            Let us help with your medicines.
          </Typography>
          <Button variant="contained" className="footer-contactUs-btn"><WhatsAppIcon className="footer-whatsapp-icon"/>CONNECT ON WHATSAPP</Button>
        </Box>
      </FooterTextWrapper>
    </FooterWrapper>
  );
}
