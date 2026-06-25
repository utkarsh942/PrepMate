import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 flex">
      {/* Mobile Sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'md:pl-64' : 'md:pl-20'
        }`}
      >
        {/* Mobile Header */}
        <header className="h-16 border-b border-white/[0.05] bg-[#0c0c14]/80 backdrop-blur-xl flex items-center px-6 justify-between md:hidden sticky top-0 z-30">
          <span className="font-bold text-white tracking-wide bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">PrepMate</span>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto md:pl-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
