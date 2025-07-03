import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";
import Banner from "./pages/Banner";


export default function Login() {
  const [username, setUsername] = useState("yte");
  const [passwordInput, setPasswordInput] = useState("");
  const navigate = useNavigate();

  const fixedAccounts = [
    { value: "yte", label: "🧾 Y tế" },
    { value: "ketoan", label: "💰 Kế toán" },
    { value: "bgh", label: "📋 BGH" },
    { value: "admin", label: "🔐 Admin" },
  ];

  const getDynamicOptions = () => {
    const match = username.trim();
    const dynamicOptions = [];

    if (/^[1-5]$/.test(match)) {
      for (let i = 1; i <= 6; i++) {
        dynamicOptions.push({
          value: `${match}.${i}`,
          label: `👧 Lớp ${match}.${i}`,
        });
      }
    }

    return [...dynamicOptions, ...fixedAccounts];
  };

  const handleLogin = async () => {
    if (!username.trim() || !passwordInput.trim()) {
      alert("⚠️ Vui lòng nhập đầy đủ tài khoản và mật khẩu.");
      return;
    }

    const userKey = username.toUpperCase();
    const docRef = doc(db, "ACCOUNT", userKey);

    try {
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

      // ✅ Lưu thông tin đăng nhập vào localStorage
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("account", userKey); // VD: '2.3'
      localStorage.setItem("loginRole", userKey.toLowerCase());

      // ✅ Điều hướng tương ứng
      if (userKey === "ADMIN") {
        navigate("/admin");
      } else if (userKey === "KETOAN") {
        navigate("/quanly", { state: { account: userKey, tab: "thongke" } });
      } else if (userKey === "BGH") {
        navigate("/quanly", { state: { account: userKey, tab: "danhsach" } });
      } else if (userKey === "YTE") {
        navigate("/quanly", { state: { account: userKey, tab: "dulieu" } });
      } else if (/^[1-5]\.[1-6]$/.test(userKey)) {
        const lop = userKey.split(".")[0]; // lấy số lớp (ví dụ '2' từ '2.3')
        navigate(`/lop${lop}`, { state: { account: userKey } });
      } else {
        alert("⚠️ Tài khoản không hợp lệ.");
      }
    } catch (error) {
      console.error("🔥 Lỗi đăng nhập:", error);
      alert("⚠️ Lỗi kết nối. Vui lòng thử lại.");
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
              {username.toLowerCase() === "admin"
                ? "QUẢN TRỊ HỆ THỐNG"
                : "QUẢN LÝ BÁN TRÚ"}
            </Typography>

            <Autocomplete
              freeSolo
              fullWidth
              options={getDynamicOptions()}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.label
              }
              value={
                getDynamicOptions().find((opt) => opt.value === username) || {
                  label: username,
                  value: username,
                }
              }
              onInputChange={(event, newInputValue) =>
                setUsername(newInputValue)
              }
              onChange={(event, newValue) => {
                if (typeof newValue === "string") {
                  setUsername(newValue);
                } else if (newValue && newValue.value) {
                  setUsername(newValue.value);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Loại tài khoản hoặc lớp"
                  variant="outlined"
                />
              )}
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
                fontSize: "1rem",
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
