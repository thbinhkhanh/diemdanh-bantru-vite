import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, TextField, Button, Stack,
  Card, Divider, Select, MenuItem, FormControl, InputLabel,
  RadioGroup, Radio, FormControlLabel, LinearProgress, Alert,
  Tabs, Tab, Checkbox, FormGroup
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import Banner from "./pages/Banner";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { deleteField, doc, getDoc, setDoc } from "firebase/firestore";
import { useClassData } from "./context/ClassDataContext";

// 🧠 Import logic đã tách
import { xoaDatabase } from "./utils/xoaDatabase";
import { resetBanTru } from "./utils/resetBanTru";
import { resetDiemDanh } from "./utils/resetDiemDanh";

import {
  downloadBackupAsJSON,
  downloadBackupAsExcel,
} from "./utils/backupUtils";
import {
  restoreFromJSONFile,
  restoreFromExcelFile,
} from "./utils/restoreUtils";


// ✅ Component phụ hiển thị tiến trình
const ResetProgressText = ({ label, progress }) => (
  <Typography variant="caption" align="center" display="block" mt={0.5}>
    {label}... {progress}%
  </Typography>
);

export default function Admin({ onCancel }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { getClassData, setClassData } = useClassData();

  // 🔧 State chung
  const [selectedYear, setSelectedYear] = useState("2024-2025");
  const [tabIndex, setTabIndex] = useState(0);
  const yearOptions = [
    "2024-2025", "2025-2026", "2026-2027", "2027-2028", "2028-2029"
  ];
  const [firestoreEnabled, setFirestoreEnabled] = useState(false);

  // 📦 Tài khoản
  const [passwords, setPasswords] = useState({ yte: "", ketoan: "", bgh: "", admin: "" });
  const [newPassword, setNewPassword] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("admin");

  // 🗑️ Xóa dữ liệu
  const [deleteCollections, setDeleteCollections] = useState({
    danhsach: false, bantru: false, diemdan: false,
    nhatkybantru: false, xoaHocSinhBanTru: false
  });
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [defaultProgress, setDefaultProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [deletingLabel, setDeletingLabel] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteSeverity, setDeleteSeverity] = useState("info");
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [defaultMessage, setDefaultMessage] = useState("");
  const [defaultSeverity, setDefaultSeverity] = useState("info");

  // ♻️ Reset dữ liệu
  const [resetProgress, setResetProgress] = useState(0);
  const [resetMessage, setResetMessage] = useState("");
  const [resetSeverity, setResetSeverity] = useState("info");
  const [resetType, setResetType] = useState("");

  // 💾 Sao lưu/phục hồi
  const [backupFormat, setBackupFormat] = useState("json");
  const [selectedDataTypes, setSelectedDataTypes] = useState({
    danhsach: false, bantru: false, diemdan: false, nhatky: false
  });
  const [selectedBackupFile, setSelectedBackupFile] = useState(null);
  const [showBackupOptions, setShowBackupOptions] = useState(false);
  const [showRestoreOptions, setShowRestoreOptions] = useState(false);
  const [restoreMode, setRestoreMode] = useState("all");
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("info");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("info"); // "success", "error", "warning", "info"

  // 🛠️ Xử lý form chọn
  const handleDeleteCheckboxChange = (key) => {
    setDeleteCollections((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const handleCheckboxChange = (key) => {
    setSelectedDataTypes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 🔁 Xử lý logic gọi hàm tách riêng
  const handlePerformDelete = async () => {
    await xoaDatabase({
      selectedYear,
      deleteCollections,
      setDeleting,
      setProgress,
      setDeletingLabel,
      setDeleteMessage,
      setDeleteSeverity,
      setDeleteSuccess,
      setShowDeleteOptions,
      setDeleteCollections,
    });
  };

  const handleResetDangKyBanTru = async () => {
    await resetBanTru({
      setResetProgress,
      setResetMessage,
      setResetSeverity,
      setResetType,
      setClassData,
      getClassData,
    });
  };

  const handleResetDiemDanh = async () => {
    await resetDiemDanh({
      setResetProgress,
      setResetMessage,
      setResetSeverity,
      setResetType,
    });
  };

  const handleBackupData = () => {
    const isEmpty = Object.values(selectedDataTypes).every((v) => !v);
    if (isEmpty) return alert("⚠️ Vui lòng chọn ít nhất một loại dữ liệu để sao lưu.");
    backupFormat === "json"
      ? downloadBackupAsJSON(selectedDataTypes)
      : downloadBackupAsExcel(selectedDataTypes);
    setShowBackupOptions(false);
  };

  const handleRestoreData = () => {
    const isEmpty = Object.values(selectedDataTypes).every((v) => !v);
    if (isEmpty) return alert("⚠️ Vui lòng chọn ít nhất một loại dữ liệu để phục hồi.");
    if (!selectedBackupFile) return alert("❌ Chưa chọn file phục hồi.");

    const restoreFn = backupFormat === "json" ? restoreFromJSONFile : restoreFromExcelFile;
    restoreFn(
      selectedBackupFile, setRestoreProgress, setAlertMessage,
      setAlertSeverity, selectedDataTypes, restoreMode
    );

    setShowRestoreOptions(false);
    setSelectedBackupFile(null);
  };

  // 🧠 Tải cấu hình ban đầu
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const accounts = ["admin", "yte", "ketoan", "bgh"];
        const passwords = {};
        for (const acc of accounts) {
          const snap = await getDoc(doc(db, "ACCOUNT", acc.toUpperCase()));
          passwords[acc] = snap.exists() ? snap.data().password || "" : "";
        }
        setPasswords(passwords);

        const yearSnap = await getDoc(doc(db, "YEAR", "NAMHOC"));
        if (yearSnap.exists()) setSelectedYear(yearSnap.data().value || "2024-2025");

        const toggleSnap = await getDoc(doc(db, "SETTINGS", "TAIDULIEU"));
        if (toggleSnap.exists()) setFirestoreEnabled(toggleSnap.data().theokhoi);
      } catch (error) {
        console.error("❌ Lỗi khi tải cấu hình:", error);
      }
    };
    fetchConfig();
  }, []);

  // ⌛ Tiện ích phụ
  useEffect(() => {
    if (restoreProgress === 100) setTimeout(() => setRestoreProgress(0), 3000);
  }, [restoreProgress]);

  const handleYearChange = async (newYear) => {
    setSelectedYear(newYear);
    await setDoc(doc(db, "YEAR", "NAMHOC"), { value: newYear });
  };

  const handleToggleChange = async (e) => {
    const newValue = e.target.value === "khoi";
    setFirestoreEnabled(newValue);
    await setDoc(doc(db, "SETTINGS", "TAIDULIEU"), { theokhoi: newValue });
  };

  const handleChangePassword = async (type) => {
    if (!newPassword.trim()) return alert("⚠️ Vui lòng nhập mật khẩu mới!");
    await setDoc(doc(db, "ACCOUNT", type.toUpperCase()), { password: newPassword }, { merge: true });
    setPasswords((prev) => ({ ...prev, [type]: newPassword }));
    alert(`✅ Đã đổi mật khẩu cho ${type.toUpperCase()}!`);
    setNewPassword("");
  };

  //Tạo dữ liệu năm học mới

  const handleInitNewYearData = async () => {
    const confirmed = window.confirm(`⚠️ Bạn có chắc muốn khởi tạo dữ liệu cho năm ${selectedYear}?`);
    if (!confirmed) return;

    const danhSachDocs = ["K1", "K2", "K3", "K4", "K5", "TRUONG"];

    try {
      for (const docName of danhSachDocs) {
        await setDoc(doc(db, `DANHSACH_${selectedYear}`, docName), { list: "" });
      }

      await setDoc(doc(db, `BANTRU_${selectedYear}`, "init"), { temp: "" });
      alert(`✅ Đã khởi tạo dữ liệu cho năm học ${selectedYear}`);
    } catch (err) {
      console.error("❌ Lỗi khi khởi tạo dữ liệu:", err);
      alert("❌ Không thể khởi tạo dữ liệu năm mới!");
    }
  };

  const [namHoc, setNamHoc] = useState('');
  useEffect(() => {
    const fetchNamHoc = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'YEAR', 'NAMHOC'));
        if (docSnap.exists()) {
          setNamHoc(docSnap.data().value || 'UNKNOWN');
        }
      } catch (err) {
        console.error('Lỗi khi tải năm học:', err.message);
        setNamHoc('UNKNOWN');
      }
    };
    fetchNamHoc();
  }, []);

  //Tạo tài khoản người dùng

  const createClassUserAccounts = async () => {
    if (!namHoc || namHoc === 'UNKNOWN') {
      alert('❌ Không có năm học hợp lệ!');
      return;
    }

    try {
      const truongRef = doc(db, `CLASSLIST_${namHoc}`, "TRUONG");
      const truongSnap = await getDoc(truongRef);

      if (!truongSnap.exists()) {
        setMessage("❌ Không tìm thấy document TRUONG.");
        setSeverity("error");
        return;
      }

      const classList = truongSnap.data().list;
      if (!Array.isArray(classList)) {
        setMessage("❌ Dữ liệu list không hợp lệ.");
        setSeverity("error");
        return;
      }

      let successCount = 0;
      let failList = [];

      for (let i = 0; i < classList.length; i++) {
        const className = classList[i];
        const accountRef = doc(db, "ACCOUNT", className);

        try {
          await setDoc(accountRef, {
            username: className,
            password: "123",
          });
          successCount++;
        } catch (err) {
          failList.push(className);
        }

        // 👉 Cập nhật tiến trình
        setProgress(Math.round(((i + 1) / classList.length) * 100));
      }

      // ✅ Hiển thị kết quả
      setMessage(`✅ Tạo xong! ${successCount} lớp thành công. ${failList.length} lớp lỗi.`);
      setSeverity("success");
    } catch (error) {
      console.error("❌ Lỗi xử lý:", error);
      setMessage("❌ Có lỗi xảy ra.");
      setSeverity("error");
    } finally {
      // ⏳ Ẩn tiến trình sau vài giây
      setTimeout(() => setProgress(0), 3000);
    }
  };



  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#e3f2fd" }}>
      <Banner title="QUẢN TRỊ HỆ THỐNG" />
      <Box sx={{ width: { xs: "95%", sm: 650 }, mx: "auto", mt: 3 }}>
        <Card elevation={10} sx={{ p: 3, borderRadius: 4 }}>
          <Tabs
            value={tabIndex}
            onChange={(e, newValue) => setTabIndex(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="⚙️ SYSTEM" />
            <Tab label="👤 ACCOUNT" />
            <Tab label="💾 BACKUP & RESTORE" />
            <Tab label="🧹 DELETE & RESET" />
          </Tabs>

          {/* Tab 0: System */}
          {tabIndex === 0 && (
            <Stack spacing={3} mt={3} sx={{ maxWidth: 300, mx: "auto", width: "100%" }}>
              <Button variant="contained" onClick={() => navigate("/quanly")}>
                🏫 HỆ THỐNG QUẢN LÝ BÁN TRÚ
              </Button>

              <FormControl fullWidth size="small">
                <InputLabel>Năm học</InputLabel>
                <Select value={selectedYear} label="Năm học" onChange={(e) => handleYearChange(e.target.value)}>
                  {yearOptions.map((year) => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Loại tài khoản</InputLabel>
                <Select value={selectedAccount} label="Loại tài khoản" onChange={(e) => setSelectedAccount(e.target.value)}>
                  <MenuItem value="yte">🏥 Y tế</MenuItem>
                  <MenuItem value="ketoan">💰 Kế toán</MenuItem>
                  <MenuItem value="bgh">📋 BGH</MenuItem>
                  <MenuItem value="admin">🔐 Admin</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="🔑 Mật khẩu mới"
                type="password"
                value={newPassword}
                size="small"
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <Button
                variant="contained"
                color="warning"
                onClick={() => handleChangePassword(selectedAccount)}
                startIcon={<LockResetIcon />}
              >
                Đổi mật khẩu
              </Button>

              <FormControl>
                <Typography variant="subtitle1" fontWeight="bold">
                  📊 Tải dữ liệu từ Firestore
                </Typography>
                <RadioGroup row value={firestoreEnabled ? "khoi" : "lop"} onChange={handleToggleChange}>
                  <FormControlLabel value="khoi" control={<Radio />} label="Tải theo khối" />
                  <FormControlLabel value="lop" control={<Radio />} label="Tải theo lớp" />
                </RadioGroup>
              </FormControl>
            </Stack>
          )}

          {tabIndex === 1 && (
            <Stack spacing={3} mt={3} sx={{ maxWidth: 300, mx: "auto", width: "100%" }}>
              <Divider> <Typography fontWeight="bold">👤 Database & Account</Typography> </Divider>
              
              <Button
                variant="contained"
                onClick={handleInitNewYearData}
                sx={{ backgroundColor: '#303f9f', '&:hover': { backgroundColor: '#2e7d32' } }}
              >
                🆕 Tạo Database năm mới
              </Button>

              <Button
                variant="contained"
                onClick={createClassUserAccounts}
                sx={{ backgroundColor: '#303f9f', '&:hover': { backgroundColor: '#2e7d32' }, mb: 2 }}
              >
                🆕 Tạo tài khoản người dùng
              </Button>

              {/* Tiến trình tạo tài khoản */}
              {progress > 0 && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  <Typography variant="caption" align="center" display="block" mt={0.5}>
                    Đang tạo tài khoản... {progress}%
                  </Typography>
                </Box>
              )}

              {/* 📢 Thông báo kết quả */}
              {message && (
                <Alert severity={severity} onClose={() => setMessage("")} sx={{ mb: 2 }}>
                  {message}
                </Alert>
              )}

            </Stack>
          )}

          {/* Tab 3: Backup & Restore */}
          {tabIndex === 2 && (
            <Stack spacing={3} mt={3} sx={{ maxWidth: 300, mx: "auto", width: "100%" }}>
              <Divider>
                <Typography fontWeight="bold">💾 Sao lưu & Phục hồi</Typography>
              </Divider>

              {/* Nút SAO LƯU */}
              {!showRestoreOptions && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    setShowBackupOptions(true);
                    setShowRestoreOptions(false);
                    setSelectedDataTypes({ danhsach: false, bantru: false, diemdan: false, nhatky: false });
                  }}
                >
                  📥 Sao lưu dữ liệu
                </Button>
              )}

              {/* Nút PHỤC HỒI */}
              {!showBackupOptions && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    setSelectedDataTypes({ danhsach: false, bantru: false, diemdan: false, nhatky: false });
                    setSelectedBackupFile(null);
                    if (inputRef.current) {
                      inputRef.current.value = "";
                      inputRef.current.click();
                    }
                  }}
                >
                  🔁 Phục hồi dữ liệu
                </Button>
              )}

              {/* Giao diện SAO LƯU */}
              {showBackupOptions && (
                <>
                  {/* Checkbox chọn dữ liệu */}
                  <Stack spacing={0.5}>
                    <FormControlLabel
                      control={<Checkbox checked={selectedDataTypes.danhsach} onChange={() => handleCheckboxChange("danhsach")} />}
                      label="Danh sách"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={selectedDataTypes.bantru} onChange={() => handleCheckboxChange("bantru")} />}
                      label="Bán trú"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={selectedDataTypes.diemdan} onChange={() => handleCheckboxChange("diemdan")} />}
                      label="Điểm danh"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={selectedDataTypes.nhatky} onChange={() => handleCheckboxChange("nhatky")} />}
                      label="Nhật ký"
                    />
                  </Stack>

                  {/* Radio chọn định dạng */}
                  <FormControl component="fieldset" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold">Chọn định dạng:</Typography>
                    <RadioGroup
                      row
                      value={backupFormat}
                      onChange={(e) => setBackupFormat(e.target.value)}
                    >
                      <FormControlLabel value="json" control={<Radio />} label="JSON" />
                      <FormControlLabel value="excel" control={<Radio />} label="Excel" />
                    </RadioGroup>
                  </FormControl>

                  {/* Nút Thực hiện & Hủy */}
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ width: "50%" }}
                      onClick={() => {
                        const isEmpty =
                          !selectedDataTypes.danhsach &&
                          !selectedDataTypes.bantru &&
                          !selectedDataTypes.diemdan &&
                          !selectedDataTypes.nhatky;

                        if (isEmpty) {
                          alert("⚠️ Vui lòng chọn ít nhất một loại dữ liệu để sao lưu.");
                          return;
                        }

                        if (backupFormat === "json") {
                          downloadBackupAsJSON(selectedDataTypes);
                        } else {
                          downloadBackupAsExcel(selectedDataTypes);
                        }

                        setShowBackupOptions(false);
                      }}
                    >
                      ✅ Sao lưu
                    </Button>

                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ width: "50%" }}
                      onClick={() => {
                        setShowBackupOptions(false);
                        setSelectedDataTypes({ danhsach: false, bantru: false, diemdan: false, nhatky: false });
                      }}
                    >
                      ❌ Hủy
                    </Button>
                  </Stack>
                </>
              )}

              {/* Input chọn file phục hồi ẩn */}
              <input
                type="file"
                hidden
                ref={inputRef}
                accept={backupFormat === "json" ? ".json" : ".xlsx"}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  const isValid =
                    (backupFormat === "json" && file.name.endsWith(".json")) ||
                    (backupFormat === "excel" && file.name.endsWith(".xlsx"));

                  if (isValid) {
                    setSelectedBackupFile(file);
                    setTimeout(() => setShowRestoreOptions(true), 0);
                  } else {
                    alert("❌ File không hợp lệ! Vui lòng chọn file đúng định dạng.");
                  }
                }}
              />

              {/* Giao diện PHỤC HỒI */}
              {showRestoreOptions && selectedBackupFile && (
                <>
                  <Stack spacing={0.5} sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={<Checkbox checked={selectedDataTypes.danhsach} onChange={() => handleCheckboxChange("danhsach")} />}
                      label="Danh sách"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={selectedDataTypes.bantru} onChange={() => handleCheckboxChange("bantru")} />}
                      label="Bán trú"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={selectedDataTypes.diemdan} onChange={() => handleCheckboxChange("diemdan")} />}
                      label="Điểm danh"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={selectedDataTypes.nhatky} onChange={() => handleCheckboxChange("nhatky")} />}
                      label="Nhật ký"
                    />
                  </Stack>
                  

                  <FormControl component="fieldset" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold">Chọn định dạng:</Typography>
                    <RadioGroup
                      row
                      value={backupFormat}
                      onChange={(e) => setBackupFormat(e.target.value)}
                    >
                      <FormControlLabel value="json" control={<Radio />} label="JSON" />
                      <FormControlLabel value="excel" control={<Radio />} label="Excel" />
                    </RadioGroup>
                  </FormControl>

                  <FormControl component="fieldset" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold">Chế độ phục hồi:</Typography>
                    <RadioGroup
                      row
                      value={restoreMode}
                      onChange={(e) => setRestoreMode(e.target.value)}
                    >
                      <FormControlLabel value="all" control={<Radio />} label="Ghi đè tất cả" />
                      <FormControlLabel value="check" control={<Radio />} label="Chỉ ghi mới" />
                    </RadioGroup>
                  </FormControl>

                  {/* Nút Thực hiện & Hủy */}
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ width: "50%" }}
                      onClick={() => {
                        const isEmpty =
                          !selectedDataTypes.danhsach &&
                          !selectedDataTypes.bantru &&
                          !selectedDataTypes.diemdan &&
                          !selectedDataTypes.nhatky;

                        if (isEmpty) {
                          alert("⚠️ Vui lòng chọn ít nhất một loại dữ liệu để phục hồi.");
                          return;
                        }

                        if (!selectedBackupFile) {
                          alert("❌ Chưa chọn file phục hồi.");
                          return;
                        }

                        if (backupFormat === "json") {
                          restoreFromJSONFile(
                            selectedBackupFile,
                            setRestoreProgress,
                            setAlertMessage,
                            setAlertSeverity,
                            selectedDataTypes,
                            restoreMode
                          );
                        } else {
                          restoreFromExcelFile(
                            selectedBackupFile,
                            setRestoreProgress,
                            setAlertMessage,
                            setAlertSeverity,
                            selectedDataTypes,
                            restoreMode
                          );
                        }

                        setShowRestoreOptions(false);
                        setSelectedBackupFile(null);
                      }}
                    >
                      ✅ PHỤC HỒI
                    </Button>

                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ width: "50%" }}
                      onClick={() => {
                        setShowRestoreOptions(false);
                        setSelectedBackupFile(null);
                        //setSelectedDataTypes({ danhsach: false, bantru: false, diemdan: false });
                        setSelectedDataTypes({ danhsach: false, bantru: false, diemdan: false, nhatky: false });
                      }}
                    >
                      ❌ Hủy
                    </Button>
                  </Stack>
                </>
              )}

              {/* Tiến trình phục hồi */}
              {restoreProgress > 0 && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={restoreProgress}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  <Typography variant="caption" align="center" display="block" mt={0.5}>
                    Đang phục hồi... {restoreProgress}%
                  </Typography>
                </Box>
              )}

              {/* Thông báo */}
              {alertMessage && (
                <Alert severity={alertSeverity} onClose={() => setAlertMessage("")}>
                  {alertMessage}
                </Alert>
              )}
            </Stack>
          )}



          {tabIndex === 3 && (
            <Stack spacing={3} mt={3} sx={{ maxWidth: 300, mx: "auto", width: "100%" }}>
              <Divider>
                <Typography fontWeight="bold">🗑️ Xóa & Reset dữ liệu</Typography>
              </Divider>

              {/* Nút bật/tắt nhóm checkbox + thực hiện xóa */}
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  setShowDeleteOptions(prev => !prev);
                  setDeleteCollections({ danhsach: false, bantru: false, diemdan: false, nhatkybantru: false, xoaHocSinhBanTru: false });
                }}
              >
                🗑️ Xóa Database
              </Button>

              {/* ✅ Khối checkbox + nút thực hiện xóa */}
              {showDeleteOptions && (
                <>
                  <FormGroup sx={{ ml: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={deleteCollections.danhsach}
                          onChange={() => handleDeleteCheckboxChange("danhsach")}
                        />
                      }
                      label="Danh sách"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={deleteCollections.bantru}
                          onChange={() => handleDeleteCheckboxChange("bantru")}
                        />
                      }
                      label="Bán trú"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={deleteCollections.diemdan}
                          onChange={() => handleDeleteCheckboxChange("diemdan")}
                        />
                      }
                      label="Điểm danh"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={deleteCollections.nhatkybantru}
                          onChange={() => handleDeleteCheckboxChange("nhatkybantru")}
                        />
                      }
                      label="Lịch sử đăng ký"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={deleteCollections.xoaHocSinhBanTru}
                          onChange={() => handleDeleteCheckboxChange("xoaHocSinhBanTru")}
                        />
                      }
                      label="Xóa học sinh bán trú"
                    />
                  </FormGroup>

                  {/* Hai nút: Thực hiện xóa + Hủy */}
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ width: "50%" }}
                      onClick={handlePerformDelete}
                    >
                      ✅ Xóa dữ liệu
                    </Button>

                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ width: "50%" }}
                      onClick={() => {
                        setShowDeleteOptions(false);
                        setDeleteCollections({ danhsach: false, bantru: false, diemdan: false, nhatkybantru: false, xoaHocSinhBanTru: false });
                      }}
                    >
                      ❌ Hủy
                    </Button>
                  </Stack>

                  {deleting && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                      <ResetProgressText label={deletingLabel} progress={progress} />
                    </Box>
                  )}
                </>
              )}

              {/* Ẩn 2 nút reset nếu đang mở delete options */}
              {!showDeleteOptions && (
                <>
                  <Button variant="contained" color="warning" onClick={handleResetDangKyBanTru}>
                    ♻️ Reset bán trú
                  </Button>

                  <Button variant="contained" color="warning" onClick={handleResetDiemDanh}>
                    ♻️ Reset điểm danh
                  </Button>
                </>
              )}

              {/* ✅ Tiến trình cho hành động xóa & reset legacy */}
              {(deleteProgress > 0 || defaultProgress > 0) && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={deleteProgress || defaultProgress}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  <Typography variant="caption" align="center" display="block" mt={0.5}>
                    {deleteProgress > 0
                      ? `Đang xóa dữ liệu bán trú... ${deleteProgress}%`
                      : `Đang reset legacy... ${defaultProgress}%`}
                  </Typography>
                </Box>
              )}

              {/* ✅ Tiến trình cho đăng ký và điểm danh bán trú */}
              {resetProgress > 0 && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={resetProgress}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  <ResetProgressText
                    label={
                      resetType === "dangky"
                        ? "Đang reset bán trú"
                        : "Đang reset điểm danh"
                    }
                    progress={resetProgress}
                  />
                </Box>
              )}

              {/* 🔔 Thông báo kết quả */}
              {deleteMessage && (
                <Alert severity={deleteSeverity} onClose={() => setDeleteMessage("")}>
                  {deleteMessage}
                </Alert>
              )}

              {defaultMessage && (
                <Alert
                  severity={["info", "success", "error", "warning"].includes(defaultSeverity) ? defaultSeverity : "info"}
                  onClose={() => setDefaultMessage("")}
                >
                  {defaultMessage}
                </Alert>
              )}

              {resetMessage && (
                <Alert severity={resetSeverity} onClose={() => setResetMessage("")}>
                  {resetMessage}
                </Alert>
              )}
            </Stack>
          )}


        </Card>
      </Box>
    </Box>
  );
}


