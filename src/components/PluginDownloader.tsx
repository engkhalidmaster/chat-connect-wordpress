
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Download, Archive, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import JSZip from 'jszip';

// Import simplified generator functions
import { 
  generateMainPluginFile, 
  generateUninstallFile 
} from '../utils/pluginGenerators/phpGenerators';
import { 
  generateAdminTemplate
} from '../utils/pluginGenerators/templateGenerators';
import { 
  generateSimplifiedCSS, 
  generateSimplifiedJavaScript 
} from '../utils/pluginGenerators/assetGenerators';
import { 
  generateReadmeFile
} from '../utils/pluginGenerators/documentationGenerators';
import { 
  generateArabicTranslation
} from '../utils/pluginGenerators/translationGenerators';
import { 
  generateSecurityIndex
} from '../utils/pluginGenerators/utilityGenerators';

const PluginDownloader = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string>('');

  const generatePluginZip = async () => {
    setIsGenerating(true);
    setDownloadStatus('جاري إنشاء ملفات الإضافة...');

    try {
      const zip = new JSZip();
      const pluginFolder = zip.folder('whatsapp-widget-pro');

      if (!pluginFolder) {
        throw new Error('Failed to create plugin folder');
      }

      // Create all plugin files
      const pluginFiles = await createPluginFiles();

      // Add all files to zip
      Object.entries(pluginFiles).forEach(([path, content]) => {
        pluginFolder.file(path, content);
      });

      setDownloadStatus('جاري ضغط الملفات...');

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(zipBlob);
      downloadLink.download = 'whatsapp-widget-pro.zip';
      downloadLink.click();

      setDownloadStatus('تم تنزيل الإضافة بنجاح!');
      
      // Clean up the object URL
      setTimeout(() => {
        URL.revokeObjectURL(downloadLink.href);
      }, 100);

    } catch (error) {
      console.error('Plugin generation error:', error);
      setDownloadStatus('حدث خطأ أثناء إنشاء الإضافة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsGenerating(false);
    }
  };

  const createPluginFiles = async () => {
    const settings = {
      phone_number: '+1234567890',
      welcome_message: 'مرحباً! كيف يمكننا مساعدتك؟',
      position: 'bottom-right',
      theme: 'green'
    };

    return {
      // Main plugin files (4 files)
      'whatsapp-widget-pro.php': generateMainPluginFile(settings),
      'readme.txt': generateReadmeFile(),
      'uninstall.php': generateUninstallFile(),
      'index.php': generateSecurityIndex(),
      
      // Admin template (2 files)
      'templates/admin-page.php': generateAdminTemplate(),
      'templates/index.php': generateSecurityIndex(),
      
      // Assets (3 files)
      'assets/style.css': generateSimplifiedCSS(),
      'assets/script.js': generateSimplifiedJavaScript(),
      'assets/index.php': generateSecurityIndex(),
      
      // Translations (2 files)
      'languages/whatsapp-widget-pro-ar.po': generateArabicTranslation(),
      'languages/index.php': generateSecurityIndex(),
    };
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          تنزيل الإضافة الكاملة
        </CardTitle>
        <CardDescription>
          قم بتنزيل إضافة واتساب كاملة جاهزة للتثبيت على موقع ووردبريس
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {downloadStatus && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {downloadStatus}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <h4 className="font-medium">الملفات المضمنة (11 ملف فقط):</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• الملف الرئيسي المبسط (whatsapp-widget-pro.php)</li>
            <li>• ملف تصميم موحد (assets/style.css)</li>
            <li>• ملف جافاسكريبت مبسط (assets/script.js)</li>
            <li>• قالب إدارة واحد (templates/admin-page.php)</li>
            <li>• ترجمة عربية (languages/whatsapp-widget-pro-ar.po)</li>
            <li>• ملف إلغاء التثبيت (uninstall.php)</li>
            <li>• وصف الإضافة (readme.txt)</li>
            <li>• ملفات الحماية (index.php في كل مجلد)</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            إضافة مبسطة وسريعة بحجم أقل من 50KB - تحتوي على الميزات الأساسية فقط
          </p>
        </div>

        <Button 
          onClick={generatePluginZip}
          disabled={isGenerating}
          className="w-full" 
          size="lg"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? 'جاري الإنشاء...' : 'تنزيل الإضافة الكاملة'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PluginDownloader;
