// src/context/AdminContext.jsx

import { createContext, useContext, useState } from "react";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [isManager, setIsManager] = useState(false);

  return (
    <AdminContext.Provider value={{ isManager, setIsManager }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
