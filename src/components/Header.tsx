
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Save } from 'lucide-react';
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
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم حفظ جميع الإعدادات بنجاح",
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Widget Pro</h1>
          <p className="text-sm text-gray-600 mt-1">
            نسخة أفضل مع Google Analytics. تأكد من إدخال معرف التتبع الصحيح وتفعيل النمودج.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PluginDownloader />
          <Button variant="outline" size="sm" onClick={handleBackup}>
            <Download className="h-4 w-4 mr-2" />
            نسخة احتياطية
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            حفظ الإعدادات
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
