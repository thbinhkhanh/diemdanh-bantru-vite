import React, { useState, useEffect } from "react";
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
  localStorage.setItem("isAdmin", "true");
  localStorage.setItem("rememberedAccount", userKey);
};

export default function Login() {
  const [passwordInput, setPasswordInput] = useState("");
  const [classList, setClassList] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [roleUsername, setRoleUsername] = useState("yte");

  const navigate = useNavigate();
  const location = useLocation();

  const isLopPath = /^\/lop[1-5]$/.test(location.pathname);
  const fallbackClassId = isLopPath ? location.pathname.slice(1) : null;
  const classId = location.state?.classId || fallbackClassId;
  const redirectTo = location.state?.redirectTo || localStorage.getItem("redirectTarget") || null;
  const switchingClass = location.state?.switchingClass || false;

  const lopSo = classId?.replace(/\D/g, "") || "";
  const isQuanLyLogin = !classId;
  const [realPassword, setRealPassword] = useState(null);

  useEffect(() => {
    const fetchPasswordForClass = async () => {
      const userKey = selectedUsername?.toUpperCase();
      if (!/^([1-5])\.\d$/.test(userKey)) {
        setRealPassword(null);
        return;
      }

      try {
        const docSnap = await getDoc(doc(db, "ACCOUNT", userKey));
        if (docSnap.exists()) {
          setRealPassword(docSnap.data().password || null);
        } else {
          setRealPassword(null);
        }
      } catch (err) {
        console.error("⚠️ Lỗi khi lấy mật khẩu lớp:", err);
        setRealPassword(null);
      }
    };

    fetchPasswordForClass();
  }, [selectedUsername]);

  useEffect(() => {
    const rememberedAccount = localStorage.getItem("rememberedAccount");
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";

    if (rememberedAccount && isLoggedIn && !switchingClass) {
      const userKey = rememberedAccount.toUpperCase();

      if (redirectTo) {
        localStorage.removeItem("redirectTarget");        
        navigate(redirectTo);
        return;
      }

      if (classId && /^lop[1-5]$/.test(classId)) {        
        navigate(`/${classId}`);
        return;
      }

      if (/^([1-5])\.\d$/.test(userKey)) {
        const khoi = userKey.split(".")[0];        
        navigate(`/lop${khoi}`);
        return;
      }

      if (userKey === "ADMIN") {
        navigate("/admin");
        return;
      }

      const tabMap = { KETOAN: "thongke", BGH: "danhsach", YTE: "dulieu" };
      const tab = tabMap[userKey] || "dulieu";      
      navigate("/quanly", { state: { account: userKey, tab } });
    }
  }, []);

  useEffect(() => {
    if (!lopSo || isQuanLyLogin) return;
    const danhSach = CLASS_BY_KHOI[`K${lopSo}`] || [];
    setClassList(danhSach);
    setSelectedUsername(danhSach.includes(selectedUsername) ? selectedUsername : danhSach[0] || "");
  }, [lopSo, isQuanLyLogin]);

  const handleLogin = async () => {
    const username = (selectedUsername || roleUsername).trim();
    const password = passwordInput.trim();

    if (!username || !password) {
      alert("⚠️ Vui lòng nhập tài khoản và mật khẩu.");
      return;
    }

    const userKey = username.toUpperCase();
    const isLopAccount = /^([1-5])\.\d$/.test(userKey);

    if (isLopAccount) {
      if (!realPassword || password !== realPassword) {
        alert("❌ Sai mật khẩu.");
        return;
      }

      setSession(userKey);
        const newKhoi = userKey.split(".")[0];
        navigate(`/lop${newKhoi}`, { state: { lop: userKey } });
        return;
      }

    try {
      const docSnap = await getDoc(doc(db, "ACCOUNT", userKey));
      if (!docSnap.exists()) {
        alert("❌ Tài khoản không tồn tại.");
        return;
      }

      const data = docSnap.data();
      if (data.password !== password) {
        alert("❌ Sai mật khẩu.");
        return;
      }

      setSession(userKey);
      if (userKey === "ADMIN") {        
        navigate("/admin");
        return;
      }

      if (redirectTo) {
        localStorage.removeItem("redirectTarget");
        localStorage.removeItem("classIdTarget");
        localStorage.removeItem("switchingClass");
        navigate(redirectTo);
        return;
      }

      const tabMap = { KETOAN: "thongke", BGH: "danhsach", YTE: "dulieu" };
      const tab = tabMap[userKey] || "dulieu";      
      navigate("/quanly", { state: { account: userKey, tab } });

    } catch (err) {
      console.error("⚠️ Lỗi đăng nhập:", err);
      alert("⚠️ Lỗi kết nối, vui lòng thử lại.");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#e3f2fd" }}>
      <Banner title={isQuanLyLogin ? "HỆ THỐNG QUẢN LÝ" : "ĐIỂM DANH"} />
      <Box sx={{ width: { xs: "95%", sm: 400 }, mx: "auto", mt: 4 }}>
        <Card elevation={10} sx={{ p: 3, borderRadius: 4 }}>
          <Stack spacing={3} alignItems="center">
            <div style={{ fontSize: 50 }}>🔐</div>
            <Typography variant="h5" fontWeight="bold" color="primary" textAlign="center">
              {isQuanLyLogin
                ? roleUsername === "admin"
                  ? "QUẢN TRỊ HỆ THỐNG"
                  : "QUẢN LÝ BÁN TRÚ"
                : `ĐĂNG NHẬP KHỐI ${lopSo}`}
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
            <Stack direction="row" spacing={2} width="100%">
              <Button
                variant="contained"
                color="primary"
                onClick={handleLogin}
                fullWidth
                sx={{ fontWeight: "bold", textTransform: "none", fontSize: "1rem" }}
              >
                🔐 Đăng nhập
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                onClick={handleBack}
                fullWidth
                sx={{ fontWeight: "bold", textTransform: "none", fontSize: "1rem" }}
              >
                🔙 Quay lại
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}
