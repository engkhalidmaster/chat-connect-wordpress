<?php
/**
 * Plugin Name: WhatsApp Widget Pro
 * Description: إضافة احترافية لعرض زر WhatsApp مع تتبع Google Analytics ولوحة تحكم شاملة
 * Version: 1.0.0
 * Author: WhatsApp Widget Pro Team
 * Text Domain: whatsapp-widget-pro
 * Domain Path: /languages
 */

// منع الوصول المباشر
if (!defined('ABSPATH')) {
    exit;
}

// تعريف المتغيرات الأساسية
define('WWP_VERSION', '1.0.0');
define('WWP_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WWP_PLUGIN_PATH', plugin_dir_path(__FILE__));

class WhatsAppWidgetPro {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        
        // تأكد من عدم إرسال الترويسات مسبقاً قبل معالجة AJAX
        add_action('wp_loaded', array($this, 'handle_ajax_requests'));
        
        // إنشاء جداول قاعدة البيانات عند التفعيل
        register_activation_hook(__FILE__, array($this, 'create_tables'));
    }
    
    public function init() {
        // تحميل ملفات الترجمة
        load_plugin_textdomain('whatsapp-widget-pro', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // إضافة القوائم الإدارية
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // تحميل الأصول
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        add_action('wp_enqueue_scripts', array($this, 'frontend_enqueue_scripts'));
        
        // عرض الويدجت في الموقع
        add_action('wp_footer', array($this, 'display_widget'));
    }
    
    public function handle_ajax_requests() {
        // التحقق من طلبات AJAX فقط
        if (!wp_doing_ajax()) {
            return;
        }
        
        // إضافة معالجات AJAX
        add_action('wp_ajax_wwp_save_settings', array($this, 'save_settings'));
        add_action('wp_ajax_wwp_record_click', array($this, 'record_click'));
        add_action('wp_ajax_wwp_add_member', array($this, 'add_member'));
        add_action('wp_ajax_wwp_edit_member', array($this, 'edit_member'));
        add_action('wp_ajax_wwp_delete_member', array($this, 'delete_member'));
        add_action('wp_ajax_wwp_backup_settings', array($this, 'backup_settings'));
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
    
    public function admin_enqueue_scripts($hook) {
        if ($hook != 'toplevel_page_whatsapp-widget-pro') {
            return;
        }
        
        wp_enqueue_style('wwp-admin-style', WWP_PLUGIN_URL . 'assets/admin-style.css', array(), WWP_VERSION);
        wp_enqueue_script('wwp-admin-script', WWP_PLUGIN_URL . 'assets/admin-script.js', array('jquery'), WWP_VERSION, true);
        
        wp_localize_script('wwp-admin-script', 'wwp_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wwp_nonce')
        ));
    }
    
    public function frontend_enqueue_scripts() {
        $settings = $this->get_settings();
        if ($settings['show_widget']) {
            wp_enqueue_style('wwp-frontend-style', WWP_PLUGIN_URL . 'assets/frontend-style.css', array(), WWP_VERSION);
            wp_enqueue_script('wwp-frontend-script', WWP_PLUGIN_URL . 'assets/frontend-script.js', array('jquery'), WWP_VERSION, true);
            
            wp_localize_script('wwp-frontend-script', 'wwp_settings', array_merge($settings, array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('wwp_nonce')
            )));
        }
    }
    
    public function admin_page() {
        $settings = $this->get_settings();
        $team_members = $this->get_team_members();
        $stats = $this->get_usage_stats();
        
        include WWP_PLUGIN_PATH . 'templates/admin-page.php';
    }
    
    public function display_widget() {
        $settings = $this->get_settings();
        if (!$settings['show_widget']) {
            return;
        }
        
        include WWP_PLUGIN_PATH . 'templates/widget.php';
    }
    
    public function save_settings() {
        // التحقق من الصلاحيات والأمان
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('فشل في التحقق من الأمان');
            return;
        }
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
            return;
        }
        
        $settings = array(
            'show_widget' => sanitize_text_field($_POST['show_widget']),
            'welcome_message' => sanitize_textarea_field($_POST['welcome_message']),
            'widget_position' => sanitize_text_field($_POST['widget_position']),
            'widget_color' => sanitize_hex_color($_POST['widget_color']),
            'analytics_id' => sanitize_text_field($_POST['analytics_id']),
            'enable_analytics' => sanitize_text_field($_POST['enable_analytics'])
        );
        
        update_option('wwp_settings', $settings);
        wp_send_json_success('تم حفظ الإعدادات بنجاح');
    }
    
    public function record_click() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('فشل في التحقق من الأمان');
            return;
        }
        
        global $wpdb;
        $member_id = intval($_POST['member_id']);
        $today = current_time('Y-m-d');
        
        // تحديث أو إدراج إحصائيات اليوم
        $wpdb->query($wpdb->prepare(
            "INSERT INTO {$wpdb->prefix}wwp_stats (date, clicks, member_id) 
             VALUES (%s, 1, %d) 
             ON DUPLICATE KEY UPDATE clicks = clicks + 1",
            $today, $member_id
        ));
        
        wp_send_json_success('تم تسجيل النقرة');
    }
    
    public function add_member() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('فشل في التحقق من الأمان');
            return;
        }
        
        if (!current_user_can('manage_options')) {
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
    
    public function edit_member() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('فشل في التحقق من الأمان');
            return;
        }
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
            return;
        }
        
        global $wpdb;
        
        $result = $wpdb->update(
            $wpdb->prefix . 'wwp_team_members',
            array(
                'name' => sanitize_text_field($_POST['name']),
                'phone' => sanitize_text_field($_POST['phone']),
                'department' => sanitize_text_field($_POST['department']),
                'status' => sanitize_text_field($_POST['status']),
                'display_order' => intval($_POST['display_order'])
            ),
            array('id' => intval($_POST['member_id'])),
            array('%s', '%s', '%s', '%s', '%d'),
            array('%d')
        );
        
        if ($result !== false) {
            wp_send_json_success('تم تحديث بيانات العضو بنجاح');
        } else {
            wp_send_json_error('حدث خطأ أثناء تحديث بيانات العضو');
        }
    }
    
    public function delete_member() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('فشل في التحقق من الأمان');
            return;
        }
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
            return;
        }
        
        global $wpdb;
        
        $result = $wpdb->delete(
            $wpdb->prefix . 'wwp_team_members',
            array('id' => intval($_POST['member_id'])),
            array('%d')
        );
        
        if ($result) {
            wp_send_json_success('تم حذف العضو بنجاح');
        } else {
            wp_send_json_error('حدث خطأ أثناء حذف العضو');
        }
    }
    
    public function backup_settings() {
        // التحقق من الصلاحيات والأمان
        if (!check_ajax_referer('wwp_nonce', 'nonce', false) || !current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
            return;
        }
        
        $backup_data = array(
            'timestamp' => current_time('mysql'),
            'settings' => get_option('wwp_settings', array()),
            'team_members' => $this->get_team_members(),
            'plugin_version' => WWP_VERSION
        );
        
        wp_send_json_success(array(
            'data' => $backup_data,
            'filename' => 'whatsapp-widget-backup-' . date('Y-m-d') . '.json'
        ));
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
    
    public function get_usage_stats() {
        global $wpdb;
        
        $stats = array();
        $stats['total_clicks'] = intval($wpdb->get_var("SELECT SUM(clicks) FROM {$wpdb->prefix}wwp_stats WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY)"));
        $stats['total_conversations'] = intval($wpdb->get_var("SELECT SUM(conversations) FROM {$wpdb->prefix}wwp_stats WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY)"));
        $stats['daily_stats'] = $wpdb->get_results("SELECT date, clicks, conversations FROM {$wpdb->prefix}wwp_stats WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY) ORDER BY date ASC");
        
        return $stats;
    }
    
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
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        // جدول الإحصائيات
        $stats_table = $wpdb->prefix . 'wwp_stats';
        $stats_sql = "CREATE TABLE $stats_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            date date NOT NULL,
            clicks int(11) DEFAULT 0,
            conversations int(11) DEFAULT 0,
            member_id mediumint(9) DEFAULT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY date_member (date, member_id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($team_sql);
        dbDelta($stats_sql);
        
        // إضافة بيانات تجريبية
        $this->insert_sample_data();
    }
    
    private function insert_sample_data() {
        global $wpdb;
        
        $team_table = $wpdb->prefix . 'wwp_team_members';
        
        // التحقق من وجود بيانات مسبقة
        $existing_count = $wpdb->get_var("SELECT COUNT(*) FROM $team_table");
        if ($existing_count > 0) {
            return; // تجنب إضافة البيانات التجريبية مرة أخرى
        }
        
        $sample_members = array(
            array('محمد أحمد', '+966501234567', 'المبيعات', 'online', 1),
            array('فاطمة علي', '+966507654321', 'الدعم الفني', 'online', 2),
            array('خالد محمد', '+966509876543', 'خدمة العملاء', 'away', 3)
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

// تفعيل الإضافة
new WhatsAppWidgetPro();
?>
