import { doc, getDoc, setDoc, deleteDoc, deleteField } from 'firebase/firestore';
import { db } from '../../firebase';

/**
 * Ghi điểm danh 1 học sinh và cập nhật lại context (UI) sau khi đã ghi DANHSACH thành công
 */
export const saveSingleDiemDanh = async (
  student,
  namHoc,
  selectedClass,
  classData,
  setClassData
) => {
  const now = new Date();
  const vietnamOffsetMs = 7 * 60 * 60 * 1000;
  const vietnamNow = new Date(now.getTime() + vietnamOffsetMs);
  const today = vietnamNow.toISOString().split('T')[0];
  const thang = today.slice(0, 7);
  const nam = today.slice(0, 4);

  const diemDanhCol = `DIEMDANH_${namHoc}`;
  const diemDanhRef = doc(db, diemDanhCol, `${student.id}_${today}`);
  const danhSachRef = doc(db, `DANHSACH_${namHoc}`, selectedClass);

  const trimmedLyDo = (student.lyDo || '').trim();
  const lyDoGhi = trimmedLyDo === '' ? 'Không rõ lý do' : trimmedLyDo;
  const phep = student.vangCoPhep === 'có phép';

  const fullList = classData[selectedClass] || [];
  const merged = fullList.map(s => {
    if (s.id !== student.id) return s;

    const updated = {
      ...s,
      diemDanh: student.diemDanh,
      registered: student.registered
    };

    if (student.diemDanh === true) {
      delete updated.lyDo;
      delete updated.phep;
    } else {
      updated.lyDo = student.lyDo || '';
      updated.phep = phep;
    }

    return updated;
  });

  try {
    // 1. Đọc DANHSACH_...
    const snap = await getDoc(danhSachRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const hocSinh = data.hocSinh || [];

    const updatedHocSinh = hocSinh.map(hs => {
      if ((hs.id || hs.maDinhDanh) !== student.id) return hs;

      const updated = { ...hs };
      if (student.diemDanh === true) {
        delete updated.lyDo;
        delete updated.phep;
      } else {
        updated.lyDo = lyDoGhi;
        updated.phep = phep;
      }

      return updated;
    });

    await setDoc(danhSachRef, {
      ...data,
      hocSinh: updatedHocSinh,
      updatedAt: new Date().toISOString()
    });

    // 2. Ghi hoặc xoá DIEMDANH_...
    if (student.diemDanh === false) {
      await setDoc(diemDanhRef, {
        maDinhDanh: student.id,
        hoTen: student.hoVaTen || '',
        lop: student.lop || '',
        khoi: student.khoi || '',
        ngay: today,
        thang,
        nam,
        lyDo: lyDoGhi,
        phep
      });
    } else {
      await deleteDoc(diemDanhRef);
    }

    // ✅ Sau khi ghi DANHSACH xong, mới cập nhật context (UI)
    //setClassData(selectedClass, merged);

  } catch (err) {
    console.error(`❌ Lỗi khi lưu điểm danh học sinh ${student.id}:`, err.message);
    throw err;
  }
};
