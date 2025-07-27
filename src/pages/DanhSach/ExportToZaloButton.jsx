// 📤 Sao chép tin nhắn để gửi qua Zalo
import { Button } from '@mui/material';

export default function ExportToZaloButton({ student }) {
  const handleClick = () => {
    const msg = `Học sinh: ${student.hoVaTen}\nVắng: ${student.vangCoPhep || '[chưa chọn]'}\nLý do: ${student.lyDo || '[chưa nhập]'}`;
    navigator.clipboard.writeText(msg).then(() => alert('Đã sao chép tin nhắn. Dán vào Zalo để gửi.'));
  };

  return (
    <Button
      variant="outlined"
      color="primary"
      onClick={handleClick}
      size="small"
      sx={{
        whiteSpace: 'nowrap',
        px: 2.5,
        height: '40px',
        backgroundColor: '#e3f2fd',
        '&:hover': {
          backgroundColor: '#bbdefb',
        },
      }}
    >
      Xuất Zalo
    </Button>
  );
}