import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../../firebase';

export const saveSingleDiemDanh = async (student, namHoc) => {
  const today = new Date().toISOString().split('T')[0];
  const docRef = doc(db, `BANTRU_${namHoc}`, student.id);

  try {
    if (!student.diemDanh) {
      // ✅ Khi học sinh VẮNG
      const value =
        student.vangCoPhep === 'có phép' ? 'P' :
        student.vangCoPhep === 'không phép' ? 'K' :
        '';

      await updateDoc(docRef, {
        [`Diemdanh.${today}`]: value,
        [`LyDoVang.${today}`]: student.lyDo || '',
        vang: 'x',
        lyDo: student.lyDo || '',
      });
    } else {
      // ✅ Khi học sinh đi học lại → xoá dữ liệu ngày hôm nay
      await updateDoc(docRef, {
        [`Diemdanh.${today}`]: deleteField(),
        [`LyDoVang.${today}`]: deleteField(),
        lyDo: deleteField(),
        vang: '', // hoặc bạn có thể bỏ hẳn field này nếu không dùng
      });
    }
  } catch (err) {
    console.error(`Lỗi khi lưu điểm danh học sinh ${student.id}:`, err.message);
    throw err;
  }
};
