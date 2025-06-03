
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Save, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const { toast } = useToast();

  const handleBackup = () => {
    try {
      // جمع جميع البيانات من localStorage
      const backupData = {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        settings: {
          widget_settings: JSON.parse(localStorage.getItem('wwp_settings') || '{}'),
          appearance_settings: JSON.parse(localStorage.getItem('wwp_appearance_settings') || '{}'),
          analytics_settings: JSON.parse(localStorage.getItem('wwp_analytics') || '{}'),
          general_settings: JSON.parse(localStorage.getItem('wwp_general_settings') || '{}')
        },
        teams: JSON.parse(localStorage.getItem('wwp_teams') || '[]'),
        statistics: JSON.parse(localStorage.getItem('wwp_statistics') || '{}')
      };
      
      // تحويل البيانات إلى JSON منسق
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // إنشاء رابط التحميل
      const link = document.createElement('a');
      link.href = url;
      link.download = `whatsapp-widget-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      // تحميل الملف
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // تنظيف الذاكرة
      URL.revokeObjectURL(url);
      
      toast({
        title: "تم إنشاء النسخة الاحتياطية بنجاح",
        description: "تم تحميل ملف النسخة الاحتياطية على جهازك",
      });
    } catch (error) {
      console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
      toast({
        title: "خطأ في النسخة الاحتياطية",
        description: "حدث خطأ أثناء إنشاء النسخة الاحتياطية",
        variant: "destructive",
      });
    }
  };

  const handleSaveSettings = () => {
    try {
      // حفظ جميع الإعدادات (التحقق من وجودها أولاً)
      const currentSettings = {
        widget_settings: JSON.parse(localStorage.getItem('wwp_settings') || '{}'),
        appearance_settings: JSON.parse(localStorage.getItem('wwp_appearance_settings') || '{}'),
        analytics_settings: JSON.parse(localStorage.getItem('wwp_analytics') || '{}'),
        general_settings: JSON.parse(localStorage.getItem('wwp_general_settings') || '{}'),
        teams: JSON.parse(localStorage.getItem('wwp_teams') || '[]'),
        last_saved: new Date().toISOString()
      };

      // إعادة حفظ الإعدادات مع الطابع الزمني
      Object.keys(currentSettings).forEach(key => {
        if (key !== 'last_saved') {
          localStorage.setItem(`wwp_${key}`, JSON.stringify(currentSettings[key]));
        }
      });
      
      localStorage.setItem('wwp_last_saved', currentSettings.last_saved);
      
      toast({
        title: "تم حفظ الإعدادات بنجاح",
        description: "تم حفظ جميع الإعدادات والبيانات بنجاح",
      });
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      });
    }
  };

  const handleRestoreBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const backupData = JSON.parse(e.target?.result as string);
            
            // استعادة البيانات
            if (backupData.settings) {
              Object.keys(backupData.settings).forEach(key => {
                localStorage.setItem(`wwp_${key}`, JSON.stringify(backupData.settings[key]));
              });
            }
            
            if (backupData.teams) {
              localStorage.setItem('wwp_teams', JSON.stringify(backupData.teams));
            }
            
            if (backupData.statistics) {
              localStorage.setItem('wwp_statistics', JSON.stringify(backupData.statistics));
            }
            
            toast({
              title: "تم استعادة النسخة الاحتياطية",
              description: "تم استعادة جميع البيانات بنجاح. يرجى إعادة تحميل الصفحة.",
            });
            
            // إعادة تحميل الصفحة بعد 2 ثانية
            setTimeout(() => {
              window.location.reload();
            }, 2000);
            
          } catch (error) {
            toast({
              title: "خطأ في الاستعادة",
              description: "ملف النسخة الاحتياطية تالف أو غير صحيح",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">WhatsApp Widget Pro</h1>
              <p className="text-sm text-gray-600 mt-1">
                إضافة احترافية لإدارة محادثات WhatsApp مع تتبع Google Analytics
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRestoreBackup}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Download className="h-4 w-4 mr-2 rotate-180" />
            استعادة نسخة
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackup}
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <Download className="h-4 w-4 mr-2" />
            نسخة احتياطية
          </Button>
          
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700" 
            onClick={handleSaveSettings}
          >
            <Save className="h-4 w-4 mr-2" />
            حفظ الإعدادات
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
