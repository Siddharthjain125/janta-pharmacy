import { ShoppingCart } from "@mui/icons-material";
import { AppBar, Badge, Box, Button, IconButton, Toolbar } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { cartItemsCalculator } from "../../helper/navbar.helper";
import { PhoneMenu } from "./PhoneMenu";
import { SearchBar } from "./SearchBar";
import { Title } from "./Title";

const pages = ["Products"];
function displayPages() {
  return pages.map((page) => (
    <Button
      key={page}
      component={Link}
      to={`/${page.toLowerCase()}`}
      sx={{ my: 2, color: "white", display: "block" }}
    >
      {page}
    </Button>
  ));
}

export function Navbar() {
  const productsQuantity = useSelector((state) => state.productsData.productsQuantity);
  const cartItemsCount = cartItemsCalculator(productsQuantity);

  return (
    <AppBar position="sticky" sx={{ width: "100%" }}>
      <Toolbar disableGutters>
        <Box sx={{ alignItems: "center", width: { xs: "100%", md: "20%" } }}>
          <Title />
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            display: { xs: "none", md: "flex" },
            width: "20%",
            marginLeft: "30px",
          }}
        >
          {displayPages()}
        </Box>
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            width: "40%",
          }}
        >
          <SearchBar />
        </Box>
        <IconButton
          component={Link}
          to="/cart"
          size="large"
          color="inherit"
          sx={{
            marginLeft: "auto",
            marginRight: "15px",
            width: "20%",
            display: { xs: "none", md: "flex" },
          }}
        >
          <Badge badgeContent={cartItemsCount} color="error">
            <ShoppingCart />
          </Badge>
        </IconButton>
      </Toolbar>
      <Toolbar
        sx={{
          display: { xs: "flex", md: "none" },
        }}
      >
        <Box sx={{ width: "20%" }}>
          <PhoneMenu pages={pages} />
        </Box>
        <Box sx={{ width: "60%" }}>
          <SearchBar />
        </Box>

        <IconButton
          component={Link}
          to="/cart"
          size="large"
          aria-label="show cart items"
          color="inherit"
          style={{ marginLeft: "auto", mr: "20%", width: "20%" }}
        >
          <Badge badgeContent={cartItemsCount} color="error">
            <ShoppingCart />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
