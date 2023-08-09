export const createWhatsAppOrderMessage = (orderData) => {
    const { formData, productsQuantity } = orderData;
  
    const customerInfo = 
`      >Customer Name: ${formData.name}
      >WhatsApp Number: ${formData.whatsapp}
      >Delivery Address: ${formData.address}
`;
  
    const orderedProducts = productsQuantity.map((product) => {
      return `
       >Product ID: ${product.productId}
       >Quantity: ${product.quantity}`;
    });
  
    const message = `Order Details:
      ${customerInfo}
Ordered Products: ${orderedProducts.join('\n')}`;
  
    const encodedMessage = encodeURIComponent(message);
    return encodedMessage;
  };
  

  export function whatsAppConnection(encodedMessage) {
    const url = 'https://api.whatsapp.com/send?phone=919009090467&text=' + encodedMessage;
    window.open(url, '_blank');
  };