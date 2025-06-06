
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
        
        // إنشاء جداول قاعدة البيانات عند التفعيل
        register_activation_hook(__FILE__, array($this, 'create_tables'));
        
        // تحميل فئات AJAX
        add_action('init', array($this, 'load_ajax_handlers'));
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
    
    public function load_ajax_handlers() {
        // تحميل فئة AJAX
        require_once WWP_PLUGIN_PATH . 'includes/class-wwp-ajax.php';
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
        
        // التأكد من تمرير البيانات بشكل صحيح
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
