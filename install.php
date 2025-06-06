
<?php
/**
 * WhatsApp Widget Pro - Installation Script
 */

if (!defined('ABSPATH')) {
    exit;
}

class WWP_Installer {
    
    public static function install() {
        self::create_tables();
        self::set_default_settings();
        self::create_upload_directory();
        
        // حفظ وقت التثبيت
        update_option('wwp_installed_date', current_time('mysql'));
        update_option('wwp_version', WWP_VERSION);
        
        // جدولة مهمة تنظيف الإحصائيات القديمة
        if (!wp_next_scheduled('wwp_cleanup_old_stats')) {
            wp_schedule_event(time(), 'daily', 'wwp_cleanup_old_stats');
        }
    }
    
    private static function create_tables() {
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
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY status (status),
            KEY display_order (display_order)
        ) $charset_collate;";
        
        // جدول الإحصائيات
        $stats_table = $wpdb->prefix . 'wwp_stats';
        $stats_sql = "CREATE TABLE $stats_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            date date NOT NULL,
            clicks int(11) DEFAULT 0,
            conversations int(11) DEFAULT 0,
            member_id mediumint(9) DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY date_member (date, member_id),
            KEY date (date),
            KEY member_id (member_id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($team_sql);
        dbDelta($stats_sql);
        
        // إضافة بيانات تجريبية
        self::insert_sample_data();
    }
    
    private static function set_default_settings() {
        $default_settings = array(
            'show_widget' => true,
            'welcome_message' => 'مرحباً! كيف يمكنني مساعدتك؟',
            'widget_position' => 'bottom-right',
            'widget_color' => '#25D366',
            'analytics_id' => '',
            'enable_analytics' => false,
            'show_on_mobile' => true,
            'show_on_pages' => array(),
            'hide_on_pages' => array(),
            'working_hours' => array(
                'enabled' => false,
                'timezone' => 'Asia/Riyadh',
                'days' => array(
                    'sunday' => array('start' => '09:00', 'end' => '17:00', 'enabled' => true),
                    'monday' => array('start' => '09:00', 'end' => '17:00', 'enabled' => true),
                    'tuesday' => array('start' => '09:00', 'end' => '17:00', 'enabled' => true),
                    'wednesday' => array('start' => '09:00', 'end' => '17:00', 'enabled' => true),
                    'thursday' => array('start' => '09:00', 'end' => '17:00', 'enabled' => true),
                    'friday' => array('start' => '09:00', 'end' => '17:00', 'enabled' => false),
                    'saturday' => array('start' => '09:00', 'end' => '17:00', 'enabled' => false)
                )
            )
        );
        
        add_option('wwp_settings', $default_settings);
    }
    
    private static function insert_sample_data() {
        global $wpdb;
        
        $team_table = $wpdb->prefix . 'wwp_team_members';
        
        // التحقق من وجود بيانات مسبقة
        $existing_count = $wpdb->get_var("SELECT COUNT(*) FROM $team_table");
        if ($existing_count > 0) {
            return;
        }
        
        $sample_members = array(
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
                'name' => 'خالد محمد',
                'phone' => '+966509876543',
                'department' => 'خدمة العملاء',
                'status' => 'away',
                'display_order' => 3
            )
        );
        
        foreach ($sample_members as $member) {
            $wpdb->insert(
                $team_table,
                $member,
                array('%s', '%s', '%s', '%s', '%d')
            );
        }
    }
    
    private static function create_upload_directory() {
        $upload_dir = wp_upload_dir();
        $plugin_upload_dir = $upload_dir['basedir'] . '/whatsapp-widget-pro';
        
        if (!file_exists($plugin_upload_dir)) {
            wp_mkdir_p($plugin_upload_dir);
            
            // إنشاء ملف .htaccess للحماية
            $htaccess_content = "Options -Indexes\n";
            $htaccess_content .= "<Files *.php>\n";
            $htaccess_content .= "deny from all\n";
            $htaccess_content .= "</Files>\n";
            
            file_put_contents($plugin_upload_dir . '/.htaccess', $htaccess_content);
            
            // إنشاء ملف index.php فارغ
            file_put_contents($plugin_upload_dir . '/index.php', '<?php // Silence is golden');
        }
    }
    
    public static function deactivate() {
        // إلغاء جدولة المهام المؤجلة
        wp_clear_scheduled_hook('wwp_cleanup_old_stats');
    }
}
