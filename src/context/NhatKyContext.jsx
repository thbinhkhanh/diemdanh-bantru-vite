import { createContext, useContext, useState } from "react";

const NhatKyContext = createContext();

export const NhatKyProvider = ({ children }) => {
  const [nhatKyData, setNhatKyData] = useState({});

  // ✅ Hàm merge: Thêm hoặc cập nhật entries vào context
  const mergeNhatKy = ({ classId, year, month, day = null, entries }) => {
    if (!Array.isArray(entries) || entries.length === 0) {
      console.warn(
        `❌ Không lưu nhật ký lớp ${classId} tại ${year}/${month}${day ? "/" + day : ""} vì dữ liệu rỗng hoặc không hợp lệ`
      );
      return;
    }

    // Nếu không có ngày cụ thể => dùng "__month__"
    const dayKey = day ? String(day).padStart(2, "0") : "__month__";

    setNhatKyData((prev) => {
      const prevClass = prev[classId] || {};
      const prevYear = prevClass[year] || {};
      const prevMonth = prevYear[month] || {};
      const prevEntries = prevMonth[dayKey] || [];

      const mergedMap = new Map();

      // Gộp dữ liệu cũ và mới theo ID + ngày để tránh trùng
      [...prevEntries, ...entries].forEach((entry) => {
        if (entry?.id && entry?.ngay) {
          const key = `${entry.id}-${entry.ngay}`;
          mergedMap.set(key, entry);
        }
      });

      const mergedEntries = Array.from(mergedMap.values());

      return {
        ...prev,
        [classId]: {
          ...prevClass,
          [year]: {
            ...prevYear,
            [month]: {
              ...prevMonth,
              [dayKey]: mergedEntries,
            },
          },
        },
      };
    });

    console.log(
      `📘 Merge nhật ký lớp ${classId} - ${year}/${month}${day ? "/" + day : ""}: ${entries.length} mục`
    );
  };

  // ✅ Hàm get: Lấy nhật ký theo ngày hoặc toàn bộ tháng
  const getNhatKy = ({ classId, year, month, day = null }) => {
    const data = nhatKyData?.[classId]?.[year]?.[month];
    if (!data) return [];

    if (day) {
      const dayKey = String(day).padStart(2, "0");
      return data[dayKey] || [];
    }

    // Trả về toàn bộ dữ liệu trong tháng (gộp "__month__" + các ngày)
    return Object.values(data).flat();
  };

  // 🔵 Debug: Log toàn bộ state
  console.log("🔵 [DEBUG] Context Provider data:", nhatKyData);

  return (
    <NhatKyContext.Provider value={{ nhatKyData, mergeNhatKy, getNhatKy }}>
      {children}
    </NhatKyContext.Provider>
  );
};

// Hook để sử dụng context
export const useNhatKy = () => useContext(NhatKyContext);
