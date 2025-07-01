import { collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const deleteAllDateFields = async ({
  setDeleteProgress,
  setDeleteMessage,
  setDeleteSeverity,
  namHocValue, // ➕ Thêm giá trị năm học từ ngoài truyền vào
}) => {
  setDeleteProgress(1);
  setDeleteMessage("");
  setDeleteSeverity("info");

  try {
    const banTruCol = collection(db, `BANTRU_${namHocValue}`); // 🔁 Sử dụng động theo năm học
    const docsSnap = await getDocs(banTruCol);
    const total = docsSnap.size;
    let processed = 0;
    let totalFieldsDeleted = 0;

    for (const docSnap of docsSnap.docs) {
      const docRef = docSnap.ref;
      const docData = docSnap.data();
      const data = docData.data || {};

      const newData = {};
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      let deleted = 0;

      for (const key in data) {
        if (dateRegex.test(key)) {
          deleted++;
        } else {
          newData[key] = data[key];
        }
      }

      if (deleted > 0) {
        await updateDoc(docRef, { data: newData });
        totalFieldsDeleted += deleted;
      }

      processed++;
      setDeleteProgress(Math.round((processed / total) * 100));
      await new Promise((res) => setTimeout(res, 50));
    }

    setDeleteMessage(`✅ Đã xóa ${totalFieldsDeleted} ngày trong ${total} lớp.`);
    setDeleteSeverity("success");
  } catch (error) {
    console.error("❌ Lỗi khi xóa:", error);
    setDeleteMessage("❌ Có lỗi xảy ra khi xóa.");
    setDeleteSeverity("error");
  } finally {
    setDeleteProgress(0);
  }
};
