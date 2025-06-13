
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import GeneralSettings from './components/GeneralSettings';
import TeamManagement from './components/TeamManagement';
import AppearanceSettings from './components/AppearanceSettings';
import AnalyticsSettings from './components/AnalyticsSettings';
import UsageStatistics from './components/UsageStatistics';

// مكونات للأقسام المفقودة
const WooCommerceSettings = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4 text-right">تكامل WooCommerce</h2>
    <p className="text-gray-600 mb-6 text-right">إرسال رسائل WhatsApp تلقائية للعملاء عند تحديث الطلبات</p>
    <div className="bg-white rounded-lg border p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <input type="checkbox" id="enable_woocommerce" className="rounded" />
          <label htmlFor="enable_woocommerce" className="text-sm font-medium">تفعيل تكامل WooCommerce</label>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-right">قالب رسالة تأكيد الطلب</label>
            <textarea 
              className="w-full border rounded-md p-3 text-right" 
              rows={3}
              placeholder="شكراً لك! تم استلام طلبك رقم #{order_number} بنجاح."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-right">قالب رسالة تحديث الشحن</label>
            <textarea 
              className="w-full border rounded-md p-3 text-right" 
              rows={3}
              placeholder="طلبك رقم #{order_number} قيد التجهيز وسيتم شحنه قريباً."
            />
          </div>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          حفظ الإعدادات
        </button>
      </div>
    </div>
  </div>
);

const SecuritySettings = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4 text-right">إعدادات الأمان وحظر IP</h2>
    <p className="text-gray-600 mb-6 text-right">حماية الويدجت من الاستخدام المفرط والسبام</p>
    <div className="bg-white rounded-lg border p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <input type="checkbox" id="enable_ip_blocking" className="rounded" />
          <label htmlFor="enable_ip_blocking" className="text-sm font-medium">تفعيل نظام حظر IP</label>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-right">الحد الأقصى للنقرات في الساعة</label>
            <input 
              type="number" 
              className="w-full border rounded-md p-3 text-right" 
              defaultValue="100"
              min="1" 
              max="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-right">قائمة IP المسموحة</label>
            <textarea 
              className="w-full border rounded-md p-3 text-right" 
              rows={5}
              placeholder="192.168.1.1&#10;10.0.0.0/8"
            />
          </div>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          حفظ الإعدادات
        </button>
      </div>
    </div>
  </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('general');

  console.log('App activeTab:', activeTab); // للتأكد من تحديث الحالة

  const renderContent = () => {
    console.log('Rendering content for tab:', activeTab); // للتأكد من استدعاء المحتوى الصحيح
    
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'team':
        return <TeamManagement />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'analytics':
        return <AnalyticsSettings />;
      case 'woocommerce':
        return <WooCommerceSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'statistics':
        return <UsageStatistics />;
      default:
        console.log('Default case, showing GeneralSettings');
        return <GeneralSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="flex w-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
