import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Tabs, Tab, Card
} from "@mui/material";
import Banner from "./pages/Banner";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useClassData } from "./context/ClassDataContext";

// 🧠 Import logic đã tách
import { xoaDatabase } from "./utils/xoaDatabase";
import { resetBanTru } from "./utils/resetBanTru";
import { resetDiemDanh } from "./utils/resetDiemDanh";
import { updateTeacherNamesFromFile } from "./utils/excelHandlers";
import { createClassUserAccounts, resetClassUserPasswords } from "./utils/accountUtils";
import {
  downloadBackupAsJSON,
  downloadBackupAsExcel,
} from "./utils/backupUtils";
import {
  restoreFromJSONFile,
  restoreFromExcelFile,
} from "./utils/restoreUtils";

// 🧩 Tabs components
import TabSystem from "./pages/AdminTabs/TabSystem";
import TabAccount from "./pages/AdminTabs/TabAccount";
import TabBackupRestore from "./pages/AdminTabs/TabBackupRestore";
import TabDeleteReset from "./pages/AdminTabs/TabDeleteReset";

export default function Admin({ onCancel }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { getClassData, setClassData } = useClassData();

  const [selectedYear, setSelectedYear] = useState("2024-2025");
  const [tabIndex, setTabIndex] = useState(0);
  const yearOptions = ["2024-2025", "2025-2026", "2026-2027", "2027-2028", "2028-2029"];
  const [firestoreEnabled, setFirestoreEnabled] = useState(false);

  const [passwords, setPasswords] = useState({ yte: "", ketoan: "", bgh: "", admin: "" });
  const [newPassword, setNewPassword] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("admin");

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

  const [resetProgress, setResetProgress] = useState(0);
  const [resetMessage, setResetMessage] = useState("");
  const [resetSeverity, setResetSeverity] = useState("info");
  const [resetType, setResetType] = useState("");

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
  const [severity, setSeverity] = useState("info");

  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [customUserPassword, setCustomUserPassword] = useState("");
  const [actionType, setActionType] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showCreateDatabase, setShowCreateDatabase] = useState(false);
  const [updateTeacherName, setUpdateTeacherName] = useState(false);
  const [teacherProgress, setTeacherProgress] = useState(0);
  const [options, setOptions] = useState({ list: false, meal: false, attendance: false, log: false });

  const handleDeleteCheckboxChange = (key) => {
    setDeleteCollections((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const handleCheckboxChange = (key) => {
    setSelectedDataTypes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
    if (Object.values(selectedDataTypes).every((v) => !v)) return alert("⚠️ Vui lòng chọn ít nhất một loại dữ liệu để sao lưu.");
    backupFormat === "json"
      ? downloadBackupAsJSON(selectedDataTypes)
      : downloadBackupAsExcel(selectedDataTypes);
    setShowBackupOptions(false);
  };

  const handleRestoreData = () => {
    if (Object.values(selectedDataTypes).every((v) => !v)) return alert("⚠️ Vui lòng chọn ít nhất một loại dữ liệu để phục hồi.");
    if (!selectedBackupFile) return alert("❌ Chưa chọn file phục hồi.");

    const restoreFn = backupFormat === "json" ? restoreFromJSONFile : restoreFromExcelFile;
    restoreFn(
      selectedBackupFile, setRestoreProgress, setAlertMessage,
      setAlertSeverity, selectedDataTypes, restoreMode
    );
    setShowRestoreOptions(false);
    setSelectedBackupFile(null);
  };

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

  const handleCreateAccounts = (password) => {
    return createClassUserAccounts({ db, password, namHoc, setActionType, setProgress, setMessage, setSeverity });
  };

  const handleResetPasswords = (password) => {
    return resetClassUserPasswords({ db, password, namHoc, setActionType, setProgress, setMessage, setSeverity });
  };

  const createNewYearData = async (options) => {
    const confirmed = window.confirm(`⚠️ Bạn có chắc muốn khởi tạo dữ liệu cho năm ${selectedYear}?`);
    if (!confirmed) return;
    try {
      if (options.list) await setDoc(doc(db, `DANHSACH_${selectedYear}`, ""), {});
      if (options.meal) await setDoc(doc(db, `BANTRU_${selectedYear}`, ""), {});
      if (options.attendance) await setDoc(doc(db, `DIEMDANH_${selectedYear}`, ""), {});
      if (options.log) await setDoc(doc(db, `NHATKYBANTRU_${selectedYear}`, ""), {});
      alert(`✅ Đã khởi tạo dữ liệu cho năm học ${selectedYear}`);
    } catch (err) {
      console.error("❌ Lỗi khi khởi tạo dữ liệu:", err);
      alert("❌ Không thể khởi tạo dữ liệu năm mới!");
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

          {tabIndex === 0 && (
            <TabSystem
              selectedYear={selectedYear}
              handleYearChange={handleYearChange}
              yearOptions={yearOptions}            // 👈 Đảm bảo dòng này có
              selectedAccount={selectedAccount}
              setSelectedAccount={setSelectedAccount}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              handleChangePassword={handleChangePassword}
              firestoreEnabled={firestoreEnabled}
              handleToggleChange={handleToggleChange}
              navigate={navigate}
            />
          )}

          {tabIndex === 1 && (
            <TabAccount
              passwords={passwords}
              setPasswords={setPasswords}
              selectedAccount={selectedAccount}
              setSelectedAccount={setSelectedAccount}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              handleChangePassword={handleChangePassword}
              showCreatePassword={showCreatePassword}
              setShowCreatePassword={setShowCreatePassword}
              customUserPassword={customUserPassword}
              setCustomUserPassword={setCustomUserPassword}
              handleCreateAccounts={handleCreateAccounts}
              handleResetPasswords={handleResetPasswords}
              showResetPassword={showResetPassword}
              setShowResetPassword={setShowResetPassword}
              progress={progress}
              message={message}
              severity={severity}
              actionType={actionType}
            />
          )}

          {tabIndex === 2 && (
            <TabBackupRestore
              selectedDataTypes={selectedDataTypes}
              handleCheckboxChange={handleCheckboxChange}
              backupFormat={backupFormat}
              setBackupFormat={setBackupFormat}
              handleBackupData={handleBackupData}
              showBackupOptions={showBackupOptions}
              setShowBackupOptions={setShowBackupOptions}
              showRestoreOptions={showRestoreOptions}
              setShowRestoreOptions={setShowRestoreOptions}
              selectedBackupFile={selectedBackupFile}
              setSelectedBackupFile={setSelectedBackupFile}
              restoreProgress={restoreProgress}
              handleRestoreData={handleRestoreData}
              restoreMode={restoreMode}
              setRestoreMode={setRestoreMode}
              alertMessage={alertMessage}
              alertSeverity={alertSeverity}
            />
          )}

          {tabIndex === 3 && (
            <TabDeleteReset
              deleteCollections={deleteCollections}
              handleDeleteCheckboxChange={handleDeleteCheckboxChange}
              showDeleteOptions={showDeleteOptions}
              setShowDeleteOptions={setShowDeleteOptions}
              handlePerformDelete={handlePerformDelete}
              deleting={deleting}
              deleteProgress={deleteProgress}
              defaultProgress={defaultProgress}
              deletingLabel={deletingLabel}
              deleteMessage={deleteMessage}
              deleteSeverity={deleteSeverity}
              deleteSuccess={deleteSuccess}
              resetProgress={resetProgress}
              resetMessage={resetMessage}
              resetSeverity={resetSeverity}
              handleResetDangKyBanTru={handleResetDangKyBanTru}
              handleResetDiemDanh={handleResetDiemDanh}
              setDefaultMessage={setDefaultMessage}
              setDefaultSeverity={setDefaultSeverity}
              defaultMessage={defaultMessage}
              defaultSeverity={defaultSeverity}
              resetType={resetType}
            />
          )}
        </Card>
      </Box>
    </Box>
  );
}