
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Download, Archive, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import JSZip from 'jszip';

// Import all generator functions
import { 
  generateMainPluginFile, 
  generateInstallFile, 
  generateUninstallFile 
} from '../utils/pluginGenerators/phpGenerators';
import { 
  generateAdminPageTemplate, 
  generateWidgetTemplate, 
  generateTeamPopupTemplate, 
  generateSettingsTabsTemplate 
} from '../utils/pluginGenerators/templateGenerators';
import { 
  generateAdminCSS, 
  generateFrontendCSS, 
  generateAdminJavaScript, 
  generateFrontendJavaScript, 
  generateAnalyticsJavaScript 
} from '../utils/pluginGenerators/assetGenerators';
import { 
  generateReadmeFile, 
  generateUserGuideFile, 
  generateInstallationGuideFile, 
  generateTroubleshootingGuideFile 
} from '../utils/pluginGenerators/documentationGenerators';
import { 
  generateTranslationFile, 
  generateBinaryTranslationFile, 
  generatePOTFile 
} from '../utils/pluginGenerators/translationGenerators';
import { 
  generateHtaccessFile, 
  generateIndexFile, 
  generateUpgradeFile, 
  generateConstantsFile, 
  generateAdminActionsFile, 
  generateFrontendActionsFile 
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
      // Main plugin files
      'whatsapp-widget-pro.php': generateMainPluginFile(settings),
      'readme.txt': generateReadmeFile(),
      'assets/admin-style.css': generateAdminCSS(),
      'assets/frontend-style.css': generateFrontendCSS(),
      'assets/admin-script.js': generateAdminJavaScript(),
      'assets/wwp-combined.js': generateFrontendJavaScript(),
      'assets/analytics.js': generateAnalyticsJavaScript(),
      'templates/admin-page.php': generateAdminPageTemplate(),
      'templates/widget.php': generateWidgetTemplate(),
      'templates/team-popup.php': generateTeamPopupTemplate(),
      'templates/settings-tabs.php': generateSettingsTabsTemplate(),
      'languages/whatsapp-widget-pro-ar.po': generateTranslationFile(),
      'languages/whatsapp-widget-pro-ar.mo': generateBinaryTranslationFile(),
      'languages/whatsapp-widget-pro.pot': generatePOTFile(),
      'install.php': generateInstallFile(),
      'uninstall.php': generateUninstallFile(),
      'upgrade.php': generateUpgradeFile(),
      '.htaccess': generateHtaccessFile(),
      'index.php': generateIndexFile(),
      // Include files
      'includes/constants.php': generateConstantsFile(),
      'includes/admin-actions.php': generateAdminActionsFile(),
      'includes/frontend-actions.php': generateFrontendActionsFile(),
      // Documentation
      'docs/user-guide.md': generateUserGuideFile(),
      'docs/installation.md': generateInstallationGuideFile(),
      'docs/troubleshooting.md': generateTroubleshootingGuideFile(),
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
          <h4 className="font-medium">الملفات المضمنة:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• ملف الإضافة الرئيسي (whatsapp-widget-pro.php)</li>
            <li>• ملفات التصميم والأنماط (CSS)</li>
            <li>• ملفات JavaScript التفاعلية</li>
            <li>• قوالب العرض والإدارة</li>
            <li>• ملفات الترجمة العربية</li>
            <li>• ملفات التثبيت والإلغاء</li>
            <li>• وثائق المساعدة والدعم</li>
          </ul>
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
