// src/pages/AdminTabs/TabSystem.jsx
import {
  Box, Button, FormControl, InputLabel, MenuItem,
  Radio, RadioGroup, Select, Stack, TextField, Typography,
  FormControlLabel
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";

export default function TabSystem({
  selectedYear,
  handleYearChange,
  yearOptions,
  selectedAccount,
  setSelectedAccount,
  newPassword,
  setNewPassword,
  handleChangePassword,
  firestoreEnabled,
  handleToggleChange,
  navigate,
}) {
  return (
    <Stack spacing={3} mt={3} sx={{ maxWidth: 300, mx: "auto", width: "100%" }}>
      <Button variant="contained" onClick={() => navigate("/quanly")}>
        🏫 HỆ THỐNG QUẢN LÝ BÁN TRÚ
      </Button>

      <FormControl fullWidth size="small">
        <InputLabel>Năm học</InputLabel>
        <Select value={selectedYear} label="Năm học" onChange={(e) => handleYearChange(e.target.value)}>
          {yearOptions.map((year) => (
            <MenuItem key={year} value={year}>{year}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel>Loại tài khoản</InputLabel>
        <Select value={selectedAccount} label="Loại tài khoản" onChange={(e) => setSelectedAccount(e.target.value)}>
          <MenuItem value="yte">🏥 Y tế</MenuItem>
          <MenuItem value="ketoan">💰 Kế toán</MenuItem>
          <MenuItem value="bgh">📋 BGH</MenuItem>
          <MenuItem value="admin">🔐 Admin</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="🔑 Mật khẩu mới"
        type="password"
        value={newPassword}
        size="small"
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <Button
        variant="contained"
        color="warning"
        onClick={() => handleChangePassword(selectedAccount)}
        startIcon={<LockResetIcon />}
      >
        Đổi mật khẩu
      </Button>

      <FormControl>
        <Typography variant="subtitle1" fontWeight="bold">
          📊 Tải dữ liệu từ Firestore
        </Typography>
        <RadioGroup row value={firestoreEnabled ? "khoi" : "lop"} onChange={handleToggleChange}>
          <FormControlLabel value="khoi" control={<Radio />} label="Tải theo khối" />
          <FormControlLabel value="lop" control={<Radio />} label="Tải theo lớp" />
        </RadioGroup>
      </FormControl>
    </Stack>
  );
}
