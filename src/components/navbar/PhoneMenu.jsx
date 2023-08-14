import { IconButton, Menu, MenuItem, Typography } from "@mui/material";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu as MenuIcon } from "@mui/icons-material";

export function PhoneMenu(props) {
  const { pages } = props;
  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  return (
    <>
      <IconButton size="large" aria-haspopup="true" onClick={handleOpenNavMenu} color="inherit">
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={anchorElNav}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        open={Boolean(anchorElNav)}
        onClose={handleCloseNavMenu}
      >
        {pages.map((page) => (
          <MenuItem
            key={page}
            onClick={handleCloseNavMenu}
            component={Link}
            to={`/${page.toLowerCase()}`}
          >
            <Typography textAlign="center">{page}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
