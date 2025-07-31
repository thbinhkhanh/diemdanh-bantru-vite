import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Box, Typography, Menu, MenuItem, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { getDoc, setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

import Home from './pages/Home';
import Lop1 from './pages/Lop1';
import Lop2 from './pages/Lop2';
import Lop3 from './pages/Lop3';
import Lop4 from './pages/Lop4';
import Lop5 from './pages/Lop5';
import QuanLy from './pages/QuanLy';
import About from './pages/About';
import Footer from './pages/Footer';
import HuongDan from './pages/HuongDan';
import Login from './Login';
import NhatKyDiemDanhGV from './NhatKyDiemDanhGV';

import { ClassDataProvider } from './context/ClassDataContext';
import { NhatKyProvider } from './context/NhatKyContext';
import { ClassListProvider } from './context/ClassListContext';

const Admin = lazy(() => import('./Admin'));

// 🔒 Route bảo vệ
//function PrivateRoute({ children }) {
//  const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
//  const location = useLocation();
//  return isLoggedIn ? children : <Navigate to="/login" replace state={{ redirectTo: location.pathname }} />;
//}

function PrivateRoute({ children }) {
  const location = useLocation();
  const loginRole = localStorage.getItem("loginRole"); // "2.3", "admin", etc.
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";

  const match = location.pathname.match(/^\/lop([1-5])$/); // eg: "/lop3" → ["lop3", "3"]

  // Nếu chưa đăng nhập → chuyển đến login
  if (!isLoggedIn || !loginRole) {
    return <Navigate to="/login" replace state={{ redirectTo: location.pathname }} />;
  }

  // Nếu đăng nhập bằng tài khoản lớp (ví dụ: "2.3")
  if (/^\d+\.\d+$/.test(loginRole)) {
    const classLoggedIn = loginRole.split(".")[0]; // "2"
    
    if (match) {
      const classTryingToAccess = match[1]; // "3"
      if (classLoggedIn !== classTryingToAccess) {
        return (
          <Navigate
            to="/login"
            replace
            state={{
              redirectTo: location.pathname,
              classId: `lop${classTryingToAccess}`,
            }}
          />
        );
      }
    } else if (location.pathname === "/quanly") {
      // Tài khoản lớp không được vào Quản lý
      alert("⚠️ Hãy đăng xuất trước khi truy cập chức năng Quản lý.");
      return <Navigate to="/home" replace />;
    }
  }

  return children;
}

// 📌 Navigation
function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [showLogoPopup, setShowLogoPopup] = useState(false);
  const [activeNavPath, setActiveNavPath] = useState('/home');

  useEffect(() => {
    const mainPath = '/' + location.pathname.split('/')[1];
    setActiveNavPath(mainPath);
  }, [location.pathname]);

  useEffect(() => {
    const fetchYear = async () => {
      const ref = doc(db, 'YEAR', 'NAMHOC');
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setSelectedYear(snap.data().value || '2024-2025');
      } else {
        await setDoc(ref, { value: '2024-2025' });
        setSelectedYear('2024-2025');
      }
    };
    fetchYear();
  }, []);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleProtectedNavigate = (path) => {
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    const loginRole = localStorage.getItem("loginRole");
    const match = path.match(/^\/lop([1-5])$/);

    if (match) {
      const lopDuocChon = match[1];
      const currentKhoi = loginRole?.split(".")[0];

      if (isLoggedIn && currentKhoi === lopDuocChon) {
        setActiveNavPath(path);
        navigate(path);
      } else {
        navigate("/login", {
          state: {
            redirectTo: path,
            classId: path.slice(1),
          },
        });
      }
      return;
    }

    if (path === "/quanly") {
      if (!isLoggedIn) {
        navigate("/login", { state: { redirectTo: path } });
        return;
      }

      const isClassAccount = /^\d+\.\d+$/.test(loginRole);
      if (isClassAccount) {
        alert("⚠️ Hãy đăng xuất trước khi truy cập chức năng Quản lý.");
        return;
      }

      setActiveNavPath(path);
      navigate(path);
      return;
    }

    if (isLoggedIn) {
      setActiveNavPath(path);
      navigate(path);
    } else {
      navigate("/login", { state: { redirectTo: path } });
    }
  };

  const handleLogout = () => {
    ['loggedIn', 'account', 'loginRole', 'redirectTarget'].forEach(k => localStorage.removeItem(k));
    navigate('/home');
  };

  const publicNavItems = [
    { path: '/home', name: 'Trang chủ', icon: <HomeIcon /> },
  ];

  const protectedNavItems = [
    { path: '/lop1', name: 'Khối 1' },
    { path: '/lop2', name: 'Khối 2' },
    { path: '/lop3', name: 'Khối 3' },
    { path: '/lop4', name: 'Khối 4' },
    { path: '/lop5', name: 'Khối 5' },
    { path: '/quanly', name: 'Quản lý' },
  ];

  return (
    <>
      {/* 👇 Popup Logo to fullscreen */}
      {showLogoPopup && (
        <div
          onClick={() => setShowLogoPopup(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            cursor: 'zoom-out',
          }}
        >
          <img
            src="/Logo.png"
            alt="Logo lớn"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: '8px',
              boxShadow: '0 0 20px rgba(255,255,255,0.8)',
            }}
          />
        </div>
      )}

      {/* 👇 Navigation bar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '4px 8px',
        background: '#1976d2',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflowX: 'auto'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          WebkitOverflowScrolling: 'touch'
        }}>
          <img
            src="/Logo.png"
            alt="Logo"
            style={{ height: '35px', marginRight: '16px', cursor: 'pointer' }}
            onClick={() => setShowLogoPopup(true)}
          />

          {publicNavItems.map((item, i) => (
            <Button
              key={i}
              onClick={() => { setActiveNavPath(item.path); navigate(item.path); }}
              style={{ ...navStyle(item.path, activeNavPath), minWidth: 'auto', padding: '6px' }}
            >
              {item.icon}
            </Button>
          ))}

          {protectedNavItems.map((item, i) => (
            <Button key={i} onClick={() => handleProtectedNavigate(item.path)} style={navStyle(item.path, activeNavPath)}>
              {item.name}
            </Button>
          ))}

          <Button
            onClick={(e) => {
              handleMenuOpen(e);
              if (location.pathname === '/login') {
                navigate('/home');
              }
            }}
            style={navStyleGroup(['/gioithieu', '/huongdan', '/chucnang'], location.pathname)}
          >
            Trợ giúp
          </Button>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleMenuClose}>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/huongdan'); }}>Hướng dẫn sử dụng</MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/chucnang'); }}>Giới thiệu chức năng</MenuItem>
          </Menu>

          {localStorage.getItem('loggedIn') === 'true' && (
            <Button onClick={handleLogout} style={navStyle('/login', location.pathname)}>Đăng xuất</Button>
          )}
        </div>

        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>Năm học:</Typography>
          <Box sx={{
            backgroundColor: 'white',
            minWidth: 100,
            borderRadius: 1,
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography sx={{
              color: '#1976d2',
              fontWeight: 'bold',
              fontSize: '14px',
              padding: '6px 8px'
            }}>
              {selectedYear}
            </Typography>
          </Box>
        </Box>
      </nav>
    </>
  );
}

const navStyle = (path, currentPath) => {
  const isExactMatch = currentPath === path;
  return {
    color: 'white',
    padding: '6px 12px',
    backgroundColor: isExactMatch ? '#1565c0' : 'transparent',
    borderBottom: isExactMatch ? '2px solid white' : 'none',
    borderRadius: '4px',
    textTransform: 'none',
    fontWeight: isExactMatch ? 'bold' : 'normal',
  };
};

const navStyleGroup = (paths, currentPath) => ({
  color: 'white',
  padding: '6px 12px',
  backgroundColor: paths.some(p => currentPath.includes(p)) ? '#1565c0' : 'transparent',
  borderBottom: paths.some(p => currentPath.includes(p)) ? '3px solid white' : 'none',
  borderRadius: '4px',
  textTransform: 'none',
});


function App() {
  const [selectedFirestore, setSelectedFirestore] = useState('firestore1');

  useEffect(() => {
    const saved = localStorage.getItem('selectedFirestore') || 'firestore1';
    setSelectedFirestore(saved);
  }, []);

  const handleFirestoreSelect = (value) => {
    setSelectedFirestore(value);
    localStorage.setItem('selectedFirestore', value);
    window.location.reload();
  };

  return (
    <ClassListProvider>
      <ClassDataProvider>
        <NhatKyProvider>
          <Router>
            <div style={{ padding: 10, background: '#f0f0f0', textAlign: 'center' }}>
              <strong>Chọn Firestore:</strong>
              <label style={{ marginLeft: 10 }}>
                <input type="radio" value="firestore1" checked={selectedFirestore === 'firestore1'} onChange={(e) => handleFirestoreSelect(e.target.value)} />
                Firestore 1
              </label>
              <label style={{ marginLeft: 20 }}>
                <input type="radio" value="firestore2" checked={selectedFirestore === 'firestore2'} onChange={(e) => handleFirestoreSelect(e.target.value)} />
                Firestore 2
              </label>
            </div>

            <Navigation />

            <div style={{ paddingTop: '0px' }}>
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/lop1" element={<PrivateRoute><Lop1 /></PrivateRoute>} />
                <Route path="/lop2" element={<PrivateRoute><Lop2 /></PrivateRoute>} />
                <Route path="/lop3" element={<PrivateRoute><Lop3 /></PrivateRoute>} />
                <Route path="/lop4" element={<PrivateRoute><Lop4 /></PrivateRoute>} />
                <Route path="/lop5" element={<PrivateRoute><Lop5 /></PrivateRoute>} />
                <Route path="/quanly" element={<PrivateRoute><QuanLy /></PrivateRoute>} />
                <Route path="/nhatky" element={<PrivateRoute><NhatKyDiemDanhGV /></PrivateRoute>} />
                <Route path="/admin" element={
                  <Suspense fallback={<div>Đang tải trang quản trị...</div>}>
                    <PrivateRoute><Admin /></PrivateRoute>
                  </Suspense>
                } />
                <Route path="/gioithieu" element={<About />} />
                <Route path="/huongdan" element={<HuongDan />} />
                <Route path="/chucnang" element={<About />} />
              </Routes>
              <Footer />
            </div>
          </Router>
        </NhatKyProvider>
      </ClassDataProvider>
    </ClassListProvider>
  );
}

export default App;