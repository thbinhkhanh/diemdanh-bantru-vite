// 📄 Hiển thị dòng mở rộng để nhập lý do học sinh vắng
import { TableRow, TableCell, Stack, TextField, FormControlLabel, Radio } from '@mui/material';
import ExportToZaloButton from './ExportToZaloButton';

export default function AbsentDetailRow({
  student,
  index,
  viewMode,
  expandedRowId,
  handleVangCoPhepChange,
  handleLyDoChange,
}) {
  if (!student.diemDanh && expandedRowId === student.id) {
    return (
      <TableRow>
        <TableCell colSpan={viewMode === 'bantru' ? 4 : 3} sx={{ backgroundColor: '#f9f9f9' }}>
          <Stack spacing={1} sx={{ pl: 2, py: 1 }}>
            <Stack direction="row" spacing={4}>
              <FormControlLabel
                control={
                  <Radio
                    checked={student.vangCoPhep === 'có phép'}
                    onChange={() => handleVangCoPhepChange(index, 'có phép')}
                    value="có phép"
                    color="primary"
                    size="small"
                  />
                }
                label="Có phép"
              />
              <FormControlLabel
                control={
                  <Radio
                    checked={student.vangCoPhep === 'không phép'}
                    onChange={() => handleVangCoPhepChange(index, 'không phép')}
                    value="không phép"
                    color="primary"
                    size="small"
                  />
                }
                label="Không phép"
              />
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Lý do"
                value={student.lyDo || ''}
                onChange={(e) => handleLyDoChange(index, e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
              <ExportToZaloButton student={student} />
            </Stack>
          </Stack>
        </TableCell>
      </TableRow>
    );
  }
  return null;
}