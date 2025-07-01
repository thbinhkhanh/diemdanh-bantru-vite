import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Card
} from "@mui/material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase"; // ⚠️ Đảm bảo bạn đã export auth từ firebase.js

import { useNavigate } from "react-router-dom";
import Banner from "./pages/Banner";


export default function Login() {
  const [email, setEmail] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username.trim() || !passwordInput.trim()) {
      alert("⚠️ Vui lòng nhập đầy đủ tài khoản và mật khẩu.");
      return;
    }

    const userKey = username.trim().toUpperCase();
    const docRef = doc(db, "ACCOUNT", userKey);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      alert("❌ Tài khoản không tồn tại.");
      return;
    }

    const data = docSnap.data();
    if (data.password !== passwordInput) {
      alert("❌ Sai mật khẩu.");
      return;
    }

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("account", userKey);

    if (userKey === "ADMIN") {
      navigate("/admin");
    } else {
      const lopNumber = userKey.split(".")[0]; // Lấy phần trước dấu chấm
      navigate(`/lop${lopNumber}`); // ví dụ: /lop1, /lop2, ...
    }
  };


  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#e3f2fd" }}>
      <Banner title="ĐĂNG NHẬP HỆ THỐNG" />
      <Box sx={{ width: { xs: "95%", sm: 400 }, mx: "auto", mt: 4 }}>
        <Card elevation={10} sx={{ p: 3, borderRadius: 4 }}>
          <Stack spacing={3} alignItems="center">
            <div style={{ fontSize: 50 }}>🔐</div>

            <Typography
              variant="h5"
              fontWeight="bold"
              color="primary"
              textAlign="center"
            >
              QUẢN TRỊ HỆ THỐNG
            </Typography>

            <TextField
              label="📧 Email Admin"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />

            <TextField
              label="🔐 Mật khẩu"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              fullWidth
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleLogin}
              fullWidth
              sx={{
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "1rem"
              }}
            >
              🔐 Đăng nhập
            </Button>
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}
