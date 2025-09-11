import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { getDocs, collection, updateDoc, doc } from 'firebase/firestore';

export const useStudentsData = ({ year, className, useNewVersion = false }) => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = async () => {
    if (!year || !className) {
      console.error("❌ Thiếu year hoặc className");
      return;
    }

    setIsLoading(true);

    try {
      const colRef = collection(db, `DANHSACH_${year}`, 'lop');
      const snapshot = await getDocs(colRef);

      const fetchedData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(student => useNewVersion || student.lop === className);

      // Merge với state hiện tại để giữ checkbox đã toggle
      setStudents(prev => {
        const mapPrev = Object.fromEntries(prev.map(s => [s.id, s]));
        return fetchedData.map(s => ({
          ...s,
          registered: mapPrev[s.id]?.registered ?? s.registered,
          diemDanhBanTru: mapPrev[s.id]?.diemDanhBanTru ?? s.diemDanhBanTru,
        }));
      });

    } catch (err) {
      console.error("❌ Lỗi fetchStudents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStudent = async (id, newData) => {
    // Cập nhật state cục bộ trước
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...newData } : s));

    // Ghi lên Firestore
    try {
      await updateDoc(doc(db, `DANHSACH_${year}`, 'lop', id), newData);
    } catch (err) {
      console.error("❌ Lỗi updateStudent:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, className]);

  return {
    students,
    isLoading,
    updateStudent,
    fetchStudents,
    setStudents, // để toggle cục bộ nếu cần
  };
};
