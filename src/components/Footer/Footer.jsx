import { FooterTextWrapper, FooterWrapper } from './styles/Footer.style';
import { Box, Button, Typography } from '@mui/material';
import { Divider } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { whatsAppConnection } from '../../helper/whatsapp.helper';

export function Footer() {
  const encodedMessage = 'Hi-Siddharth';

  return (
    <FooterWrapper>
      <Divider />
      <FooterTextWrapper>
        <Box sx={{ width: '100%' }}>
          <Typography variant='h4' gutterBottom className='footer-text'>
            Let us help with your medicines.
          </Typography>
          <Button
            onClick={() => whatsAppConnection(encodedMessage)}
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
