import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CardActionArea,
  CardMedia,
  Grid,
  Typography,
} from '@mui/material';
import { ProductsFooter } from './ProductsFooter';
import { updateProductQuantity } from '../../redux/productsSlice';
import { CardContainer, CardContentWrapper, CardDescription, CardTitleContainer, ProductsWrapper } from './styles/Products.style';

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
          <CardContainer>
            <CardActionArea style={{ height: '50%' }}>
              <CardMedia component='img' height='100%' image={data.image} alt={data.title} />
            </CardActionArea>
            <CardContentWrapper>
              <CardTitleContainer>
                <Typography gutterBottom variant='body1' component='div'>
                  {data.title}
                </Typography>
              </CardTitleContainer>
              <CardDescription>
                <Typography variant='body2' color='text.secondary'>
                  {data.description}
                </Typography>
              </CardDescription>
            </CardContentWrapper>
            <ProductsFooter
              productQuantity={data.quantity}
              onAdd={() => handleIncreaseQuantity(data.productId)}
              onDecreaseQuantity={() => handleDecreaseQuantity(data.productId)}
              onIncreaseQuantity={() => handleIncreaseQuantity(data.productId)}
              mrp={data.mrp}
              ourPrice={data.ourPrice}
            />
          </CardContainer>
        </Grid>
      ))}
    </ProductsWrapper>
  );
}