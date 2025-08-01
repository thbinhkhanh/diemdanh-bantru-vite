// 📁 src/App.jsx
//import React, { useState } from 'react';
import React, { useState, Suspense } from 'react';

import {
  Routes,
  Route,
  Navigate,
  useNavigate
} from 'react-router-dom';

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
import ChangePassword from './pages/ChangePassword';
import { ClassDataProvider } from './context/ClassDataContext';
import { NhatKyProvider } from './context/NhatKyContext';
import { ClassListProvider } from './context/ClassListContext';

import Navigation from './utils/Navigation';
import PrivateRoute from './utils/PrivateRoute';
import { Navigation_Route } from './utils/Navigation_Route';
import SwitchAccount from './pages/SwitchAccount';

const Admin = React.lazy(() => import('./Admin'));

function App() {
  const navigate = useNavigate();
  const [activeNavPath, setActiveNavPath] = useState('/home');

  return (
    <ClassListProvider>
      <ClassDataProvider>
        <NhatKyProvider>
          {/* ✅ Thanh menu */}
          <Navigation />

          <div style={{ paddingTop: '44px' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/home" element={<Home handleProtectedNavigate={(path) => Navigation_Route(path, navigate, setActiveNavPath)} />} />
              <Route path="/lop1" element={<PrivateRoute><Lop1 /></PrivateRoute>} />
              <Route path="/lop2" element={<PrivateRoute><Lop2 /></PrivateRoute>} />
              <Route path="/lop3" element={<PrivateRoute><Lop3 /></PrivateRoute>} />
              <Route path="/lop4" element={<PrivateRoute><Lop4 /></PrivateRoute>} />
              <Route path="/lop5" element={<PrivateRoute><Lop5 /></PrivateRoute>} />
              <Route path="/quanly" element={<PrivateRoute><QuanLy /></PrivateRoute>} />
              <Route path="/nhatky" element={<PrivateRoute><NhatKyDiemDanhGV /></PrivateRoute>} />
              <Route path="/doimatkhau" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
              <Route path="/chon-tai-khoan" element={<SwitchAccount />} /> 
              <Route path="/gioithieu" element={<About />} />
              <Route path="/huongdan" element={<HuongDan />} />
              <Route path="/chucnang" element={<About />} />
              <Route path="/admin" element={
                <Suspense fallback={<div>Đang tải trang quản trị...</div>}>
                  <PrivateRoute><Admin /></PrivateRoute>
                </Suspense>
              } />
            </Routes>
            <Footer />
          </div>
        </NhatKyProvider>
      </ClassDataProvider>
    </ClassListProvider>
  );
}

export default App;
