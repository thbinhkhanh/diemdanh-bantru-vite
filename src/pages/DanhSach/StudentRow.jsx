// 🧑‍🎓 Hiển thị thông tin hàng học sinh kèm checkbox điểm danh / bán trú
import React from 'react';
import { TableRow, TableCell, Typography, Checkbox } from '@mui/material';

export default function StudentRow({
  index,
  student,
  viewMode,
  toggleDiemDanh,
  toggleRegister,
  setExpandedRowId,
}) {
  return (
    <TableRow>
      <TableCell align="center">{index + 1}</TableCell>

      <TableCell align="left">
        <Typography
          sx={{
            cursor: !student.diemDanh ? 'pointer' : 'default',
            color: '#000000',
            '&:hover': !student.diemDanh ? { textDecoration: 'underline' } : undefined,
            whiteSpace: 'nowrap',
            overflowX: 'auto',
          }}
          onClick={() => {
            if (!student.diemDanh) {
              setExpandedRowId((prev) => (prev === student.id ? null : student.id));
            }
          }}
        >
          {student.hoVaTen || 'Không có tên'}
        </Typography>
      </TableCell>

      {viewMode === 'diemdanh' && (
        <TableCell align="center">
          <Checkbox
            checked={Boolean(student.diemDanh)}
            onChange={toggleDiemDanh}
            size="small"
            color="primary"
            />
        </TableCell>
      )}

      {viewMode === 'bantru' && (
        <TableCell align="center">
          <Checkbox
            checked={student.registered === true}
            onChange={toggleRegister}
            size="small"
            color="primary"
          />
        </TableCell>
      )}
    </TableRow>
  );
}