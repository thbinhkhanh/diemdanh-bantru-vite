import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export const saveMultipleDiemDanh = async (students, namHoc, today) => {
  const col = `BANTRU_${namHoc}`;

  const updates = students.map((s) => {
    const value =
      s.vangCoPhep === 'có phép'
        ? 'P'
        : s.vangCoPhep === 'không phép'
        ? 'K'
        : '';

    const update = {
      [`Diemdanh.${today}`]: value,
      [`LyDoVang.${today}`]: s.lyDo || '',
      vang: 'x' // 👈 Quan trọng: ghi dấu học sinh vắng (tương thích `diemDanh = d.vang !== 'x'`)
    };

    return updateDoc(doc(db, col, s.id), update).catch((err) => {
      console.warn(`Không thể ghi điểm danh học sinh ${s.id}:`, err.message);
      throw err;
    });
  });

  await Promise.all(updates);
};