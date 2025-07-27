// 🔀 Chuyển chế độ giữa "Điểm danh" và "Bán trú"
import { FormControlLabel, Radio, Stack } from '@mui/material';

export default function ViewModeSwitcher({ viewMode, setViewMode }) {
  return (
    <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1, mb: 2 }}>
      <FormControlLabel
        value="diemdanh"
        control={<Radio checked={viewMode === 'diemdanh'} onChange={() => setViewMode('diemdanh')} />}
        label="Điểm danh"
      />
      <FormControlLabel
        value="bantru"
        control={<Radio checked={viewMode === 'bantru'} onChange={() => setViewMode('bantru')} />}
        label="Bán trú"
      />
    </Stack>
  );
}