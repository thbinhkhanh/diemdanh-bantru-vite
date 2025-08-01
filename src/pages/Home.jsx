import React from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Banner from "./Banner";

export default function Home({ handleProtectedNavigate }) {
  const khốiList = ["KHỐI 1", "KHỐI 2", "KHỐI 3", "KHỐI 4", "KHỐI 5"];
  const imageList = ["L1.png", "L2.png", "L3.png", "L4.png", "L5.png"];
  const colorMap = ["#42a5f5", "#66bb6a", "#ffb300", "#ab47bc", "#ef5350"];

  const handleClickKhoiLop = (index) => {
    const path = `/lop${index + 1}`;
    handleProtectedNavigate(path); // ✅ Dùng logic kiểm tra từ App.jsx
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #e3f2fd, #bbdefb)",
        py: 0,
        px: 0,
      }}
    >
      <Banner title="HỆ THỐNG BÁN TRÚ" />

      <Box sx={{ px: 2 }}>
        <Grid container spacing={3} justifyContent="center" sx={{ mt: 3, mb: 4 }}>
          {khốiList.map((label, index) => (
            <Grid item xs={12} sm={6} md={4} key={label}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  elevation={4}
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    textAlign: "center",
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "#fff",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      p: 1.5,
                      cursor: "pointer",
                    }}
                    onClick={() => handleClickKhoiLop(index)}
                  >
                    <img
                      src={`/${imageList[index]}`}
                      alt={label}
                      width="120px"
                      height="120px"
                      loading="lazy"
                      style={{
                        borderRadius: "8px",
                        boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                  </Box>

                  <CardContent sx={{ py: 1 }}>
                    <Typography
                      variant="h6"
                      fontWeight="600"
                      gutterBottom
                      sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1, fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                    >
                      Nhấn để xem danh sách lớp {index + 1}
                    </Typography>

                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        backgroundColor: colorMap[index],
                        fontWeight: 600,
                        py: { xs: 0.5, sm: 1 },
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                        "&:hover": {
                          backgroundColor: colorMap[index],
                          filter: "brightness(0.9)",
                        },
                      }}
                      onClick={() => handleClickKhoiLop(index)}
                    >
                      Vào {label}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
