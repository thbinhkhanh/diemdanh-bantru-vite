// 🎯 Dropdown chọn lớp học
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function ClassSelector({ selectedClass, classList, onChange }) {
  return (
    <FormControl size="small" sx={{ width: 120 }}>
      <InputLabel>Lớp</InputLabel>
      <Select value={selectedClass} label="Lớp" onChange={onChange}>
        {classList.map(cls => (
          <MenuItem key={cls} value={cls}>{cls}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}