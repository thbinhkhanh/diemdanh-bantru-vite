import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Button, Alert, Stack, LinearProgress
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { writeBatch, doc, getDoc, setDoc, getDocs, collection } from "firebase/firestore";
import { db } from './firebase';

export default function TaiDanhSach({ onBack }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [namHoc, setNamHoc] = useState('');

  useEffect(() => {
    const fetchNamHoc = async () => {
      try {
        const docRef = doc(db, 'YEAR', 'NAMHOC');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const value = docSnap.data().value;
          if (value) setNamHoc(value);
          else setMessage('❗ Chưa có năm học từ hệ thống!');
        } else {
          setMessage('❗ Không tìm thấy thông tin năm học!');
        }
      } catch (err) {
        setMessage('❌ Lỗi khi lấy năm học!');
        console.error(err);
      }
    };
    fetchNamHoc();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      setSelectedFile(file);
      setMessage('');
      setSuccess(false);
    } else {
      setSelectedFile(null);
      setMessage('❌ Vui lòng chọn đúng định dạng file Excel (.xlsx)');
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    const loginRole = localStorage.getItem("loginRole");
    if (loginRole !== "admin" && loginRole !== "bgh") {
      setMessage("❌ Bạn không có quyền tải danh sách lên hệ thống!");
      setSuccess(false);
      return;
    }

    if (!selectedFile) {
      setMessage('❗ Chưa chọn file!');
      setSuccess(false);
      return;
    }

    if (!namHoc) {
      setMessage('❗ Không có năm học hợp lệ!');
      return;
    }

    setLoading(true);
    setMessage('🔄 Đang xử lý file...');
    setProgress(0);
    setCurrentIndex(0);
    setTotalCount(0);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const range = XLSX.utils.decode_range(sheet['!ref']);

        const headerRow = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: 2, c: C });
          const cell = sheet[cellAddress];
          headerRow.push((cell?.v || '').toString().trim().toUpperCase());
        }

        const expectedHeaders = ['STT', 'MÃ ĐỊNH DANH', 'HỌ VÀ TÊN', 'LỚP', 'ĐĂNG KÝ'];
        const isValidHeader = headerRow.length === expectedHeaders.length &&
          expectedHeaders.every((title, index) => headerRow[index] === title);

        if (!isValidHeader) {
          setLoading(false);
          setSuccess(false);
          setMessage('❌ Dữ liệu không hợp lệ! Tiêu đề phải nằm ở hàng 3 và đúng định dạng: STT, MÃ ĐỊNH DANH, HỌ VÀ TÊN, LỚP, ĐĂNG KÝ.');
          return;
        }

        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          defval: '',
          header: 1,
          range: 3,
        });

        const formattedData = jsonData.map(row => {
          const obj = {};
          expectedHeaders.forEach((key, i) => {
            obj[key] = row[i] ?? '';
          });
          return obj;
        });

        setTotalCount(formattedData.length);
        await processStudentData(formattedData);
      } catch (err) {
        console.error('❌ Lỗi khi xử lý file:', err);
        setSuccess(false);
        setMessage('❌ Đã xảy ra lỗi khi xử lý file Excel.');
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const processStudentData = async (jsonData) => {
    const studentCollection = `DANHSACH_${namHoc}`;
    const classListCollection = `CLASSLIST_${namHoc}`;

    const studentsNew = jsonData.map(row => {
      const lop = row['LỚP']?.toString().trim().toUpperCase();
      const maGoc = row['MÃ ĐỊNH DANH']?.toString().trim().toUpperCase();
      const maDinhDanh = `${lop}-${maGoc}`;
      const dangKyStr = row['ĐĂNG KÝ']?.toString().trim().toLowerCase();

      const student = {
        stt: row['STT'] || '',
        maDinhDanh,
        hoVaTen: row['HỌ VÀ TÊN']?.toString().trim(),
        lop,
        khoi: lop.charAt(0),
      };

      if (dangKyStr === 'x') {
        student.dangKyBanTru = true;
        student.diemDanhBanTru = true;
      }

      return student;
    });

    if (studentsNew.length === 0) {
      setSuccess(true);
      setMessage('📌 Không có dữ liệu học sinh để thêm.');
    } else {
      const snapshot = await getDocs(collection(db, studentCollection));
      const existingIds = new Set(snapshot.docs.map(doc => doc.id));
      const studentsToAdd = studentsNew.filter(s => !existingIds.has(s.maDinhDanh));

      if (studentsToAdd.length === 0) {
        setSuccess(true);
        setMessage('✅ Không có học sinh mới để thêm.');
      } else {
        let successCount = 0;
        let errorCount = 0;
        const BATCH_LIMIT = 500;

        for (let i = 0; i < studentsToAdd.length; i += BATCH_LIMIT) {
          const chunk = studentsToAdd.slice(i, i + BATCH_LIMIT);
          const batch = writeBatch(db);

          chunk.forEach(student => {
            const docRef = doc(db, studentCollection, student.maDinhDanh);
            batch.set(docRef, student);
          });

          try {
            await batch.commit();
            successCount += chunk.length;
          } catch (err) {
            console.error(`❌ Lỗi khi ghi batch từ ${i} đến ${i + BATCH_LIMIT}:`, err.message);
            errorCount += chunk.length;
          }

          const current = Math.min(i + BATCH_LIMIT, studentsToAdd.length);
          setCurrentIndex(current);
          setProgress(Math.round((current / studentsToAdd.length) * 100));
        }

        if (successCount > 0) setSelectedFile(null);

        setSuccess(errorCount === 0);
        setMessage(errorCount === 0
          ? `✅ Đã thêm ${successCount} học sinh mới.`
          : `⚠️ Có ${errorCount} lỗi khi thêm ${studentsToAdd.length} học sinh mới.`);
      }
    }

    // ✅ LUÔN cập nhật CLASSLIST
    try {
      const truongRef = doc(db, classListCollection, 'TRUONG');
      const truongSnap = await getDoc(truongRef);
      const oldClasses = truongSnap.exists() ? truongSnap.data().list || [] : [];
      const allClasses = new Set(oldClasses);

      studentsNew.forEach(student => {
        const lop = student.lop?.toString().trim();
        if (lop) allClasses.add(lop);
      });

      const classArray = Array.from(allClasses).map(x => x.replace(/\s+/g, '').toUpperCase()).sort((a, b) =>
        a.localeCompare(b, 'vi', { numeric: true })
      );

      const grouped = {};
      classArray.forEach(lop => {
        const khoiMatch = lop.match(/^(\d+)/);
        if (khoiMatch) {
          const khoi = `K${khoiMatch[1]}`;
          if (!grouped[khoi]) grouped[khoi] = [];
          grouped[khoi].push(lop);
        }
      });

      await setDoc(truongRef, { list: classArray });
      for (const khoiKey in grouped) {
        await setDoc(doc(db, classListCollection, khoiKey), { list: grouped[khoiKey] });
      }

      console.log('✅ Cập nhật CLASSLIST thành công');
    } catch (e) {
      console.error('❌ Lỗi khi cập nhật CLASSLIST:', e.message);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'transparent', pt: 0, px: 1 }}>
      <Box maxWidth={420} mx="auto">
        <Card elevation={8} sx={{ p: 4, borderRadius: 4, mt: 2 }}>
          <Typography variant="h5" color="primary" fontWeight="bold" align="center" gutterBottom>
            TẢI DANH SÁCH HỌC SINH
          </Typography>
          <Box sx={{ height: "2px", width: "100%", backgroundColor: "#1976d2", borderRadius: 1, mt: 2, mb: 4 }} />
          <Stack spacing={2}>
            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} sx={{ height: 40 }}>
              Chọn file Excel (.xlsx)
              <input type="file" hidden accept=".xlsx" onChange={handleFileChange} />
            </Button>

            {selectedFile && (
              <Typography variant="body2" color="text.secondary">
                📄 File đã chọn: {selectedFile.name}
              </Typography>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                fullWidth variant="contained" color="success"
                startIcon={<CloudUploadIcon />} onClick={handleUpload}
                sx={{ fontWeight: 'bold', height: 40 }} disabled={loading}
              >
                {loading ? '🔄 Đang tải lên...' : 'Tải lên'}
              </Button>
            </motion.div>

            {loading && (
              <>
                <LinearProgress variant="determinate" value={progress} />
                <Typography variant="caption" color="text.secondary" align="center">
                  Đang tải dữ liệu học sinh... ({currentIndex}/{totalCount} HS - {progress}%)
                </Typography>
              </>
            )}

            {message && (
              <Alert severity={success ? 'success' : loading ? 'info' : 'error'}>
                {message}
              </Alert>
            )}

            <Button onClick={onBack} color="secondary">
              ⬅️ Quay lại
            </Button>
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}
