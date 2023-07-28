import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardActionArea, CardActions, CardContent, CardMedia, Grid, Typography} from "@mui/material";
import { ProductsFooter } from "./ProductsFooter";
import { updateProductQuantity } from "../../redux/counterSlice";

export function Products() {
const products = useSelector(state=> state.counter.products);
const dispatch = useDispatch();

  const handleIncreaseQuantity = useCallback((productId)=>{
    dispatch(updateProductQuantity({productId, change: 1}))
  },[dispatch])

  const handleDecreaseQuantity = useCallback((productId) => {
    dispatch(updateProductQuantity({productId, change: -1}))
  },[dispatch])


  return (
    <Grid container spacing={2}>
      {products.map((data) => (
        <Grid item xs={12} sm={6} md={4} key={data.productId}>
          <Card sx={{ maxWidth: 345 }}>
            <CardActionArea>
              <CardMedia component="img" height="140" image={data.image} alt={data.title} />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {data.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {data.description}
                </Typography>
              </CardContent>
            </CardActionArea>
            <CardActions>
              <ProductsFooter productQuantity={data.quantity }
              onAdd={()=>handleIncreaseQuantity(data.productId)}
              onDecreaseQuantity={()=>handleDecreaseQuantity(data.productId)}
              onIncreaseQuantity={()=>handleIncreaseQuantity(data.productId)}   
              />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
