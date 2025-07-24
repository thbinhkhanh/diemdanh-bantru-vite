import React from "react";
import { Box, Container } from "@mui/material";
import Banner from "../components/Banner";

export default function MainLayout({ children }) {
  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(to bottom, #e3f2fd, #bbdefb)", py: 0 }}>
      <Banner />
      <Container maxWidth="md">
        {children}
      </Container>
    </Box>
  );
}
