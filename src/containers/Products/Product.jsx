import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardActionArea,
  // CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from '@mui/material';
import { ProductsFooter } from './ProductsFooter';
import { updateProductQuantity } from '../../redux/productsSlice';
import { ProductsWrapper } from './styles/Products.style';

export function Products() {
  const products = useSelector((state) => state.productsData.products);
  const dispatch = useDispatch();

  const handleIncreaseQuantity = useCallback(
    (productId) => {
      dispatch(updateProductQuantity({ productId, change: 1 }));
    },
    [dispatch],
  );

  const handleDecreaseQuantity = useCallback(
    (productId) => {
      dispatch(updateProductQuantity({ productId, change: -1 }));
    },
    [dispatch],
  );

  return (
    <ProductsWrapper>
      {products.map((data) => (
        <Grid item xs={12} sm={6} md={4} key={data.productId}>
          <Card sx={{ height: 345, width:200 }}>
            <CardActionArea>
              <CardMedia
                component='img'
                height='145'
                image={data.image}
                alt={data.title}
              />
              <CardContent className='card-content'>
                <Typography gutterBottom variant='h5' component='div'>
                  {data.title}
                </Typography>
                <Typography variant='body2' color='text.secondary' className='jp-product-description'>
                  {data.description}
                </Typography>
              </CardContent>
            </CardActionArea>
            {/* <CardActions> */}
           
            {/* </CardActions> */}
            <ProductsFooter
                productQuantity={data.quantity}
                onAdd={() => handleIncreaseQuantity(data.productId)}
                onDecreaseQuantity={() =>
                  handleDecreaseQuantity(data.productId)
                }
                onIncreaseQuantity={() =>
                  handleIncreaseQuantity(data.productId)
                }
              />
          </Card>
       
        </Grid>
      ))}
    </ProductsWrapper>
  );
}
