import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate, useLocation } from "react-router-dom";
import Banner from "./pages/Banner";

const CLASS_BY_KHOI = {
  K1: ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6"],
  K2: ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6"],
  K3: ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6"],
  K4: ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6"],
  K5: ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6"],
};

const setSession = (userKey) => {
  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("account", userKey);
  localStorage.setItem("loginRole", userKey.toLowerCase());
};

export default function Login() {
  const [passwordInput, setPasswordInput] = useState("");
  const [classList, setClassList] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [roleUsername, setRoleUsername] = useState("yte");

  const navigate = useNavigate();
  const location = useLocation();

  const urlPath = location.pathname;
  const isLopPath = /^\/lop[1-5]$/.test(urlPath);
  const fallbackClassId = isLopPath ? urlPath.slice(1) : null;

  const classId = location.state?.classId || fallbackClassId;
  const redirectTo = location.state?.redirectTo || localStorage.getItem("redirectTarget") || null;

  const lopSo = classId?.replace(/\D/g, "") || "";
  const isQuanLyLogin = !classId;

  useEffect(() => {
    if (!lopSo || isQuanLyLogin) return;

    const khoiKey = `K${lopSo}`;
    const danhSach = CLASS_BY_KHOI[khoiKey] || [];
    setClassList(danhSach);
    setSelectedUsername(danhSach.includes(selectedUsername) ? selectedUsername : danhSach[0] || "");
  }, [lopSo, isQuanLyLogin]);

  const handleLogin = async () => {
    const username = (selectedUsername || roleUsername).trim();
    const password = passwordInput.trim();
    if (!username || !password) {
      alert("⚠️ Vui lòng nhập đầy đủ tài khoản và mật khẩu.");
      return;
    }

    const userKey = username.toUpperCase();
    const isLopAccount = /^([1-5])\.\d$/.test(username);

    // 👉 Trường hợp đăng nhập lớp
    if (isLopAccount && password === "1") {
      setSession(userKey);
      const khoiLop = username.split(".")[0]; // "3.2" → "3"
      navigate(`/lop${khoiLop}`);
      return;
    }

    try {
      const docSnap = await getDoc(doc(db, "ACCOUNT", userKey));
      if (!docSnap.exists()) {
        alert("❌ Sai mật khẩu.");
        return;
      }

      const data = docSnap.data();
      if (data.password !== password) {
        alert("❌ Sai mật khẩu.");
        return;
      }

      setSession(userKey);

      // Điều hướng sau đăng nhập
      if (userKey === "ADMIN") {
        navigate("/admin");
        return;
      }

      if (redirectTo) {
        localStorage.removeItem("redirectTarget");
        navigate(redirectTo);
        return;
      }

      if (selectedUsername) {
        navigate(`/lop${selectedUsername.split(".")[0]}`);
        return;
      }

      const tabMap = {
        KETOAN: "thongke",
        BGH: "danhsach",
      };
      const tab = tabMap[userKey] || "dulieu";

      navigate("/quanly", { state: { account: userKey, tab } });
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

            <Typography variant="h5" fontWeight="bold" color="primary" textAlign="center">
              {classId
                ? `ĐĂNG NHẬP LỚP ${lopSo}`
                : roleUsername?.toLowerCase() === "admin"
                ? "QUẢN TRỊ HỆ THỐNG"
                : "QUẢN LÝ BÁN TRÚ"}
            </Typography>

            {isQuanLyLogin ? (
              <FormControl fullWidth size="small">
                <InputLabel id="role-label">Loại tài khoản</InputLabel>
                <Select
                  labelId="role-label"
                  value={roleUsername}
                  onChange={(e) => setRoleUsername(e.target.value)}
                  label="Loại tài khoản"
                >
                  <MenuItem value="yte">🧾 Y tế</MenuItem>
                  <MenuItem value="ketoan">💰 Kế toán</MenuItem>
                  <MenuItem value="bgh">📋 BGH</MenuItem>
                  <MenuItem value="admin">🔐 Admin</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <FormControl fullWidth size="small">
                <InputLabel id="username-label">Chọn lớp</InputLabel>
                <Select
                  labelId="username-label"
                  value={selectedUsername}
                  onChange={(e) => setSelectedUsername(e.target.value)}
                  label="Chọn lớp"
                >
                  {classList.map((lop) => (
                    <MenuItem key={lop} value={lop}>
                      {lop}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              label="🔐 Mật khẩu"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              fullWidth
              size="small"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
