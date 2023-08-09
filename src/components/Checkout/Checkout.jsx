import React, { useState } from "react";
import {
  Button,
  Container,
  Grid,
  InputLabel,
  TextField,
  TextareaAutosize,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import { createWhatsAppOrderMessage, whatsAppConnection } from "../../helper/whatsapp.helper";

export function Checkout() {
  const productsQuantity = useSelector((state) => state.productsData.productsQuantity);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    address: "",
    prescriptionFile: null,
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "prescriptionFile" ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form Data:", {formData, productsQuantity});
    const encodedMessage = createWhatsAppOrderMessage({formData, productsQuantity});
    whatsAppConnection(encodedMessage)
    // Reset form data after submission
    setFormData({
      name: "",
      whatsapp: "",
      address: "",
      prescriptionFile: null,
    });
  };

  return (
    <Container maxWidth="md" style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="WhatsApp Number"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={10}>
            <TextareaAutosize
              minRows="4"
              placeholder="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              style={{ width: "100%" }}
            />
          </Grid>
          <Grid item xs={12}>
            <InputLabel htmlFor="prescription-file">Upload Prescription (Optional)</InputLabel>
            <input
              type="file"
              id="prescription-file"
              name="prescriptionFile"
              accept=".jpg, .jpeg, .png, .pdf"
              onChange={handleInputChange}
            />
          </Grid>
        </Grid>
        <Button type="submit" variant="contained" color="primary" style={{ marginTop: "20px" }}>
          Submit Order
        </Button>
      </form>
    </Container>
  );
}
