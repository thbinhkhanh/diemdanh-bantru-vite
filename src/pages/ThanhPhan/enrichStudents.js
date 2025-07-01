export const enrichStudents = (rawData, today, className, useNewVersion) => {
  return rawData
    .map((d, idx) => {
      const diemDanhValue = d?.Diemdanh?.[today] || '';
      const lyDoVang = d?.LyDoVang?.[today] || '';
      const isPresent = d?.vang !== 'x';

      let vangCoPhep = '';
      if (diemDanhValue === 'P') vangCoPhep = 'có phép';
      else if (diemDanhValue === 'K') vangCoPhep = 'không phép';

      return {
        id: d.id,
        ...d,
        stt: idx + 1,
        registered: d?.huyDangKy === 'T',
        showRegisterCheckbox: d?.huyDangKy !== 'x',
        diemDanh: isPresent,
        vangCoPhep,
        lyDo: isPresent ? '' : lyDoVang,
        lop: d?.lop || '', // Đảm bảo có trường 'lop' để lọc sau
      };
    })
    .filter(s => useNewVersion || s.lop === className);
};