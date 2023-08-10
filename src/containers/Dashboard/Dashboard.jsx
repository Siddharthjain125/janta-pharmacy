import { Button, Card, CardContent, CardMedia, Container, Grid, Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

export function Dashboard() {
  return (
    <Container sx={{ marginTop: "3rem" }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            Welcome to Janta Pharmacy
          </Typography>
          <Typography variant="body1" paragraph>
            Browse our wide range of medicines and healthcare products. With quality products and
            fast delivery, we are Ujjain's most trusted pharmacy.
          </Typography>
          <Button
            component={Link}
            to={`/products`}
            variant="contained"
            color="primary"
            size="large"
          >
            Shop Now
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ maxWidth: 345 }}>
            <CardMedia
              component="img"
              height="100%"
              image="images/Banner.png"
              alt="Pharmacy Image"
            />
            <CardContent>
              <Typography variant="h6">Quick Delivery</Typography>
              <Typography variant="body2">
                Get your medications delivered to your doorstep in no time.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
