import React, { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection
} from "firebase/firestore";
import { db, auth } from "./firebase";

const Admin = () => {
  const [firestoreEnabled, setFirestoreEnabled] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwords, setPasswords] = useState({
    yte: "",
    ketoan: "",
    bgh: "",
    admin: ""
  });
  const [selectedYear, setSelectedYear] = useState("2024-2025");

  // --- Lấy trạng thái firestore từ Firestore ---
  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const docRef = doc(db, "SETTINGS", "TAIDULIEU");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFirestoreEnabled(!!docSnap.data().theokhoi);
        }
      } catch (err) {
        console.error("Không thể tải cài đặt:", err.message);
      }
    };
    fetchSetting();
  }, []);

  // --- Toggle firestore ---
  const handleToggleChange = async (e) => {
    const newValue = e.target.value === "khoi";
    setFirestoreEnabled(newValue);
    try {
      await setDoc(doc(db, "SETTINGS", "TAIDULIEU"), {
        theokhoi: newValue
      });
    } catch (error) {
      alert("❌ Không thể cập nhật chế độ Firestore!");
    }
  };

  // --- Đổi mật khẩu ---
  const handleChangePassword = async (type) => {
    if (!newPassword.trim()) {
      alert("⚠️ Vui lòng nhập mật khẩu mới!");
      return;
    }

    const accountDisplayNames = {
      yte: "Y tế",
      ketoan: "Kế toán",
      bgh: "BGH",
      admin: "Admin"
    };

    try {
      await setDoc(
        doc(db, "ACCOUNT", type.toUpperCase()),
        { password: newPassword },
        { merge: true }
      );

      setPasswords((prev) => ({
        ...prev,
        [type]: newPassword
      }));

      alert(`✅ Đã đổi mật khẩu cho tài khoản ${accountDisplayNames[type] || type}!`);
      setNewPassword("");
    } catch (err) {
      alert("❌ Không thể đổi mật khẩu!");
    }
  };

  // --- Tạo tài khoản lớp ---
  const handleCreateAccounts = async () => {
    try {
      const truongRef = doc(db, `DANHSACH_${selectedYear}`, "TRUONG");
      const truongSnap = await getDoc(truongRef);

      if (!truongSnap.exists()) {
        alert("❌ Không tìm thấy dữ liệu TRUONG!");
        return;
      }

      const list = truongSnap.data().list;
      if (!Array.isArray(list) || list.length === 0) {
        alert("❌ Danh sách lớp không hợp lệ hoặc trống!");
        return;
      }

      const created = [];

      for (const lop of list) {
        await setDoc(doc(db, "ACCOUNT", lop), {
          password: "123456"
        });
        created.push(lop);
      }

      alert(`✅ Đã tạo ${created.length} tài khoản lớp: ${created.join(", ")}`);
    } catch (error) {
      console.error("❌ Lỗi khi tạo tài khoản:", error.message);
      alert("❌ Không thể tạo tài khoản lớp!");
    }
  };

  // --- Xóa dữ liệu điểm danh ---
  const handleDeleteAll = async () => {
    const confirmed = window.confirm(
      `⚠️ Bạn có chắc chắn muốn xóa tất cả dữ liệu điểm danh của năm ${selectedYear}?`
    );
    if (!confirmed) return;

    // Giả lập (cần thay bằng hàm thực tế)
    alert("✅ Đã xóa dữ liệu (giả lập)");
  };

  // --- Reset điểm danh về mặc định ---
  const handleSetDefault = async () => {
    const confirmed = window.confirm("⚠️ Bạn có chắc muốn reset điểm danh?");
    if (!confirmed) return;

    try {
      const namHocDoc = await getDoc(doc(db, "YEAR", "NAMHOC"));
      const namHocValue = namHocDoc.exists() ? namHocDoc.data().value : null;

      if (!namHocValue) {
        alert("❌ Không tìm thấy năm học hợp lệ!");
        return;
      }

      const collectionName = `BANTRU_${namHocValue}`;
      const snapshot = await getDocs(collection(db, collectionName));
      const docs = snapshot.docs;

      for (const docSnap of docs) {
        const data = docSnap.data();
        let newData = {
          ...data,
          vang: "",
          lyDo: ""
        };
        if (data.huyDangKy !== "x") {
          newData.huyDangKy = "T";
        }
        await setDoc(doc(db, collectionName, docSnap.id), newData);
      }

      alert("✅ Đã reset điểm danh!");
    } catch (error) {
      alert("❌ Lỗi khi reset điểm danh!");
    }
  };

  // --- Khởi tạo năm học mới ---
  const handleInitNewYearData = async () => {
    const confirmed = window.confirm(
      `⚠️ Bạn có chắc muốn khởi tạo dữ liệu cho năm ${selectedYear}?`
    );
    if (!confirmed) return;

    const danhSachDocs = ["K1", "K2", "K3", "K4", "K5", "TRUONG"];

    try {
      for (const docName of danhSachDocs) {
        await setDoc(doc(db, `DANHSACH_${selectedYear}`, docName), {
          list: ""
        });
      }

      await setDoc(doc(db, `BANTRU_${selectedYear}`, "init"), {
        temp: ""
      });

      alert(`✅ Đã khởi tạo dữ liệu cho năm học ${selectedYear}`);
    } catch (err) {
      alert("❌ Không thể khởi tạo dữ liệu năm mới!");
    }
  };

  return (
    <div>
      <h1>Quản trị viên</h1>

      <div>
        <h2>Chế độ Firestore</h2>
        <label>
          <input
            type="radio"
            name="firestoreToggle"
            value="khoi"
            checked={firestoreEnabled === true}
            onChange={handleToggleChange}
          />
          Kích hoạt
        </label>
        <label>
          <input
            type="radio"
            name="firestoreToggle"
            value="tat"
            checked={firestoreEnabled === false}
            onChange={handleToggleChange}
          />
          Tắt
        </label>
      </div>

      <div>
        <h2>Đổi mật khẩu</h2>
        <input
          type="password"
          placeholder="Nhập mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        {["yte", "ketoan", "bgh", "admin"].map((type) => (
          <button key={type} onClick={() => handleChangePassword(type)}>
            Đổi mật khẩu {type.toUpperCase()}
          </button>
        ))}
      </div>

      <div>
        <h2>Tạo tài khoản lớp</h2>
        <button onClick={handleCreateAccounts}>Tạo tài khoản lớp</button>
      </div>

      <div>
        <h2>Xóa dữ liệu điểm danh</h2>
        <button onClick={handleDeleteAll}>Xóa tất cả dữ liệu điểm danh</button>
      </div>

      <div>
        <h2>Reset điểm danh về mặc định</h2>
        <button onClick={handleSetDefault}>Reset điểm danh</button>
      </div>

      <div>
        <h2>Khởi tạo dữ liệu năm học mới</h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="2024-2025">2024-2025</option>
          <option value="2023-2024">2023-2024</option>
          {/* Thêm các năm học khác nếu cần */}
        </select>
        <button onClick={handleInitNewYearData}>Khởi tạo dữ liệu</button>
      </div>
    </div>
  );
};

export default Admin;
