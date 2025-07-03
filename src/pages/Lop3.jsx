import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Checkbox, FormControl, InputLabel,
  Select, MenuItem, LinearProgress, Typography,
  Radio, FormControlLabel, Stack, TextField, Alert, Card, Button
} from '@mui/material';

import { useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

import { fetchStudentsFromFirestore } from '../pages/ThanhPhan/fetchStudents';
import { enrichStudents } from '../pages/ThanhPhan/enrichStudents';
import { saveRegistrationChanges } from '../pages/ThanhPhan/saveRegistration';
import { saveMultipleDiemDanh } from '../pages/ThanhPhan/saveDiemDanh';
import { saveSingleDiemDanh } from '../pages/ThanhPhan/saveSingleDiemDanh';
import { MySort } from '../utils/MySort';

export default function Lop3() {
  const location = useLocation();
  const useNewVersion = location.state?.useNewVersion ?? false;

  const [students, setStudents] = useState([]);
  const [originalRegistered, setOriginalRegistered] = useState({});
  const [selectedClass, setSelectedClass] = useState('');
  const [classList, setClassList] = useState([]);
  const [namHoc, setNamHoc] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [viewMode, setViewMode] = useState('bantru');
  const saveTimeout = useRef(null);
  const filteredStudents = students;
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [showSavedAlert, setShowSavedAlert] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  const [checkAllDiemDanh, setCheckAllDiemDanh] = useState(true);
  const [checkAllBanTru, setCheckAllBanTru] = useState(true);

  useEffect(() => {
    setExpandedRowId(null);
  }, [viewMode]);

  useEffect(() => {
    const allRegistered = students.length > 0 &&
      students.every(s => !s.showRegisterCheckbox || s.registered);
    setCheckAllBanTru(allRegistered); // cập nhật trạng thái checkbox theo dữ liệu mới
  }, [students]);

  useEffect(() => {
    if (lastSaved && !isSaving) {
      // So sánh nếu thời gian mới khác với trước đó
      const newTime = lastSaved.getTime();
      if (newTime !== lastSavedTime) {
        setLastSavedTime(newTime);
        setShowSavedAlert(true);

        const timer = setTimeout(() => {
          setShowSavedAlert(false);
        }, 2000); // 5 giây

        return () => clearTimeout(timer);
      }
    }
  }, [lastSaved, isSaving]);

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

  useEffect(() => {
    const fetchClassList = async () => {
      if (!namHoc) return;
      try {
        const docRef = doc(db, `DANHSACH_${namHoc}`, 'K3');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const list = data.list || [];
          setClassList(list);
          if (list.length > 0) setSelectedClass(list[0]);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách lớp:', err.message);
      }
    };
    fetchClassList();
  }, [namHoc]);

  useEffect(() => {
  const fetchData = async () => {
    if (!namHoc || !selectedClass) return;
    setIsLoading(true);
    try {
      const col = `BANTRU_${namHoc}`;
      const raw = await fetchStudentsFromFirestore(col, selectedClass, useNewVersion);
      const enriched = enrichStudents(raw, today, selectedClass, useNewVersion);

      const sorted = MySort(enriched); // ✅ SẮP XẾP SAU KHI enrich

      setStudents(sorted);

      const initMap = {};
      sorted.forEach(s => (initMap[s.id] = s.registered));
      setOriginalRegistered(initMap);
    } catch (err) {
      console.error('Lỗi khi tải học sinh:', err.message);
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, [namHoc, selectedClass]);


  const handleSave = async () => {
    if (!namHoc) return;
    setIsSaving(true);

    const changed = students.filter(s => s.registered !== originalRegistered[s.id]);
    const absent = students.filter(s => !s.diemDanh);

    try {
      await saveRegistrationChanges(changed, namHoc);
      await saveMultipleDiemDanh(absent, namHoc, today);

      const updatedMap = { ...originalRegistered };
      changed.forEach(s => (updatedMap[s.id] = s.registered));
      setOriginalRegistered(updatedMap);

      setLastSaved(new Date()); // 👈 THÊM DÒNG NÀY
    } catch (err) {
      console.error('Lỗi khi lưu:', err.message);
    } finally {
      setIsSaving(false);
    }
  };


  const toggleDiemDanh = async (index) => {
    const updated = [...students];
    updated[index].diemDanh = !updated[index].diemDanh;

    if (updated[index].diemDanh) {
      updated[index].vangCoPhep = '';
      updated[index].lyDo = '';
      setExpandedRowId(null);
    } else {
      updated[index].registered = false;
      setExpandedRowId(updated[index].id);

      // ✅ GỌI LƯU BÁN TRÚ NGAY LÚC ĐÓ
      await saveRegistrationChanges([updated[index]], namHoc);

      // ✅ CẬP NHẬT BẢN SAO CỦA originalRegistered CHỈ VỚI HỌC SINH ĐÓ
      setOriginalRegistered(prev => ({
        ...prev,
        [updated[index].id]: false,
      }));
    }

    setStudents(updated);

    // ✅ Điểm danh luôn lưu như cũ
    await saveSingleDiemDanh(updated[index], namHoc);
  };

  const toggleRegister = (index) => {
    const updated = [...students];
    updated[index].registered = !updated[index].registered;
    setStudents(updated);
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(handleSave, 2000);
  };

  const handleClassChange = async (event) => {
    clearTimeout(saveTimeout.current);
    await handleSave();
    setSelectedClass(event.target.value);
  };

  const handleVangCoPhepChange = (index, value) => {
    const updated = [...students];
    updated[index].vangCoPhep = value;
    setStudents(updated);
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveSingleDiemDanh(updated[index], namHoc);
    }, 1000);
  };

  const handleLyDoChange = (index, value) => {
    const updated = [...students];
    updated[index].lyDo = value;
    setStudents(updated);

    // Gọi lưu sau khi cập nhật lý do
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveSingleDiemDanh(updated[index], namHoc);
    }, 500); // debounce tránh lưu quá nhanh khi người dùng đang gõ
  };

  const handleSendZalo = (student) => {
    const msg = `Học sinh: ${student.hoVaTen}\nVắng: ${student.vangCoPhep || '[chưa chọn]'}\nLý do: ${student.lyDo || '[chưa nhập]'}`;
    navigator.clipboard.writeText(msg).then(() => alert('Đã sao chép tin nhắn. Dán vào Zalo để gửi.'));
  };

  return (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12 }}>
    <Card
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: 470,
        width: '100%',
        borderRadius: 4,
        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
        backgroundColor: 'white',
        minHeight: '100vh'
      }}
      elevation={10}
    >
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        fontWeight="bold"
        color="primary"
        sx={{ mb: 4, borderBottom: '3px solid #1976d2', pb: 1 }}
      >
        DANH SÁCH HỌC SINH
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <FormControl size="small" sx={{ width: 120 }}>
          <InputLabel>Lớp</InputLabel>
          <Select value={selectedClass} label="Lớp" onChange={handleClassChange}>
            {classList.map(cls => (
              <MenuItem key={cls} value={cls}>{cls}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1, mb: 2 }}>
        <FormControlLabel
          value="diemdanh"
          control={<Radio checked={viewMode === 'diemdanh'} onChange={() => setViewMode('diemdanh')} />}
          label="Điểm danh"
        />
        <FormControlLabel
          value="bantru"
          control={<Radio checked={viewMode === 'bantru'} onChange={() => setViewMode('bantru')} />}
          label="Bán trú"
        />
      </Stack>

      {/* Tóm tắt học sinh vắng */}
      {viewMode !== 'bantru' && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: '#f1f8e9', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Thông tin tóm tắt
          </Typography>
          <Stack direction="row" spacing={4} sx={{ pl: 2 }}>
            <Typography variant="body2">
              Sĩ số: <strong>{students.length}</strong>
            </Typography>
            <Typography variant="body2">
              Vắng: Phép: <strong>{students.filter(s => !s.diemDanh && s.vangCoPhep === 'có phép').length}</strong>
              &nbsp;&nbsp;
              Không: <strong>{students.filter(s => !s.diemDanh && s.vangCoPhep === 'không phép').length}</strong>
            </Typography>
          </Stack>

          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
            Danh sách học sinh vắng:
          </Typography>
          <Box sx={{ pl: 2 }}>
            {students.filter(s => !s.diemDanh).length === 0 ? (
              <Typography variant="body2">Không có học sinh vắng.</Typography>
            ) : (
              <Box component="ul" sx={{ pl: 2, mt: 0.5 }}>
                {students.filter(s => !s.diemDanh).map((s, i) => (
                  <li key={s.id}>{s.hoVaTen || 'Không tên'} ({s.vangCoPhep === 'có phép' ? 'P' : 'K'})</li>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 1, mt: 2 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    px: { xs: 1, sm: 2 },
                    width: { xs: 30, sm: 'auto' },
                  }}
                >
                  STT
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: '#1976d2',
                    color: 'white',
                  }}
                >
                  HỌ VÀ TÊN
                </TableCell>

                {viewMode === 'diemdanh' && (
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      px: { xs: 1, sm: 2 },
                      width: { xs: 55, sm: 'auto' },
                    }}
                  >
                    ĐIỂM{"\n"}DANH
                  </TableCell>
                )}

                {viewMode === 'bantru' && (
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      px: { xs: 0.5, sm: 2 },
                      width: { xs: 55, sm: 'auto' },
                      whiteSpace: { xs: 'pre-wrap', sm: 'nowrap' },
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                      <Typography sx={{ color: 'white', fontWeight: 'bold' }}>BÁN{"\n"}TRÚ</Typography>
                      <Checkbox
                        checked={checkAllBanTru}
                        onChange={async (e) => {
                          const newVal = e.target.checked;
                          setCheckAllBanTru(newVal);

                          // 🔄 Cập nhật danh sách học sinh
                          const updated = students.map((s) =>
                            s.showRegisterCheckbox ? { ...s, registered: newVal } : s
                          );
                          setStudents(updated);

                          // 🔍 Lọc những học sinh có registered thay đổi so với original
                          const changed = updated.filter(
                            (s) => s.showRegisterCheckbox && s.registered !== originalRegistered[s.id]
                          );

                          // 💾 Gọi lưu nếu có thay đổi
                          if (changed.length > 0) {
                            try {
                              await saveRegistrationChanges(changed, namHoc);

                              // Cập nhật lại originalRegistered
                              const updatedMap = { ...originalRegistered };
                              changed.forEach((s) => {
                                updatedMap[s.id] = s.registered;
                              });
                              setOriginalRegistered(updatedMap);
                              setLastSaved(new Date());
                            } catch (err) {
                              console.error('Lỗi khi lưu đăng ký bán trú:', err.message);
                            }
                          }
                        }}
                        size="small"
                        color="default"
                        sx={{
                          p: 0,
                          color: 'white',
                          '& .MuiSvgIcon-root': { fontSize: 18 },
                        }}
                      />
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>

              <TableBody>
                {students.map((s, index) => (
                  <React.Fragment key={s.id}>
                    <TableRow>
                      <TableCell
                        align="center"
                        sx={{ px: { xs: 1, sm: 2 }, width: { xs: 30, sm: 'auto' } }}
                      >
                        {index + 1}
                      </TableCell>

                      <TableCell
                        align="left"
                        sx={{
                          px: { xs: 1, sm: 2 },
                          width: { xs: 200, sm: 'auto' },
                          maxWidth: { xs: 200, sm: 'none' },
                        }}
                      >
                        <Typography
                          sx={{
                            cursor: !s.diemDanh ? 'pointer' : 'default',
                            color: '#000000',
                            '&:hover': !s.diemDanh ? { textDecoration: 'underline' } : undefined,
                            whiteSpace: 'nowrap',
                            overflowX: 'auto',
                            WebkitOverflowScrolling: 'touch',
                          }}
                          onClick={() => {
                            if (!s.diemDanh) {
                              setExpandedRowId(prev => (prev === s.id ? null : s.id));
                            }
                          }}
                        >
                          {s.hoVaTen || 'Không có tên'}
                        </Typography>
                      </TableCell>

                      {viewMode === 'diemdanh' && (
                        <TableCell
                          align="center"
                          sx={{ px: { xs: 1, sm: 2 }, width: { xs: 40, sm: 'auto' } }}
                        >
                          <Checkbox
                            checked={s.diemDanh}
                            onChange={() => toggleDiemDanh(index)}
                            size="small"
                            color="primary"
                          />
                        </TableCell>
                      )}

                      {viewMode === 'bantru' && (
                        <TableCell
                          align="center"
                          sx={{ px: { xs: 1, sm: 2 }, width: { xs: 50, sm: 'auto' } }}
                        >
                          {s.showRegisterCheckbox && (
                            <Checkbox
                              checked={s.registered ?? false}
                              onChange={() => toggleRegister(index)}
                              size="small"
                              color="primary"
                            />
                          )}
                        </TableCell>
                      )}
                    </TableRow>

                    {!s.diemDanh && expandedRowId === s.id && (
                      <TableRow>
                        <TableCell
                          colSpan={viewMode === 'bantru' ? 4 : 3}
                          sx={{ backgroundColor: '#f9f9f9' }}
                        >
                          <Stack spacing={1} sx={{ pl: 2, py: 1 }}>
                            <Stack direction="row" spacing={4}>
                              <FormControlLabel
                                control={
                                  <Radio
                                    checked={s.vangCoPhep === 'có phép'}
                                    onChange={() => handleVangCoPhepChange(index, 'có phép')}
                                    value="có phép"
                                    color="primary"
                                    size="small"
                                  />
                                }
                                label="Có phép"
                              />
                              <FormControlLabel
                                control={
                                  <Radio
                                    checked={s.vangCoPhep === 'không phép'}
                                    onChange={() => handleVangCoPhepChange(index, 'không phép')}
                                    value="không phép"
                                    color="primary"
                                    size="small"
                                  />
                                }
                                label="Không phép"
                              />
                            </Stack>

                            <Stack direction="row" spacing={2} alignItems="center">
                              <TextField
                                label="Lý do"
                                value={s.lyDo || ''}
                                onChange={(e) => handleLyDoChange(index, e.target.value)}
                                size="small"
                                sx={{ flex: 1 }}
                              />
                              <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => handleSendZalo(s)}
                                size="small"
                                sx={{
                                  whiteSpace: 'nowrap',
                                  px: 2.5,
                                  height: '40px',
                                  backgroundColor: '#e3f2fd',
                                  '&:hover': {
                                    backgroundColor: '#bbdefb',
                                  },
                                }}
                              >
                                Xuất Zalo
                              </Button>
                            </Stack>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

        )}

        {/* Thông báo lưu */}
        <Box sx={{ mt: 2 }}>
          {isSaving && (
            <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
              Đang lưu...
            </Alert>
          )}
          {lastSaved && !isSaving && showSavedAlert && (
            <Alert severity="success" sx={{ fontSize: '0.875rem' }}>
              Đã lưu lúc {lastSaved.toLocaleTimeString('vi-VN')}
            </Alert>
          )}
        </Box>
      </Card>
    </Box>
  );
}