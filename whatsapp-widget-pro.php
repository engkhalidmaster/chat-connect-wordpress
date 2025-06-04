
<?php
/**
 * Plugin Name: WhatsApp Widget Pro
 * Description: إضافة احترافية لعرض زر WhatsApp مع تتبع Google Analytics ولوحة تحكم شاملة
 * Version: 1.0.2
 * Author: WhatsApp Widget Pro Team
 * Text Domain: whatsapp-widget-pro
 * Domain Path: /languages
 */

// منع الوصول المباشر
if (!defined('ABSPATH')) {
    exit;
}

// تعريف المتغيرات الأساسية
define('WWP_VERSION', '1.0.2');
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
        add_action('wp_ajax_wwp_generate_report', array($this, 'generate_report'));
    }
    
    // استيراد الإعدادات المحفوظة من التطبيق
    public function import_saved_settings() {
        // محاولة استيراد الإعدادات إذا كانت متوفرة
        $default_settings = array(
            'show_widget' => true,
            'welcome_message' => 'مرحباً! كيف يمكنني مساعدتك؟',
            'widget_position' => 'bottom-right',
            'widget_color' => '#25D366',
            'analytics_id' => '',
            'enable_analytics' => false,
            'auto_open' => false,
            'show_offline_message' => true,
            'offline_message' => 'نحن غير متواجدين حالياً، لكن يمكنك ترك رسالة وسنتواصل معك قريباً.',
            'business_hours' => array(
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
        
        // حفظ الإعدادات الافتراضية إذا لم تكن موجودة
        if (!get_option('wwp_settings')) {
            update_option('wwp_settings', $default_settings);
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
                ),
                array(
                    'name' => 'خالد محمد',
                    'phone' => '+966509876543',
                    'department' => 'خدمة العملاء',
                    'status' => 'away',
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
    
    // إنشاء جداول قاعدة البيانات المحدثة
    public function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // جدول أعضاء الفريق المحدث
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
        
        // جدول الإحصائيات المحدث
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
        
        // جدول المحادثات
        $conversations_table = $wpdb->prefix . 'wwp_conversations';
        $conversations_sql = "CREATE TABLE $conversations_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            member_id mediumint(9) NOT NULL,
            visitor_ip varchar(45) DEFAULT NULL,
            visitor_data text DEFAULT NULL,
            started_at datetime DEFAULT CURRENT_TIMESTAMP,
            status enum('active','closed','pending') DEFAULT 'active',
            PRIMARY KEY (id),
            KEY member_id (member_id),
            KEY status (status)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($team_sql);
        dbDelta($stats_sql);
        dbDelta($conversations_sql);
    }
    
    // إضافة قائمة الإدارة
    public function add_admin_menu() {
        $hook = add_menu_page(
            'WhatsApp Widget Pro',
            'WhatsApp Widget',
            'manage_options',
            'whatsapp-widget-pro',
            array($this, 'admin_page'),
            'dashicons-whatsapp',
            30
        );
        
        // إضافة صفحات فرعية
        add_submenu_page(
            'whatsapp-widget-pro',
            'الإعدادات العامة',
            'الإعدادات العامة',
            'manage_options',
            'whatsapp-widget-pro',
            array($this, 'admin_page')
        );
        
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
    
    // تحميل ملفات الإدارة
    public function admin_enqueue_scripts($hook) {
        if (strpos($hook, 'whatsapp-widget-pro') === false && strpos($hook, 'wwp-') === false) {
            return;
        }
        
        // إنشاء ملفات CSS و JS إذا لم تكن موجودة
        $this->create_assets_files();
        
        wp_enqueue_style('wwp-admin-style', WWP_PLUGIN_URL . 'assets/admin-style.css', array(), WWP_VERSION);
        wp_enqueue_script('wwp-admin-script', WWP_PLUGIN_URL . 'assets/admin-script.js', array('jquery', 'wp-color-picker'), WWP_VERSION, true);
        
        // إضافة مكتبة اختيار الألوان
        wp_enqueue_style('wp-color-picker');
        
        wp_localize_script('wwp-admin-script', 'wwp_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wwp_nonce'),
            'plugin_url' => WWP_PLUGIN_URL
        ));
    }
    
    // تحميل ملفات الواجهة الأمامية
    public function frontend_enqueue_scripts() {
        $settings = $this->get_settings();
        
        if ($settings['show_widget']) {
            $this->create_assets_files();
            
            wp_enqueue_style('wwp-frontend-style', WWP_PLUGIN_URL . 'assets/frontend-style.css', array(), WWP_VERSION);
            wp_enqueue_script('wwp-frontend-script', WWP_PLUGIN_URL . 'assets/frontend-script.js', array('jquery'), WWP_VERSION, true);
            
            wp_localize_script('wwp-frontend-script', 'wwp_settings', array_merge($settings, array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('wwp_nonce'),
                'team_members' => $this->get_active_team_members()
            )));
        }
    }
    
    // إنشاء ملفات الأصول إذا لم تكن موجودة
    private function create_assets_files() {
        $assets_dir = WWP_PLUGIN_PATH . 'assets/';
        
        if (!file_exists($assets_dir)) {
            wp_mkdir_p($assets_dir);
        }
        
        // إنشاء ملف CSS للإدارة
        if (!file_exists($assets_dir . 'admin-style.css')) {
            $admin_css = $this->get_admin_css();
            file_put_contents($assets_dir . 'admin-style.css', $admin_css);
        }
        
        // إنشاء ملف JS للإدارة
        if (!file_exists($assets_dir . 'admin-script.js')) {
            $admin_js = $this->get_admin_js();
            file_put_contents($assets_dir . 'admin-script.js', $admin_js);
        }
        
        // إنشاء ملف CSS للواجهة الأمامية
        if (!file_exists($assets_dir . 'frontend-style.css')) {
            $frontend_css = $this->get_frontend_css();
            file_put_contents($assets_dir . 'frontend-style.css', $frontend_css);
        }
        
        // إنشاء ملف JS للواجهة الأمامية
        if (!file_exists($assets_dir . 'frontend-script.js')) {
            $frontend_js = $this->get_frontend_js();
            file_put_contents($assets_dir . 'frontend-script.js', $frontend_js);
        }
    }
    
    // صفحة الإدارة الرئيسية
    public function admin_page() {
        $settings = $this->get_settings();
        $team_members = $this->get_team_members();
        $stats = $this->get_usage_stats();
        
        include WWP_PLUGIN_PATH . 'templates/admin-page.php';
    }
    
    // صفحة إدارة الفريق
    public function team_management_page() {
        $team_members = $this->get_team_members();
        echo '<div class="wrap">';
        echo '<h1>إدارة الفريق</h1>';
        include WWP_PLUGIN_PATH . 'templates/team-management.php';
        echo '</div>';
    }
    
    // صفحة الإحصائيات
    public function statistics_page() {
        $stats = $this->get_detailed_stats();
        echo '<div class="wrap">';
        echo '<h1>الإحصائيات التفصيلية</h1>';
        include WWP_PLUGIN_PATH . 'templates/statistics.php';
        echo '</div>';
    }
    
    // عرض الويدجت
    public function display_widget() {
        $settings = $this->get_settings();
        if (!$settings['show_widget']) {
            return;
        }
        
        // التحقق من ساعات العمل
        if ($settings['business_hours']['enabled'] && !$this->is_business_hours()) {
            return;
        }
        
        include WWP_PLUGIN_PATH . 'templates/widget.php';
    }
    
    // معالجة طلبات AJAX
    public function handle_ajax_requests() {
        if (!wp_doing_ajax()) {
            return;
        }
        
        add_action('wp_ajax_wwp_save_settings', array($this, 'save_settings'));
        add_action('wp_ajax_wwp_record_click', array($this, 'record_click'));
        add_action('wp_ajax_wwp_add_member', array($this, 'add_member'));
        add_action('wp_ajax_wwp_edit_member', array($this, 'edit_member'));
        add_action('wp_ajax_wwp_delete_member', array($this, 'delete_member'));
        add_action('wp_ajax_wwp_backup_settings', array($this, 'backup_settings'));
        add_action('wp_ajax_wwp_restore_settings', array($this, 'restore_settings'));
        add_action('wp_ajax_wwp_get_stats', array($this, 'get_ajax_stats'));
        add_action('wp_ajax_wwp_update_member_status', array($this, 'update_member_status'));
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
            'show_widget' => sanitize_text_field($_POST['show_widget'] ?? 'false'),
            'welcome_message' => sanitize_textarea_field($_POST['welcome_message'] ?? ''),
            'widget_position' => sanitize_text_field($_POST['widget_position'] ?? 'bottom-right'),
            'widget_color' => sanitize_hex_color($_POST['widget_color'] ?? '#25D366'),
            'analytics_id' => sanitize_text_field($_POST['analytics_id'] ?? ''),
            'enable_analytics' => sanitize_text_field($_POST['enable_analytics'] ?? 'false'),
            'auto_open' => sanitize_text_field($_POST['auto_open'] ?? 'false'),
            'show_offline_message' => sanitize_text_field($_POST['show_offline_message'] ?? 'true'),
            'offline_message' => sanitize_textarea_field($_POST['offline_message'] ?? ''),
            'business_hours' => $this->sanitize_business_hours($_POST['business_hours'] ?? array())
        );
        
        update_option('wwp_settings', $settings);
        wp_send_json_success('تم حفظ الإعدادات بنجاح');
    }
    
    // تسجيل النقرات مع تفاصيل إضافية
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
                'display_order' => intval($_POST['display_order']),
                'working_hours' => wp_json_encode($_POST['working_hours'] ?? array())
            ),
            array('%s', '%s', '%s', '%s', '%d', '%s')
        );
        
        if ($result) {
            wp_send_json_success('تم إضافة العضو بنجاح');
        } else {
            wp_send_json_error('حدث خطأ أثناء إضافة العضو');
        }
    }
    
    // باقي الوظائف...
    public function get_settings() {
        $defaults = array(
            'show_widget' => true,
            'welcome_message' => 'مرحباً! كيف يمكنني مساعدتك؟',
            'widget_position' => 'bottom-right',
            'widget_color' => '#25D366',
            'analytics_id' => '',
            'enable_analytics' => false,
            'auto_open' => false,
            'show_offline_message' => true,
            'offline_message' => 'نحن غير متواجدين حالياً، لكن يمكنك ترك رسالة وسنتواصل معك قريباً.',
            'business_hours' => array('enabled' => false)
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
        $stats['daily_stats'] = $wpdb->get_results("SELECT DATE(timestamp) as date, COUNT(*) as clicks FROM {$wpdb->prefix}wwp_statistics WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY DATE(timestamp) ORDER BY date ASC");
        
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
    
    private function sanitize_business_hours($hours) {
        // تنظيف وتصحيح بيانات ساعات العمل
        return wp_json_encode($hours);
    }
    
    private function is_business_hours() {
        // التحقق من ساعات العمل
        return true; // مؤقتاً
    }
    
    // CSS للإدارة
    private function get_admin_css() {
        return '
        .wwp-admin-wrap { direction: rtl; }
        .wwp-card { background: #fff; border: 1px solid #ccd0d4; border-radius: 4px; margin: 20px 0; }
        .wwp-card-header { padding: 15px 20px; border-bottom: 1px solid #ccd0d4; }
        .wwp-card-body { padding: 20px; }
        .wwp-field { margin-bottom: 20px; }
        .wwp-field label { display: block; margin-bottom: 5px; font-weight: 600; }
        .wwp-toggle { display: flex; align-items: center; gap: 10px; }
        .wwp-team-member { display: flex; align-items: center; padding: 15px; border: 1px solid #ddd; margin: 10px 0; border-radius: 5px; }
        .wwp-member-info { flex: 1; margin: 0 15px; }
        .wwp-stats-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .wwp-stat-card { background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ddd; text-align: center; }
        ';
    }
    
    // JS للإدارة
    private function get_admin_js() {
        return '
        jQuery(document).ready(function($) {
            // تفعيل منتقي الألوان
            $(".color-picker").wpColorPicker();
            
            // حفظ الإعدادات
            $(".wwp-save-btn").click(function() {
                var formData = new FormData();
                formData.append("action", "wwp_save_settings");
                formData.append("nonce", wwp_ajax.nonce);
                
                // جمع البيانات من النموذج
                $("input, textarea, select").each(function() {
                    formData.append($(this).attr("name"), $(this).val());
                });
                
                $.ajax({
                    url: wwp_ajax.ajax_url,
                    type: "POST",
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function(response) {
                        alert("تم حفظ الإعدادات بنجاح");
                    }
                });
            });
            
            // إضافة عضو فريق
            $(".wwp-add-member").click(function() {
                var name = prompt("اسم العضو:");
                var phone = prompt("رقم الهاتف:");
                var department = prompt("القسم:");
                
                if (name && phone) {
                    $.post(wwp_ajax.ajax_url, {
                        action: "wwp_add_member",
                        nonce: wwp_ajax.nonce,
                        name: name,
                        phone: phone,
                        department: department,
                        status: "online",
                        display_order: 0
                    }, function(response) {
                        if (response.success) {
                            location.reload();
                        }
                    });
                }
            });
        });
        ';
    }
    
    // CSS للواجهة الأمامية
    private function get_frontend_css() {
        return '
        #wwp-widget { position: fixed; z-index: 9999; }
        #wwp-widget.bottom-right { bottom: 20px; right: 20px; }
        #wwp-widget.bottom-left { bottom: 20px; left: 20px; }
        .wwp-widget-button { width: 60px; height: 60px; border-radius: 50%; background: var(--widget-color, #25D366); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .wwp-chat-window { position: absolute; bottom: 70px; right: 0; width: 300px; height: 400px; background: white; border-radius: 10px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); display: none; }
        .wwp-chat-header { background: var(--widget-color, #25D366); color: white; padding: 15px; border-radius: 10px 10px 0 0; }
        .wwp-chat-body { padding: 15px; height: 300px; overflow-y: auto; }
        .wwp-team-member-item { display: flex; align-items: center; padding: 10px; margin: 5px 0; border: 1px solid #eee; border-radius: 5px; cursor: pointer; }
        .wwp-team-member-item:hover { background: #f5f5f5; }
        .wwp-member-avatar { width: 40px; height: 40px; border-radius: 50%; background: #ddd; display: flex; align-items: center; justify-content: center; margin-left: 10px; }
        ';
    }
    
    // JS للواجهة الأمامية
    private function get_frontend_js() {
        return '
        jQuery(document).ready(function($) {
            var chatVisible = false;
            
            // فتح/إغلاق نافذة الدردشة
            $("#wwp-toggle-chat").click(function() {
                if (chatVisible) {
                    $("#wwp-chat-window").fadeOut();
                } else {
                    $("#wwp-chat-window").fadeIn();
                }
                chatVisible = !chatVisible;
            });
            
            // إغلاق النافذة
            $("#wwp-close-chat").click(function() {
                $("#wwp-chat-window").fadeOut();
                chatVisible = false;
            });
            
            // النقر على عضو الفريق
            $(".wwp-team-member-item").click(function() {
                var phone = $(this).data("phone");
                var name = $(this).data("name");
                var memberId = $(this).data("member-id");
                var message = wwp_settings.welcome_message;
                
                // تسجيل النقرة
                $.post(wwp_ajax.ajax_url, {
                    action: "wwp_record_click",
                    nonce: wwp_ajax.nonce,
                    member_id: memberId,
                    event_type: "click",
                    page_url: window.location.href
                });
                
                // فتح WhatsApp
                var whatsappUrl = "https://wa.me/" + phone.replace(/\+/, "") + "?text=" + encodeURIComponent(message);
                window.open(whatsappUrl, "_blank");
            });
        });
        ';
    }
}

// تفعيل الإضافة
new WhatsAppWidgetPro();
?>
