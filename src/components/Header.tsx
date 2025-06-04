
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Save, Shield, PackageOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';

const Header = () => {
  const { toast } = useToast();

  const handleBackup = () => {
    try {
      // جمع جميع البيانات من localStorage
      const backupData = {
        timestamp: new Date().toISOString(),
        version: "1.0.3",
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

  const handleDownloadPlugin = async () => {
    try {
      // إنشاء كائن ZIP
      const zip = new JSZip();
      
      // جمع الإعدادات المحفوظة
      const savedSettings = {
        widget_settings: JSON.parse(localStorage.getItem('wwp_settings') || '{}'),
        appearance_settings: JSON.parse(localStorage.getItem('wwp_appearance_settings') || '{}'),
        analytics_settings: JSON.parse(localStorage.getItem('wwp_analytics') || '{}'),
        general_settings: JSON.parse(localStorage.getItem('wwp_general_settings') || '{}'),
        teams: JSON.parse(localStorage.getItem('wwp_teams') || '[]')
      };

      // إنشاء الملف الرئيسي للإضافة
      const mainPluginFile = `<?php
/**
 * Plugin Name: WhatsApp Widget Pro
 * Plugin URI: https://whatsappwidgetpro.com
 * Description: إضافة احترافية لعرض زر WhatsApp مع تتبع Google Analytics ولوحة تحكم شاملة
 * Version: 1.0.3
 * Author: WhatsApp Widget Pro Team
 * License: GPL2
 * Text Domain: whatsapp-widget-pro
 * Domain Path: /languages
 */

// منع الوصول المباشر
if (!defined('ABSPATH')) {
    exit;
}

// تعريف المتغيرات الأساسية
define('WWP_VERSION', '1.0.3');
define('WWP_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WWP_PLUGIN_PATH', plugin_dir_path(__FILE__));

class WhatsAppWidgetPro {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_loaded', array($this, 'handle_ajax_requests'));
        register_activation_hook(__FILE__, array($this, 'create_tables'));
        register_activation_hook(__FILE__, array($this, 'import_saved_settings'));
        add_action('wp_head', array($this, 'add_analytics_tracking'));
    }
    
    public function init() {
        load_plugin_textdomain('whatsapp-widget-pro', false, dirname(plugin_basename(__FILE__)) . '/languages');
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        add_action('wp_enqueue_scripts', array($this, 'frontend_enqueue_scripts'));
        add_action('wp_footer', array($this, 'display_widget'));
        
        // إضافة خطافات إضافية للميزات المتقدمة
        add_action('wp_ajax_wwp_export_data', array($this, 'export_data'));
        add_action('wp_ajax_wwp_import_data', array($this, 'import_data'));
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
            
            // حذف البيانات الموجودة أولاً
            $wpdb->query("DELETE FROM $team_table");
            
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
        
        // إضافة فريق تجريبي إذا لم يكن موجود
        $this->add_default_team_members();
    }
    
    private function add_default_team_members() {
        global $wpdb;
        $team_table = $wpdb->prefix . 'wwp_team_members';
        
        // التحقق من وجود أعضاء فريق
        $existing_count = $wpdb->get_var("SELECT COUNT(*) FROM $team_table");
        
        if ($existing_count == 0) {
            $default_members = array(
                array(
                    'name' => 'محمد أحمد',
                    'phone' => '+966501234567',
                    'department' => 'المبيعات',
                    'status' => 'online',
                    'display_order' => 1
                ),
                array(
                    'name' => 'فاطمة علي',
                    'phone' => '+966507654321',
                    'department' => 'الدعم الفني',
                    'status' => 'online',
                    'display_order' => 2
                )
            );
            
            foreach ($default_members as $member) {
                $wpdb->insert(
                    $team_table,
                    $member,
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
            name varchar(100) NOT NULL,
            phone varchar(20) NOT NULL,
            department varchar(100) DEFAULT '',
            avatar varchar(255) DEFAULT '',
            status enum('online','offline','away') DEFAULT 'online',
            display_order int(11) DEFAULT 0,
            working_hours text DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        // جدول الإحصائيات
        $stats_table = $wpdb->prefix . 'wwp_statistics';
        $stats_sql = "CREATE TABLE $stats_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            event_type varchar(50) NOT NULL,
            member_id mediumint(9) DEFAULT NULL,
            user_data text,
            ip_address varchar(45) DEFAULT NULL,
            user_agent text DEFAULT NULL,
            page_url varchar(500) DEFAULT NULL,
            timestamp datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY member_id (member_id),
            KEY event_type (event_type),
            KEY timestamp (timestamp)
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
        $settings = $this->get_settings();
        $team_members = $this->get_team_members();
        $stats = $this->get_usage_stats();
        
        include WWP_PLUGIN_PATH . 'templates/admin-page.php';
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
        $settings = $this->get_settings();
        
        if ($settings['show_widget']) {
            wp_enqueue_script('wwp-frontend-script', WWP_PLUGIN_URL . 'assets/frontend-script.js', array('jquery'), WWP_VERSION, true);
            wp_enqueue_style('wwp-frontend-style', WWP_PLUGIN_URL . 'assets/frontend-style.css', array(), WWP_VERSION);
            
            wp_localize_script('wwp-frontend-script', 'wwp_settings', array_merge($settings, array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('wwp_nonce'),
                'team_members' => $this->get_active_team_members()
            )));
        }
    }
    
    // عرض الويدجت
    public function display_widget() {
        $settings = $this->get_settings();
        if (!$settings['show_widget']) {
            return;
        }
        
        include WWP_PLUGIN_PATH . 'templates/widget.php';
    }
    
    // معالجة طلبات AJAX
    public function handle_ajax_requests() {
        add_action('wp_ajax_wwp_save_settings', array($this, 'save_settings'));
        add_action('wp_ajax_wwp_record_click', array($this, 'record_click'));
        add_action('wp_ajax_wwp_add_member', array($this, 'add_member'));
        add_action('wp_ajax_wwp_delete_member', array($this, 'delete_member'));
    }
    
    // حفظ الإعدادات
    public function save_settings() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('فشل في التحقق من الأمان');
            return;
        }
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
            return;
        }
        
        $settings = array(
            'show_widget' => sanitize_text_field($_POST['show_widget'] ?? '0'),
            'welcome_message' => sanitize_textarea_field($_POST['welcome_message'] ?? ''),
            'widget_position' => sanitize_text_field($_POST['widget_position'] ?? 'bottom-right'),
            'widget_color' => sanitize_hex_color($_POST['widget_color'] ?? '#25D366'),
            'analytics_id' => sanitize_text_field($_POST['analytics_id'] ?? ''),
            'enable_analytics' => sanitize_text_field($_POST['enable_analytics'] ?? '0')
        );
        
        update_option('wwp_settings', $settings);
        wp_send_json_success('تم حفظ الإعدادات بنجاح');
    }
    
    // تسجيل النقرات
    public function record_click() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('فشل في التحقق من الأمان');
            return;
        }
        
        global $wpdb;
        
        $member_id = intval($_POST['member_id'] ?? 0);
        $event_type = sanitize_text_field($_POST['event_type'] ?? 'click');
        $user_data = wp_json_encode($_POST['user_data'] ?? array());
        
        $result = $wpdb->insert(
            $wpdb->prefix . 'wwp_statistics',
            array(
                'event_type' => $event_type,
                'member_id' => $member_id,
                'user_data' => $user_data,
                'ip_address' => $this->get_user_ip(),
                'user_agent' => sanitize_text_field($_SERVER['HTTP_USER_AGENT'] ?? ''),
                'page_url' => sanitize_url($_POST['page_url'] ?? ''),
                'timestamp' => current_time('mysql')
            ),
            array('%s', '%d', '%s', '%s', '%s', '%s', '%s')
        );
        
        if ($result) {
            wp_send_json_success('تم تسجيل الحدث بنجاح');
        } else {
            wp_send_json_error('حدث خطأ في التسجيل');
        }
    }
    
    // إضافة عضو فريق
    public function add_member() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false) || !current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
            return;
        }
        
        global $wpdb;
        
        $result = $wpdb->insert(
            $wpdb->prefix . 'wwp_team_members',
            array(
                'name' => sanitize_text_field($_POST['name']),
                'phone' => sanitize_text_field($_POST['phone']),
                'department' => sanitize_text_field($_POST['department']),
                'status' => sanitize_text_field($_POST['status']),
                'display_order' => intval($_POST['display_order'])
            ),
            array('%s', '%s', '%s', '%s', '%d')
        );
        
        if ($result) {
            wp_send_json_success('تم إضافة العضو بنجاح');
        } else {
            wp_send_json_error('حدث خطأ أثناء إضافة العضو');
        }
    }
    
    // حذف عضو فريق
    public function delete_member() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false) || !current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
            return;
        }
        
        global $wpdb;
        
        $member_id = intval($_POST['member_id']);
        
        $result = $wpdb->delete(
            $wpdb->prefix . 'wwp_team_members',
            array('id' => $member_id),
            array('%d')
        );
        
        if ($result) {
            wp_send_json_success('تم حذف العضو بنجاح');
        } else {
            wp_send_json_error('حدث خطأ أثناء الحذف');
        }
    }
    
    public function get_settings() {
        $defaults = array(
            'show_widget' => true,
            'welcome_message' => 'مرحباً! كيف يمكنني مساعدتك؟',
            'widget_position' => 'bottom-right',
            'widget_color' => '#25D366',
            'analytics_id' => '',
            'enable_analytics' => false
        );
        
        return wp_parse_args(get_option('wwp_settings', array()), $defaults);
    }
    
    public function get_team_members() {
        global $wpdb;
        return $wpdb->get_results("SELECT * FROM {$wpdb->prefix}wwp_team_members ORDER BY display_order ASC");
    }
    
    public function get_active_team_members() {
        global $wpdb;
        return $wpdb->get_results("SELECT * FROM {$wpdb->prefix}wwp_team_members WHERE status = 'online' ORDER BY display_order ASC");
    }
    
    public function get_usage_stats() {
        global $wpdb;
        
        $stats = array();
        $stats['total_clicks'] = intval($wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}wwp_statistics WHERE event_type = 'click' AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)"));
        $stats['total_conversations'] = intval($wpdb->get_var("SELECT COUNT(DISTINCT member_id) FROM {$wpdb->prefix}wwp_statistics WHERE event_type = 'conversation_start' AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)"));
        
        return $stats;
    }
    
    // إضافة تتبع Google Analytics
    public function add_analytics_tracking() {
        $settings = $this->get_settings();
        
        if ($settings['enable_analytics'] && !empty($settings['analytics_id'])) {
            ?>
            <!-- Global site tag (gtag.js) - Google Analytics -->
            <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr($settings['analytics_id']); ?>"></script>
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '<?php echo esc_attr($settings['analytics_id']); ?>');
            </script>
            <?php
        }
    }
    
    // وظائف مساعدة
    private function get_user_ip() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return sanitize_text_field($_SERVER['HTTP_CLIENT_IP']);
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            return sanitize_text_field($_SERVER['HTTP_X_FORWARDED_FOR']);
        } else {
            return sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? '');
        }
    }
}

// تفعيل الإضافة
new WhatsAppWidgetPro();
?>`;

      // إضافة ملف README.txt
      const readmeContent = `=== WhatsApp Widget Pro ===
Contributors: whatsappwidgetpro
Tags: whatsapp, widget, chat, analytics, customer-service
Requires at least: 5.0
Tested up to: 6.4
Stable tag: 1.0.3
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
* واجهة عربية كاملة
* متجاوب مع جميع الأجهزة

== Installation ==

1. ارفع ملفات الإضافة إلى مجلد /wp-content/plugins/whatsapp-widget-pro/
2. فعل الإضافة من لوحة تحكم ووردبريس
3. اذهب إلى قائمة WhatsApp Widget لتكوين الإعدادات

== Changelog ==

= 1.0.3 =
* إصلاح الأخطاء وتحسين الأداء
* إضافة ميزات جديدة للإحصائيات
* تحسين الواجهة العربية`;

      // إضافة ملفات CSS
      const adminCSS = `.wwp-admin-wrap {
    direction: rtl;
    font-family: 'Tahoma', sans-serif;
}

.wwp-card {
    background: #fff;
    border: 1px solid #ccd0d4;
    border-radius: 4px;
    margin: 20px 0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.wwp-card-header {
    padding: 15px 20px;
    border-bottom: 1px solid #ccd0d4;
    background-color: #f9f9f9;
}

.wwp-card-body {
    padding: 20px;
}

.wwp-field {
    margin-bottom: 20px;
}

.wwp-field label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #23282d;
}

.wwp-toggle {
    display: flex;
    align-items: center;
    gap: 10px;
}

.wwp-team-member {
    display: flex;
    align-items: center;
    padding: 15px;
    border: 1px solid #ddd;
    margin: 10px 0;
    border-radius: 5px;
    background: #fff;
}

.wwp-member-info {
    flex: 1;
    margin: 0 15px;
}

.wwp-stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 20px 0;
}

.wwp-stat-card {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #ddd;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.wwp-nav-tabs {
    display: flex;
    border-bottom: 1px solid #ccd0d4;
    margin-bottom: 20px;
}

.wwp-nav-link {
    padding: 10px 20px;
    text-decoration: none;
    border: 1px solid transparent;
    border-bottom: none;
    background: #f1f1f1;
    color: #555;
    cursor: pointer;
}

.wwp-nav-link.active {
    background: #fff;
    border-color: #ccd0d4;
    color: #0073aa;
}

.wwp-tab-content {
    display: none;
}

.wwp-tab-content.active {
    display: block;
}

.wwp-btn {
    background: #0073aa;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
}

.wwp-btn:hover {
    background: #005a87;
}

.wwp-btn-danger {
    background: #dc3232;
}

.wwp-btn-danger:hover {
    background: #a00;
}`;

      const frontendCSS = `#wwp-widget {
    position: fixed;
    z-index: 9999;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#wwp-widget.bottom-right {
    bottom: 20px;
    right: 20px;
}

#wwp-widget.bottom-left {
    bottom: 20px;
    left: 20px;
}

#wwp-widget.top-right {
    top: 20px;
    right: 20px;
}

#wwp-widget.top-left {
    top: 20px;
    left: 20px;
}

.wwp-widget-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--widget-color, #25D366);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: all 0.3s ease;
    font-size: 24px;
}

.wwp-widget-button:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}

.wwp-chat-window {
    position: absolute;
    bottom: 70px;
    right: 0;
    width: 320px;
    max-height: 500px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    display: none;
    overflow: hidden;
    direction: rtl;
}

.wwp-chat-header {
    background: var(--widget-color, #25D366);
    color: white;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.wwp-chat-title {
    font-size: 18px;
    font-weight: bold;
    margin: 0;
}

.wwp-close-chat {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.wwp-chat-body {
    padding: 20px;
    max-height: 400px;
    overflow-y: auto;
}

.wwp-welcome-message {
    background: #f0f0f0;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 14px;
    line-height: 1.4;
}

.wwp-team-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.wwp-team-member-item {
    display: flex;
    align-items: center;
    padding: 12px;
    margin: 8px 0;
    border: 1px solid #eee;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.wwp-team-member-item:hover {
    background: #f5f5f5;
    border-color: var(--widget-color, #25D366);
}

.wwp-member-avatar {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background: var(--widget-color, #25D366);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 12px;
    color: white;
    font-weight: bold;
    font-size: 16px;
}

.wwp-member-details {
    flex: 1;
}

.wwp-member-name {
    font-weight: bold;
    margin-bottom: 4px;
    color: #333;
}

.wwp-member-department {
    font-size: 12px;
    color: #666;
}

.wwp-member-status {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 8px;
    flex-shrink: 0;
}

.wwp-member-status.online {
    background: #4CAF50;
}

.wwp-member-status.away {
    background: #FF9800;
}

.wwp-member-status.offline {
    background: #9E9E9E;
}

@media (max-width: 480px) {
    .wwp-chat-window {
        width: 300px;
        left: 10px !important;
        right: 10px !important;
    }
    
    #wwp-widget.bottom-left,
    #wwp-widget.bottom-right {
        left: 20px;
        right: auto;
    }
}`;

      // إضافة ملفات JavaScript
      const adminJS = `jQuery(document).ready(function($) {
    // تبديل التبويبات
    $('.wwp-nav-link').click(function(e) {
        e.preventDefault();
        var tab = $(this).data('tab');
        
        // إزالة الفئة النشطة من جميع الروابط والتبويبات
        $('.wwp-nav-link').removeClass('active');
        $('.wwp-tab-content').removeClass('active');
        
        // إضافة الفئة النشطة للعنصر المحدد
        $(this).addClass('active');
        $('#' + tab + '-tab').addClass('active');
    });
    
    // تفعيل منتقي الألوان
    if ($.fn.wpColorPicker) {
        $('.color-picker').wpColorPicker();
    }
    
    // حفظ الإعدادات
    $('.wwp-save-btn').click(function() {
        var formData = new FormData();
        formData.append('action', 'wwp_save_settings');
        formData.append('nonce', wwp_ajax.nonce);
        
        // جمع البيانات من النموذج
        $('input[type="text"], input[type="color"], select, textarea').each(function() {
            if ($(this).attr('name')) {
                formData.append($(this).attr('name'), $(this).val());
            }
        });
        
        // جمع checkboxes
        $('input[type="checkbox"]').each(function() {
            if ($(this).attr('name')) {
                formData.append($(this).attr('name'), $(this).is(':checked') ? '1' : '0');
            }
        });
        
        $.ajax({
            url: wwp_ajax.ajax_url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    alert('تم حفظ الإعدادات بنجاح');
                } else {
                    alert('حدث خطأ أثناء الحفظ');
                }
            },
            error: function() {
                alert('حدث خطأ في الاتصال');
            }
        });
    });
    
    // إضافة عضو فريق
    $('.wwp-add-member').click(function() {
        var name = prompt('اسم العضو:');
        var phone = prompt('رقم الهاتف:');
        var department = prompt('القسم:');
        
        if (name && phone) {
            $.post(wwp_ajax.ajax_url, {
                action: 'wwp_add_member',
                nonce: wwp_ajax.nonce,
                name: name,
                phone: phone,
                department: department || 'خدمة العملاء',
                status: 'online',
                display_order: 0
            }, function(response) {
                if (response.success) {
                    location.reload();
                } else {
                    alert('حدث خطأ أثناء الإضافة');
                }
            });
        }
    });
    
    // حذف عضو فريق
    $('.wwp-delete-member').click(function() {
        if (confirm('هل أنت متأكد من حذف هذا العضو؟')) {
            var memberId = $(this).closest('.wwp-team-member').data('id');
            
            $.post(wwp_ajax.ajax_url, {
                action: 'wwp_delete_member',
                nonce: wwp_ajax.nonce,
                member_id: memberId
            }, function(response) {
                if (response.success) {
                    location.reload();
                } else {
                    alert('حدث خطأ أثناء الحذف');
                }
            });
        }
    });
    
    // نسخة احتياطية
    $('.wwp-backup-btn').click(function() {
        window.location.href = wwp_ajax.ajax_url + '?action=wwp_export_data&nonce=' + wwp_ajax.nonce;
    });
});`;

      const frontendJS = `jQuery(document).ready(function($) {
    var chatVisible = false;
    
    // فتح/إغلاق نافذة الدردشة
    $(document).on('click', '#wwp-toggle-chat', function() {
        if (chatVisible) {
            $('#wwp-chat-window').fadeOut();
        } else {
            $('#wwp-chat-window').fadeIn();
        }
        chatVisible = !chatVisible;
    });
    
    // إغلاق النافذة
    $(document).on('click', '#wwp-close-chat', function() {
        $('#wwp-chat-window').fadeOut();
        chatVisible = false;
    });
    
    // النقر على عضو الفريق
    $(document).on('click', '.wwp-team-member-item', function() {
        var phone = $(this).data('phone');
        var name = $(this).data('name');
        var memberId = $(this).data('member-id');
        var message = wwp_settings.welcome_message || 'مرحباً! كيف يمكنني مساعدتك؟';
        
        // تسجيل النقرة
        $.post(wwp_settings.ajax_url, {
            action: 'wwp_record_click',
            nonce: wwp_settings.nonce,
            member_id: memberId,
            event_type: 'click',
            page_url: window.location.href
        });
        
        // فتح WhatsApp
        var whatsappUrl = 'https://wa.me/' + phone.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(message);
        window.open(whatsappUrl, '_blank');
    });
});`;

      // إضافة الملفات إلى ZIP
      zip.file('whatsapp-widget-pro.php', mainPluginFile);
      zip.file('readme.txt', readmeContent);
      
      // إنشاء مجلد assets وإضافة الملفات
      zip.folder('assets')?.file('admin-style.css', adminCSS);
      zip.folder('assets')?.file('admin-script.js', adminJS);
      zip.folder('assets')?.file('frontend-style.css', frontendCSS);
      zip.folder('assets')?.file('frontend-script.js', frontendJS);
      
      // إنشاء مجلد templates وإضافة الملفات
      const adminPageTemplate = `<?php if (!defined('ABSPATH')) exit; ?>
<div class="wwp-admin-wrap">
    <h1>WhatsApp Widget Pro</h1>
    
    <div class="wwp-nav-tabs">
        <a href="#" class="wwp-nav-link active" data-tab="general">الإعدادات العامة</a>
        <a href="#" class="wwp-nav-link" data-tab="team">إدارة الفريق</a>
        <a href="#" class="wwp-nav-link" data-tab="stats">الإحصائيات</a>
    </div>
    
    <div id="general-tab" class="wwp-tab-content active">
        <div class="wwp-card">
            <div class="wwp-card-header">
                <h2>إعدادات الويدجت</h2>
            </div>
            <div class="wwp-card-body">
                <form method="post" action="">
                    <div class="wwp-field">
                        <label for="show_widget">تفعيل الويدجت</label>
                        <input type="checkbox" name="show_widget" id="show_widget" value="1" <?php checked($settings['show_widget']); ?> />
                    </div>
                    
                    <div class="wwp-field">
                        <label for="welcome_message">رسالة الترحيب</label>
                        <textarea name="welcome_message" id="welcome_message" rows="3"><?php echo esc_textarea($settings['welcome_message']); ?></textarea>
                    </div>
                    
                    <div class="wwp-field">
                        <label for="widget_position">موقع الويدجت</label>
                        <select name="widget_position" id="widget_position">
                            <option value="bottom-right" <?php selected($settings['widget_position'], 'bottom-right'); ?>>أسفل يمين</option>
                            <option value="bottom-left" <?php selected($settings['widget_position'], 'bottom-left'); ?>>أسفل يسار</option>
                            <option value="top-right" <?php selected($settings['widget_position'], 'top-right'); ?>>أعلى يمين</option>
                            <option value="top-left" <?php selected($settings['widget_position'], 'top-left'); ?>>أعلى يسار</option>
                        </select>
                    </div>
                    
                    <div class="wwp-field">
                        <label for="widget_color">لون الويدجت</label>
                        <input type="text" name="widget_color" id="widget_color" value="<?php echo esc_attr($settings['widget_color']); ?>" class="color-picker" />
                    </div>
                    
                    <button type="button" class="wwp-btn wwp-save-btn">حفظ الإعدادات</button>
                </form>
            </div>
        </div>
    </div>
    
    <div id="team-tab" class="wwp-tab-content">
        <div class="wwp-card">
            <div class="wwp-card-header">
                <h2>إدارة فريق خدمة العملاء</h2>
                <button type="button" class="wwp-btn wwp-add-member">إضافة عضو جديد</button>
            </div>
            <div class="wwp-card-body">
                <?php if (!empty($team_members)): ?>
                    <?php foreach ($team_members as $member): ?>
                        <div class="wwp-team-member" data-id="<?php echo $member->id; ?>">
                            <div class="wwp-member-avatar">
                                <?php echo substr($member->name, 0, 1); ?>
                            </div>
                            <div class="wwp-member-info">
                                <strong><?php echo esc_html($member->name); ?></strong><br>
                                <small><?php echo esc_html($member->phone); ?> - <?php echo esc_html($member->department); ?></small>
                            </div>
                            <button type="button" class="wwp-btn wwp-btn-danger wwp-delete-member">حذف</button>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <p>لا توجد أعضاء فريق حالياً</p>
                <?php endif; ?>
            </div>
        </div>
    </div>
    
    <div id="stats-tab" class="wwp-tab-content">
        <div class="wwp-card">
            <div class="wwp-card-header">
                <h2>إحصائيات الاستخدام</h2>
            </div>
            <div class="wwp-card-body">
                <div class="wwp-stats-cards">
                    <div class="wwp-stat-card">
                        <h3>النقرات الشهرية</h3>
                        <p class="stat-number"><?php echo $stats['total_clicks']; ?></p>
                    </div>
                    <div class="wwp-stat-card">
                        <h3>المحادثات</h3>
                        <p class="stat-number"><?php echo $stats['total_conversations']; ?></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;

      const widgetTemplate = `<?php if (!defined('ABSPATH')) exit; ?>
<div id="wwp-widget" class="<?php echo esc_attr($settings['widget_position']); ?>">
    <button id="wwp-toggle-chat" class="wwp-widget-button" style="--widget-color: <?php echo esc_attr($settings['widget_color']); ?>">
        💬
    </button>
    
    <div id="wwp-chat-window" class="wwp-chat-window">
        <div class="wwp-chat-header" style="--widget-color: <?php echo esc_attr($settings['widget_color']); ?>">
            <h3 class="wwp-chat-title">خدمة العملاء</h3>
            <button id="wwp-close-chat" class="wwp-close-chat">×</button>
        </div>
        
        <div class="wwp-chat-body">
            <?php if (!empty($settings['welcome_message'])): ?>
                <div class="wwp-welcome-message">
                    <?php echo esc_html($settings['welcome_message']); ?>
                </div>
            <?php endif; ?>
            
            <ul class="wwp-team-list">
                <?php 
                $team_members = $this->get_active_team_members();
                if (!empty($team_members)): 
                ?>
                    <?php foreach ($team_members as $member): ?>
                        <li class="wwp-team-member-item" 
                            data-phone="<?php echo esc_attr($member->phone); ?>" 
                            data-name="<?php echo esc_attr($member->name); ?>"
                            data-member-id="<?php echo esc_attr($member->id); ?>">
                            
                            <div class="wwp-member-avatar">
                                <?php echo substr($member->name, 0, 1); ?>
                            </div>
                            
                            <div class="wwp-member-details">
                                <div class="wwp-member-name"><?php echo esc_html($member->name); ?></div>
                                <div class="wwp-member-department"><?php echo esc_html($member->department); ?></div>
                            </div>
                            
                            <div class="wwp-member-status <?php echo esc_attr($member->status); ?>"></div>
                        </li>
                    <?php endforeach; ?>
                <?php else: ?>
                    <li style="text-align: center; padding: 20px;">
                        لا توجد أعضاء فريق متاحين حالياً
                    </li>
                <?php endif; ?>
            </ul>
        </div>
    </div>
</div>`;

      zip.folder('templates')?.file('admin-page.php', adminPageTemplate);
      zip.folder('templates')?.file('widget.php', widgetTemplate);

      // إضافة ملف التثبيت
      const installInstructions = `# تعليمات تثبيت إضافة WhatsApp Widget Pro

## خطوات التثبيت:

1. قم بتحميل الملف المضغوط whatsapp-widget-pro.zip
2. اذهب إلى لوحة تحكم ووردبريس > الإضافات > إضافة جديد
3. اضغط على "رفع إضافة" في أعلى الصفحة
4. اختر الملف المضغوط whatsapp-widget-pro.zip
5. اضغط على "تثبيت الآن"
6. بعد انتهاء التثبيت، اضغط على "تفعيل الإضافة"

## بعد التفعيل:

1. ستجد قائمة جديدة في الشريط الجانبي باسم "WhatsApp Widget"
2. اضغط عليها لفتح إعدادات الإضافة
3. قم بتكوين الإعدادات حسب احتياجاتك
4. أضف أعضاء فريق خدمة العملاء
5. احفظ الإعدادات

## المتطلبات:

- ووردبريس 5.0 أو أحدث
- PHP 7.4 أو أحدث
- MySQL 5.6 أو أحدث

## الدعم الفني:

للحصول على الدعم الفني أو الإبلاغ عن مشاكل، يرجى التواصل معنا.

إضافة WhatsApp Widget Pro
النسخة 1.0.3
`;

      zip.file('تعليمات_التثبيت.txt', installInstructions);

      // توليد الملف المضغوط
      const content = await zip.generateAsync({ type: 'blob' });
      
      // إنشاء رابط التحميل
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `whatsapp-widget-pro-v1.0.3-${new Date().toISOString().split('T')[0]}.zip`;
      
      // تحميل الملف
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // تنظيف الذاكرة
      URL.revokeObjectURL(url);
      
      toast({
        title: "تم تحميل الإضافة الكاملة بنجاح!",
        description: "تم إنشاء ملف ZIP مضغوط يحتوي على جميع ملفات الإضافة جاهز للتنصيب في ووردبريس",
      });

    } catch (error) {
      console.error('خطأ في تحميل الإضافة:', error);
      toast({
        title: "خطأ في التحميل",
        description: "حدث خطأ أثناء إنشاء ملف الإضافة المضغوط",
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
            تحميل الإضافة الكاملة ZIP
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
