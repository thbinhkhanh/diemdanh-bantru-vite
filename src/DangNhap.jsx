import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

import {
  Box, Card, Stack, Typography, TextField, Button, Alert,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

import Banner from './pages/Banner';

export default function DangNhap() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('yte');

  const [passwords, setPasswords] = useState({
    yte: 'yte123',
    ketoan: 'ketoan123',
    bgh: 'bgh123',
    admin: 'admin123'
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        const roles = ['YTE', 'KETOAN', 'BGH', 'ADMIN'];
        const newPasswords = {};

        for (const role of roles) {
          const snap = await getDoc(doc(db, 'SETTINGS', role));
          newPasswords[role.toLowerCase()] = snap.exists() ? (snap.data().password || '') : '';
        }

        setPasswords(newPasswords);
      } catch (err) {
        console.error('❌ Lỗi khi lấy mật khẩu từ Firestore:', err);
      }
    };

    fetchPasswords();
  }, []);

  const handleLogin = () => {
    const expectedPassword = passwords[selectedAccount] || '';

    if (password === expectedPassword) {
      localStorage.setItem('loginRole', selectedAccount);

      if (selectedAccount === 'admin') {
        navigate('/admin');
      } else {
        navigate('/quanly');
      }
    } else {
      setMessage('❌ Mật khẩu không chính xác!');
    }
  };

  const bannerTitle = selectedAccount === 'admin'
    ? 'QUẢN TRỊ HỆ THỐNG'
    : 'QUẢN LÝ BÁN TRÚ';

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #e3f2fd, #bbdefb)' }}>
      <Banner title="ĐĂNG NHẬP QUẢN LÝ" />
      <Box sx={{ width: { xs: '90%', sm: 400 }, mx: 'auto', mt: 3 }}>
        <Card elevation={10} sx={{ p: 4, borderRadius: 3, backgroundColor: '#ffffff' }}>
          <Stack spacing={3}>
            <Box textAlign="center">
              <Box sx={{ fontSize: 48, color: 'primary.main', mb: 1 }}>
                🔐
              </Box>
              <Typography variant="h5" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
                {bannerTitle}
              </Typography>
            </Box>

            <FormControl fullWidth variant="outlined">
              <InputLabel id="account-label">Loại tài khoản</InputLabel>
              <Select
                labelId="account-label"
                label="Loại tài khoản"
                value={selectedAccount}
                onChange={(e) => {
                  setSelectedAccount(e.target.value);
                  setMessage('');
                }}
              >
                <MenuItem value="yte">🏥 Y tế</MenuItem>
                <MenuItem value="ketoan">💰 Kế toán</MenuItem>
                <MenuItem value="bgh">📋 BGH</MenuItem>
                <MenuItem value="admin">🔐 Admin</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="🔒 Mật khẩu"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {message && <Alert severity="error" variant="filled">{message}</Alert>}

            <Button
              variant="contained"
              fullWidth
              onClick={handleLogin}
              sx={{ height: 40, fontWeight: 'bold', fontSize: '16px' }}
            >
              🔓 Đăng nhập
            </Button>
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}
