import React, { useState } from "react";
import Sidebar from "../components/sidebar";

const Layout = ({ children }) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      <Sidebar isVisible={sidebarVisible} onToggle={toggleSidebar} />
      <main className={`overflow-y-auto bg-gray-100 p-6 main-content-scrollbar transition-all duration-[400ms] cubic-bezier(0.4, 0, 0.2, 1) ${
        sidebarVisible ? 'ml-64' : 'ml-0'
      } flex-1`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
