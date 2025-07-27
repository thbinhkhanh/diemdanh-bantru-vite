// 🛟 Hiển thị trạng thái lưu dữ liệu
import { Box, Alert } from '@mui/material';

export default function SaveStatusAlert({ isSaving, lastSaved, showSavedAlert }) {
  return (
    <Box sx={{ mt: 2 }}>
      {isSaving && (
        <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
          Đang lưu...
        </Alert>
      )}
      {lastSaved && !isSaving && showSavedAlert && (
        <Alert severity="success" sx={{ fontSize: '0.875rem' }}>
          Đã lưu lúc {lastSaved.toLocaleTimeString('vi-VN')}
        </Alert>
      )}
    </Box>
  );
}