import {
  collection,
  getDocs,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { formatExcel } from "./formatExcel.js";
import * as XLSX from "xlsx";

/** 🎯 Sao lưu một số collection Firestore sang JSON theo năm học */
export const downloadBackupAsJSON = async () => {
  try {
    const namHocDoc = await getDoc(doc(db, "YEAR", "NAMHOC"));
    const namHocValue = namHocDoc.exists() ? namHocDoc.data().value : null;

    if (!namHocValue) {
      alert("❗ Không tìm thấy năm học hợp lệ trong hệ thống!");
      return;
    }

    const collectionsToBackup = [
      `DANHSACH_${namHocValue}`,
      `DIEMDANH_${namHocValue}`,
      `BANTRU_${namHocValue}`,
    ];

    const backupContent = {};

    for (const colName of collectionsToBackup) {
      const colSnap = await getDocs(collection(db, colName));
      backupContent[colName] = {};

      for (const docSnap of colSnap.docs) {
        const rawData = docSnap.data();
        const converted = {};
        for (const [key, value] of Object.entries(rawData)) {
          converted[key] = value instanceof Timestamp ? value.toDate().toISOString() : value;
        }
        backupContent[colName][docSnap.id] = converted;
      }
    }

    const blob = new Blob([JSON.stringify(backupContent, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const now = new Date();
    const formatNum = (n) => String(n).padStart(2, "0");
    const filename = `Backup_Firestore_${namHocValue}_${formatNum(now.getDate())}_${formatNum(now.getMonth() + 1)}_${now.getFullYear()}_${formatNum(now.getHours())}_${formatNum(now.getMinutes())}.json`;

    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    console.log("✅ Đã tạo file JSON sao lưu!");
  } catch (error) {
    console.error("❌ Lỗi khi tạo file JSON:", error);
    alert("❌ Không thể sao lưu dữ liệu.");
  }
};
