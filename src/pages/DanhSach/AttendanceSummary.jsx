// 📊 Hiển thị thống kê và danh sách học sinh vắng
import { Box, Stack, Typography } from '@mui/material';

export default function AttendanceSummary({ students }) {
  const vangs = students.filter(s => !s.diemDanh);
  const vangsCoPhep = vangs.filter(s => s.vangCoPhep === 'có phép');
  const vangsKhongPhep = vangs.filter(s => s.vangCoPhep === 'không phép');

  return (
    <Box sx={{ mb: 2, p: 2, backgroundColor: '#f1f8e9', borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Thông tin tóm tắt
      </Typography>
      <Stack direction="row" spacing={4} sx={{ pl: 2 }}>
        <Typography variant="body2">Sĩ số: <strong>{students.length}</strong></Typography>
        <Typography variant="body2">
          Vắng: Phép: <strong>{vangsCoPhep.length}</strong> &nbsp;&nbsp;
          Không: <strong>{vangsKhongPhep.length}</strong>
        </Typography>
      </Stack>

      <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
        Danh sách học sinh vắng:
      </Typography>
      <Box sx={{ pl: 2 }}>
        {vangs.length === 0 ? (
          <Typography variant="body2">Không có học sinh vắng.</Typography>
        ) : (
          <Box component="ul" sx={{ pl: 2, mt: 0.5 }}>
            {vangs.map((s) => (
              <li key={s.id}>{s.hoVaTen || 'Không tên'} ({s.vangCoPhep === 'có phép' ? 'P' : 'K'})</li>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}