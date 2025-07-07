import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Typography, Paper, Table, TableHead, TableBody,
  TableRow, TableCell, CircularProgress, Button,
  TableContainer,
  InputLabel, FormControl, RadioGroup, FormControlLabel, Radio
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import vi from "date-fns/locale/vi";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { format } from "date-fns";
import { useMediaQuery, useTheme } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useNhatKy } from "./context/NhatKyContext";

export default function NhatKyGV() {
  const location = useLocation();
  const navigate = useNavigate();
  const lop = location.state?.lop;
  const { nhatKyData, mergeNhatKy, getNhatKy } = useNhatKy();

  const today = new Date();
  const [filterMode, setFilterMode] = useState("ngay");
  const [selectedDate, setSelectedDate] = useState(today);
  const [filterThang, setFilterThang] = useState(today.getMonth() + 1);
  const [filterNam, setFilterNam] = useState(today.getFullYear());
  const [firestoreData, setFirestoreData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [orderBy, setOrderBy] = useState("hoTen");
  const [order, setOrder] = useState("asc");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (filterMode === "ngay") {
      const currentDay = selectedDate.getDate();
      const maxDays = new Date(filterNam, filterThang, 0).getDate();
      const safeDay = Math.min(currentDay, maxDays);
      const newDate = new Date(filterNam, filterThang - 1, safeDay);
      setSelectedDate(newDate);
    }
  }, [filterThang, filterNam, filterMode]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const namHocDoc = await getDoc(doc(db, "YEAR", "NAMHOC"));
      const namHocValue = namHocDoc.exists() ? namHocDoc.data().value : null;

      if (!namHocValue) {
        console.error("❌ Không tìm thấy năm học hiện tại!");
        setFirestoreData([]);
        setIsLoading(false);
        return;
      }

      let combinedData = [];

      if (filterMode === "ngay") {
        const ngayKey = format(selectedDate, "yyyy-MM-dd");
        const nhatKyDoc = await getDoc(doc(db, `NHATKY_${namHocValue}`, ngayKey));
        if (nhatKyDoc.exists()) {
          const rawData = nhatKyDoc.data();
          combinedData = Object.entries(rawData)
            .filter(([_, value]) => value.lop === lop)
            .map(([id, value]) => ({ id, ...value }));
        }
      } else if (filterMode === "thang") {
        const datesToFetch = [];
        const year = filterNam;
        const month = filterThang - 1;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          datesToFetch.push(new Date(year, month, day));
        }

        const promises = datesToFetch.map((date) => {
          const ngayKey = format(date, "yyyy-MM-dd");
          const docRef = doc(db, `NHATKY_${namHocValue}`, ngayKey);
          return getDoc(docRef).then((snapshot) => ({ snapshot, ngayKey }));
        });

        const results = await Promise.all(promises);

        for (const { snapshot } of results) {
          if (snapshot.exists()) {
            const rawData = snapshot.data();
            combinedData = combinedData.concat(
              Object.entries(rawData)
                .filter(([_, value]) => value.lop === lop)
                .map(([id, value]) => ({ id, ...value }))
            );
          }
        }
      }

      // Gộp và loại trùng dựa trên ID và ngày nghỉ
      const uniqueMap = new Map();
      for (const entry of combinedData) {
        const key = `${entry.id}-${entry.ngay}`;
        uniqueMap.set(key, entry);
      }
      const uniqueData = Array.from(uniqueMap.values());

      setFirestoreData(uniqueData);

      if (uniqueData.length > 0) {
        const classId = lop;
        const year = filterNam.toString();
        const month = String(filterThang).padStart(2, '0');

        if (filterMode === "ngay") {
          const day = String(selectedDate.getDate()).padStart(2, '0');
          mergeNhatKy({ classId, year, month, day, entries: uniqueData });
        } else {
          mergeNhatKy({ classId, year, month, entries: uniqueData });
        }
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu:", err);
      setFirestoreData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!lop) return;

    const classId = lop;
    const year = filterNam.toString();
    const month = String(filterThang).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');

    if (filterMode === "ngay") {
      const cachedData = getNhatKy({ classId, year, month, day });
      if (cachedData && cachedData.length > 0) return;
    }

    if (filterMode === "thang") {
      const cachedData = getNhatKy({ classId, year, month, day: null }); // ← thêm day: null
      if (cachedData && cachedData.length > 0) return;
    }


    fetchData();
  }, [filterMode, selectedDate, filterThang, filterNam, lop]);

  const classId = lop;
  const year = filterNam.toString();
  const month = String(filterThang).padStart(2, '0');
  const day = String(selectedDate.getDate()).padStart(2, '0');

  const computedDataList = useMemo(() => {
    if (filterMode === "ngay") {
      return getNhatKy({ classId, year, month, day }) || [];
    } else {
      return getNhatKy({ classId, year, month, day: null }) || [];
    }
  }, [filterMode, classId, year, month, day]);


  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortByName = (a, b) => {
    const splitA = a.hoTen?.trim().split(/\s+/) || [];
    const splitB = b.hoTen?.trim().split(/\s+/) || [];
    const [hoA, ...restA] = splitA;
    const [hoB, ...restB] = splitB;
    const tenA = restA.pop();
    const tenB = restB.pop();
    const demA = restA.join(" ").toLowerCase();
    const demB = restB.join(" ").toLowerCase();

    const cmpTen = tenA?.localeCompare(tenB, "vi", { sensitivity: "base" }) || 0;
    if (cmpTen !== 0) return order === "asc" ? cmpTen : -cmpTen;

    const cmpDem = demA?.localeCompare(demB, "vi", { sensitivity: "base" }) || 0;
    if (cmpDem !== 0) return order === "asc" ? cmpDem : -cmpDem;

    return order === "asc"
      ? hoA?.localeCompare(hoB, "vi", { sensitivity: "base" }) || 0
      : hoB?.localeCompare(hoA, "vi", { sensitivity: "base" }) || 0;
  };

  const sortedData = [...computedDataList].sort((a, b) => {
    const dateA = new Date(a.ngay || 0);
    const dateB = new Date(b.ngay || 0);
    if (dateA.getTime() !== dateB.getTime()) {
      return order === "asc" ? dateA - dateB : dateB - dateA;
    }
    return sortByName(a, b);
  });

  if (!lop) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h6" color="error">
          ❗ Không tìm thấy thông tin lớp được chọn.
        </Typography>
        <Button variant="contained" color="secondary" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          ⬅️ Quay lại
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: '#e3f2fd',
        minHeight: '100vh',
        py: 4,
        overflowX: "hidden"  // ✅ ngăn cuộn ngang toàn trang
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "750px",    // ✅ giữ giới hạn chiều ngang
          mx: "auto",            // ✅ căn giữa
          px: { xs: 0, sm: 2 },  // ✅ padding ngang cho responsive
          pt: 2
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 2,
            mt: 6,
            width: "100%",          // ✅ đảm bảo không tràn vùng cha
            boxSizing: "border-box" // ✅ tính cả padding vào width
          }}
        >
          {/* Nội dung ở đây */}
          <Typography variant="h5" fontWeight="bold" align="center" color="primary" sx={{ mb: 4, borderBottom: "3px solid #1976d2", pb: 1 }}>
            NHẬT KÝ ĐIỂM DANH - LỚP {lop}
          </Typography>

          {/* Bộ lọc */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <FormControl component="fieldset">
              <RadioGroup row value={filterMode} onChange={(e) => setFilterMode(e.target.value)}>
                <FormControlLabel value="ngay" control={<Radio />} label="Ngày" />
                <FormControlLabel value="thang" control={<Radio />} label="Tháng" />
              </RadioGroup>
            </FormControl>
          </Box>

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
            <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 2, mb: 2 }}>
              {filterMode === "ngay" && (
                <DatePicker
                  label="Chọn ngày"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  slotProps={{ textField: { size: "small", sx: { width: 140 } } }}
                />
              )}
              {filterMode === "thang" && (
                <DatePicker
                  label="Chọn tháng"
                  views={["year", "month"]}
                  value={new Date(filterNam, filterThang - 1)}
                  onChange={(newDate) => {
                    if (newDate) {
                      setFilterNam(newDate.getFullYear());
                      setFilterThang(newDate.getMonth() + 1);
                    }
                  }}
                  format="M/yyyy"
                  slotProps={{ textField: { size: "small", sx: { width: 130 } } }}
                />
              )}
            </Box>
          </LocalizationProvider>

          {/* Danh sách */}
          {isLoading && sortedData.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <CircularProgress />
            </Box>
          ) : isMobile ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {sortedData.length === 0 ? (
                <Typography sx={{ textAlign: "center", fontStyle: "italic" }}>
                  Không có dữ liệu phù hợp
                </Typography>
              ) : (
                sortedData.map((item, index) => (
                  <Paper key={item.id || index} sx={{ p: 2, borderLeft: '5px solid #1976d2' }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                      {index + 1}. {item.hoTen?.toUpperCase()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Có phép:</strong>{" "}
                      {item.loai?.trim().toUpperCase() === "P" ? "✅" : "❌"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Lý do nghỉ:</strong> {item.lydo?.trim() || "Không rõ lý do"}
                    </Typography>
                    <Typography variant="body2" color="error">
                      <strong>Ngày nghỉ:</strong>{" "}
                      {item.ngay ? new Date(item.ngay).toLocaleDateString("vi-VN") : "Không rõ"}
                    </Typography>
                  </Paper>
                ))
              )}
            </Box>
          ) : (
           <TableContainer component={Paper} sx={{ overflowX: "auto", mt: 2 }}>
              <Table
                sx={{
                  border: "1px solid #ccc",
                  "& td, & th": {
                    border: "1px solid #ccc",
                    textAlign: "center",
                    padding: "10px 8px",
                  },
                  "& td.hoten": {
                    textAlign: "left",
                    whiteSpace: "nowrap",
                  },
                }}
              >
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#1976d2" }}>
                    {["STT", "HỌ VÀ TÊN", "CÓ PHÉP", "LÝ DO", "NGÀY NGHỈ"].map((label, i) => (
                      <TableCell key={i} align="center" sx={{ color: "#fff", fontWeight: "bold" }}>
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ fontStyle: "italic", textAlign: "center" }}>
                        Không có dữ liệu phù hợp
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedData.map((item, index) => (
                      <TableRow key={item.id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="hoten">{item.hoTen || ""}</TableCell>
                        <TableCell>{item.loai?.trim().toUpperCase() === "P" ? "✅" : "❌"}</TableCell>
                        <TableCell>{item.lydo?.trim() || "Không rõ lý do"}</TableCell>
                        <TableCell>{item.ngay ? new Date(item.ngay).toLocaleDateString("vi-VN") : "Không rõ"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Nút quay lại */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button
              onClick={() => {
                const selectedClass = location.state?.lop;
                const selectedLop = selectedClass?.split('.')[0];
                if (selectedLop) {
                  navigate(`/lop${selectedLop}`, { state: { lop: selectedClass } });
                } else {
                  navigate('/home');
                }
              }}
              color="secondary"
            >
              ⬅️ Quay lại
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
