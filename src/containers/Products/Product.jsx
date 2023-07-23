import React, { useCallback, useState } from "react";
import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@mui/material";
import { mockData } from "../../mockData/Products";
import { ProductsFooter } from "./ProductsFooter";

export function Products() {

const [products,updateProducts]= useState(mockData);


  const handleAddClick = useCallback((productId) => {
    const clonedProducts = [...products];
    const updatedProductsData=  clonedProducts.map(data=>{
     
      if(data.productId === productId)
          return {...data, quantity:1}
       else return data;
      
    });
    updateProducts(updatedProductsData);
  },[products]);



  const handleIncreaseQuantity = useCallback((productId)=>{
   const clonedProducts = [...products];
    const updatedProductsData=  clonedProducts.map(data=>{
   
      if(data.productId === productId)
      return {...data, quantity: data.quantity +1};
      
      else return data;
    });
 
    updateProducts(updatedProductsData);

  
  },[products])

  const handleDecreaseQuantity = useCallback((productId) => {
    const clonedProducts = [...products];
    const updatedProductsData=  clonedProducts.map(data=>{
   
      if(data.productId === productId)
      return {...data, quantity: data.quantity - 1};
      
      else return data;
    });
    updateProducts(updatedProductsData);
  },[products]);


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
              onAdd={()=>handleAddClick(data.productId)}
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
