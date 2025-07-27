import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export const saveRegistrationChanges = async (
  students,
  namHoc,
  selectedClass,
  setClassData,
  classData
) => {
  const col = `DANHSACH_${namHoc}`;
  const classRef = doc(db, col, selectedClass);

  try {
    // 🧲 Lấy dữ liệu từ Firestore
    const docSnap = await getDoc(classRef);
    if (!docSnap.exists()) return;

    const data = docSnap.data();
    const hocSinh = data.hocSinh || [];

    // 📌 Map ID → registered (dữ liệu từ UI)
    const regMap = new Map(
      students.map(s => [
        s.maDinhDanh || s.id,
        !!s.registered // đảm bảo boolean
      ])
    );

    // 🛠️ Cập nhật trạng thái trong danh sách học sinh gốc từ Firestore
    const updatedHocSinh = hocSinh.map(hs => {
      const reg = regMap.get(hs.id);
      return reg !== undefined
        ? { ...hs, diemDanhBanTru: reg }
        : { ...hs };
    });

    // 📝 Ghi ngược vào Firestore
    await setDoc(classRef, {
      ...data,
      hocSinh: updatedHocSinh,
      updatedAt: new Date().toISOString()
    });

    // 🧠 Tạo studentMap từ dữ liệu UI để giữ các field bổ sung
    const studentMap = new Map(
      students.map(s => [s.maDinhDanh || s.id, s])
    );

    // 🔀 Trộn lại dữ liệu từ Firestore và UI
    const mergedList = updatedHocSinh.map(hs => {
      const source = studentMap.get(hs.id);
      return {
        ...hs,
        ...(source || {}),
        hoVaTen: hs.hoTen || source?.hoVaTen || 'Không có tên',
        // ✅ Đảm bảo luôn có 'registered' để checkbox hiển thị đúng
        registered: source?.registered ?? hs.diemDanhBanTru ?? false
      };
    });

    // 👀 LOG: kiểm tra dữ liệu trước khi cập nhật UI
    //console.log("✅ Dữ liệu chuẩn bị gửi vào setClassData:", {
    //  selectedClass,
    //  mergedList: mergedList.map(hs => ({
    //    id: hs.id,
    //    hoVaTen: hs.hoVaTen,
    //    registered: hs.registered,
    //    diemDanhBanTru: hs.diemDanhBanTru
    //  }))
    //});

    // 🎯 Cập nhật dữ liệu lên context
    //setClassData(selectedClass, mergedList);
  } catch (err) {
    console.error('❌ Lỗi khi lưu dữ liệu bán trú:', err);
  }
};