import React, { useState, useEffect } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Stack, Button, IconButton, LinearProgress
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import vi from "date-fns/locale/vi";
import { getDocs, getDoc, collection, doc } from "firebase/firestore";
import { db } from "./firebase";
import { format } from "date-fns";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function groupData(danhSachKhongAnRaw, danhSachData, nhatKyBanTruData, selectedDateStr) {
  const khongAnIds = new Set(
    Array.isArray(danhSachKhongAnRaw) ? danhSachKhongAnRaw.map(id => id?.trim()) : []
  );
  const ngayThang = selectedDateStr; // "2025-07-19"

  const khoiData = {};
  let truongSiSo = 0;
  let truongAn = 0;

  if (!nhatKyBanTruData || typeof nhatKyBanTruData !== "object") {
    console.warn("⚠️ Dữ liệu nhật ký bán trú chưa được khởi tạo đúng!");
    return []; // Trả về mảng rỗng để tránh lỗi .map hoặc undefined
  }

  danhSachData.forEach((student) => {
    const { maDinhDanh, lop } = student;
    if (!maDinhDanh || !lop) return;

    // ✅ Kiểm tra lịch sử đăng ký bán trú còn hiệu lực
    const nhatKy = nhatKyBanTruData[maDinhDanh];
    let isDangKyHieuLuc = Array.isArray(nhatKy)
      ? nhatKy.some(entry =>
          entry.tuNgay <= ngayThang &&
          (!entry.denNgay || ngayThang < entry.denNgay)
        )
      : false;

    // ✅ Fallback chỉ khi KHÔNG có nhật ký
    if (!isDangKyHieuLuc && !nhatKy && student.dangKyBanTru !== undefined) {
      isDangKyHieuLuc = true;
    }

    if (!isDangKyHieuLuc) return;

    // ✅ Tính thống kê
    const khoi = lop.trim().split(".")[0];
    const id = maDinhDanh.trim();

    khoiData[khoi] = khoiData[khoi] || {
      group: `KHỐI ${khoi}`, siSo: 0, anBanTru: 0, isGroup: true, children: {}
    };
    khoiData[khoi].children[lop] = khoiData[khoi].children[lop] || {
      group: lop, siSo: 0, anBanTru: 0, isGroup: false
    };

    khoiData[khoi].children[lop].siSo += 1;
    khoiData[khoi].siSo += 1;
    truongSiSo += 1;

    if (!khongAnIds.has(id)) {
      khoiData[khoi].children[lop].anBanTru += 1;
      khoiData[khoi].anBanTru += 1;
      truongAn += 1;
    }
  });

  // ✨ Chuyển thành summaryData
  const summaryData = [];
  Object.keys(khoiData).sort().forEach(khoi => {
    const khoiItem = khoiData[khoi];
    summaryData.push({ ...khoiItem });
    Object.keys(khoiItem.children).sort().forEach(lop => {
      summaryData.push(khoiItem.children[lop]);
    });
  });

  summaryData.push({
    group: "TRƯỜNG", siSo: truongSiSo, anBanTru: truongAn, isGroup: true
  });

  return summaryData;
}

function Row({ row, openGroups, setOpenGroups, summaryData }) {
  const isOpen = openGroups.includes(row.group);
  const isTruong = row.group === "TRƯỜNG";
  const isGroup = row.isGroup;

  const subRows = summaryData.filter(
    r => !r.isGroup && r.group.startsWith(row.group.split(" ")[1] + ".")
  );

  return (
    <>
      <TableRow
        sx={{
          backgroundColor: isTruong ? "#fff3e0" : "#e3f2fd",
          cursor: isGroup && !isTruong ? "pointer" : "default",
          "&:hover": { backgroundColor: isGroup && !isTruong ? "#bbdefb" : undefined },
        }}
        onClick={() => {
          if (isGroup && !isTruong) {
            setOpenGroups(isOpen ? openGroups.filter(g => g !== row.group) : [...openGroups, row.group]);
          }
        }}
      >
        <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
          {isGroup && !isTruong && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setOpenGroups(isOpen ? openGroups.filter(g => g !== row.group) : [...openGroups, row.group]);
              }}
            >
              {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          )}
          {row.group}
        </TableCell>
        <TableCell align="center" sx={{ fontWeight: "bold" }}>{row.siSo}</TableCell>
        <TableCell align="center" sx={{ fontWeight: "bold" }}>{row.anBanTru}</TableCell>
      </TableRow>

      {isGroup && isOpen &&
        subRows.map(subRow => (
          <TableRow key={subRow.group} sx={{ backgroundColor: "#f9fbe7", "&:hover": { backgroundColor: "#f0f4c3" } }}>
            <TableCell sx={{ pl: 6, textAlign: "center" }}>{subRow.group}</TableCell>
            <TableCell align="center">{subRow.siSo}</TableCell>
            <TableCell align="center">{subRow.anBanTru}</TableCell>
          </TableRow>
        ))}
    </>
  );
}

