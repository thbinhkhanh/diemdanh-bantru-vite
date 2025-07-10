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
import { exportThongKeNamDiemDanh } from './utils/exportThongKeNamDiemDanh';
import { useClassList } from "./context/ClassListContext";
import { useClassData } from "./context/ClassDataContext"; // ✅

export default function ThongKeNam_DiemDanh({ onBack }) {
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

  useEffect(() => {
    const fetchNamHoc = async () => {
      const namHocDoc = await getDoc(doc(db, "YEAR", "NAMHOC"));
      const value = namHocDoc.exists() ? namHocDoc.data().value : null;
      setNamHocValue(value);
    };
    fetchNamHoc();
  }, []);

  useEffect(() => {
    const fetchClassList = async () => {
      try {
        // 🗓️ Lấy năm học hiện tại từ Firestore
        const namHocDoc = await getDoc(doc(db, "YEAR", "NAMHOC"));
        const namHoc = namHocDoc.exists() ? namHocDoc.data().value : null;

        if (!namHoc) {
          console.error("❌ Không tìm thấy năm học hợp lệ!");
          return;
        }

        setNamHocValue(namHoc); // ⬅️ Lưu lại vào state (nếu cần dùng tiếp)

        // ✅ Kiểm tra context có dữ liệu chưa
        const cachedList = getClassList("TRUONG");
        if (cachedList.length > 0) {
          setClassList(cachedList);
          setSelectedClass(cachedList[0] || "");
          return;
        }

        // 📥 Tải danh sách lớp từ Firestore nếu chưa có trong context
        const docRef = doc(db, `CLASSLIST_${namHoc}`, "TRUONG");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const list = docSnap.data().list || [];

          setClassList(list);
          setSelectedClass(list[0] || "");

          // 🔁 Cập nhật context để các nơi khác dùng chung
          setClassListForKhoi("TRUONG", list);
        } else {
          console.warn(`⚠️ Không tìm thấy CLASSLIST_${namHoc}/TRUONG`);
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách lớp:", err);
      }
    };

    fetchClassList();
  }, []);


  useEffect(() => {
    if (!selectedClass || !selectedDate || !namHocValue) return;

    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        // ======= STEP 1: Lấy danh sách học sinh từ CONTEXT nếu có =======
        let studentsList = getClassData?.(selectedClass);

        const isValidArray = Array.isArray(studentsList) && studentsList.length > 0;

        if (isValidArray) {
          //console.log("📦 Danh sách học sinh lấy từ CONTEXT:", studentsList);
        } else {
          //console.log("🔥 Đang lấy danh sách học sinh từ Firestore...");

          const studentQuery = query(
            collection(db, `DANHSACH_${namHocValue}`),
            where("lop", "==", selectedClass)
          );
          const studentSnapshot = await getDocs(studentQuery);
          studentsList = studentSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          // Lưu vào context nếu có hàm
          if (setClassData) {
            setClassData(selectedClass, studentsList);
          }
        }

        if (!Array.isArray(studentsList)) {
          console.warn("⚠️ studentsList không hợp lệ:", studentsList);
          setDataList([]);
          return;
        }

        // ======= STEP 2: Lấy điểm danh từ Firestore =======
        const diemDanhQuery = query(
          collection(db, `DIEMDANH_${namHocValue}`),
          where("lop", "==", selectedClass)
        );
        const diemDanhSnapshot = await getDocs(diemDanhQuery);

        const diemDanhByStudent = {};

        diemDanhSnapshot.forEach(docSnap => {
          const d = docSnap.data();
          const maDinhDanh = d.maDinhDanh;
          const date = d.ngay;
          const phep = d.phep;
          const nam = Number(d.nam);
          const thang = Number((d.thang || "").split("-")[1]);

          if (nam !== selectedDate.getFullYear()) return;

          if (!diemDanhByStudent[maDinhDanh]) {
            diemDanhByStudent[maDinhDanh] = {};
          }

          const type = phep ? "P" : "K";

          if (!diemDanhByStudent[maDinhDanh][thang]) {
            diemDanhByStudent[maDinhDanh][thang] = { P: 0, K: 0 };
          }

          diemDanhByStudent[maDinhDanh][thang][type]++;
        });

        // ======= STEP 3: Gộp học sinh + thống kê điểm danh =======
        const students = studentsList.map((s, index) => {
          const monthSummary = diemDanhByStudent[s.id] || {};
          let total = 0;

          Object.values(monthSummary).forEach(month => {
            total += (month.P || 0) + (month.K || 0);
          });

          return {
            id: s.id,
            hoVaTen: s.hoVaTen || s.hoTen,
            stt: index + 1,
            monthSummary,
            total,
          };
        });

        // ======= STEP 4: Chuẩn hóa dữ liệu đầu ra =======
        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        setMonthSet(months);

        const sorted = MySort(students).map((s, idx) => ({
          ...s,
          stt: idx + 1
        }));
        setDataList(sorted);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu điểm danh:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass, selectedDate, namHocValue]);


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
    exportThongKeNamDiemDanh(dataList, selectedDate.getFullYear(), selectedClass, monthSet);
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
            ĐIỂM DANH CẢ NĂM
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
                  <TableCell align="center" rowSpan={2} sx={{
                    ...headCellStyle,
                    ...(isMobile && { position: "sticky", left: 0, zIndex: 3, backgroundColor: "#1976d2" })
                  }}>
                    STT
                  </TableCell>
                  <TableCell align="center" rowSpan={2} sx={{
                    ...headCellStyle,
                    minWidth: 140,
                    ...(isMobile && { position: "sticky", left: 60, zIndex: 3, backgroundColor: "#1976d2" })
                  }}>
                    HỌ VÀ TÊN
                  </TableCell>

                  {showMonths && monthSet.map((m) => (
                    <TableCell key={m} align="center" colSpan={2} sx={{ ...headCellStyle, minWidth: 60 }}>
                      Tháng {m}
                    </TableCell>
                  ))}
                  <TableCell align="center" rowSpan={2} sx={{ ...headCellStyle, width: 80 }}>TỔNG CỘNG</TableCell>
                </TableRow>

                {showMonths && (
                  <TableRow>
                    {monthSet.map((m) => (
                      <React.Fragment key={m}>
                        <TableCell align="center" sx={headCellStyle}>P</TableCell>
                        <TableCell align="center" sx={headCellStyle}>K</TableCell>
                      </React.Fragment>
                    ))}
                  </TableRow>
                )}
              </TableHead>

              <TableBody>
                {dataList.map((student) => (
                  <TableRow key={student.id} sx={{
                    height: 44,
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
                      <React.Fragment key={m}>
                        <TableCell align="center" sx={{ minWidth: 15, px: 0 }}>
                          {student.monthSummary?.[m]?.P > 0 ? student.monthSummary[m].P : ""}
                        </TableCell>
                        <TableCell align="center" sx={{ minWidth: 15, px: 0 }}>
                          {student.monthSummary?.[m]?.K > 0 ? student.monthSummary[m].K : ""}
                        </TableCell>
                      </React.Fragment>
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
