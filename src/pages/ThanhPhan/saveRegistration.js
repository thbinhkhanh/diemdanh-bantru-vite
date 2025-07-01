import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export const saveRegistrationChanges = async (students, namHoc) => {
  const col = `BANTRU_${namHoc}`;

  const updates = students.map(s => {
    const ref = doc(db, col, s.id);
    const value = s.registered ? 'T' : '';

    return updateDoc(ref, { huyDangKy: value }).catch(err => {
      console.warn(`Lỗi cập nhật học sinh ${s.id}:`, err.message);
      throw err;
    });
  });

  await Promise.all(updates);
};