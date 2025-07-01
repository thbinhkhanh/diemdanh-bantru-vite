import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../../firebase';

export const saveSingleDiemDanh = async (student, namHoc) => {
  const today = new Date().toISOString().split('T')[0];
  const docRef = doc(db, `BANTRU_${namHoc}`, student.id);

  try {
    if (!student.diemDanh) {
      const value =
        student.vangCoPhep === 'có phép' ? 'P' :
        student.vangCoPhep === 'không phép' ? 'K' :
        '';

      await updateDoc(docRef, {
        lyDo: student.lyDo || '',
        [`Diemdanh.${today}`]: value,
        [`LyDoVang.${today}`]: student.lyDo || '',
        vang: 'x' // ✅ Quan trọng: đánh dấu học sinh vắng
      });
    } else {
      await updateDoc(docRef, {
        lyDo: deleteField(),
        [`Diemdanh.${today}`]: deleteField(),
        [`LyDoVang.${today}`]: deleteField(),
        vang: '' // ✅ Trở lại trạng thái đi học
      });
    }
  } catch (err) {
    console.error(`Lỗi khi lưu điểm danh học sinh ${student.id}:`, err.message);
    throw err;
  }
};