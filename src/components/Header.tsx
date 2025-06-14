
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Save, Settings, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PluginDownloader from './PluginDownloader';

const Header = () => {
  const { toast } = useToast();

  const handleBackup = () => {
    // إنشاء نسخة احتياطية من الإعدادات
    const settings = {
      timestamp: new Date().toISOString(),
      widget_settings: JSON.parse(localStorage.getItem('wwp_settings') || '{}'),
      team_members: JSON.parse(localStorage.getItem('wwp_team_members') || '[]'),
      analytics_settings: JSON.parse(localStorage.getItem('wwp_analytics') || '{}')
    };
    
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `whatsapp-widget-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "تم إنشاء النسخة الاحتياطية",
      description: "تم تحميل ملف النسخة الاحتياطية بنجاح",
    });
  };

  const handleSaveSettings = () => {
    // حفظ جميع الإعدادات
    const currentSettings = {
      general: JSON.parse(localStorage.getItem('wwp_settings') || '{}'),
      team: JSON.parse(localStorage.getItem('wwp_team_members') || '[]'),
      analytics: JSON.parse(localStorage.getItem('wwp_analytics') || '{}'),
      saved_at: new Date().toISOString()
    };
    
    localStorage.setItem('wwp_all_settings', JSON.stringify(currentSettings));
    
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم حفظ جميع الإعدادات بنجاح",
    });
  };

  const handleShowStats = () => {
    toast({
      title: "إحصائيات الاستخدام",
      description: "استخدم قائمة 'إحصائيات الاستخدام' في الشريط الجانبي لعرض التفاصيل",
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
              W
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">WhatsApp Widget Pro</h1>
              <p className="text-sm text-gray-600">
                لوحة تحكم احترافية مع Google Analytics وتكامل WooCommerce
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleShowStats} className="gap-2">
            <BarChart3 className="h-4 w-4" />
            الإحصائيات
          </Button>
          
          <PluginDownloader />
          
          <Button variant="outline" size="sm" onClick={handleBackup} className="gap-2">
            <Download className="h-4 w-4" />
            نسخة احتياطية
          </Button>
          
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={handleSaveSettings}>
            <Save className="h-4 w-4" />
            حفظ الإعدادات
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
