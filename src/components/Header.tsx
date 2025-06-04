
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Save, Shield, PackageOpen } from 'lucide-react';
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

  const handleDownloadPlugin = () => {
    try {
      // إنشاء محتوى ملف الإضافة المحدث مع الإعدادات المحفوظة
      const savedSettings = {
        widget_settings: JSON.parse(localStorage.getItem('wwp_settings') || '{}'),
        appearance_settings: JSON.parse(localStorage.getItem('wwp_appearance_settings') || '{}'),
        analytics_settings: JSON.parse(localStorage.getItem('wwp_analytics') || '{}'),
        general_settings: JSON.parse(localStorage.getItem('wwp_general_settings') || '{}'),
        teams: JSON.parse(localStorage.getItem('wwp_teams') || '[]')
      };

      // محتوى ملف الإضافة المحدث
      const pluginContent = `<?php
/**
 * Plugin Name: WhatsApp Widget Pro
 * Description: إضافة احترافية لعرض زر WhatsApp مع تتبع Google Analytics ولوحة تحكم شاملة
 * Version: 1.0.1
 * Author: WhatsApp Widget Pro Team
 * Text Domain: whatsapp-widget-pro
 * Domain Path: /languages
 */

// منع الوصول المباشر
if (!defined('ABSPATH')) {
    exit;
}

// تعريف المتغيرات الأساسية
define('WWP_VERSION', '1.0.1');
define('WWP_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WWP_PLUGIN_PATH', plugin_dir_path(__FILE__));

class WhatsAppWidgetPro {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_loaded', array($this, 'handle_ajax_requests'));
        register_activation_hook(__FILE__, array($this, 'create_tables'));
        register_activation_hook(__FILE__, array($this, 'import_saved_settings'));
    }
    
    public function init() {
        load_plugin_textdomain('whatsapp-widget-pro', false, dirname(plugin_basename(__FILE__)) . '/languages');
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        add_action('wp_enqueue_scripts', array($this, 'frontend_enqueue_scripts'));
        add_action('wp_footer', array($this, 'display_widget'));
    }
    
    // استيراد الإعدادات المحفوظة من التطبيق
    public function import_saved_settings() {
        $saved_settings = ${JSON.stringify(savedSettings, null, 8)};
        
        if (!empty($saved_settings['widget_settings'])) {
            update_option('wwp_settings', $saved_settings['widget_settings']);
        }
        
        if (!empty($saved_settings['teams'])) {
            global $wpdb;
            $team_table = $wpdb->prefix . 'wwp_team_members';
            
            foreach ($saved_settings['teams'] as $team) {
                $wpdb->insert(
                    $team_table,
                    array(
                        'name' => sanitize_text_field($team['name']),
                        'phone' => sanitize_text_field($team['phone']),
                        'department' => sanitize_text_field($team['department']),
                        'status' => sanitize_text_field($team['status']),
                        'display_order' => intval($team['display_order'] ?? 0)
                    ),
                    array('%s', '%s', '%s', '%s', '%d')
                );
            }
        }
    }
    
    // إنشاء جداول قاعدة البيانات
    public function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // جدول أعضاء الفريق
        $team_table = $wpdb->prefix . 'wwp_team_members';
        $team_sql = "CREATE TABLE $team_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            name tinytext NOT NULL,
            phone varchar(20) NOT NULL,
            department varchar(100) NOT NULL,
            status varchar(20) DEFAULT 'active',
            display_order int(11) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        // جدول الإحصائيات
        $stats_table = $wpdb->prefix . 'wwp_statistics';
        $stats_sql = "CREATE TABLE $stats_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            event_type varchar(50) NOT NULL,
            user_data text,
            timestamp datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($team_sql);
        dbDelta($stats_sql);
    }
    
    // إضافة قائمة الإدارة
    public function add_admin_menu() {
        add_menu_page(
            'WhatsApp Widget Pro',
            'WhatsApp Widget',
            'manage_options',
            'whatsapp-widget-pro',
            array($this, 'admin_page'),
            'dashicons-whatsapp',
            30
        );
    }
    
    // صفحة الإدارة
    public function admin_page() {
        include_once WWP_PLUGIN_PATH . 'templates/admin-page.php';
    }
    
    // تحميل ملفات الإدارة
    public function admin_enqueue_scripts($hook) {
        if ($hook != 'toplevel_page_whatsapp-widget-pro') {
            return;
        }
        
        wp_enqueue_script('wwp-admin-script', WWP_PLUGIN_URL . 'assets/admin-script.js', array('jquery'), WWP_VERSION, true);
        wp_enqueue_style('wwp-admin-style', WWP_PLUGIN_URL . 'assets/admin-style.css', array(), WWP_VERSION);
        
        wp_localize_script('wwp-admin-script', 'wwp_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wwp_nonce')
        ));
    }
    
    // تحميل ملفات الواجهة الأمامية
    public function frontend_enqueue_scripts() {
        wp_enqueue_script('wwp-frontend-script', WWP_PLUGIN_URL . 'assets/frontend-script.js', array('jquery'), WWP_VERSION, true);
        wp_enqueue_style('wwp-frontend-style', WWP_PLUGIN_URL . 'assets/frontend-style.css', array(), WWP_VERSION);
    }
    
    // عرض الويدجت
    public function display_widget() {
        $settings = get_option('wwp_settings', array());
        if (!empty($settings['enabled'])) {
            include_once WWP_PLUGIN_PATH . 'templates/widget.php';
        }
    }
    
    // معالجة طلبات AJAX
    public function handle_ajax_requests() {
        add_action('wp_ajax_wwp_save_settings', array($this, 'save_settings'));
        add_action('wp_ajax_wwp_get_settings', array($this, 'get_settings'));
        add_action('wp_ajax_wwp_save_team_member', array($this, 'save_team_member'));
        add_action('wp_ajax_wwp_delete_team_member', array($this, 'delete_team_member'));
        add_action('wp_ajax_wwp_get_statistics', array($this, 'get_statistics'));
    }
    
    // حفظ الإعدادات
    public function save_settings() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die();
        }
        
        $settings = $_POST['settings'];
        update_option('wwp_settings', $settings);
        
        wp_send_json_success();
    }
    
    // جلب الإعدادات
    public function get_settings() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        $settings = get_option('wwp_settings', array());
        wp_send_json_success($settings);
    }
}

// تفعيل الإضافة
new WhatsAppWidgetPro();
?>`;

      // إنشاء ملف ZIP باستخدام JSZip (محاكاة)
      const zip = {
        'whatsapp-widget-pro.php': pluginContent,
        'readme.txt': `=== WhatsApp Widget Pro ===
Contributors: whatsappwidgetpro
Tags: whatsapp, widget, chat, analytics, customer-service
Requires at least: 5.0
Tested up to: 6.4
Stable tag: 1.0.1
License: GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html

إضافة احترافية لعرض زر WhatsApp مع تتبع Google Analytics ولوحة تحكم شاملة.

== Description ==

إضافة WhatsApp Widget Pro توفر حلول شاملة لإدارة خدمة العملاء عبر WhatsApp مع إمكانيات متقدمة للتتبع والإحصائيات.

الميزات الرئيسية:
* إدارة فريق خدمة العملاء
* تتبع Google Analytics
* إحصائيات مفصلة
* تخصيص كامل للمظهر
* نسخ احتياطية للإعدادات

== Installation ==

1. ارفع ملفات الإضافة إلى مجلد /wp-content/plugins/whatsapp-widget-pro/
2. فعل الإضافة من لوحة تحكم ووردبريس
3. اذهب إلى قائمة WhatsApp Widget لتكوين الإعدادات

== Changelog ==

= 1.0.1 =
* إصلاح مشاكل الترويسات
* تحسين إدارة الفريق
* إضافة ميزات جديدة للنسخ الاحتياطي`
      };

      // تحويل إلى نص واحد (محاكاة ZIP)
      let pluginData = '# WhatsApp Widget Pro Plugin Files\n\n';
      Object.entries(zip).forEach(([filename, content]) => {
        pluginData += `## ${filename}\n\`\`\`\n${content}\n\`\`\`\n\n`;
      });

      // إنشاء ملف للتحميل
      const dataBlob = new Blob([pluginData], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(dataBlob);
      
      // إنشاء رابط التحميل
      const link = document.createElement('a');
      link.href = url;
      link.download = `whatsapp-widget-pro-v1.0.1-${new Date().toISOString().split('T')[0]}.txt`;
      
      // تحميل الملف
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // تنظيف الذاكرة
      URL.revokeObjectURL(url);
      
      toast({
        title: "تم تحميل الإضافة بنجاح",
        description: "تم تحميل ملفات الإضافة المحدثة. قم برفعها إلى ووردبريس.",
      });
    } catch (error) {
      console.error('خطأ في تحميل الإضافة:', error);
      toast({
        title: "خطأ في التحميل",
        description: "حدث خطأ أثناء تحميل ملفات الإضافة",
        variant: "destructive",
      });
    }
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
            onClick={handleDownloadPlugin}
            className="text-purple-600 border-purple-200 hover:bg-purple-50"
          >
            <PackageOpen className="h-4 w-4 mr-2" />
            تحميل الإضافة المحدثة
          </Button>
          
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
