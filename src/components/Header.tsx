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
        version: "1.0.4",
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
      // إنشاء كائن ZIP جديد
      const zip = new JSZip();
      
      // جمع الإعدادات المحفوظة من localStorage
      const savedSettings = {
        widget_settings: JSON.parse(localStorage.getItem('wwp_settings') || '{}'),
        appearance_settings: JSON.parse(localStorage.getItem('wwp_appearance_settings') || '{}'),
        analytics_settings: JSON.parse(localStorage.getItem('wwp_analytics') || '{}'),
        general_settings: JSON.parse(localStorage.getItem('wwp_general_settings') || '{}'),
        teams: JSON.parse(localStorage.getItem('wwp_teams') || '[]')
      };

      // إنشاء محتوى ملف الإضافة الرئيسي مع جميع الوظائف
      const mainPluginContent = `<?php
/**
 * Plugin Name: WhatsApp Widget Pro
 * Plugin URI: https://whatsappwidgetpro.com
 * Description: إضافة احترافية لعرض زر WhatsApp مع تتبع Google Analytics ولوحة تحكم شاملة
 * Version: 1.0.4
 * Author: WhatsApp Widget Pro Team
 * License: GPL2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: whatsapp-widget-pro
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 */

// منع الوصول المباشر للملف
if (!defined('ABSPATH')) {
    exit('لا يمكن الوصول المباشر لهذا الملف');
}

// تعريف الثوابت الأساسية للإضافة
define('WWP_VERSION', '1.0.4');
define('WWP_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WWP_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('WWP_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * الكلاس الرئيسي لإضافة WhatsApp Widget Pro
 */
class WhatsAppWidgetPro {
    
    /**
     * مُنشئ الكلاس
     */
    public function __construct() {
        // تسجيل خطافات التفعيل وإلغاء التفعيل
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // تهيئة الإضافة
        add_action('init', array($this, 'init'));
    }
    
    /**
     * تهيئة الإضافة
     */
    public function init() {
        // تحميل ملفات الترجمة
        load_plugin_textdomain('whatsapp-widget-pro', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // إضافة الخطافات الأساسية
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        add_action('wp_enqueue_scripts', array($this, 'frontend_enqueue_scripts'));
        add_action('wp_footer', array($this, 'display_widget'));
        add_action('wp_head', array($this, 'add_analytics_tracking'));
        
        // إضافة خطافات AJAX
        add_action('wp_ajax_wwp_save_settings', array($this, 'ajax_save_settings'));
        add_action('wp_ajax_wwp_add_member', array($this, 'ajax_add_member'));
        add_action('wp_ajax_wwp_edit_member', array($this, 'ajax_edit_member'));
        add_action('wp_ajax_wwp_delete_member', array($this, 'ajax_delete_member'));
        add_action('wp_ajax_wwp_record_click', array($this, 'ajax_record_click'));
        add_action('wp_ajax_nopriv_wwp_record_click', array($this, 'ajax_record_click'));
    }
    
    /**
     * تفعيل الإضافة
     */
    public function activate() {
        // إنشاء جداول قاعدة البيانات
        $this->create_database_tables();
        
        // إضافة الإعدادات الافتراضية
        $this->add_default_settings();
        
        // إضافة أعضاء الفريق الافتراضيين
        $this->add_default_team_members();
        
        // إضافة الإعدادات المحفوظة من التطبيق
        $this->import_app_settings();
        
        // مسح الكاش
        flush_rewrite_rules();
    }
    
    /**
     * إلغاء تفعيل الإضافة
     */
    public function deactivate() {
        // مسح الكاش
        flush_rewrite_rules();
    }
    
    /**
     * إنشاء جداول قاعدة البيانات
     */
    private function create_database_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // جدول أعضاء الفريق
        $team_table = $wpdb->prefix . 'wwp_team_members';
        $team_sql = "CREATE TABLE IF NOT EXISTS $team_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            phone varchar(20) NOT NULL,
            department varchar(100) DEFAULT '',
            avatar varchar(255) DEFAULT '',
            status enum('online','offline','away') DEFAULT 'online',
            working_hours text DEFAULT NULL,
            display_order int(11) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY status (status),
            KEY display_order (display_order)
        ) $charset_collate;";
        
        // جدول الإحصائيات
        $stats_table = $wpdb->prefix . 'wwp_statistics';
        $stats_sql = "CREATE TABLE IF NOT EXISTS $stats_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            event_type varchar(50) NOT NULL,
            member_id mediumint(9) DEFAULT NULL,
            user_data text DEFAULT NULL,
            ip_address varchar(45) DEFAULT NULL,
            user_agent text DEFAULT NULL,
            page_url varchar(500) DEFAULT NULL,
            session_id varchar(100) DEFAULT NULL,
            timestamp datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY member_id (member_id),
            KEY event_type (event_type),
            KEY timestamp (timestamp),
            KEY session_id (session_id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($team_sql);
        dbDelta($stats_sql);
    }
    
    /**
     * إضافة الإعدادات الافتراضية
     */
    private function add_default_settings() {
        $default_settings = array(
            'show_widget' => true,
            'welcome_message' => 'مرحباً! كيف يمكنني مساعدتك؟',
            'widget_position' => 'bottom-right',
            'widget_color' => '#25D366',
            'auto_open' => false,
            'show_offline_message' => true,
            'offline_message' => 'نحن غير متواجدين حالياً، لكن يمكنك ترك رسالة وسنتواصل معك قريباً.',
            'analytics_id' => '',
            'enable_analytics' => false,
            'working_hours_enabled' => false,
            'working_hours' => array(
                'monday' => array('start' => '09:00', 'end' => '17:00'),
                'tuesday' => array('start' => '09:00', 'end' => '17:00'),
                'wednesday' => array('start' => '09:00', 'end' => '17:00'),
                'thursday' => array('start' => '09:00', 'end' => '17:00'),
                'friday' => array('start' => '09:00', 'end' => '17:00'),
                'saturday' => array('start' => '09:00', 'end' => '17:00'),
                'sunday' => array('start' => '09:00', 'end' => '17:00')
            )
        );
        
        // إضافة الإعدادات إذا لم تكن موجودة
        if (!get_option('wwp_settings')) {
            add_option('wwp_settings', $default_settings);
        }
    }
    
    /**
     * إضافة أعضاء الفريق الافتراضيين
     */
    private function add_default_team_members() {
        global $wpdb;
        
        $team_table = $wpdb->prefix . 'wwp_team_members';
        
        // التحقق من عدم وجود أعضاء فريق
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
                ),
                array(
                    'name' => 'أحمد محمود',
                    'phone' => '+966509876543',
                    'department' => 'خدمة العملاء',
                    'status' => 'online',
                    'display_order' => 3
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
    
    /**
     * استيراد الإعدادات من التطبيق
     */
    private function import_app_settings() {
        $app_settings = ${JSON.stringify(savedSettings, null, 8)};
        
        if (!empty($app_settings)) {
            // استيراد إعدادات الويدجت
            if (!empty($app_settings['widget_settings'])) {
                update_option('wwp_settings', array_merge(
                    get_option('wwp_settings', array()),
                    $app_settings['widget_settings']
                ));
            }
            
            // استيراد أعضاء الفريق
            if (!empty($app_settings['teams'])) {
                global $wpdb;
                $team_table = $wpdb->prefix . 'wwp_team_members';
                
                foreach ($app_settings['teams'] as $team) {
                    $wpdb->replace(
                        $team_table,
                        array(
                            'name' => sanitize_text_field($team['name']),
                            'phone' => sanitize_text_field($team['phone']),
                            'department' => sanitize_text_field($team['department'] ?? ''),
                            'status' => sanitize_text_field($team['status'] ?? 'online'),
                            'display_order' => intval($team['display_order'] ?? 0)
                        ),
                        array('%s', '%s', '%s', '%s', '%d')
                    );
                }
            }
        }
    }
    
    /**
     * إضافة قوائم الإدارة
     */
    public function add_admin_menu() {
        // القائمة الرئيسية
        add_menu_page(
            'WhatsApp Widget Pro',
            'WhatsApp Widget',
            'manage_options',
            'whatsapp-widget-pro',
            array($this, 'admin_page'),
            'dashicons-format-chat',
            30
        );
        
        // القوائم الفرعية
        add_submenu_page(
            'whatsapp-widget-pro',
            'إدارة الفريق',
            'إدارة الفريق',
            'manage_options',
            'wwp-team-management',
            array($this, 'team_management_page')
        );
        
        add_submenu_page(
            'whatsapp-widget-pro',
            'الإحصائيات',
            'الإحصائيات',
            'manage_options',
            'wwp-statistics',
            array($this, 'statistics_page')
        );
    }
    
    /**
     * تحميل ملفات الإدارة
     */
    public function admin_enqueue_scripts($hook) {
        if (strpos($hook, 'whatsapp-widget-pro') === false && strpos($hook, 'wwp-') === false) {
            return;
        }
        
        // إنشاء ملفات الأصول إذا لم تكن موجودة
        $this->create_asset_files();
        
        wp_enqueue_style('wwp-admin-style', WWP_PLUGIN_URL . 'assets/admin-style.css', array(), WWP_VERSION);
        wp_enqueue_script('wwp-admin-script', WWP_PLUGIN_URL . 'assets/admin-script.js', array('jquery'), WWP_VERSION, true);
        
        wp_localize_script('wwp-admin-script', 'wwp_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wwp_nonce'),
            'plugin_url' => WWP_PLUGIN_URL
        ));
    }
    
    /**
     * تحميل ملفات الواجهة الأمامية
     */
    public function frontend_enqueue_scripts() {
        $settings = $this->get_settings();
        
        if ($settings['show_widget']) {
            // إنشاء ملفات الأصول إذا لم تكن موجودة
            $this->create_asset_files();
            
            wp_enqueue_style('wwp-frontend-style', WWP_PLUGIN_URL . 'assets/frontend-style.css', array(), WWP_VERSION);
            wp_enqueue_script('wwp-frontend-script', WWP_PLUGIN_URL . 'assets/frontend-script.js', array('jquery'), WWP_VERSION, true);
            
            wp_localize_script('wwp-frontend-script', 'wwp_settings', array_merge($settings, array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('wwp_nonce'),
                'team_members' => $this->get_active_team_members()
            )));
        }
    }
    
    /**
     * عرض الويدجت في الواجهة الأمامية
     */
    public function display_widget() {
        $settings = $this->get_settings();
        
        if (!$settings['show_widget']) {
            return;
        }
        
        $team_members = $this->get_active_team_members();
        
        // تحديد ما إذا كنا في أوقات العمل
        $is_working_hours = $this->is_working_hours();
        
        include WWP_PLUGIN_PATH . 'templates/widget.php';
    }
    
    /**
     * صفحة الإدارة الرئيسية
     */
    public function admin_page() {
        $settings = $this->get_settings();
        $team_members = $this->get_team_members();
        $stats = $this->get_usage_stats();
        
        include WWP_PLUGIN_PATH . 'templates/admin-page.php';
    }
    
    /**
     * صفحة إدارة الفريق
     */
    public function team_management_page() {
        $team_members = $this->get_team_members();
        include WWP_PLUGIN_PATH . 'templates/team-management.php';
    }
    
    /**
     * صفحة الإحصائيات
     */
    public function statistics_page() {
        $stats = $this->get_detailed_stats();
        include WWP_PLUGIN_PATH . 'templates/statistics.php';
    }
    
    /**
     * حفظ الإعدادات عبر AJAX
     */
    public function ajax_save_settings() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('فشل في التحقق من الأمان');
            return;
        }
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
            return;
        }
        
        $settings = array(
            'show_widget' => isset($_POST['show_widget']) ? (bool) $_POST['show_widget'] : false,
            'welcome_message' => isset($_POST['welcome_message']) ? sanitize_textarea_field($_POST['welcome_message']) : '',
            'widget_position' => isset($_POST['widget_position']) ? sanitize_text_field($_POST['widget_position']) : 'bottom-right',
            'widget_color' => isset($_POST['widget_color']) ? sanitize_hex_color($_POST['widget_color']) : '#25D366',
            'auto_open' => isset($_POST['auto_open']) ? (bool) $_POST['auto_open'] : false,
            'analytics_id' => isset($_POST['analytics_id']) ? sanitize_text_field($_POST['analytics_id']) : '',
            'enable_analytics' => isset($_POST['enable_analytics']) ? (bool) $_POST['enable_analytics'] : false,
        );
        
        update_option('wwp_settings', array_merge($this->get_settings(), $settings));
        wp_send_json_success('تم حفظ الإعدادات بنجاح');
    }
    
    /**
     * إضافة عضو فريق عبر AJAX
     */
    public function ajax_add_member() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false) || !current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
            return;
        }
        
        global $wpdb;
        
        $name = sanitize_text_field($_POST['name'] ?? '');
        $phone = sanitize_text_field($_POST['phone'] ?? '');
        $department = sanitize_text_field($_POST['department'] ?? '');
        $status = sanitize_text_field($_POST['status'] ?? 'online');
        
        if (empty($name) || empty($phone)) {
            wp_send_json_error('الاسم ورقم الهاتف مطلوبان');
            return;
        }
        
        $result = $wpdb->insert(
            $wpdb->prefix . 'wwp_team_members',
            array(
                'name' => $name,
                'phone' => $phone,
                'department' => $department,
                'status' => $status,
                'display_order' => 0
            ),
            array('%s', '%s', '%s', '%s', '%d')
        );
        
        if ($result) {
            wp_send_json_success('تم إضافة العضو بنجاح');
        } else {
            wp_send_json_error('حدث خطأ أثناء إضافة العضو');
        }
    }
    
    /**
     * تعديل عضو فريق عبر AJAX
     */
    public function ajax_edit_member() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false) || !current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
            return;
        }
        
        global $wpdb;
        
        $member_id = intval($_POST['member_id'] ?? 0);
        $name = sanitize_text_field($_POST['name'] ?? '');
        $phone = sanitize_text_field($_POST['phone'] ?? '');
        $department = sanitize_text_field($_POST['department'] ?? '');
        $status = sanitize_text_field($_POST['status'] ?? 'online');
        
        if ($member_id <= 0 || empty($name) || empty($phone)) {
            wp_send_json_error('بيانات غير صحيحة');
            return;
        }
        
        $result = $wpdb->update(
            $wpdb->prefix . 'wwp_team_members',
            array(
                'name' => $name,
                'phone' => $phone,
                'department' => $department,
                'status' => $status
            ),
            array('id' => $member_id),
            array('%s', '%s', '%s', '%s'),
            array('%d')
        );
        
        if ($result !== false) {
            wp_send_json_success('تم تعديل العضو بنجاح');
        } else {
            wp_send_json_error('حدث خطأ أثناء التعديل');
        }
    }
    
    /**
     * حذف عضو فريق عبر AJAX
     */
    public function ajax_delete_member() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false) || !current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
            return;
        }
        
        global $wpdb;
        
        $member_id = intval($_POST['member_id'] ?? 0);
        
        if ($member_id <= 0) {
            wp_send_json_error('معرف العضو غير صحيح');
            return;
        }
        
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
    
    /**
     * تسجيل النقرات عبر AJAX
     */
    public function ajax_record_click() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('فشل في التحقق من الأمان');
            return;
        }
        
        global $wpdb;
        
        $member_id = intval($_POST['member_id'] ?? 0);
        $event_type = sanitize_text_field($_POST['event_type'] ?? 'click');
        $page_url = esc_url_raw($_POST['page_url'] ?? '');
        
        $result = $wpdb->insert(
            $wpdb->prefix . 'wwp_statistics',
            array(
                'event_type' => $event_type,
                'member_id' => $member_id,
                'ip_address' => $this->get_user_ip(),
                'user_agent' => sanitize_text_field($_SERVER['HTTP_USER_AGENT'] ?? ''),
                'page_url' => $page_url,
                'session_id' => $this->get_session_id(),
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
    
    /**
     * إضافة تتبع Google Analytics
     */
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
    
    /**
     * الحصول على الإعدادات
     */
    public function get_settings() {
        $defaults = array(
            'show_widget' => true,
            'welcome_message' => 'مرحباً! كيف يمكنني مساعدتك؟',
            'widget_position' => 'bottom-right',
            'widget_color' => '#25D366',
            'auto_open' => false,
            'analytics_id' => '',
            'enable_analytics' => false,
            'show_offline_message' => true,
            'offline_message' => 'نحن غير متواجدين حالياً، لكن يمكنك ترك رسالة وسنتواصل معك قريباً.'
        );
        
        return wp_parse_args(get_option('wwp_settings', array()), $defaults);
    }
    
    /**
     * الحصول على أعضاء الفريق
     */
    public function get_team_members() {
        global $wpdb;
        
        return $wpdb->get_results(
            "SELECT * FROM {$wpdb->prefix}wwp_team_members ORDER BY display_order ASC, id ASC"
        );
    }
    
    /**
     * الحصول على أعضاء الفريق النشطين
     */
    public function get_active_team_members() {
        global $wpdb;
        
        return $wpdb->get_results(
            "SELECT * FROM {$wpdb->prefix}wwp_team_members WHERE status = 'online' ORDER BY display_order ASC, id ASC"
        );
    }
    
    /**
     * الحصول على إحصائيات الاستخدام
     */
    public function get_usage_stats() {
        global $wpdb;
        
        $stats_table = $wpdb->prefix . 'wwp_statistics';
        
        $stats = array();
        $stats['total_clicks'] = intval($wpdb->get_var(
            "SELECT COUNT(*) FROM $stats_table WHERE event_type = 'click' AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
        ));
        $stats['total_conversations'] = intval($wpdb->get_var(
            "SELECT COUNT(DISTINCT session_id) FROM $stats_table WHERE event_type = 'click' AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
        ));
        $stats['today_clicks'] = intval($wpdb->get_var(
            "SELECT COUNT(*) FROM $stats_table WHERE event_type = 'click' AND DATE(timestamp) = CURDATE()"
        ));
        $stats['this_week_clicks'] = intval($wpdb->get_var(
            "SELECT COUNT(*) FROM $stats_table WHERE event_type = 'click' AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
        ));
        
        return $stats;
    }
    
    /**
     * الحصول على إحصائيات مفصلة
     */
    public function get_detailed_stats() {
        global $wpdb;
        
        $stats_table = $wpdb->prefix . 'wwp_statistics';
        $team_table = $wpdb->prefix . 'wwp_team_members';
        
        // إحصائيات شاملة
        $stats = $this->get_usage_stats();
        
        // إحصائيات الأعضاء
        $member_stats = $wpdb->get_results(
            "SELECT t.name, t.department, COUNT(s.id) as clicks 
             FROM $team_table t 
             LEFT JOIN $stats_table s ON t.id = s.member_id AND s.event_type = 'click' 
             GROUP BY t.id 
             ORDER BY clicks DESC"
        );
        
        $stats['member_stats'] = $member_stats;
        
        return $stats;
    }
    
    /**
     * التحقق من أوقات العمل
     */
    private function is_working_hours() {
        $settings = $this->get_settings();
        
        if (!$settings['working_hours_enabled']) {
            return true;
        }
        
        $current_day = strtolower(date('l'));
        $current_time = date('H:i');
        
        $working_hours = $settings['working_hours'][$current_day] ?? null;
        
        if (!$working_hours) {
            return false;
        }
        
        return ($current_time >= $working_hours['start'] && $current_time <= $working_hours['end']);
    }
    
    /**
     * إنشاء ملفات الأصول
     */
    private function create_asset_files() {
        $assets_dir = WWP_PLUGIN_PATH . 'assets/';
        
        if (!file_exists($assets_dir)) {
            wp_mkdir_p($assets_dir);
        }
        
        // إنشاء ملفات CSS و JS إذا لم تكن موجودة
        if (!file_exists($assets_dir . 'admin-style.css')) {
            file_put_contents($assets_dir . 'admin-style.css', $this->get_admin_css());
        }
        
        if (!file_exists($assets_dir . 'admin-script.js')) {
            file_put_contents($assets_dir . 'admin-script.js', $this->get_admin_js());
        }
        
        if (!file_exists($assets_dir . 'frontend-style.css')) {
            file_put_contents($assets_dir . 'frontend-style.css', $this->get_frontend_css());
        }
        
        if (!file_exists($assets_dir . 'frontend-script.js')) {
            file_put_contents($assets_dir . 'frontend-script.js', $this->get_frontend_js());
        }
    }
    
    /**
     * وظائف مساعدة
     */
    private function get_user_ip() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return sanitize_text_field($_SERVER['HTTP_CLIENT_IP']);
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            return sanitize_text_field($_SERVER['HTTP_X_FORWARDED_FOR']);
        } else {
            return sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? '');
        }
    }
    
    private function get_session_id() {
        if (!session_id()) {
            session_start();
        }
        return session_id();
    }
    
    /**
     * أكواد CSS و JavaScript
     */
    private function get_admin_css() {
        return '.wwp-admin-wrap { direction: rtl; }
.wwp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 20px 0; }
.wwp-actions { display: flex; gap: 10px; }
.nav-tab-wrapper { border-bottom: 1px solid #ccd0d4; margin-bottom: 20px; }
.tab-content .tab-pane { display: none; }
.tab-content .tab-pane.active { display: block; }
.wwp-team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
.wwp-member-card { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.3s ease; }
.wwp-member-card:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.15); transform: translateY(-2px); }
.member-avatar { width: 60px; height: 60px; border-radius: 50%; background: #25D366; color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin: 0 auto 15px; }
.member-info h4 { margin: 0 0 10px 0; color: #333; }
.member-info .department { color: #666; font-size: 14px; margin: 5px 0; }
.member-info .phone { color: #25D366; font-weight: bold; margin: 5px 0; }
.status { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
.status-online { background: #d4edda; color: #155724; }
.status-offline { background: #f8d7da; color: #721c24; }
.member-actions { margin-top: 15px; display: flex; gap: 10px; justify-content: center; }
.wwp-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
.stat-card { background: #fff; padding: 30px 20px; border-radius: 8px; text-align: center; border: 1px solid #ddd; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.stat-number { font-size: 2.5em; font-weight: bold; color: #25D366; margin-bottom: 10px; }
.stat-label { color: #666; font-size: 14px; }
.wwp-modal { position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); }
.wwp-modal-content { background-color: #fff; margin: 5% auto; padding: 0; border-radius: 8px; width: 80%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
.wwp-modal-header { padding: 20px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; }
.wwp-modal-header h3 { margin: 0; }
.wwp-modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #666; }
.wwp-modal-body { padding: 20px; }
.wwp-modal-footer { padding: 20px; border-top: 1px solid #ddd; text-align: left; }
.wwp-empty-state { text-align: center; padding: 60px 20px; color: #666; }
.wwp-empty-state p { font-size: 16px; margin: 0; }
@media (max-width: 768px) { .wwp-header { flex-direction: column; gap: 15px; } .wwp-team-grid { grid-template-columns: 1fr; } .wwp-stats-grid { grid-template-columns: repeat(2, 1fr); } .wwp-modal-content { width: 95%; margin: 2% auto; } } @media (max-width: 480px) { .wwp-stats-grid { grid-template-columns: 1fr; } .member-actions { flex-direction: column; } }';
    }
    
    private function get_admin_js() {
        return '/* سكريبت لوحة الإدارة - WhatsApp Widget Pro */ jQuery(document).ready(function($) { "use strict"; $(".nav-tab").on("click", function(e) { e.preventDefault(); var targetTab = $(this).attr("href").substring(1); $(".nav-tab").removeClass("nav-tab-active"); $(".tab-pane").removeClass("active"); $(this).addClass("nav-tab-active"); $("#" + targetTab + "-tab").addClass("active"); localStorage.setItem("wwp_active_tab", targetTab); }); var activeTab = localStorage.getItem("wwp_active_tab"); if (activeTab) { $(".nav-tab[href=\'#" + activeTab + "\']").trigger("click"); } if (typeof $.fn.wpColorPicker !== "undefined") { $(".wwp-color-picker").wpColorPicker({ change: function(event, ui) { var color = ui.color.toString(); $(this).val(color); updateWidgetPreview(); } }); } $(".wwp-save-all").on("click", function(e) { e.preventDefault(); saveAllSettings(); }); $("input[type=\'checkbox\'], select, input[type=\'text\'], textarea").on("change", function() { updateWidgetPreview(); }); $(".wwp-add-member").on("click", function() { openMemberModal(); }); $(".wwp-edit-member").on("click", function() { var memberId = $(this).data("id"); editMember(memberId); }); $(".wwp-delete-member").on("click", function() { var memberId = $(this).data("id"); deleteMember(memberId); }); $(".wwp-modal-close, #cancel-member").on("click", function() { closeMemberModal(); }); $("#save-member").on("click", function() { saveMember(); }); $(window).on("click", function(e) { if ($(e.target).hasClass("wwp-modal")) { closeMemberModal(); } }); function saveAllSettings() { var $button = $(".wwp-save-all"); var originalText = $button.text(); $button.text("جاري الحفظ...").prop("disabled", true); var formData = new FormData(); formData.append("action", "wwp_save_settings"); formData.append("nonce", wwp_ajax.nonce); $("input[type=\'text\'], input[type=\'color\'], select, textarea").each(function() { if ($(this).attr("name")) { formData.append($(this).attr("name"), $(this).val()); } }); $("input[type=\'checkbox\']").each(function() { if ($(this).attr("name")) { formData.append($(this).attr("name"), $(this).is(":checked") ? "1" : "0"); } }); $.ajax({ url: wwp_ajax.ajax_url, type: "POST", data: formData, processData: false, contentType: false, success: function(response) { if (response.success) { showNotice("تم حفظ الإعدادات بنجاح!", "success"); } else { showNotice("حدث خطأ أثناء الحفظ: " + (response.data || "خطأ غير معروف"), "error"); } }, error: function(xhr, status, error) { console.error("AJAX Error:", error); showNotice("حدث خطأ في الاتصال بالخادم", "error"); }, complete: function() { $button.text(originalText).prop("disabled", false); } }); } function openMemberModal(memberData) { var isEdit = memberData && memberData.id; $("#modal-title").text(isEdit ? "تعديل عضو الفريق" : "إضافة عضو جديد"); if (isEdit) { $("#member-id").val(memberData.id); $("#member-name").val(memberData.name); $("#member-phone").val(memberData.phone); $("#member-department").val(memberData.department); $("#member-status").val(memberData.status); } else { $("#member-form")[0].reset(); $("#member-id").val(""); } $("#wwp-member-modal").fadeIn(300); } function closeMemberModal() { $("#wwp-member-modal").fadeOut(300); $("#member-form")[0].reset(); } function editMember(memberId) { var $memberCard = $(".wwp-member-card[data-id=\'" + memberId + "\']"); if ($memberCard.length) { var memberData = { id: memberId, name: $memberCard.find("h4").text(), phone: $memberCard.find(".phone").text(), department: $memberCard.find(".department").text(), status: $memberCard.find(".status").hasClass("status-online") ? "online" : "offline" }; openMemberModal(memberData); } } function saveMember() { var $form = $("#member-form"); var $button = $("#save-member"); var originalText = $button.text(); var name = $("#member-name").val().trim(); var phone = $("#member-phone").val().trim(); if (!name || !phone) { showNotice("الاسم ورقم الهاتف مطلوبان", "error"); return; } $button.text("جاري الحفظ...").prop("disabled", true); var memberId = $("#member-id").val(); var action = memberId ? "wwp_edit_member" : "wwp_add_member"; var formData = { action: action, nonce: wwp_ajax.nonce, member_id: memberId, name: name, phone: phone, department: $("#member-department").val().trim(), status: $("#member-status").val() }; $.post(wwp_ajax.ajax_url, formData) .done(function(response) { if (response.success) { showNotice(response.data || "تم حفظ العضو بنجاح!", "success"); closeMemberModal(); setTimeout(function() { window.location.reload(); }, 1000); } else { showNotice("حدث خطأ: " + (response.data || "خطأ غير معروف"), "error"); } }) .fail(function(xhr, status, error) { console.error("AJAX Error:", error); showNotice("حدث خطأ في الاتصال بالخادم", "error"); }) .always(function() { $button.text(originalText).prop("disabled", false); }); } function deleteMember(memberId) { if (!confirm("هل أنت متأكد من حذف هذا العضو؟ لا يمكن التراجع عن هذا الإجراء.")) { return; } var $memberCard = $(".wwp-member-card[data-id=\'" + memberId + "\']"); $memberCard.css("opacity", "0.5"); $.post(wwp_ajax.ajax_url, { action: "wwp_delete_member", nonce: wwp_ajax.nonce, member_id: memberId }) .done(function(response) { if (response.success) { $memberCard.fadeOut(400, function() { $(this).remove(); }); showNotice("تم حذف العضو بنجاح", "success"); } else { $memberCard.css("opacity", "1"); showNotice("حدث خطأ أثناء الحذف: " + (response.data || "خطأ غير معروف"), "error"); } }) .fail(function(xhr, status, error) { $memberCard.css("opacity", "1"); console.error("AJAX Error:", error); showNotice("حدث خطأ في الاتصال بالخادم", "error"); }); } function updateWidgetPreview() { var color = $("#widget_color").val() || "#25D366"; var position = $("#widget_position").val() || "bottom-right"; localStorage.setItem("wwp_preview_color", color); localStorage.setItem("wwp_preview_position", position); } function showNotice(message, type) { type = type || "info"; var $notice = $("<div class=\'notice notice-" + type + " is-dismissible\'><p>" + message + "</p></div>"); $(".wwp-admin-wrap").prepend($notice); setTimeout(function() { $notice.fadeOut(400, function() { $(this).remove(); }); }, 5000); $notice.on("click", ".notice-dismiss", function() { $notice.fadeOut(400, function() { $(this).remove(); }); }); } $("input[type=\'tel\'], input[type=\'phone\']").on("input", function() { var value = $(this).val(); if (value && !value.startsWith("+")) { $(this).val("+" + value.replace(/[^0-9]/g, "")); } }); $("#widget_color").on("input change", function() { var color = $(this).val(); $(".stat-number").css("color", color); $(".wwp-powered-by strong").css("color", color); }); });';
    }
    
    private function get_frontend_css() {
        return '/* نمط الواجهة الأمامية - WhatsApp Widget Pro */ #wwp-widget { position: fixed; z-index: 999999; font-family: "Segoe UI", Tahoma, Arial, sans-serif; direction: rtl; } #wwp-widget.bottom-right { bottom: 20px; right: 20px; } #wwp-widget.bottom-left { bottom: 20px; left: 20px; } #wwp-widget.top-right { top: 20px; right: 20px; } #wwp-widget.top-left { top: 20px; left: 20px; } .wwp-widget-button { width: 60px; height: 60px; border-radius: 50%; background: var(--widget-color, #25D366); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: all 0.3s ease; position: relative; overflow: hidden; } .wwp-widget-button:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(0,0,0,0.4); } .whatsapp-icon { transition: transform 0.3s ease; } .wwp-widget-button:hover .whatsapp-icon { transform: scale(1.1); } .wwp-notification-badge { position: absolute; top: -5px; right: -5px; background: #ff4444; color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; font-weight: bold; display: flex; align-items: center; justify-content: center; animation: pulse 2s infinite; } @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } } .wwp-chat-window { position: absolute; bottom: 75px; right: 0; width: 350px; max-height: 550px; background: white; border-radius: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.3); overflow: hidden; transform: translateY(20px); opacity: 0; transition: all 0.3s ease; border: 1px solid rgba(0,0,0,0.1); } .wwp-chat-window.show { transform: translateY(0); opacity: 1; } .wwp-chat-header { background: var(--widget-color, #25D366); color: white; padding: 20px; display: flex; align-items: center; justify-content: space-between; } .wwp-header-info { display: flex; align-items: center; gap: 12px; } .wwp-company-avatar { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; } .wwp-header-text h3 { margin: 0; font-size: 16px; font-weight: 600; } .wwp-status { margin: 2px 0 0 0; font-size: 12px; opacity: 0.9; } .wwp-close-chat { background: none; border: none; color: white; cursor: pointer; padding: 8px; border-radius: 50%; transition: background 0.2s ease; } .wwp-close-chat:hover { background: rgba(255,255,255,0.2); } .wwp-chat-body { padding: 20px; max-height: 400px; overflow-y: auto; } .wwp-welcome-message { margin-bottom: 20px; } .wwp-message-bubble { background: #f0f0f0; padding: 12px 16px; border-radius: 18px; border-bottom-right-radius: 4px; position: relative; max-width: 85%; } .wwp-message-time { font-size: 11px; color: #666; margin-top: 4px; display: block; } .wwp-section-title { font-size: 14px; color: #666; margin: 0 0 15px 0; font-weight: 500; } .wwp-team-list { display: flex; flex-direction: column; gap: 12px; } .wwp-team-member-item { display: flex; align-items: center; padding: 12px; border: 1px solid #e5e5e5; border-radius: 12px; cursor: pointer; transition: all 0.2s ease; background: white; } .wwp-team-member-item:hover { background: #f8f9fa; border-color: var(--widget-color, #25D366); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); } .wwp-team-member-item:active { transform: translateY(0); } .wwp-member-avatar { width: 45px; height: 45px; border-radius: 50%; position: relative; margin-left: 12px; flex-shrink: 0; } .wwp-member-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; } .wwp-avatar-placeholder { width: 100%; height: 100%; border-radius: 50%; background: var(--widget-color, #25D366); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; } .wwp-status-indicator { position: absolute; bottom: 2px; right: 2px; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; } .status-online { background: #4CAF50; } .status-offline { background: #9E9E9E; } .status-away { background: #FF9800; } .wwp-member-details { flex: 1; min-width: 0; } .wwp-member-name { margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .wwp-member-department { margin: 0 0 2px 0; font-size: 13px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .wwp-member-status { font-size: 12px; color: #4CAF50; font-weight: 500; } .wwp-chat-icon { color: var(--widget-color, #25D366); margin-right: 8px; flex-shrink: 0; } .wwp-no-agents { text-align: center; padding: 40px 20px; color: #666; } .wwp-no-agents-icon { margin-bottom: 15px; } .wwp-no-agents h4 { margin: 0 0 10px 0; color: #333; font-size: 16px; } .wwp-no-agents p { margin: 0; font-size: 14px; line-height: 1.5; } .wwp-chat-footer { padding: 12px 20px; border-top: 1px solid #f0f0f0; background: #fafafa; } .wwp-powered-by { text-align: center; font-size: 11px; color: #999; } .wwp-powered-by strong { color: var(--widget-color, #25D366); } @media (max-width: 480px) { #wwp-widget.bottom-left, #wwp-widget.bottom-right { bottom: 20px; left: 20px; right: 20px; } .wwp-chat-window { width: calc(100vw - 40px); right: 0; left: 0; margin: 0 auto; } .wwp-widget-button { position: fixed; bottom: 20px; right: 20px; } } @media (max-width: 360px) { .wwp-widget-button { width: 50px; height: 50px; } .whatsapp-icon { width: 20px; height: 20px; } .wwp-chat-window { bottom: 65px; } }';
    }
    
    private function get_frontend_js() {
        return '/* سكريبت الواجهة الأمامية - WhatsApp Widget Pro */ jQuery(document).ready(function($) { "use strict"; var chatOpen = false; var $chatWindow = $("#wwp-chat-window"); var $toggleButton = $("#wwp-toggle-chat"); var $closeButton = $("#wwp-close-chat"); $toggleButton.on("click", function() { if (chatOpen) { closeChat(); } else { openChat(); } }); $closeButton.on("click", function() { closeChat(); }); $(document).on("click", ".wwp-team-member-item", function() { var phone = $(this).data("phone"); var name = $(this).data("name"); var memberId = $(this).data("member-id"); var message = wwp_settings.welcome_message || "مرحباً! كيف يمكنني مساعدتك؟"; recordClick(memberId); var cleanPhone = phone.replace(/[^0-9+]/g, ""); var whatsappUrl = "https://wa.me/" + cleanPhone + "?text=" + encodeURIComponent(message); window.open(whatsappUrl, "_blank"); setTimeout(closeChat, 500); }); $(document).on("click", function(e) { if (chatOpen && !$(e.target).closest("#wwp-widget").length) { closeChat(); } }); function openChat() { chatOpen = true; $chatWindow.fadeIn(300).addClass("show"); $toggleButton.addClass("active"); $(".wwp-notification-badge").hide(); localStorage.setItem("wwp_chat_open", "true"); recordEvent("chat_open"); setTimeout(function() { var $body = $(".wwp-chat-body"); $body.scrollTop($body[0].scrollHeight); }, 300); } function closeChat() { chatOpen = false; $chatWindow.fadeOut(300).removeClass("show"); $toggleButton.removeClass("active"); localStorage.setItem("wwp_chat_open", "false"); } function recordClick(memberId) { if (!wwp_settings.ajax_url || !wwp_settings.nonce) { console.error("WhatsApp Widget: بيانات AJAX غير متوفرة"); return; } $.ajax({ url: wwp_settings.ajax_url, type: "POST", data: { action: "wwp_record_click", nonce: wwp_settings.nonce, member_id: memberId, event_type: "click", page_url: window.location.href }, success: function(response) { if (!response.success) { console.error("WhatsApp Widget: فشل تسجيل النقرة", response); } }, error: function(xhr, status, error) { console.error("WhatsApp Widget: خطأ AJAX", error); } }); } function recordEvent(eventType) { if (!wwp_settings.ajax_url || !wwp_settings.nonce) { return; } $.ajax({ url: wwp_settings.ajax_url, type: "POST", data: { action: "wwp_record_click", nonce: wwp_settings.nonce, event_type: eventType, page_url: window.location.href } }); } setTimeout(function() { if (!chatOpen) { $(".wwp-notification-badge").fadeIn(300); } }, 3000); var savedState = localStorage.getItem("wwp_chat_open"); if (savedState === "true") { setTimeout(openChat, 500); } $(".wwp-team-member-item").on("keydown", function(e) { if (e.which === 13 || e.which === 32) { $(this).trigger("click"); } }); $(window).on("load", function() { setTimeout(function() { $(".wwp-team-member-item").addClass("ready"); }, 500); }); });';
    }
}

// تشغيل الإضافة
new WhatsAppWidgetPro();
