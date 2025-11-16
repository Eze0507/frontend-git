import React, { useState } from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/Header";

const Layout = ({ children }) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [menuItems, setMenuItems] = useState([]);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleMenuItemsReady = (items) => {
    setMenuItems(items);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      <Sidebar isVisible={sidebarVisible} onToggle={toggleSidebar} onMenuItemsReady={handleMenuItemsReady} />
      <div className={`flex-1 flex flex-col transition-all duration-[400ms] ${sidebarVisible ? 'ml-64' : 'ml-0'}`}>
        <Header sidebarVisible={sidebarVisible} onToggleSidebar={toggleSidebar} menuItems={menuItems} />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6 main-content-scrollbar mt-16">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
