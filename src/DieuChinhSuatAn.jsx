import React, { useState, useEffect } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Stack, MenuItem,
  Select, FormControl, InputLabel, LinearProgress, Button,
  Checkbox, Alert, Card, CardContent
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import vi from "date-fns/locale/vi";
import { getDocs, getDoc, collection, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { MySort } from './utils/MySort';

export default function DieuChinhSuatAn({ onBack }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState(null);
  const [classList, setClassList] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [originalChecked, setOriginalChecked] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [namHocValue, setNamHocValue] = useState(null);

  useEffect(() => {
    if (saveSuccess !== null) {
      const timer = setTimeout(() => setSaveSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  useEffect(() => {
    const fetchNamHocAndClassList = async () => {
      try {
        const namHocDoc = await getDoc(doc(db, "YEAR", "NAMHOC"));
        const namHoc = namHocDoc.exists() ? namHocDoc.data().value : null;

        if (!namHoc) {
          setIsLoading(false);
          setSaveSuccess("❌ Không tìm thấy năm học hợp lệ trong hệ thống!");
          return;
        }

        setNamHocValue(namHoc);

        const danhSachDoc = await getDoc(doc(db, `DANHSACH_${namHoc}`, "TRUONG"));
        if (danhSachDoc.exists()) {
          const data = danhSachDoc.data();
          setClassList(data.list || []);
          if (data.list.length > 0) {
            setSelectedClass(data.list[0]);
            await fetchStudents(data.list[0], namHoc);
          }
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu:", err);
        setIsLoading(false);
      }
    };
    fetchNamHocAndClassList();
  }, []);

  const fetchStudents = async (className, nhValue = namHocValue) => {
    if (!nhValue) return;

    setIsLoading(true);
    try {
      const q = query(collection(db, `BANTRU_${nhValue}`), where("lop", "==", className));
      const snapshot = await getDocs(q);

      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);
      const adjustedDate = new Date(selected.getTime() + 7 * 60 * 60 * 1000);
      const selectedDateStr = adjustedDate.toISOString().split("T")[0];

      const students = [];
      const checkedMap = {};

      snapshot.docs.forEach((docSnap, index) => {
        const d = docSnap.data();
        const registeredData = d.data?.[selectedDateStr];
        const ma = d.maDinhDanh;
        const student = {
          id: docSnap.id,
          maDinhDanh: ma,
          hoVaTen: d.hoVaTen,
          registered: registeredData === "T",
          disabled: registeredData == null,
          stt: index + 1,
        };
        students.push(student);
        checkedMap[ma] = student.registered;
      });

      setDataList(MySort(students).map((s, i) => ({ ...s, stt: i + 1 })));
      setOriginalChecked(checkedMap);
    } catch (err) {
      console.error("❌ Lỗi khi tải học sinh:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass && namHocValue) fetchStudents(selectedClass);
  }, [selectedDate]);

  const saveData = async () => {
    if (isSaving || !namHocValue) return;

    const loginRole = localStorage.getItem("loginRole");
    const now = new Date();
    const sm = selectedDate.getMonth(), sy = selectedDate.getFullYear();
    const cm = now.getMonth(), cy = now.getFullYear();

    if (
      loginRole !== "admin" &&
      (
        loginRole !== "yte" ||
        (sy < cy || (sy === cy && sm < cm))
      )
    ) {
      setSaveSuccess("unauthorized");
      return;
    }

    const changed = dataList.filter(s => s.registered !== originalChecked[s.maDinhDanh]);
    if (changed.length === 0) {
      setSaveSuccess(null);
      return;
    }

    setIsSaving(true);
    setSaveSuccess(null);
    try {
      const selectedDateStr = new Date(selectedDate.getTime() + 7 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      await Promise.all(changed.map(s =>
        updateDoc(doc(db, `BANTRU_${namHocValue}`, s.id), {
          [`data.${selectedDateStr}`]: s.registered ? "T" : ""
        })
      ));

      const updated = { ...originalChecked };
      changed.forEach(s => updated[s.maDinhDanh] = s.registered);
      setOriginalChecked(updated);
      setSaveSuccess(true);
    } catch (err) {
      console.error("❌ Lỗi khi lưu:", err);
      setSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClassChange = async e => {
    await saveData();
    setSelectedClass(e.target.value);
    await fetchStudents(e.target.value);
  };

  const handleDateChange = nv => {
    if (nv instanceof Date && !isNaN(nv)) setSelectedDate(nv);
  };

  const toggleRegister = idx => setDataList(prev => prev.map((s, i) => i === idx ? { ...s, registered: !s.registered } : s));

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 0 }}>
      <Card sx={{
        mt:2,
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: 450,
        width: { xs: '98%', sm: '100%' },
        borderRadius: 4,
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
        backgroundColor: 'white',
      }} elevation={10}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" align="center" fontWeight="bold" color="primary" gutterBottom>
              ĐIỀU CHỈNH SUẤT ĂN
            </Typography>
            <Box sx={{
              height: "2.5px",
              width: "100%",
              backgroundColor: "#1976d2",
              borderRadius: 1,
              mt: 2, mb: 4,
            }} />
          </Box>

          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
              <DatePicker label="Chọn ngày" value={selectedDate} onChange={handleDateChange} slotProps={{
                textField: { size: "small", sx: { minWidth: 150, maxWidth: 180, "& input": { textAlign: "center" } } }
              }} />
            </LocalizationProvider>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Lớp</InputLabel>
              <Select value={selectedClass || ""} label="Lớp" onChange={handleClassChange}>
                {classList.map((cls, i) => (
                  <MenuItem key={i} value={cls}>{cls}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {isLoading && <LinearProgress />}
          <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, border: "1px solid #e0e0e0", mt: 2 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {["STT", "HỌ VÀ TÊN", "ĐĂNG KÝ"].map((h, i) => (
                    <TableCell key={i} align="center" sx={{ fontWeight: 'bold', backgroundColor: '#1976d2', color: 'white', px: { xs: 0.5, sm: 1, md: 2 } }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {dataList.map((s, i) => (
                  <TableRow key={s.maDinhDanh} hover>
                    <TableCell align="center">{s.stt}</TableCell>
                    <TableCell>{s.hoVaTen}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={s.registered}
                        onChange={() => toggleRegister(i)}
                        disabled={s.disabled}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack spacing={2} sx={{ mt: 3, alignItems: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={saveData}
              disabled={isSaving}
              sx={{ width: 160, fontWeight: 600 }}
            >
              {isSaving ? "🔄 Cập nhật" : "Cập nhật"}
            </Button>

            {saveSuccess === "unauthorized" && (
              <Alert severity="error" sx={{ width: "100%", textAlign: 'left' }}>
                ❌ Bạn không có quyền điều chỉnh suất ăn!
              </Alert>
            )}

            {saveSuccess === true && (
              <Alert severity="success" sx={{ width: "92%", textAlign: 'left' }}>
                ✅ Cập nhật thành công!
              </Alert>
            )}

            {saveSuccess === false && (
              <Alert severity="error" sx={{ width: "100%", textAlign: 'left' }}>
                ❌ Lỗi khi lưu dữ liệu!
              </Alert>
            )}

            {isSaving && (
              <Alert severity="info" sx={{ width: "92%", textAlign: 'left' }}>
                🔄 Đang lưu dữ liệu...
              </Alert>
            )}

            <Button onClick={onBack} color="secondary">
              ⬅️ Quay lại
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
