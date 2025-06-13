
<?php
/**
 * Plugin Name: WhatsApp Widget Pro
 * Description: إضافة احترافية لعرض زر WhatsApp مع تتبع Google Analytics ولو
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

/**
 * فئة إدارة قاعدة البيانات
 */
class WWP_Database {
    
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
        
        // حفظ إصدار قاعدة البيانات
        update_option('wwp_db_version', '1.0.0');
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
    
    public static function drop_tables() {
        global $wpdb;
        
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wwp_team_members");
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wwp_stats");
        
        delete_option('wwp_db_version');
        delete_option('wwp_settings');
    }
    
    public static function get_team_members() {
        global $wpdb;
        return $wpdb->get_results("SELECT * FROM {$wpdb->prefix}wwp_team_members ORDER BY display_order ASC");
    }
    
    public static function get_usage_stats() {
        global $wpdb;
        
        $stats = array();
        $stats['total_clicks'] = intval($wpdb->get_var(
            "SELECT SUM(clicks) FROM {$wpdb->prefix}wwp_stats WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
        ));
        
        $stats['total_conversations'] = intval($wpdb->get_var(
            "SELECT SUM(conversations) FROM {$wpdb->prefix}wwp_stats WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
        ));
        
        $stats['daily_stats'] = $wpdb->get_results(
            "SELECT date, SUM(clicks) as clicks, SUM(conversations) as conversations 
             FROM {$wpdb->prefix}wwp_stats 
             WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
             GROUP BY date ORDER BY date ASC"
        );
        
        return $stats;
    }
}

/**
 * فئة معالجة AJAX
 */
class WWP_Ajax {
    
    public function __construct() {
        add_action('wp_ajax_wwp_save_settings', array($this, 'save_settings'));
        add_action('wp_ajax_wwp_record_click', array($this, 'record_click'));
        add_action('wp_ajax_wwp_add_member', array($this, 'add_member'));
        add_action('wp_ajax_wwp_edit_member', array($this, 'edit_member'));
        add_action('wp_ajax_wwp_delete_member', array($this, 'delete_member'));
        add_action('wp_ajax_wwp_get_stats', array($this, 'get_stats'));
        
        // For non-logged users (frontend clicks)
        add_action('wp_ajax_nopriv_wwp_record_click', array($this, 'record_click'));
    }
    
    public function save_settings() {
        // التحقق من الصلاحيات والأمان
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('فشل في التحقق من الأمان');
        }
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
        }
        
        // تنظيف وحفظ الإعدادات
        $settings = array(
            'show_widget' => isset($_POST['show_widget']) ? sanitize_text_field($_POST['show_widget']) : '0',
            'welcome_message' => isset($_POST['welcome_message']) ? sanitize_textarea_field($_POST['welcome_message']) : '',
            'widget_position' => isset($_POST['widget_position']) ? sanitize_text_field($_POST['widget_position']) : 'bottom-right',
            'widget_color' => isset($_POST['widget_color']) ? sanitize_hex_color($_POST['widget_color']) : '#25D366',
            'analytics_id' => isset($_POST['analytics_id']) ? sanitize_text_field($_POST['analytics_id']) : '',
            'enable_analytics' => isset($_POST['enable_analytics']) ? sanitize_text_field($_POST['enable_analytics']) : '0'
        );
        
        // حفظ الإعدادات
        $result = update_option('wwp_settings', $settings);
        
        if ($result !== false) {
            wp_send_json_success('تم حفظ الإعدادات بنجاح');
        } else {
            wp_send_json_error('فشل في حفظ الإعدادات');
        }
    }
    
    public function record_click() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('فشل في التحقق من الأمان');
        }
        
        global $wpdb;
        $member_id = intval($_POST['member_id']);
        $today = current_time('Y-m-d');
        
        // تحديث أو إدراج إحصائيات اليوم
        $result = $wpdb->query($wpdb->prepare(
            "INSERT INTO {$wpdb->prefix}wwp_stats (date, clicks, member_id) 
             VALUES (%s, 1, %d) 
             ON DUPLICATE KEY UPDATE clicks = clicks + 1",
            $today, $member_id
        ));
        
        if ($result !== false) {
            wp_send_json_success('تم تسجيل النقرة');
        } else {
            wp_send_json_error('فشل في تسجيل النقرة');
        }
    }
    
    public function add_member() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('فشل في التحقق من الأمان');
        }
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
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
        }
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
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
        }
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
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
    
    public function get_stats() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
        }
        
        $stats = WWP_Database::get_usage_stats();
        wp_send_json_success($stats);
    }
}

