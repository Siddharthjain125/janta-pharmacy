import { Search } from "@mui/icons-material";
import { Box, IconButton, TextField } from "@mui/material";
import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const handleSearchChange = useCallback(
    (event) => {
      let query = event.target.value;
      if (query !== undefined) {
        query = query.toLowerCase();
      }

      setSearchQuery(query);
      navigate(`/search/${query}`);
    },
    [navigate]
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <TextField
        sx={{
          backgroundColor: "white",
        }}
        label="Search"
        variant="outlined"
        size="small"
        value={searchQuery}
        onChange={handleSearchChange}
        InputLabelProps={{
          shrink: searchQuery !== "",
          style: {
            color: searchQuery !== "" ? "black" : "grey",
          },
        }}
      />
      <IconButton
        color="inherit"
        sx={{
          display: { xs: "none", md: "flex" },
        }}
      >
        <Search />
      </IconButton>
    </Box>
  );
}
