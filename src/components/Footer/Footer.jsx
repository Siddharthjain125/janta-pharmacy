import React, { useCallback } from 'react';
import { FooterTextWrapper, FooterWrapper } from './styles/Footer.style';
import { Box, Button, Typography } from '@mui/material';
import { Divider } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

export function Footer() {
  const phoneNumber = '919009090467';
  const encodedMessage = 'Hi-Siddharth';

  const whatsAppSupport = useCallback(() => {
    const url =
      'https://api.whatsapp.com/send?phone=' +
      phoneNumber +
      '&text=' +
      encodedMessage;
    window.open(url, '_blank');
  }, []);

  return (
    <FooterWrapper>
      <Divider />
      <FooterTextWrapper>
        <Box sx={{ width: '100%' }}>
          <Typography variant='h4' gutterBottom className='footer-text'>
            Let us help with your medicines.
          </Typography>
          <Button
            onClick={whatsAppSupport}
            variant='contained'
            className='footer-contactUs-btn'>
            <WhatsAppIcon className='footer-whatsapp-icon' />
            CONNECT ON WHATSAPP
          </Button>
        </Box>
      </FooterTextWrapper>
    </FooterWrapper>
  );
}
