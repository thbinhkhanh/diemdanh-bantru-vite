import { doc, getDoc, updateDoc } from "firebase/firestore";
import * as XLSX from "xlsx";
import { db } from "../firebase";

export const updateTeacherNamesFromFile = async (
  file,
  setTeacherProgress,
  setMessage,
  setSeverity,
  setUpdateTeacherName // 👈 Thêm tham số mới
) => {
  if (!file) {
    setMessage("❗ Vui lòng chọn file Excel hợp lệ.");
    setSeverity("error");
    return;
  }

  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const expectedHeaders = ["STT", "HỌ VÀ TÊN", "LỚP"];
      const headerRow = Object.keys(jsonData[0] || {});
      const isValid = expectedHeaders.every((h) => headerRow.includes(h));

      if (!isValid) {
        setMessage("❌ File Excel không đúng định dạng yêu cầu.");
        setSeverity("error");
        return;
      }

      const total = jsonData.length;
      let successCount = 0;
      let skipCount = 0;
      let failCount = 0;

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        const lop = row["LỚP"]?.toString().trim().toUpperCase();
        const hoTenGoc = row["HỌ VÀ TÊN"]?.toString().trim();

        if (!lop || !hoTenGoc) continue;

        const expectedHoTen = hoTenGoc.toUpperCase();

        try {
          const ref = doc(db, "ACCOUNT", lop);
          const existing = await getDoc(ref);

          if (existing.exists()) {
            const currentHoTen = (existing.data().hoTen || "").toUpperCase();

            if (currentHoTen !== expectedHoTen) {
              await updateDoc(ref, { hoTen: expectedHoTen });
              successCount++;
            } else {
              skipCount++;
            }
          } else {
            failCount++;
          }
        } catch (err) {
          console.error("Lỗi cập nhật:", err);
          failCount++;
        }

        const percent = Math.round(((i + 1) / total) * 100);
        setTeacherProgress(percent);
      }

      setMessage(`✅ Cập nhật xong ${successCount} giáo viên, bỏ qua ${skipCount} giáo viên.`);
      setSeverity("success");
    } catch (err) {
      console.error("❌ Lỗi đọc file:", err);
      setMessage("❌ Lỗi khi xử lý file Excel.");
      setSeverity("error");
    } finally {
      setTimeout(() => setTeacherProgress(0), 3000);
      if (setUpdateTeacherName) setUpdateTeacherName(false); // ✅ Reset checkbox
    }
  };

  reader.readAsArrayBuffer(file);
};
