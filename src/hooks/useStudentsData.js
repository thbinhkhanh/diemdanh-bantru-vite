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

    const colRef = collection(db, `DANHSACH_${year}`, 'lop');
    const snapshot = await getDocs(colRef);

    const data = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(student => useNewVersion || student.lop === className); // ⬅️ Giữ đúng logic lọc

    setStudents(data);
    setIsLoading(false);
  };

  const updateStudent = async (id, newData) => {
    await updateDoc(doc(db, `DANHSACH_${year}`, 'lop', id), newData);
  };

  useEffect(() => {
    fetchStudents();
  }, [year, className]);

  return {
    students,
    isLoading,
    updateStudent,
    fetchStudents,
  };
};
