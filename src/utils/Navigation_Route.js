export const Navigation_Route = (path, navigate, setActiveNavPath) => {
  const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
  const loginRole = localStorage.getItem('loginRole');
  const match = path.match(/^\/lop([1-5])$/); // kiểm tra nếu là route lớp
  const isClassAccount = /^\d+\.\d+$/.test(loginRole); // ví dụ: "2.3"
  const isManagerAccount = ['admin', 'yte', 'bgh', 'ketoan'].includes(loginRole);

  // 👉 Trường hợp: đường dẫn tới lớp cụ thể
  if (match) {
    const targetClass = match[1]; // "1", "2", ...

    if (!isLoggedIn) {
      navigate('/login', {
        state: {
          redirectTo: `/lop${targetClass}`,
          classId: `lop${targetClass}`,
        },
      });
      return;
    }

    if (isClassAccount) {
      const userClass = loginRole.split('.')[0];
      if (userClass === targetClass) {
        setActiveNavPath?.(path);
        navigate(path);
      } else {
        navigate('/login', {
          state: {
            redirectTo: `/lop${targetClass}`,
            classId: `lop${targetClass}`,
            switchingClass: true,
          },
        });
      }
      return;
    }

    // ✅ Nếu là tài khoản quản lý -> cho phép truy cập bất kỳ lớp nào
    if (isManagerAccount) {
      setActiveNavPath?.(path);
      navigate(path);
      return;
    }

    // ❓ Nếu là kiểu tài khoản khác không xác định
    navigate('/login', {
      state: {
        redirectTo: `/lop${targetClass}`,
        classId: `lop${targetClass}`,
      },
    });
    return;
  }

  // 👉 Trường hợp: truy cập trang quản lý
  if (path === '/quanly') {
    if (!isLoggedIn) {
      navigate('/login', { state: { redirectTo: path } });
      return;
    }

    if (isClassAccount) {
      alert('⚠️ Tài khoản lớp không được truy cập chức năng Quản lý. Hãy đăng xuất trước!');
      return;
    }

    setActiveNavPath?.(path);
    navigate(path);
    return;
  }

  // 👉 Trường hợp khác: Trang công khai hoặc có quyền
  if (isLoggedIn) {
    setActiveNavPath?.(path);
    navigate(path);
  } else {
    navigate('/login', { state: { redirectTo: path } });
  }
};