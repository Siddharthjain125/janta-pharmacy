import { Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

export function Title() {
  return (
    <Typography
      variant="h6"
      noWrap
      component={Link}
      to="/"
      sx={{
        ml: "20px",
        display: "flex",
        fontFamily: "monospace",
        fontWeight: 700,
        color: "inherit",
        textDecoration: "none",
      }}
    >
      Janta Pharmacy
    </Typography>
  );
}