/**
 * فئة الويدجت الرئيسية
 */
class WWP_Widget {
    
    private $settings;
    private $team_members;
    
    public function __construct() {
        $this->settings = $this->get_settings();
        $this->team_members = $this->get_team_members();
    }
    
    public function display() {
        if (!$this->settings['show_widget']) {
            return;
        }
        
        $settings = $this->settings;
        $team_members = $this->team_members;
        $available_members = array_filter($team_members, function($member) {
            return $member->status === 'online';
        });
        
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
        return WWP_Database::get_team_members();
    }
    
    public function enqueue_scripts() {
        if (!$this->settings['show_widget']) {
            return;
        }
        
        wp_enqueue_style(
            'wwp-frontend-style', 
            WWP_PLUGIN_URL . 'assets/frontend-style.css', 
            array(), 
            WWP_VERSION
        );
        
        wp_enqueue_script(
            'wwp-combined-script', 
            WWP_PLUGIN_URL . 'assets/wwp-combined.js', 
            array('jquery'), 
            WWP_VERSION, 
            true
        );
        
        // Add Google Analytics if enabled
        if ($this->settings['enable_analytics'] && !empty($this->settings['analytics_id'])) {
            $this->add_google_analytics();
        }
        
        wp_localize_script('wwp-combined-script', 'wwp_settings', array_merge($this->settings, array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wwp_nonce')
        )));
    }
    
    private function add_google_analytics() {
        $tracking_id = $this->settings['analytics_id'];
        ?>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr($tracking_id); ?>"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '<?php echo esc_js($tracking_id); ?>');
        </script>
        <?php
    }
}

/**
 * الفئة الرئيسية للإضافة
 */
class WhatsAppWidgetPro {
    
    private $widget;
    private $ajax;
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        
        // إنشاء جداول قاعدة البيانات عند التفعيل
        register_activation_hook(__FILE__, array($this, 'create_tables'));
        
        // حذف البيانات عند إلغاء التفعيل
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    public function init() {
        // تحميل ملفات الترجمة
        load_plugin_textdomain('whatsapp-widget-pro', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // إنشاء كائنات الفئات
        $this->widget = new WWP_Widget();
        $this->ajax = new WWP_Ajax();
        
        // إضافة القوائم الإدارية
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // تحميل الأصول
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        add_action('wp_enqueue_scripts', array($this->widget, 'enqueue_scripts'));
        
        // عرض الويدجت في الموقع
        add_action('wp_footer', array($this->widget, 'display'));
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
        wp_enqueue_script('wwp-combined-script', WWP_PLUGIN_URL . 'assets/wwp-combined.js', array('jquery'), WWP_VERSION, true);
        
        wp_localize_script('wwp-combined-script', 'wwp_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wwp_nonce')
        ));
    }
    
    public function admin_page() {
        $settings = $this->widget->get_settings();
        $team_members = $this->widget->get_team_members();
        $stats = WWP_Database::get_usage_stats();
        
        include WWP_PLUGIN_PATH . 'templates/admin-page.php';
    }
    
    public function create_tables() {
        WWP_Database::create_tables();
    }
    
    public function deactivate() {
        // يمكن إضافة عمليات تنظيف هنا إذا لزم الأمر
    }
}

// تفعيل الإضافة
new WhatsAppWidgetPro();
?>
