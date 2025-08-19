import { createContext, useContext, useState, useEffect, useRef } from "react";

const ClassDataContext = createContext();

export const ClassDataProvider = ({ children }) => {
  const [classDataMap, setClassDataMap] = useState({});
  const lastResetRef = useRef(null); // lưu ngày đã reset

  // 🆕 Ghi toàn bộ dữ liệu lớp (mảng học sinh)
  const setClassData = (classId, hocSinhList) => {
    if (!Array.isArray(hocSinhList)) {
      console.warn(`❌ Không lưu lớp ${classId} vì dữ liệu không phải mảng`);
      return;
    }

    setClassDataMap(prev => ({
      ...prev,
      [classId]: hocSinhList
    }));
  };

  // 🆕 Cập nhật 1 học sinh trong lớp theo cấu trúc mới
  const updateStudentInClass = (classId, updatedStudent) => {
    setClassDataMap(prev => {
      const currentList = prev[classId] || [];

      // Tìm và cập nhật học sinh theo ID
      const newList = currentList.map(s =>
        s.id === updatedStudent.id ? { ...s, ...updatedStudent } : s
      );

      return {
        ...prev,
        [classId]: newList
      };
    });
  };

  // 🆕 Hàm lấy toàn bộ danh sách học sinh của lớp
  const getClassData = (classId) => classDataMap[classId] || [];

  // ✅ Hàm reset tất cả checkbox về true nếu cần
  const resetAllClasses = () => {
    setClassDataMap(prev => {
      const newMap = {};

      Object.keys(prev).forEach(classId => {
        newMap[classId] = prev[classId].map(s => {
          const newDiemDanh = s.diemDanh === false ? true : s.diemDanh;
          const newRegistered =
            s.dangKyBanTru && s.registered === false ? true : s.registered;

          if (newDiemDanh === s.diemDanh && newRegistered === s.registered) {
            return s;
          }

          return {
            ...s,
            diemDanh: newDiemDanh,
            registered: newRegistered
          };
        });
      });

      console.log("✅ Reset checkbox lúc", new Date().toLocaleString());
      return newMap;
    });
  };

  // ✅ Tự động reset lúc 5:00 sáng giờ Việt Nam mỗi ngày
  useEffect(() => {
    const targetHour = 21;
    const targetMinute = 5;

    const checkTimeAndReset = () => {
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
      const currentTimeStr = now.toTimeString().slice(0, 5); // "HH:MM"
      const todayStr = now.toISOString().slice(0, 10); // "YYYY-MM-DD"
      const targetTimeStr = `${String(targetHour).padStart(2, "0")}:${String(targetMinute).padStart(2, "0")}`;

      if (
        currentTimeStr === targetTimeStr &&
        lastResetRef.current !== todayStr
      ) {
        console.log("🚀 Tự động reset lúc:", currentTimeStr);
        resetAllClasses();
        lastResetRef.current = todayStr;
      }
    };

    const intervalId = setInterval(checkTimeAndReset, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [resetAllClasses]);

  return (
    <ClassDataContext.Provider
      value={{
        classDataMap,
        setClassData,
        getClassData,
        updateClassData: updateStudentInClass,
        resetAllClasses
      }}
    >
      {children}
    </ClassDataContext.Provider>
  );
};

export const useClassData = () => useContext(ClassDataContext);