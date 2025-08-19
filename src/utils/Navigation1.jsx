import React from 'react';
import { Typography, Box } from '@mui/material';

export default function Home() {
  return (
    <Box sx={{ paddingTop: '80px', paddingX: 2 }}>
      {/* Banner */}
      <Box
        sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          borderRadius: 2,
          padding: 3,
          textAlign: 'center',
          marginBottom: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          HỆ THỐNG QUẢN LÝ BÁN TRÚ
        </Typography>
        <Typography variant="body1" sx={{ marginTop: 1 }}>
          Chào mừng bạn đến với trang quản lý bán trú.
        </Typography>
      </Box>

      {/* Nội dung chính */}
      <Typography variant="body1">
        Đây là trang chủ của hệ thống. Bạn có thể chọn menu phía trên để truy cập các chức năng như Phiếu xuất, Chi cho, Tiền ăn,...
      </Typography>
    </Box>
  );
}
