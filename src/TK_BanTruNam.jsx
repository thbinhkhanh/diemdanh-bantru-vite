import React, { useState, useEffect } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Stack, MenuItem,
  Select, FormControl, InputLabel, LinearProgress, Button, useTheme, useMediaQuery
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import vi from "date-fns/locale/vi";
import { getDoc, getDocs, doc, collection, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { MySort } from "./utils/MySort";
import { exportBanTruNam } from "./utils/exportBanTruNam";
import { useClassList } from "./context/ClassListContext";
import { useClassData } from "./context/ClassDataContext";
import { enrichStudents } from "./pages/ThanhPhan/enrichStudents";

export default function ThongKeNam({ onBack }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState("");
  const [classList, setClassList] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [monthSet, setMonthSet] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMonths, setShowMonths] = useState(false);
  const [namHocValue, setNamHocValue] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { getClassList, setClassListForKhoi } = useClassList();
  const { getClassData, setClassData } = useClassData();

  // Lấy năm học động
  useEffect(() => {
    const fetchNamHoc = async () => {
      const namHocDoc = await getDoc(doc(db, "YEAR", "NAMHOC"));
      const value = namHocDoc.exists() ? namHocDoc.data().value : null;
      setNamHocValue(value);
    };
    fetchNamHoc();
  }, []);

  // Lấy danh sách lớp từ DANHSACH_{namHoc}
  useEffect(() => {
    if (!namHocValue) return;

    const cachedList = getClassList("TRUONG");
    if (cachedList.length > 0) {
      //console.log("📦 LẤY TỪ CONTEXT (TRUONG):", cachedList);
      setClassList(cachedList);
      setSelectedClass(cachedList[0]);
      return;
    }

    const fetchClassList = async () => {
      try {
        const docRef = doc(db, `CLASSLIST_${namHocValue}`, "TRUONG");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const list = docSnap.data().list || [];
          //console.log("🗂️ LẤY TỪ FIRESTORE:", list);
          setClassList(list);
          setSelectedClass(list[0] || "");

          // 🔁 Cập nhật vào context để dùng cho các component khác
          setClassListForKhoi("TRUONG", list);
        } else {
          console.warn("⚠️ Không tìm thấy tài liệu CLASSLIST/TRUONG");
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách lớp:", err);
      }
    };

    fetchClassList();
  }, [namHocValue]);

  // Lấy dữ liệu thống kê 
  useEffect(() => {
    if (!selectedClass || !selectedDate || !namHocValue) return;

    const fetchStudents = async () => {
      setIsLoading(true);

      const key = selectedClass; // ✅ Chỉ dùng tên lớp làm key

      try {
        let rawData = getClassData(key);

        if (!rawData || rawData.length === 0) {
          //console.log(`🔥 [FIRESTORE] Chưa có dữ liệu context, tải từ Firestore...`);

          const danhSachSnap = await getDocs(query(
            collection(db, `DANHSACH_${namHocValue}`),
            where("lop", "==", selectedClass)
          ));

          //const danhSachData = danhSachSnap.docs
          //  .map(d => d.data())
          //  .filter(hs => {
          //    const huy = (hs.huyDangKy || "").toUpperCase();
          //    return huy === "" || huy === "T";
          //  });
          const danhSachData = danhSachSnap.docs.map(d => d.data());

          const selectedDateStr = selectedDate.toISOString().split("T")[0];
          const enriched = enrichStudents(danhSachData, selectedDateStr, selectedClass, true);

          //console.log(`✨ [ENRICH] Đã enrich ${enriched.length} học sinh`);

          // ✅ Lưu enriched vào context với key là tên lớp (vd: "1.2")
          setClassData(key, enriched);
          rawData = enriched;
        } else {
          //console.log(`📦 [CONTEXT] Dữ liệu đã có trong context với key: ${key}`);
        }

        // ✅ Thống kê bán trú
        const banTruSnap = await getDocs(query(
          collection(db, `BANTRU_${namHocValue}`),
          where("lop", "==", selectedClass)
        ));

        const banTruData = banTruSnap.docs.map(doc => doc.data());

        const studentMap = {};
        banTruData.forEach(record => {
          const { maDinhDanh, thang } = record;
          if (!maDinhDanh || !thang) return;

          const thangSo = parseInt(thang.split("-")[1]);
          studentMap[maDinhDanh] = studentMap[maDinhDanh] || {
            monthSummary: {},
            total: 0,
          };

          studentMap[maDinhDanh].monthSummary[thangSo] =
            (studentMap[maDinhDanh].monthSummary[thangSo] || 0) + 1;
          studentMap[maDinhDanh].total += 1;
        });

        const students = rawData.map((hs, index) => {
          const summary = studentMap[hs.maDinhDanh] || {};
          return {
            ...hs,
            monthSummary: summary.monthSummary || {},
            total: summary.total || 0,
            stt: index + 1,
          };
        });

        const sorted = MySort(students).map((s, idx) => ({ ...s, stt: idx + 1 }));

        setDataList(sorted);
        setMonthSet(Array.from({ length: 12 }, (_, i) => i + 1));
      } catch (err) {
        console.error("❌ Lỗi khi lấy dữ liệu học sinh:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass, selectedDate, namHocValue, getClassData, setClassData]);



  const headCellStyle = {
    fontWeight: "bold",
    backgroundColor: "#1976d2",
    color: "white",
    border: "1px solid #ccc",
    whiteSpace: "nowrap",
    textAlign: "center",
    px: 1,
  };

  const handleExport = () => {
    exportBanTruNam(dataList, selectedDate.getFullYear(), selectedClass, monthSet);
  };

  return (
    <Box sx={{ width: "100%", overflowX: "auto", mt: 2, px: 1 }}>
      <Paper elevation={3} sx={{
        p: 4,
        borderRadius: showMonths ? 0 : 4,
        mx: "auto",
        overflowX: "auto",
        ...(showMonths
          ? {
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 1300, backgroundColor: "white", overflow: "auto"
            }
          : {
              width: "max-content"
            }),
      }}>
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" fontWeight="bold" color="primary" align="center" sx={{ mb: 1 }}>
            BÁN TRÚ NĂM {selectedDate.getFullYear()}
          </Typography>
          <Box sx={{ height: "2.5px", width: "100%", backgroundColor: "#1976d2", borderRadius: 1, mt: 2, mb: 4 }} />
        </Box>

        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" flexWrap="wrap" sx={{ mb: 4 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
            <DatePicker
              label="Chọn năm"
              views={["year"]}
              openTo="year"
              value={selectedDate}
              onChange={(newValue) => {
                if (newValue instanceof Date && !isNaN(newValue)) {
                  setSelectedDate(newValue);
                }
              }}
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    minWidth: 100, maxWidth: 145,
                    "& input": { textAlign: "center" }
                  }
                }
              }}
            />
          </LocalizationProvider>

          <FormControl size="small" sx={{ minWidth: 80, maxWidth: 100 }}>
            <InputLabel>Lớp</InputLabel>
            <Select value={selectedClass} label="Lớp" onChange={(e) => setSelectedClass(e.target.value)}>
              {classList.map((cls, idx) => (
                <MenuItem key={idx} value={cls}>{cls}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="outlined" onClick={() => setShowMonths(prev => !prev)}>
            {showMonths ? "ẨN THÁNG" : "HIỆN THÁNG"}
          </Button>

          {!isMobile && (
            <Button variant="contained" color="success" onClick={handleExport}>
              📅 Xuất Excel
            </Button>
          )}
        </Stack>

        {isLoading && (
          <Box sx={{ width: "50%", mx: "auto", my: 2 }}>
            <LinearProgress />
          </Box>
        )}

        <Box sx={{ width: "100%", overflowX: "auto", mt: 2 }}>
          <TableContainer component={Paper} sx={{ borderRadius: 2, minWidth: "max-content" }}>
            <Table size="small" sx={{ borderCollapse: "collapse" }}>
              <TableHead>
                <TableRow sx={{ height: 48 }}>
                  <TableCell align="center" sx={{
                    ...headCellStyle,
                    ...(isMobile && { position: "sticky", left: 0, zIndex: 3, backgroundColor: "#1976d2" })
                  }}>
                    STT
                  </TableCell>
                  <TableCell align="center" sx={{
                    ...headCellStyle,
                    minWidth: 140,
                    ...(isMobile && { position: "sticky", left: 60, zIndex: 3, backgroundColor: "#1976d2" })
                  }}>
                    HỌ VÀ TÊN
                  </TableCell>

                  {showMonths && monthSet.map((m) => (
                    <TableCell key={m} align="center" sx={{ ...headCellStyle, minWidth: 30, px: 0.5 }}>
                      Tháng {m}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ ...headCellStyle, width: 80 }}>TỔNG CỘNG</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {dataList.map((student) => (
                  <TableRow key={student.id} sx={{
                    height: 44,
                    backgroundColor: student.huyDangKy?.toLowerCase() === "x" ? "#f0f0f0" : "inherit",
                    "& td": { border: "1px solid #ccc", py: 1 }
                  }}>
                    <TableCell align="center" sx={{
                      width: 48,
                      px: 1,
                      ...(isMobile && {
                        position: "sticky", left: 0, backgroundColor: "#fff", zIndex: 2
                      })
                    }}>
                      {student.stt}
                    </TableCell>
                    <TableCell sx={{
                      minWidth: 180,
                      px: 1,
                      ...(isMobile && {
                        position: "sticky", left: 60, backgroundColor: "#fff", zIndex: 2
                      })
                    }}>
                      {student.hoVaTen}
                    </TableCell>

                    {showMonths && monthSet.map((m) => (
                      <TableCell key={`${student.id}-${m}`} align="center" sx={{ minWidth: 30, px: 0.5 }}>
                        {student.monthSummary[m] > 0 ? student.monthSummary[m] : ""}
                      </TableCell>
                    ))}

                    <TableCell align="center" sx={{ width: 80, px: 1 }}>
                      {student.total > 0 ? student.total : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {isMobile && (
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleExport}
              fullWidth
              sx={{
                maxWidth: { xs: 150, sm: 280 },
                fontSize: { xs: '13px', sm: '15px' },
                height: { xs: 38, sm: 44 },
                fontWeight: 'bold',
                px: { xs: 1, sm: 2 },
              }}
            >
              📥 Xuất Excel
            </Button>
          </Box>
        )}

        <Stack spacing={2} sx={{ mt: 4, alignItems: "center" }}>
          <Button onClick={onBack} color="secondary">
            ⬅️ Quay lại
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
