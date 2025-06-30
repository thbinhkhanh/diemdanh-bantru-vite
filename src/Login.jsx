import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";
import Banner from "./pages/Banner";

export default function Login() {
  const [selectedAccount, setSelectedAccount] = useState("gvcn");
  const [passwordInput, setPasswordInput] = useState("");
  const [passwords, setPasswords] = useState({
    manager: "",
    admin: "",
    gvcn: "",
    gvbm: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        const accounts = ["manager", "admin", "gvcn", "gvbm"];
        const newPasswords = {};
        for (const acc of accounts) {
          const snap = await getDoc(doc(db, "SETTINGS", acc.toUpperCase()));
          newPasswords[acc] = snap.exists() ? snap.data().password || "" : "";
        }
        setPasswords(newPasswords);
      } catch (error) {
        console.error("❌ Lỗi khi tải mật khẩu:", error);
      }
    };
    fetchPasswords();
  }, []);

  const handleLogin = () => {
    if (!passwordInput.trim()) {
      alert("⚠️ Vui lòng nhập mật khẩu.");
      return;
    }

    if (passwordInput === passwords[selectedAccount]) {
      //alert(`✅ Đăng nhập thành công với tài khoản ${selectedAccount.toUpperCase()}`);
      // Thay sessionStorage bằng localStorage để PrivateRoute kiểm tra được
      localStorage.setItem("loggedIn", "true");  
      navigate(`/${selectedAccount}`);
    } else {
      alert("❌ Mật khẩu không đúng.");
    }
  };


  const getTitleByAccount = () => {
    switch (selectedAccount) {
      case "gvcn":
        return "ĐIỂM DANH - BÁN TRÚ";
      case "gvbm":
        return "ĐIỂM DANH";
      case "manager":
        return "QUẢN LÝ DỮ LIỆU";
      default:
        return "QUẢN TRỊ HỆ THỐNG";
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
              {getTitleByAccount()}
            </Typography>

            <Box height={0} /> {/* 👈 spacer thêm khoảng cách */}

            <FormControl fullWidth>
              <InputLabel id="account-select-label">Loại tài khoản</InputLabel>
              <Select
                labelId="account-select-label"
                value={selectedAccount}
                label="Loại tài khoản"
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                <MenuItem value="gvcn">👩‍🏫 Giáo viên chủ nhiệm</MenuItem>
                <MenuItem value="gvbm">🧑‍🏫 Giáo viên bộ môn</MenuItem>
                <MenuItem value="manager">📋 Quản lý</MenuItem>
                <MenuItem value="admin">🔐 Admin</MenuItem>
              </Select>
            </FormControl>

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