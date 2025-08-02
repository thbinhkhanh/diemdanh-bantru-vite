import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Card, Button
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AccountList() {
  const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'ACCOUNT'));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setAccounts(data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu ACCOUNT:", error);
      }
    };

    fetchAccounts();
  }, []);

  const roleLabels = {
    yte: "Y tế",
    ketoan: "Kế toán",
    bgh: "Ban Giám hiệu",
    admin: "Admin",
    };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0, backgroundColor: '#e3f2fd', minHeight: '100vh' }}>
      <Card
        sx={{
          mt: 4,
          p: { xs: 2, sm: 3, md: 4 },
          maxWidth: 470,
          width: '100%',
          borderRadius: 4,
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          backgroundColor: 'white',
        }}
        elevation={10}
      >
        <Typography
          variant="h5"
          align="center"
          color="primary"
          sx={{ mb: 4, borderBottom: '3px solid #1976d2', pb: 1, fontWeight: 'bold' }}
        >
          DANH SÁCH TÀI KHOẢN
        </Typography>

        <TableContainer component={Paper}>
          <Table size="small" sx={{ border: '1px solid #ccc' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#1976d2' }}>
                {['STT', 'USERNAME', 'PASSWORD'].map((label, idx) => (
                  <TableCell key={idx} align="center" sx={{ color: '#fff', fontWeight: 'bold' }}>
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
                {accounts.length === 0 ? (
                    <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ fontStyle: 'italic' }}>
                        Không có tài khoản nào
                    </TableCell>
                    </TableRow>
                ) : (
                    accounts.map((item, index) => {
                    const isManager = ['yte', 'ketoan', 'bgh', 'admin'].includes(item.username?.toLowerCase());
                    const displayName = roleLabels[item.username?.toLowerCase()] || item.username;

                    return (
                        <TableRow
                        key={item.id}
                        sx={{
                            backgroundColor: isManager ? '#f1fbfd' : 'inherit',
                        }}
                        >
                        <TableCell align="center">{index + 1}</TableCell>
                        <TableCell align="center">{displayName}</TableCell>
                        <TableCell align="center">{item.password}</TableCell>
                        </TableRow>
                    );
                    })
                )}
                </TableBody>

          </Table>
        </TableContainer>

        {/* Nút Quay lại */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            onClick={() => {
              const selectedClass = location.state?.lop;
              const selectedLop = selectedClass?.split('.')[0];
              if (selectedLop) {
                navigate(`/lop${selectedLop}`, { state: { lop: selectedClass } });
              } else {
                navigate('/admin'); // fallback nếu không có thông tin lớp
              }
            }}
            color="secondary"
          >
            ⬅️ Quay lại
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
