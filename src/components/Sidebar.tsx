
import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const menuItems = [
    { id: 'general', label: 'الإعدادات العامة', icon: '⚙️' },
    { id: 'team', label: 'إدارة الفريق', icon: '👥' },
    { id: 'appearance', label: 'إعدادات المظهر', icon: '🎨' },
    { id: 'analytics', label: 'إعدادات Google Analytics', icon: '📊' },
    { id: 'woocommerce', label: 'تكامل WooCommerce', icon: '🛒' },
    { id: 'security', label: 'إعدادات الأمان', icon: '🔒' },
    { id: 'statistics', label: 'إحصائيات الاستخدام (آخر 30 يوم)', icon: '📈' },
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            W
          </div>
          <span className="font-semibold text-gray-900">WhatsApp Widget Pro</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full text-right p-3 rounded-lg transition-colors flex items-center gap-3",
                  activeTab === item.id
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
