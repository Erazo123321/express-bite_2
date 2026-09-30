import React from 'react';
import { Coffee, Smartphone, Monitor, ShieldCheck } from 'lucide-react';

export type ActiveTab = 'student' | 'admin' | 'architecture';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingOrdersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  pendingOrdersCount: _pendingOrdersCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-8 py-3 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Logo & Location */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Coffee className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Express<span className="text-emerald-600">Bite</span>
              </span>
              <span className="hidden sm:inline-flex text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                Campus Central
              </span>
            </div>
          </div>

          {/* Quick status on mobile */}
          <div className="flex items-center gap-1.5 md:hidden text-xs font-medium text-gray-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span>Abierto</span>
          </div>
        </div>

        {/* View Switcher Tabs (Student / Staff / Architecture) */}
        <div className="flex items-center p-1 bg-gray-100 rounded-[12px] border border-gray-200/70 shadow-inner max-w-full overflow-x-auto">
          <button
            onClick={() => onTabChange('student')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-[10px] transition-all duration-200 whitespace-nowrap ${
              activeTab === 'student'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Smartphone className={`w-4 h-4 ${activeTab === 'student' ? 'text-emerald-600' : 'text-gray-500'}`} />
            <span>Vista Estudiante <span className="hidden sm:inline font-normal text-gray-500">(Móvil)</span></span>
          </button>

          <button
            onClick={() => onTabChange('admin')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-[10px] transition-all duration-200 whitespace-nowrap ${
              activeTab === 'admin'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Monitor className={`w-4 h-4 ${activeTab === 'admin' ? 'text-emerald-600' : 'text-gray-500'}`} />
            <span>Vista Personal <span className="hidden sm:inline font-normal text-gray-500">(Escritorio)</span></span>
          </button>

          <button
            onClick={() => onTabChange('architecture')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-[10px] transition-all duration-200 whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${activeTab === 'architecture' ? 'text-emerald-600' : 'text-gray-500'}`} />
            <span>Clean & SOLID <span className="hidden sm:inline font-normal text-gray-500">(Arquitectura)</span></span>
          </button>
        </div>

        {/* Live Status indicator */}
        <div className="hidden md:flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span>Cafetería Abierta</span>
          </div>
        </div>
      </div>
    </header>
  );
};
