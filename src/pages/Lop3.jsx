import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Stack, MenuItem, Select,
  FormControl, InputLabel, Checkbox, Card, LinearProgress,
  Alert, TextField, Radio, FormControlLabel, Button
} from '@mui/material';


import {
  getDocs, getDoc, collection, doc, updateDoc,
  query, where
} from 'firebase/firestore';
import { db } from '../firebase';
import { useLocation } from 'react-router-dom';
import { MySort } from '../utils/MySort';
import { deleteField } from 'firebase/firestore';
import { Tooltip } from '@mui/material';


export default function Lop3() {
  const location = useLocation();
  const useNewVersion = location.state?.useNewVersion ?? false;

  const [filteredStudents, setFilteredStudents] = useState([]);
  const [originalChecked, setOriginalChecked] = useState({});
  const [classList, setClassList] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  const [currentNamHoc, setCurrentNamHoc] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);

  const saveTimeout = useRef(null);
  const intervalRef = useRef(null);

  const [viewMode, setViewMode] = useState('diemDanh'); // 'diemDanh' | 'banTru'
  const [showBanTruColumn, setShowBanTruColumn] = useState(true);


  const fetchNamHoc = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'YEAR', 'NAMHOC'));
      if (!docSnap.exists()) throw new Error('Không tìm thấy YEAR/NAMHOC');
      return docSnap.data().value || 'UNKNOWN';
    } catch (err) {
      console.error('Lỗi khi tải năm học:', err.message);
      return 'UNKNOWN';
    }
  };

  const fetchStudents = async (className, namHoc) => {
    setIsLoading(true);
    try {
      const banTruCollection = `BANTRU_${namHoc}`;
      let snapshot;

      if (useNewVersion) {
        const q = query(collection(db, banTruCollection), where('lop', '==', className));
        snapshot = await getDocs(q);
      } else {
        snapshot = await getDocs(collection(db, banTruCollection));
      }

      const today = new Date().toISOString().split('T')[0];

      const data = snapshot.docs.map((doc, idx) => {
        const d = doc.data();
        const diemDanhValue = d.Diemdanh?.[today];

        const lyDoVang = d?.LyDoVang?.[today] || ''; // lấy lý do vắng hôm nay nếu có

        let diemDanh = d.vang !== 'x'; // true nếu đi học
        let vangCoPhep = '';
        if (diemDanhValue === 'P') {
          vangCoPhep = 'có phép';
        } else if (diemDanhValue === 'K') {
          vangCoPhep = 'không phép';
        }

        return {
          id: doc.id,
          ...d,
          stt: idx + 1,
          registered: d['huyDangKy'] === 'T',
          diemDanh,
          vangCoPhep,
          lyDo: diemDanh ? '' : lyDoVang, // gán lý do nếu vắng
          showRegisterCheckbox: d['huyDangKy'] !== 'x'
        };

      }).filter(student => useNewVersion || student.lop === className);

      setFilteredStudents(MySort(data));
      setExpandedRowId(null);  // Ẩn khung mở rộng khi tải mới

      const checkedMap = {};
      data.forEach(s => (checkedMap[s.id] = s.registered));
      setOriginalChecked(checkedMap);
    } catch (err) {
      console.error('Lỗi khi tải học sinh:', err.message);
      setFilteredStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClassList = async (namHoc) => {
    try {
      const docRef = doc(db, `DANHSACH_${namHoc}`, 'K3');
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;

      const data = docSnap.data();
      const classes = data.list || [];
      setClassList(classes);

      if (classes.length > 0) {
        const firstClass = classes[0];
        setSelectedClass(firstClass);
        await fetchStudents(firstClass, namHoc);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách lớp:', error.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      const namHoc = await fetchNamHoc();
      setCurrentNamHoc(namHoc);
      await fetchClassList(namHoc);
    };
    init();
  }, []);

  const saveData = async () => {
  if (isSaving || !currentNamHoc) return;

  // Lọc học sinh có trạng thái đăng ký thay đổi
  const changedRegistration = filteredStudents.filter(
    s => s.registered !== originalChecked[s.id]
  );

  const today = new Date().toISOString().split('T')[0];
  const banTruCollection = `BANTRU_${currentNamHoc}`;

  // Nếu không có học sinh thay đổi đăng ký và danh sách trống thì thôi
  if (changedRegistration.length === 0 && filteredStudents.length === 0) return;

  setIsSaving(true);
  setSaveStatus(null);

  try {
    // Cập nhật trạng thái đăng ký
    const updates = changedRegistration.map(s =>
      updateDoc(doc(db, banTruCollection, s.id), {
        huyDangKy: s.registered ? 'T' : '',
      }).catch(err => {
        console.warn(`Không thể cập nhật học sinh ${s.id}:`, err.message);
        setSaveStatus('error');
      })
    );

    // Cập nhật điểm danh chỉ cho học sinh vắng (diemDanh === false)
    const diemDanhWrites = filteredStudents
      .filter(s => !s.diemDanh)  // chỉ học sinh vắng mới lưu điểm danh
      .map(s => {
        let diemDanhValue = '';
        if (s.vangCoPhep === 'có phép') diemDanhValue = 'P';
        else if (s.vangCoPhep === 'không phép') diemDanhValue = 'K';

        const update = {};
        update[`Diemdanh.${today}`] = diemDanhValue;
        update[`LyDoVang.${today}`] = s.lyDo || '';

        return updateDoc(doc(db, banTruCollection, s.id), update).catch(err => {
          console.warn(`Không thể ghi điểm danh học sinh ${s.id}:`, err.message);
          setSaveStatus('error');
        });
      });

    await Promise.all([...updates, ...diemDanhWrites]);

    // Cập nhật trạng thái đăng ký trong bộ nhớ
    const updatedChecked = { ...originalChecked };
    changedRegistration.forEach(s => (updatedChecked[s.id] = s.registered));
    setOriginalChecked(updatedChecked);
    setLastSaved(new Date());
    setSaveStatus('success');
  } catch (err) {
    console.error('Lỗi khi lưu dữ liệu:', err.message);
    setSaveStatus('error');
  } finally {
    setIsSaving(false);
  }
};

  const handleClassChange = async (event) => {
    await saveData();
    const selected = event.target.value;
    setSelectedClass(selected);
    await fetchStudents(selected, currentNamHoc);
  };

  const toggleRegister = (index) => {
    const updated = [...filteredStudents];
    updated[index].registered = !updated[index].registered;
    setFilteredStudents(updated);
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(saveData, 5000);
  };

 
  const saveSingleStudent = async (student) => {
    if (!currentNamHoc) return;

    const today = new Date().toISOString().split('T')[0];
    const banTruCollection = `BANTRU_${currentNamHoc}`;
    const docRef = doc(db, banTruCollection, student.id);

    try {
      if (!student.diemDanh) {
        const diemDanhValue =
          student.vangCoPhep === 'có phép' ? 'P' :
          student.vangCoPhep === 'không phép' ? 'K' : '';

        // Ghi lyDo (field gốc) trước để đảm bảo không bị mất
        await updateDoc(docRef, {
          lyDo: student.lyDo || ''
        });

        // Ghi tiếp LyDoVang và Diemdanh
        await updateDoc(docRef, {
          [`Diemdanh.${today}`]: diemDanhValue,
          [`LyDoVang.${today}`]: student.lyDo || '',
          vang: 'x'
        });
      } else {
        // Xóa cả lyDo (field gốc) và LyDoVang trong ngày
        await updateDoc(docRef, {
          [`Diemdanh.${today}`]: deleteField(),
          [`LyDoVang.${today}`]: deleteField(),
          lyDo: deleteField(),
          vang: ''
        });
      }
    } catch (error) {
      console.error("Lỗi khi lưu điểm danh:", error);
    }
  };

  // ⬇️ Thêm vào ngay đây
  const handleRowExpandToggle = (id) => {
    setExpandedRowId(prevId => (prevId === id ? null : id));
  };

  const toggleDiemDanh = (index) => {
    const updated = [...filteredStudents];
    updated[index].diemDanh = !updated[index].diemDanh;

    if (updated[index].diemDanh) {
      updated[index].vangCoPhep = '';
      updated[index].lyDo = '';
      setExpandedRowId(null);
    } else {
      updated[index].registered = false;
      setExpandedRowId(updated[index].id);
    }

    setFilteredStudents(updated);

    // Lưu điểm danh cho học sinh này thôi
    saveSingleStudent(updated[index]);
  };

  const handleVangCoPhepChange = (index, value) => {
    const updated = [...filteredStudents];
    updated[index].vangCoPhep = value;
    setFilteredStudents(updated);

    // Đừng lưu ngay, hãy chờ vài giây nếu không có hành động nhập lý do
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveSingleStudent(updated[index]);
    }, 1000); // chờ 5 giây
  };

  const handleSendZalo = (student) => {
  const name = student?.hoVaTen || '[Không rõ tên]';
  const phep = student?.vangCoPhep || '[không rõ phép]';
  const lyDo = student?.lyDo || '[Không có lý do]';

  const message = `Học sinh: ${name}\nVắng: ${phep}\nLý do vắng: ${lyDo}`;

  navigator.clipboard.writeText(message).then(() => {
    alert('Đã sao chép nội dung.\nBạn hãy mở Zalo và dán vào khung chat.');
  });
};

  const handleLyDoChange = async (index, value) => {
    const updated = [...filteredStudents];
    updated[index].lyDo = value; // Ghi nội dung lý do vào state

    setFilteredStudents(updated);

    const student = updated[index];
    if (!student || !currentNamHoc) return;

    const today = new Date().toISOString().split('T')[0];
    const banTruCollection = `BANTRU_${currentNamHoc}`;
    const docRef = doc(db, banTruCollection, student.id);

    try {
      await updateDoc(docRef, {
        lyDo: value,
        [`LyDoVang.${today}`]: value,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật lý do:", error);
    }

    // Optional: nếu vẫn muốn debounce một thao tác lớn khác
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(saveData, 1000);
  };



  useEffect(() => {
    intervalRef.current = setInterval(saveData, 120000);
    return () => clearInterval(intervalRef.current);
  }, [filteredStudents, originalChecked, currentNamHoc]);

  useEffect(() => {
    const beforeUnload = (e) => {
      if (filteredStudents.some(s => s.registered !== originalChecked[s.id])) {
        saveData();
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [filteredStudents, originalChecked]);

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #e3f2fd, #bbdefb)', py: 6, px: 2, mt: 6, display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 450, width: '100%', borderRadius: 4, boxShadow: '0 8px 30px rgba(0,0,0,0.15)', backgroundColor: 'white' }} elevation={10}>
        <Typography variant="h5" align="center" gutterBottom fontWeight="bold" color="primary" sx={{ mb: 4, borderBottom: '3px solid #1976d2', pb: 1 }}>
          DANH SÁCH HỌC SINH
        </Typography>

        <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Lớp</InputLabel>
            <Select value={selectedClass} label="Lớp" onChange={handleClassChange}>
              {classList.map((cls, idx) => (
                <MenuItem key={idx} value={cls}>{cls}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" justifyContent="center" spacing={2} sx={{ mb: 2 }}>
          <FormControlLabel
            value="diemDanh"
            control={
              <Radio
                checked={viewMode === 'diemDanh'}
                onChange={() => {
                  setViewMode('diemDanh');
                  setExpandedRowId(null); // ✅ Thêm vào đây
                }}
              />
            }
            label="Điểm danh"
          />
          <FormControlLabel
            value="banTru"
            control={
              <Radio
                checked={viewMode === 'banTru'}
                onChange={() => {
                  setViewMode('banTru');
                  setExpandedRowId(null); // ✅ Thêm vào đây
                }}
              />
            }
            label="Bán trú"
          />
        </Stack>



        {isLoading ? (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
            <Box sx={{ width: '50%' }}><LinearProgress /></Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Đang tải dữ liệu học sinh...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Tóm tắt học sinh */}
            {viewMode !== 'banTru' && (
              <Box sx={{ mb: 2, p: 2, backgroundColor: '#f1f8e9', borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Thông tin tóm tắt
                </Typography>
                <Stack direction="row" spacing={4} sx={{ pl: 2 }}>
                  <Typography variant="body2">
                    Sĩ số: <strong>{filteredStudents.length}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Vắng: Phép: <strong>{filteredStudents.filter(s => !s.diemDanh && s.vangCoPhep === 'có phép').length}</strong>
                    <span style={{ display: 'inline-block', width: '32px' }}></span>
                    Không: <strong>{filteredStudents.filter(s => !s.diemDanh && s.vangCoPhep === 'không phép').length}</strong>
                  </Typography>
                </Stack>

                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                  Danh sách học sinh vắng:
                </Typography>
                <Box sx={{ pl: 2 }}>
                  {filteredStudents.filter(s => !s.diemDanh).length === 0 ? (
                    <Typography variant="body2">Không có học sinh vắng.</Typography>
                  ) : (
                    <Box component="ul" sx={{ pl: 2, mt: 0.5 }}>
                      {filteredStudents.filter(s => !s.diemDanh).map((s, i) => (
                        <li key={i}>{s.hoVaTen || 'Không tên'} ({s.vangCoPhep === 'có phép' ? 'P' : 'K'})</li>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            )}


            {/* Bảng học sinh */}
            <TableContainer component={Paper} sx={{ borderRadius: 2, mt: 2 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 'bold',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        //px: { xs: 0.5, sm: 2 },
                        //width: { xs: 30, sm: 'auto' },
                        px: { xs: 1, sm: 2 }, // 👈 tăng padding ngang cho màn hình nhỏ
                        width: { xs: 30, sm: 'auto' }, // 👈 tăng width nếu cần
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

                    {viewMode === 'diemDanh' && (
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 'bold',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          //px: { xs: 0.5, sm: 2 },
                         //width: { xs: 60, sm: 'auto' },
                          px: { xs: 1, sm: 2 }, // 👈 tăng padding ngang cho màn hình nhỏ
                          width: { xs: 55, sm: 'auto' }, // 👈 tăng width nếu cần
                        }}
                      >
                        ĐIỂM{"\n"}DANH
                      </TableCell>
                    )}

                    {viewMode === 'banTru' && (
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 'bold',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          //px: { xs: 0.5, sm: 2 },
                          //width: { xs: 60, sm: 'auto' },
                          px: { xs: 0.5, sm: 2 }, // 👈 tăng padding ngang cho màn hình nhỏ
                          width: { xs: 55, sm: 'auto' }, // 👈 tăng width nếu cần
                          whiteSpace: { xs: 'pre-wrap', sm: 'nowrap' },
                        }}
                      >
                        BÁN{"\n"}TRÚ
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredStudents.map((student, index) => (
                    <React.Fragment key={student.id}>
                      <TableRow>
                        <TableCell
                          align="center"
                          sx={{ px: { xs: 0.5, sm: 2 }, width: { xs: 40, sm: 'auto' } }}
                        >
                          {index + 1}
                        </TableCell>

                        <TableCell
                          align="left"
                          sx={{
                            px: { xs: 0.5, sm: 2 },
                            width: { xs: 200, sm: 'auto' },
                            maxWidth: { xs: 200, sm: 'none' },
                          }}
                        >
                          <Typography
                            sx={{
                              cursor: 'pointer',
                              color: '#000000',
                              '&:hover': student.trangThai === 'vang' ? { textDecoration: 'underline' } : undefined,
                              textDecoration: student.trangThai === 'vang' ? 'none' : 'none',
                              whiteSpace: 'nowrap',
                              overflowX: 'auto',
                              WebkitOverflowScrolling: 'touch',
                            }}
                            onClick={() => handleRowExpandToggle(student.id)}
                          >
                            {student.hoVaTen || 'Không có tên'}
                          </Typography>
                        </TableCell>

                        {viewMode === 'diemDanh' && (
                          <TableCell
                            align="center"
                            sx={{ px: { xs: 0.5, sm: 2 }, width: { xs: 40, sm: 'auto' } }}
                          >
                            <Checkbox
                              checked={student.diemDanh}
                              onChange={() => toggleDiemDanh(index)}
                              size="small"
                              color="primary"
                            />
                          </TableCell>
                        )}

                        {viewMode === 'banTru' && (
                          <TableCell
                            align="center"
                            sx={{ px: { xs: 0.5, sm: 2 }, width: { xs: 50, sm: 'auto' } }}
                          >
                            {student.showRegisterCheckbox && (
                              <Checkbox
                                checked={student.registered ?? false}
                                onChange={() => toggleRegister(index)}
                                size="small"
                                color="primary"
                              />
                            )}
                          </TableCell>
                        )}
                      </TableRow>

                      {!student.diemDanh && student.id === expandedRowId && (
                        <TableRow>
                          <TableCell
                            colSpan={viewMode === 'banTru' ? 4 : 3}
                            sx={{ backgroundColor: '#f9f9f9' }}
                          >
                            <Stack spacing={1} sx={{ pl: 2, py: 1 }}>
                              <Stack direction="row" spacing={4}>
                                <FormControlLabel
                                  control={
                                    <Radio
                                      checked={student.vangCoPhep === 'có phép'}
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
                                      checked={student.vangCoPhep === 'không phép'}
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
                                  value={student.lyDo || ''}
                                  onChange={(e) => handleLyDoChange(index, e.target.value)}
                                  size="small"
                                  sx={{ flex: 1 }}
                                />
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => handleSendZalo(student)}
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
          </>
        )}

        {isSaving && <Alert severity="info" sx={{ mt: 3 }}>Đang lưu dữ liệu...</Alert>}
        {lastSaved && !isSaving && <Alert severity="success" sx={{ mt: 3 }}>Đã lưu lúc {lastSaved.toLocaleTimeString('vi-VN')}</Alert>}
      </Card>
    </Box>
  );
}
