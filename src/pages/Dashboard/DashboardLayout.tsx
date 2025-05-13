
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Truck, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden flex items-center p-4 bg-tabata-800 text-white">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="mr-2 text-white hover:bg-tabata-700"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
        <span className="font-semibold">TabShipping</span>
      </div>

      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 fixed md:relative z-10 bg-tabata-800 text-white w-64 h-[calc(100vh-4rem)] md:h-screen flex flex-col`}
      >
        {/* Logo */}
        <div className="hidden md:flex p-4 border-b border-tabata-700">
          <div className="flex flex-col items-center w-full">
            <img 
              src="https://tobematransportadora.com.br/wp-content/uploads/2020/02/logo-do-rodape.png" 
              alt="Logo TabShipping" 
              className="h-12 w-auto mb-2"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/200x100/tabata/white?text=TabShipping";
              }}
            />
            <h1 className="text-xl font-bold">TabShipping</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <NavLink 
            to="/dashboard" 
            end
            className={({isActive}) => `
              flex items-center p-2 rounded-md transition-colors
              ${isActive ? 'bg-tabata-700 text-white' : 'text-white/80 hover:bg-tabata-700 hover:text-white'}
            `}
          >
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </NavLink>

          <NavLink 
            to="/dashboard/motoristas"
            className={({isActive}) => `
              flex items-center p-2 rounded-md transition-colors
              ${isActive ? 'bg-tabata-700 text-white' : 'text-white/80 hover:bg-tabata-700 hover:text-white'}
            `}
          >
            <Truck className="mr-3 h-5 w-5" />
            Motoristas
          </NavLink>

          <NavLink 
            to="/dashboard/cargas"
            className={({isActive}) => `
              flex items-center p-2 rounded-md transition-colors
              ${isActive ? 'bg-tabata-700 text-white' : 'text-white/80 hover:bg-tabata-700 hover:text-white'}
            `}
          >
            <Package className="mr-3 h-5 w-5" />
            Cargas
          </NavLink>

          {user?.role === 'admin' && (
            <NavLink 
              to="/dashboard/configuracoes"
              className={({isActive}) => `
                flex items-center p-2 rounded-md transition-colors
                ${isActive ? 'bg-tabata-700 text-white' : 'text-white/80 hover:bg-tabata-700 hover:text-white'}
              `}
            >
              <Settings className="mr-3 h-5 w-5" />
              Configurações
            </NavLink>
          )}
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t border-tabata-700">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-tabata-600 flex items-center justify-center mr-3">
              {user?.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-white/60 capitalize">{user?.role}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <ThemeToggle />
            <Button 
              variant="outline" 
              className="w-3/4 text-white border-tabata-600 hover:bg-tabata-700 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto dark:bg-gray-900 dark:text-gray-100">
        {/* Mobile overlay when sidebar is open */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-[5] md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        <div className="container mx-auto py-6 px-4 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
