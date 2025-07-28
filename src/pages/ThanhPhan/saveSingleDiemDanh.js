import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

/**
 * Ghi trạng thái điểm danh của một học sinh vào Firestore
 * - Cập nhật danh sách lớp: DANHSACH_<namHoc>
 * - Ghi hoặc xoá bản điểm danh riêng: DIEMDANH_<namHoc>
 */
export const saveSingleDiemDanh = async (
  student,
  namHoc,
  selectedClass
) => {
  try {
    // ⏱️ Giờ Việt Nam hiện tại
    const now = new Date();
    const vietnamOffsetMs = 7 * 60 * 60 * 1000;
    const vietnamNow = new Date(now.getTime() + vietnamOffsetMs);
    const today = vietnamNow.toISOString().split('T')[0];
    const thang = today.slice(0, 7); // yyyy-mm
    const nam = today.slice(0, 4);   // yyyy

    // 🔗 Firestore references
    const col = `DANHSACH_${namHoc}`;
    const diemDanhCol = `DIEMDANH_${namHoc}`;
    const danhSachRef = doc(db, col, selectedClass);
    const diemDanhRef = doc(db, diemDanhCol, `${student.maDinhDanh || student.id}_${today}`);

    // 📌 Lý do và trạng thái phép
    const trimmedLyDo = (student.lyDo || '').trim();
    const lyDoGhi = trimmedLyDo === '' ? 'Không rõ lý do' : trimmedLyDo;
    const phep = student.vangCoPhep === 'có phép';

    // 🧾 Đọc dữ liệu DANHSACH hiện tại
    const snap = await getDoc(danhSachRef);
    if (!snap.exists()) {
      console.warn(`⚠️ Không tìm thấy lớp ${selectedClass}`);
      return;
    }

    const data = snap.data();
    const hocSinh = data.hocSinh || [];

    // 🔄 Cập nhật học sinh tương ứng
    const updatedHocSinh = hocSinh.map(hs => {
      const studentId = student.maDinhDanh || student.id;
      const hsId = hs.id || hs.maDinhDanh;
      if (hsId !== studentId) return hs;

      const updated = { ...hs };

      if (student.diemDanh === true) {
        delete updated.lyDo;
        delete updated.phep;
      } else {
        updated.lyDo = lyDoGhi;
        updated.phep = phep;
      }

      updated.diemDanh = student.diemDanh ?? false;
      return updated;
    });

    // ☁️ Ghi lại vào DANHSACH_<namHoc>
    await setDoc(danhSachRef, {
      ...data,
      hocSinh: updatedHocSinh,
      updatedAt: vietnamNow.toISOString()
    });

    // 📌 Ghi hoặc xoá bản điểm danh riêng
    if (student.diemDanh === false) {
      await setDoc(diemDanhRef, {
        maDinhDanh: student.maDinhDanh || student.id,
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

    console.log(`✅ Đã ghi điểm danh cho ${student.hoVaTen} vào DANHSACH và DIEMDANH`);
  } catch (err) {
    console.error(`❌ Lỗi ghi điểm danh cho ${student.maDinhDanh}:`, err.message);
    throw err;
  }
};