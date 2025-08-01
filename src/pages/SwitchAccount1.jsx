import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { db } from "../firebase";
import { getDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const setSession = (userKey) => {
  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("account", userKey);
  localStorage.setItem("loginRole", userKey.toLowerCase());
  localStorage.setItem("isAdmin", "true");
  localStorage.setItem("rememberedAccount", userKey);
};

const CLASS_BY_KHOI = {
  K1: ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6"],
  K2: ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6"],
  K3: ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6"],
  K4: ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6"],
  K5: ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6"],
};

export default function SwitchAccount() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const current = localStorage.getItem("account")?.trim();

    // Nếu tài khoản hiện tại là dạng lớp (ví dụ "1.6")
    if (current && /^\d\./.test(current)) {
      const khoi = "K" + current.split(".")[0];
      setAccounts(CLASS_BY_KHOI[khoi] || []);
    } else {
      // Nếu tài khoản không phải lớp, không hiện danh sách tài khoản quản lý nữa, set danh sách rỗng
      setAccounts([]);
    }
  }, []);

  const handleSwitchAccount = async () => {
    const userKey = username?.toUpperCase().trim();
    const passwordInput = password.trim();

    if (!userKey || !passwordInput) {
        setMessage("⚠️ Vui lòng nhập đầy đủ thông tin.");
        return;
    }

    try {
        const docSnap = await getDoc(doc(db, "ACCOUNT", userKey));
        if (!docSnap.exists()) {
        setMessage("❌ Tài khoản không tồn tại.");
        return;
        }

        const storedPassword = docSnap.data().password;
        if (storedPassword !== passwordInput) {
        setMessage("❌ Sai mật khẩu.");
        return;
        }

        setSession(userKey);
        setMessage("✅ Đăng nhập thành công.");

        // Lấy số khối từ tài khoản (ví dụ '1' từ '1.3')
        const khoi = userKey.split(".")[0];

        setTimeout(() => {
        navigate(`/lop${khoi}`, { state: { lop: userKey } });  // truyền tên lớp ở đây
        }, 500);
    } catch (err) {
        console.error("🔥 Lỗi chuyển tài khoản:", err);
        setMessage("⚠️ Lỗi kết nối.");
    }
    };

  const handleCancel = () => {
    setUsername("");
    setPassword("");
    setMessage("");
    navigate(-1);
  };

  const currentAccount = localStorage.getItem("account") || "";

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#e3f2fd", py: 4 }}>
      <Box sx={{ width: { xs: "95%", sm: 400 }, mx: "auto", mt: 0 }}>
        <Card elevation={10} sx={{ p: 3, borderRadius: 4 }}>
          <Stack spacing={3} alignItems="center">
            <div style={{ fontSize: 50 }}>🔁</div>

            <Typography
              variant="h5"
              fontWeight="bold"
              textAlign="center"
              color="primary"
            >
              CHUYỂN TÀI KHOẢN
            </Typography>

            {/* Hiển thị tài khoản đang đăng nhập, căn giữa */}
            <Typography
              variant="body1"
              sx={{
                width: "100%",
                fontWeight: "bold",
                textAlign: "center",
                mb: 1,
              }}
            >
              👤 Tài khoản: {currentAccount || "Chưa đăng nhập"}
            </Typography>

            {/* Nếu danh sách accounts rỗng, disable select */}
            <FormControl fullWidth size="small" disabled={accounts.length === 0}>
              <InputLabel>🧑 Chọn tài khoản</InputLabel>
              <Select
                value={username}
                label="🧑 Chọn tài khoản"
                onChange={(e) => setUsername(e.target.value)}
              >
                {accounts.map((acc) => (
                  <MenuItem key={acc} value={acc}>
                    {acc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="🔐 Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              size="small"
              onKeyDown={(e) => e.key === "Enter" && handleSwitchAccount()}
            />

            <Stack direction="row" spacing={2} width="100%">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSwitchAccount}
                fullWidth
                sx={{ fontWeight: "bold", textTransform: "none", fontSize: "1rem" }}
              >
                ✅ Đăng nhập
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
                fullWidth
                sx={{ fontWeight: "bold", textTransform: "none", fontSize: "1rem" }}
              >
                🔙 Quay lại
              </Button>
            </Stack>

            {message && (
              <Typography
                variant="body2"
                sx={{
                  color: message.startsWith("✅") ? "green" : "red",
                  mt: 1,
                  textAlign: "center",
                }}
              >
                {message}
              </Typography>
            )}
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}
