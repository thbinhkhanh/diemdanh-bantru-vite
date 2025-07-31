import { Navigate, useLocation } from 'react-router-dom';

function PrivateRoute({ children }) {
  const location = useLocation();
  const loginRole = localStorage.getItem("loginRole");
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";
  const currentPath = location.pathname;

  const isClassRoute = /^\/lop([1-5])$/.test(currentPath);
  const classTryingToAccess = currentPath.match(/^\/lop([1-5])$/)?.[1]; // "1" to "5"
  const isClassAccount = /^\d+\.\d+$/.test(loginRole); // e.g. "2.3"

  if (!isLoggedIn || !loginRole) {
    return <Navigate to="/login" replace state={{ redirectTo: currentPath }} />;
  }

  if (isClassAccount) {
    const classLoggedIn = loginRole.split(".")[0];

    if (isClassRoute && classLoggedIn !== classTryingToAccess) {
      // Truy cập sai lớp
      return <Navigate to="/login" replace state={{ redirectTo: currentPath }} />;
    }

    if (currentPath === "/quanly") {
      alert("⚠️ Tài khoản lớp không thể truy cập chức năng Quản lý.");
      return <Navigate to="/home" replace />;
    }
  }

  return children;
}

export default PrivateRoute;