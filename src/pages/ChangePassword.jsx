import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedAccount = localStorage.getItem("account");
    if (storedAccount) {
      setUsername(storedAccount.toUpperCase());
    }
  }, []);

  const handleChangePassword = async () => {
    const oldPw = oldPassword.trim();
    const newPw = newPassword.trim();
    const confirmPw = confirmPassword.trim();

    if (!username || !oldPw || !newPw || !confirmPw) {
      setMessage("⚠️ Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (newPw !== confirmPw) {
      setMessage("❌ Mật khẩu mới không khớp.");
      return;
    }

    try {
      const storedPassword = localStorage.getItem(`password_${username}`);
      if (storedPassword && storedPassword !== oldPw) {
        setMessage("❌ Mật khẩu cũ không đúng.");
        return;
      }

      localStorage.setItem(`password_${username}`, newPw);
      setMessage("✅ Đổi mật khẩu thành công.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("🔥 Lỗi đổi mật khẩu:", err);
      setMessage("⚠️ Đã có lỗi xảy ra.");
    }
  };

  const handleCancel = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("");
    navigate(-1); // Quay về trang trước (hoặc navigate("/") để về trang chính)
    };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#e3f2fd", py: 4 }}>
      <Box sx={{ width: { xs: "95%", sm: 400 }, mx: "auto", mt: 0 }}>
        <Card elevation={10} sx={{ p: 3, borderRadius: 4 }}>
          <Stack spacing={3} alignItems="center">
            <div style={{ fontSize: 50 }}>🔑</div>

            <Typography
              variant="h5"
              fontWeight="bold"
              textAlign="center"
              color="primary"
            >
              ĐỔI MẬT KHẨU
            </Typography>

            {username && (
              <Typography
                variant="h8"
                sx={{
                    color: "black", // ← màu đen
                    textAlign: "center",
                    fontWeight: "bold",
                    mb: -1,
                }}
                >
                🧑 Tài khoản: {username}
                </Typography>
            )}

            <TextField
              label="🔒 Mật khẩu cũ"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="🆕 Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="✅ Xác nhận mật khẩu"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              size="small"
              onKeyDown={(e) => e.key === "Enter" && handleChangePassword()}
            />

            <Stack direction="row" spacing={2} width="100%">
              <Button
                variant="contained"
                color="primary"
                onClick={handleChangePassword}
                fullWidth
                sx={{
                  fontWeight: "bold",
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                🔁 Cập nhật
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
                fullWidth
                sx={{
                    fontWeight: "bold",
                    textTransform: "none",
                    fontSize: "1rem",
                }}
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
