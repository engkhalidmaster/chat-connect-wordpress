
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';

const PluginDownloader: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePluginZip = async () => {
    setIsGenerating(true);
    
    try {
      // إنشاء ملفات الإضافة
      const pluginFiles = createPluginFiles();
      
      // إنشاء ZIP file
      const zip = new JSZip();
      
      // إضافة الملفات إلى الـ ZIP
      Object.entries(pluginFiles).forEach(([fileName, content]) => {
        zip.file(fileName, content);
      });
      
      // توليد الـ ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // تنزيل الملف
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `whatsapp-widget-pro-v${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "تم إنشاء الإضافة بنجاح",
        description: "تم تنزيل ملف الإضافة الكامل مع جميع الملفات المطلوبة",
      });
      
    } catch (error) {
      console.error('Plugin generation error:', error);
      toast({
        title: "خطأ في إنشاء الإضافة",
        description: "حدث خطأ أثناء إنشاء ملف الإضافة",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const createPluginFiles = () => {
    const currentSettings = JSON.parse(localStorage.getItem('wwp_settings') || '{}');
    const teamMembers = JSON.parse(localStorage.getItem('wwp_team_members') || '[]');
    
    return {
      // ملف PHP الرئيسي
      'whatsapp-widget-pro.php': generateMainPHPFile(),
      
      // ملف README
      'readme.txt': generateReadmeFile(),
      
      // ملفات CSS
      'assets/admin-style.css': generateAdminCSS(),
      'assets/frontend-style.css': generateFrontendCSS(),
      
      // ملف JavaScript
      'assets/wwp-combined.js': generateJavaScriptFile(),
      
      // قوالب PHP
      'templates/admin-page.php': generateAdminPageTemplate(),
      'templates/widget.php': generateWidgetTemplate(),
      
      // ملف الترجمة
      'languages/whatsapp-widget-pro-ar.po': generateTranslationFile(),
      
      // ملفات التثبيت
      'install.php': generateInstallFile(),
      'uninstall.php': generateUninstallFile(),
      
      // إعدادات JSON
      'settings.json': JSON.stringify({
        settings: currentSettings,
        team_members: teamMembers,
        export_date: new Date().toISOString(),
        version: '2.0.0'
      }, null, 2)
    };
  };

  const generateMainPHPFile = () => {
    return `<?php
/**
 * Plugin Name: WhatsApp Widget Pro
 * Description: إضافة احترافية لعرض زر WhatsApp مع تتبع Google Analytics وتكامل WooCommerce ونظام حماية IP
 * Version: 2.0.0
 * Author: WhatsApp Widget Pro Team
 * Text Domain: whatsapp-widget-pro
 * Domain Path: /languages
 */

// منع الوصول المباشر
if (!defined('ABSPATH')) {
    exit;
}

// تعريف المتغيرات الأساسية
define('WWP_VERSION', '2.0.0');
define('WWP_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WWP_PLUGIN_PATH', plugin_dir_path(__FILE__));

// تضمين الملفات المطلوبة
require_once WWP_PLUGIN_PATH . 'install.php';

// فئة الإضافة الرئيسية
class WhatsAppWidgetPro {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    public function init() {
        // تحميل ملفات الترجمة
        load_plugin_textdomain('whatsapp-widget-pro', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // إضافة القوائم الإدارية
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // تحميل الأصول
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        add_action('wp_enqueue_scripts', array($this, 'frontend_enqueue_scripts'));
        
        // عرض الويدجت
        add_action('wp_footer', array($this, 'display_widget'));
    }
    
    public function activate() {
        // تشغيل إجراءات التفعيل
        WWP_Install::create_tables();
    }
    
    public function deactivate() {
        // إجراءات إلغاء التفعيل
    }
    
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
    
    public function admin_page() {
        include WWP_PLUGIN_PATH . 'templates/admin-page.php';
    }
    
    public function admin_enqueue_scripts($hook) {
        if ($hook != 'toplevel_page_whatsapp-widget-pro') {
            return;
        }
        
        wp_enqueue_style('wwp-admin-style', WWP_PLUGIN_URL . 'assets/admin-style.css', array(), WWP_VERSION);
        wp_enqueue_script('wwp-combined-script', WWP_PLUGIN_URL . 'assets/wwp-combined.js', array('jquery'), WWP_VERSION, true);
    }
    
    public function frontend_enqueue_scripts() {
        wp_enqueue_style('wwp-frontend-style', WWP_PLUGIN_URL . 'assets/frontend-style.css', array(), WWP_VERSION);
        wp_enqueue_script('wwp-combined-script', WWP_PLUGIN_URL . 'assets/wwp-combined.js', array('jquery'), WWP_VERSION, true);
    }
    
    public function display_widget() {
        include WWP_PLUGIN_PATH . 'templates/widget.php';
    }
}

// تفعيل الإضافة
new WhatsAppWidgetPro();
?>`;
  };

  const generateReadmeFile = () => {
    return `=== WhatsApp Widget Pro ===
Contributors: whatsappwidgetpro
Tags: whatsapp, chat, widget, analytics, woocommerce
Requires at least: 5.0
Tested up to: 6.4
Stable tag: 2.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

إضافة احترافية لعرض زر WhatsApp مع تتبع Google Analytics وتكامل WooCommerce ونظام حماية IP

== Description ==

WhatsApp Widget Pro هي إضافة متقدمة تتيح لك إضافة زر WhatsApp احترافي إلى موقعك مع ميزات متقدمة:

* **إدارة الفريق**: إضافة عدة أعضاء فريق مع ساعات عمل مختلفة
* **Google Analytics**: تتبع تفاعل المستخدمين مع الزر
* **تكامل WooCommerce**: إرسال إشعارات تلقائية للطلبات
* **نظام الأمان**: حماية من الـ IP المشبوهة
* **إحصائيات متقدمة**: تقارير مفصلة عن الاستخدام
* **تخصيص كامل**: ألوان ومواضع وتصاميم مختلفة

== Installation ==

1. ارفع ملفات الإضافة إلى مجلد \`/wp-content/plugins/whatsapp-widget-pro/\`
2. فعل الإضافة من خلال قائمة 'الإضافات' في ووردبريس
3. اذهب إلى 'WhatsApp Widget' في القائمة الإدارية لضبط الإعدادات

== Changelog ==

= 2.0.0 =
* إضافة نظام إدارة الفريق المتقدم
* تكامل Google Analytics
* نظام الأمان وحماية IP
* واجهة إدارية محدثة`;
  };

  const generateAdminCSS = () => {
    return `/* WhatsApp Widget Pro Admin Styles */
.wwp-admin-container {
    max-width: 1200px;
    margin: 20px auto;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.wwp-header {
    padding: 20px;
    border-bottom: 1px solid #e2e8f0;
    background: linear-gradient(135deg, #25D366, #128C7E);
    color: white;
    border-radius: 8px 8px 0 0;
}

.wwp-content {
    padding: 30px;
}

.wwp-form-group {
    margin-bottom: 20px;
}

.wwp-form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #374151;
}

.wwp-form-group input,
.wwp-form-group textarea,
.wwp-form-group select {
    width: 100%;
    padding: 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
}

.wwp-btn {
    background: #25D366;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.3s;
}

.wwp-btn:hover {
    background: #128C7E;
}`;
  };

  const generateFrontendCSS = () => {
    return `/* WhatsApp Widget Pro Frontend Styles */
.wwp-widget {
    position: fixed;
    z-index: 9999;
    background: #25D366;
    border-radius: 50px;
    padding: 15px;
    box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
    transition: all 0.3s ease;
    cursor: pointer;
}

.wwp-widget:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(37, 211, 102, 0.6);
}

.wwp-widget.bottom-right {
    bottom: 20px;
    right: 20px;
}

.wwp-widget.bottom-left {
    bottom: 20px;
    left: 20px;
}

.wwp-widget-icon {
    width: 24px;
    height: 24px;
    fill: white;
}

.wwp-team-popup {
    position: fixed;
    bottom: 100px;
    right: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    padding: 20px;
    max-width: 300px;
    z-index: 10000;
}

.wwp-team-member {
    display: flex;
    align-items: center;
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 8px;
    transition: background 0.3s;
}

.wwp-team-member:hover {
    background: #f8f9fa;
}`;
  };

  const generateJavaScriptFile = () => {
    return `// WhatsApp Widget Pro JavaScript
(function($) {
    'use strict';
    
    $(document).ready(function() {
        initWhatsAppWidget();
        initAdminInterface();
    });
    
    function initWhatsAppWidget() {
        $('.wwp-widget').on('click', function() {
            const phone = $(this).data('phone');
            const message = $(this).data('message') || 'مرحباً';
            const url = \`https://wa.me/\${phone}?text=\${encodeURIComponent(message)}\`;
            
            // تسجيل النقرة
            recordClick($(this).data('member-id'));
            
            // فتح WhatsApp
            window.open(url, '_blank');
        });
    }
    
    function initAdminInterface() {
        // حفظ الإعدادات
        $('#wwp-save-settings').on('click', function() {
            const settings = {
                show_widget: $('#show_widget').is(':checked'),
                welcome_message: $('#welcome_message').val(),
                widget_position: $('#widget_position').val(),
                widget_color: $('#widget_color').val()
            };
            
            saveSettings(settings);
        });
    }
    
    function recordClick(memberId) {
        $.ajax({
            url: wwp_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'wwp_record_click',
                member_id: memberId,
                nonce: wwp_ajax.nonce
            }
        });
    }
    
    function saveSettings(settings) {
        $.ajax({
            url: wwp_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'wwp_save_settings',
                settings: settings,
                nonce: wwp_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    alert('تم حفظ الإعدادات بنجاح');
                }
            }
        });
    }
    
})(jQuery);`;
  };

  const generateAdminPageTemplate = () => {
    return `<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wwp-admin-container">
    <div class="wwp-header">
        <h1><?php _e('WhatsApp Widget Pro', 'whatsapp-widget-pro'); ?></h1>
        <p><?php _e('إعداد وتخصيص زر WhatsApp لموقعك', 'whatsapp-widget-pro'); ?></p>
    </div>
    
    <div class="wwp-content">
        <form method="post" action="options.php">
            <?php settings_fields('wwp_settings'); ?>
            
            <div class="wwp-form-group">
                <label for="show_widget"><?php _e('إظهار الويدجت', 'whatsapp-widget-pro'); ?></label>
                <input type="checkbox" id="show_widget" name="wwp_settings[show_widget]" value="1" />
            </div>
            
            <div class="wwp-form-group">
                <label for="welcome_message"><?php _e('رسالة الترحيب', 'whatsapp-widget-pro'); ?></label>
                <textarea id="welcome_message" name="wwp_settings[welcome_message]" rows="3"></textarea>
            </div>
            
            <div class="wwp-form-group">
                <label for="widget_position"><?php _e('موضع الويدجت', 'whatsapp-widget-pro'); ?></label>
                <select id="widget_position" name="wwp_settings[widget_position]">
                    <option value="bottom-right"><?php _e('أسفل يمين', 'whatsapp-widget-pro'); ?></option>
                    <option value="bottom-left"><?php _e('أسفل يسار', 'whatsapp-widget-pro'); ?></option>
                </select>
            </div>
            
            <?php submit_button(__('حفظ الإعدادات', 'whatsapp-widget-pro'), 'primary', 'submit', true, array('class' => 'wwp-btn')); ?>
        </form>
    </div>
</div>`;
  };

  const generateWidgetTemplate = () => {
    return `<?php
if (!defined('ABSPATH')) {
    exit;
}

$settings = get_option('wwp_settings', array());
if (empty($settings['show_widget'])) {
    return;
}
?>

<div class="wwp-widget <?php echo esc_attr($settings['widget_position'] ?? 'bottom-right'); ?>" 
     data-phone="<?php echo esc_attr($settings['phone'] ?? ''); ?>"
     data-message="<?php echo esc_attr($settings['welcome_message'] ?? 'مرحباً'); ?>">
    <svg class="wwp-widget-icon" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.891 3.426"/>
    </svg>
</div>`;
  };

  const generateTranslationFile = () => {
    return `# Arabic Translation for WhatsApp Widget Pro
msgid ""
msgstr ""
"Project-Id-Version: WhatsApp Widget Pro\\n"
"Language: ar\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"

msgid "WhatsApp Widget Pro"
msgstr "ويدجت واتساب برو"

msgid "إعداد وتخصيص زر WhatsApp لموقعك"
msgstr "إعداد وتخصيص زر WhatsApp لموقعك"

msgid "إظهار الويدجت"
msgstr "إظهار الويدجت"

msgid "رسالة الترحيب"
msgstr "رسالة الترحيب"

msgid "موضع الويدجت"
msgstr "موضع الويدجت"

msgid "حفظ الإعدادات"
msgstr "حفظ الإعدادات"`;
  };

  const generateInstallFile = () => {
    return `<?php
if (!defined('ABSPATH')) {
    exit;
}

class WWP_Install {
    
    public static function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // جدول أعضاء الفريق
        $team_table = $wpdb->prefix . 'wwp_team_members';
        $team_sql = "CREATE TABLE $team_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            phone varchar(20) NOT NULL,
            department varchar(100) DEFAULT '',
            status enum('online','offline','away','busy') DEFAULT 'online',
            display_order int(11) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        // جدول الإحصائيات
        $stats_table = $wpdb->prefix . 'wwp_stats';
        $stats_sql = "CREATE TABLE $stats_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            date date NOT NULL,
            clicks int(11) DEFAULT 0,
            member_id mediumint(9) DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($team_sql);
        dbDelta($stats_sql);
        
        // إضافة بيانات تجريبية
        self::insert_sample_data();
        
        update_option('wwp_db_version', '2.0.0');
    }
    
    private static function insert_sample_data() {
        global $wpdb;
        
        $team_table = $wpdb->prefix . 'wwp_team_members';
        
        $sample_members = array(
            array('اسم العضو', '+966501234567', 'المبيعات', 'online', 1),
            array('عضو الدعم', '+966507654321', 'الدعم الفني', 'online', 2)
        );
        
        foreach ($sample_members as $member) {
            $wpdb->insert(
                $team_table,
                array(
                    'name' => $member[0],
                    'phone' => $member[1],
                    'department' => $member[2],
                    'status' => $member[3],
                    'display_order' => $member[4]
                ),
                array('%s', '%s', '%s', '%s', '%d')
            );
        }
    }
}
?>`;
  };

  const generateUninstallFile = () => {
    return `<?php
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// حذف الجداول
global $wpdb;
$wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wwp_team_members");
$wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wwp_stats");

// حذف الإعدادات
delete_option('wwp_settings');
delete_option('wwp_db_version');
?>`;
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={generatePluginZip}
      disabled={isGenerating}
      className="flex items-center gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
    >
      {isGenerating ? (
        <>
          <Package className="h-4 w-4 animate-spin" />
          جاري التحضير...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          تنزيل الإضافة
        </>
      )}
    </Button>
  );
};

export default PluginDownloader;
