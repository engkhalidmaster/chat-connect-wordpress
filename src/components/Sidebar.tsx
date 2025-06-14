
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
    { id: 'statistics', label: 'إحصائيات الاستخدام', icon: '📈' },
    { id: 'uninstall', label: 'إلغاء التثبيت', icon: '🗑️' },
  ];

  const handleTabClick = (tabId: string) => {
    console.log('Switching to tab:', tabId);
    setActiveTab(tabId);
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col min-h-screen">
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
                type="button"
                onClick={() => handleTabClick(item.id)}
                className={cn(
                  "w-full text-right p-3 rounded-lg transition-all duration-200 flex items-center gap-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
                  activeTab === item.id
                    ? "bg-green-50 text-green-700 border-2 border-green-200 font-medium shadow-sm"
                    : "text-gray-700 border-2 border-transparent hover:border-gray-100"
                )}
                aria-pressed={activeTab === item.id}
                aria-label={`انتقل إلى ${item.label}`}
              >
                <span className="text-lg" role="img" aria-hidden="true">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
                {activeTab === item.id && (
                  <div className="mr-auto w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
