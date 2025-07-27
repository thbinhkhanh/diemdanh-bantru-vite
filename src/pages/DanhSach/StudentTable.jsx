// 📋 Hiển thị bảng học sinh với tùy chọn điểm danh hoặc bán trú
import React from 'react';
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Stack,
  Typography,
} from '@mui/material';
import StudentRow from './StudentRow';
import AbsentDetailRow from './AbsentDetailRow';

export default function StudentTable({
  students,
  viewMode,
  checkAllBanTru,
  handleCheckAllChange,
  toggleDiemDanh,
  toggleRegister,
  expandedRowId,
  setExpandedRowId,
  handleVangCoPhepChange,
  handleLyDoChange,
}) {
  const filteredStudents =
    viewMode === 'bantru'
      ? students.filter((s) => s.dangKyBanTru)
      : students;

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 1, mt: 2 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell
              align="center"
              sx={{
                fontWeight: 'bold',
                backgroundColor: '#1976d2',
                color: 'white',
              }}
            >
              STT
            </TableCell>

            <TableCell
              align="center"
              sx={{
                fontWeight: 'bold',
                backgroundColor: '#1976d2',
                color: 'white',
              }}
            >
              HỌ VÀ TÊN
            </TableCell>

            {viewMode === 'diemdanh' && (
              <TableCell
                align="center"
                sx={{
                  fontWeight: 'bold',
                  backgroundColor: '#1976d2',
                  color: 'white',
                }}
              >
                ĐIỂM DANH
              </TableCell>
            )}

            {viewMode === 'bantru' && (
              <TableCell
                align="center"
                sx={{
                  fontWeight: 'bold',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  px: { xs: 0.5, sm: 2 },
                  width: { xs: 55, sm: 'auto' },
                  whiteSpace: { xs: 'pre-wrap', sm: 'nowrap' },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  spacing={1}
                >
                  <Typography
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      lineHeight: 1.1,
                    }}
                  >
                    BÁN{"\n"}TRÚ
                  </Typography>
                  <Checkbox
                    checked={checkAllBanTru}
                    onChange={handleCheckAllChange}
                    size="small"
                    color="default"
                    sx={{
                      p: 0,
                      color: 'white',
                      '& .MuiSvgIcon-root': { fontSize: 18 },
                    }}
                  />
                </Stack>
              </TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredStudents.map((student, visibleIndex) => (
            <React.Fragment key={student.id}>
              <StudentRow
                index={visibleIndex}
                student={student}
                viewMode={viewMode}
                toggleDiemDanh={() => toggleDiemDanh(student.id)} // ✅ sửa dùng student.id
                toggleRegister={() => toggleRegister(student.id)} // ✅ tương tự bán trú
                setExpandedRowId={setExpandedRowId}
              />
              <AbsentDetailRow
                student={student}
                index={visibleIndex}
                viewMode={viewMode}
                expandedRowId={expandedRowId}
                handleVangCoPhepChange={handleVangCoPhepChange}
                handleLyDoChange={handleLyDoChange}
              />
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}