export default function ThongKeTheoNgay({ onBack }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dataList, setDataList] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [openGroups, setOpenGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        // 📦 Lấy năm học hiện tại
        const namHocDoc = await getDoc(doc(db, "YEAR", "NAMHOC"));
        const namHocValue = namHocDoc.exists() ? namHocDoc.data().value : null;

        if (!namHocValue) {
          console.error("❌ Không tìm thấy năm học hiện tại trong hệ thống!");
          setIsLoading(false);
          return;
        }

        const nhatKySnap = await getDocs(collection(db, `NHATKYBANTRU_${namHocValue}`));
        const nhatKyBanTruData = {};

        nhatKySnap.forEach(doc => {
          const data = doc.data();
          const maID = data.maDinhDanh?.trim();
          if (maID && Array.isArray(data.lichSuDangKy)) {
            nhatKyBanTruData[maID] = data.lichSuDangKy;
          }
        });

        // 🗓 Format ngày thành chuỗi yyyy-MM-dd
        const dateStr = format(selectedDate, "yyyy-MM-dd");

        // 🔄 Lấy document bán trú theo ngày và danh sách toàn trường
        const [banTruDoc, danhSachSnap] = await Promise.all([
          getDoc(doc(db, `BANTRU_${namHocValue}`, dateStr)),
          getDocs(collection(db, `DANHSACH_${namHocValue}`)),
        ]);

        // ✅ Tách dữ liệu đúng nguồn
        const danhSachKhongAnRaw = banTruDoc.exists() ? banTruDoc.data().danhSachKhongAn : [];
        const danhSachData = danhSachSnap.docs.map(doc => doc.data());

        // 🔍 Kiểm tra dữ liệu đầu vào
        //console.log("🔍 Tổng số học sinh đăng ký ăn bán trú:", danhSachData.length);
        //console.log("🔍 Số học sinh đã điểm danh hôm nay:", banTruData.length);
        //console.log("📌 Mã học sinh đã điểm danh:", banTruData.map(d => d.maDinhDanh?.trim()));
        //console.log("📌 Mã học sinh đăng ký ăn:", danhSachData.map(d => d.maDinhDanh?.trim()));

        // 🚀 Gọi hàm thống kê
        setDataList(danhSachKhongAnRaw);
        const summary = groupData(danhSachKhongAnRaw, danhSachData, nhatKyBanTruData, dateStr);
        setSummaryData(summary);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu từ Firebase:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  return (
    <Box sx={{ maxWidth: 500, marginLeft: "auto", marginRight: "auto", paddingLeft: 0.5, paddingRight: 0.5, mt: 2 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" fontWeight="bold" color="primary" align="center" sx={{ mb: 1 }}>
            TỔNG HỢP NGÀY
          </Typography>
          <Box sx={{ height: "2px", width: "100%", backgroundColor: "#1976d2", borderRadius: 1, mt: 2, mb: 4 }} />
        </Box>

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Box sx={{ width: 185 }}>
              <DatePicker
                label="Chọn ngày"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      minWidth: 130,
                      maxWidth: 165,
                      "& input": {
                        textAlign: "center",
                        height: "1.4375em",
                      },
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </LocalizationProvider>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <LinearProgress sx={{ width: '50%' }} />
          </Box>
        )}

          <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#1976d2' }}>
                <TableCell align="center" sx={{ fontWeight: "bold", color: "white" }}>LỚP / KHỐI</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", color: "white" }}>SĨ SỐ</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", color: "white" }}>ĂN BÁN TRÚ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summaryData
                .filter(row => row.isGroup)
                .map(row => (
                  <Row
                    key={row.group}
                    row={row}
                    openGroups={openGroups}
                    setOpenGroups={setOpenGroups}
                    summaryData={summaryData}
                  />
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack spacing={2} sx={{ mt: 4, alignItems: "center" }}>
          <Button onClick={onBack} color="secondary">
            ⬅️ Quay lại
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}