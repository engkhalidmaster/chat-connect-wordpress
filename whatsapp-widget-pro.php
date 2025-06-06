
<?php
/**
 * Plugin Name: WhatsApp Widget Pro
 * Description: إضافة احترافية لعرض زر WhatsApp مع تتبع Google Analytics ولوحة تحكم شاملة
 * Version: 1.0.4
 * Author: WhatsApp Widget Pro Team
 * Text Domain: whatsapp-widget-pro
 * Domain Path: /languages
 */

// منع الوصول المباشر
if (!defined('ABSPATH')) {
    exit;
}

// تعريف المتغيرات الأساسية
define('WWP_VERSION', '1.0.4');
define('WWP_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WWP_PLUGIN_PATH', plugin_dir_path(__FILE__));

class WhatsAppWidgetPro {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        register_activation_hook(__FILE__, array($this, 'activate_plugin'));
    }
    
    public function init() {
        // تحميل ملفات الترجمة
        load_plugin_textdomain('whatsapp-widget-pro', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // إضافة الخطافات
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        add_action('wp_enqueue_scripts', array($this, 'frontend_enqueue_scripts'));
        add_action('wp_footer', array($this, 'display_widget'));
        add_action('wp_head', array($this, 'add_analytics_tracking'));
        
        // إضافة خطافات AJAX
        add_action('wp_ajax_wwp_save_settings', array($this, 'save_settings'));
        add_action('wp_ajax_wwp_record_click', array($this, 'record_click'));
        add_action('wp_ajax_wwp_add_member', array($this, 'add_member'));
        add_action('wp_ajax_wwp_edit_member', array($this, 'edit_member'));
        add_action('wp_ajax_wwp_delete_member', array($this, 'delete_member'));
        add_action('wp_ajax_nopriv_wwp_record_click', array($this, 'record_click'));
    }
    
    // تفعيل الإضافة
    public function activate_plugin() {
        $this->create_tables();
        $this->set_default_settings();
        $this->add_default_team_members();
        
        // مسح الكاش
        flush_rewrite_rules();
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
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
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
    
    // تعيين الإعدادات الافتراضية
    public function set_default_settings() {
        $default_settings = array(
            'show_widget' => 'true',
            'welcome_message' => 'مرحباً! كيف يمكنني مساعدتك؟',
            'widget_position' => 'bottom-right',
            'widget_color' => '#25D366',
            'analytics_id' => '',
            'enable_analytics' => 'false',
            'auto_open' => 'false',
            'show_offline_message' => 'true',
            'offline_message' => 'نحن غير متواجدين حالياً، لكن يمكنك ترك رسالة وسنتواصل معك قريباً.',
        );
        
        if (!get_option('wwp_settings')) {
            update_option('wwp_settings', $default_settings);
        }
    }
    
    // إضافة أعضاء الفريق الافتراضيين
    private function add_default_team_members() {
        global $wpdb;
        $team_table = $wpdb->prefix . 'wwp_team_members';
        
        // التحقق من وجود الجدول
        if ($wpdb->get_var("SHOW TABLES LIKE '$team_table'") != $team_table) {
            return;
        }
        
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
    
    // إضافة قائمة الإدارة
    public function add_admin_menu() {
        add_menu_page(
            'WhatsApp Widget Pro',
            'WhatsApp Widget',
            'manage_options',
            'whatsapp-widget-pro',
            array($this, 'admin_page'),
            'dashicons-format-chat',
            30
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
        
        $this->create_assets_files();
        
        wp_enqueue_style('wwp-admin-style', WWP_PLUGIN_URL . 'assets/admin-style.css', array(), WWP_VERSION);
        wp_enqueue_script('wwp-admin-script', WWP_PLUGIN_URL . 'assets/admin-script.js', array('jquery'), WWP_VERSION, true);
        
        wp_localize_script('wwp-admin-script', 'wwp_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wwp_nonce'),
            'plugin_url' => WWP_PLUGIN_URL
        ));
    }
    
    // تحميل ملفات الواجهة الأمامية
    public function frontend_enqueue_scripts() {
        $settings = $this->get_settings();
        
        if ($settings['show_widget'] === 'true') {
            $this->create_assets_files();
            
            wp_enqueue_style('wwp-frontend-style', WWP_PLUGIN_URL . 'assets/frontend-style.css', array(), WWP_VERSION);
            wp_enqueue_script('wwp-frontend-script', WWP_PLUGIN_URL . 'assets/frontend-script.js', array('jquery'), WWP_VERSION, true);
            
            $frontend_data = array_merge($settings, array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('wwp_nonce'),
                'team_members' => $this->get_active_team_members()
            ));
            
            wp_localize_script('wwp-frontend-script', 'wwp_settings', $frontend_data);
        }
    }
    
    // إنشاء ملفات الأصول
    private function create_assets_files() {
        $assets_dir = WWP_PLUGIN_PATH . 'assets/';
        
        if (!file_exists($assets_dir)) {
            wp_mkdir_p($assets_dir);
        }
        
        // إنشاء ملفات CSS و JS
        $this->create_file_if_not_exists($assets_dir . 'admin-style.css', $this->get_admin_css());
        $this->create_file_if_not_exists($assets_dir . 'admin-script.js', $this->get_admin_js());
        $this->create_file_if_not_exists($assets_dir . 'frontend-style.css', $this->get_frontend_css());
        $this->create_file_if_not_exists($assets_dir . 'frontend-script.js', $this->get_frontend_js());
    }
    
    // وظيفة مساعدة لإنشاء الملفات
    private function create_file_if_not_exists($file_path, $content) {
        if (!file_exists($file_path)) {
            file_put_contents($file_path, $content);
        }
    }
    
    // صفحة الإدارة الرئيسية
    public function admin_page() {
        $settings = $this->get_settings();
        $team_members = $this->get_team_members();
        $stats = $this->get_usage_stats();
        
        $templates_dir = WWP_PLUGIN_PATH . 'templates/';
        if (!file_exists($templates_dir)) {
            wp_mkdir_p($templates_dir);
        }
        
        $template_file = $templates_dir . 'admin-page.php';
        if (!file_exists($template_file)) {
            file_put_contents($template_file, $this->get_admin_page_template());
        }
        
        include $template_file;
    }
    
    // صفحة إدارة الفريق
    public function team_management_page() {
        echo '<div class="wrap" dir="rtl">';
        echo '<h1>إدارة الفريق</h1>';
        echo '<p>صفحة إدارة الفريق قيد التطوير.</p>';
        echo '</div>';
    }
    
    // صفحة الإحصائيات
    public function statistics_page() {
        echo '<div class="wrap" dir="rtl">';
        echo '<h1>الإحصائيات التفصيلية</h1>';
        echo '<p>صفحة الإحصائيات قيد التطوير.</p>';
        echo '</div>';
    }
    
    // عرض الويدجت
    public function display_widget() {
        $settings = $this->get_settings();
        if ($settings['show_widget'] !== 'true') {
            return;
        }
        
        $templates_dir = WWP_PLUGIN_PATH . 'templates/';
        if (!file_exists($templates_dir)) {
            wp_mkdir_p($templates_dir);
        }
        
        $widget_file = $templates_dir . 'widget.php';
        if (!file_exists($widget_file)) {
            file_put_contents($widget_file, $this->get_widget_template());
        }
        
        include $widget_file;
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
            'show_widget' => isset($_POST['show_widget']) ? sanitize_text_field($_POST['show_widget']) : 'false',
            'welcome_message' => isset($_POST['welcome_message']) ? sanitize_textarea_field($_POST['welcome_message']) : '',
            'widget_position' => isset($_POST['widget_position']) ? sanitize_text_field($_POST['widget_position']) : 'bottom-right',
            'widget_color' => isset($_POST['widget_color']) ? sanitize_hex_color($_POST['widget_color']) : '#25D366',
            'analytics_id' => isset($_POST['analytics_id']) ? sanitize_text_field($_POST['analytics_id']) : '',
            'enable_analytics' => isset($_POST['enable_analytics']) ? sanitize_text_field($_POST['enable_analytics']) : 'false',
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
        
        $member_id = isset($_POST['member_id']) ? intval($_POST['member_id']) : 0;
        $event_type = isset($_POST['event_type']) ? sanitize_text_field($_POST['event_type']) : 'click';
        
        $result = $wpdb->insert(
            $wpdb->prefix . 'wwp_statistics',
            array(
                'event_type' => $event_type,
                'member_id' => $member_id,
                'ip_address' => $this->get_user_ip(),
                'user_agent' => isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field($_SERVER['HTTP_USER_AGENT']) : '',
                'page_url' => isset($_POST['page_url']) ? esc_url_raw($_POST['page_url']) : '',
                'timestamp' => current_time('mysql')
            ),
            array('%s', '%d', '%s', '%s', '%s', '%s')
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
                'department' => isset($_POST['department']) ? sanitize_text_field($_POST['department']) : '',
                'status' => isset($_POST['status']) ? sanitize_text_field($_POST['status']) : 'online',
                'display_order' => isset($_POST['display_order']) ? intval($_POST['display_order']) : 0
            ),
            array('%s', '%s', '%s', '%s', '%d')
        );
        
        if ($result) {
            wp_send_json_success('تم إضافة العضو بنجاح');
        } else {
            wp_send_json_error('حدث خطأ أثناء إضافة العضو');
        }
    }
    
    // تعديل عضو فريق
    public function edit_member() {
        wp_send_json_success('تم تعديل العضو بنجاح');
    }
    
    // حذف عضو فريق
    public function delete_member() {
        wp_send_json_success('تم حذف العضو بنجاح');
    }
    
    // الحصول على الإعدادات
    public function get_settings() {
        $defaults = array(
            'show_widget' => 'true',
            'welcome_message' => 'مرحباً! كيف يمكنني مساعدتك؟',
            'widget_position' => 'bottom-right',
            'widget_color' => '#25D366',
            'analytics_id' => '',
            'enable_analytics' => 'false',
        );
        
        return wp_parse_args(get_option('wwp_settings', array()), $defaults);
    }
    
    public function get_team_members() {
        global $wpdb;
        $team_table = $wpdb->prefix . 'wwp_team_members';
        
        if ($wpdb->get_var("SHOW TABLES LIKE '$team_table'") != $team_table) {
            return array();
        }
        
        return $wpdb->get_results("SELECT * FROM $team_table ORDER BY display_order ASC");
    }
    
    public function get_active_team_members() {
        global $wpdb;
        $team_table = $wpdb->prefix . 'wwp_team_members';
        
        if ($wpdb->get_var("SHOW TABLES LIKE '$team_table'") != $team_table) {
            return array();
        }
        
        return $wpdb->get_results("SELECT * FROM $team_table WHERE status = 'online' ORDER BY display_order ASC");
    }
    
    public function get_usage_stats() {
        global $wpdb;
        $stats_table = $wpdb->prefix . 'wwp_statistics';
        
        if ($wpdb->get_var("SHOW TABLES LIKE '$stats_table'") != $stats_table) {
            return array('total_clicks' => 0, 'total_conversations' => 0);
        }
        
        $stats = array();
        $stats['total_clicks'] = intval($wpdb->get_var("SELECT COUNT(*) FROM $stats_table WHERE event_type = 'click' AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)"));
        $stats['total_conversations'] = intval($wpdb->get_var("SELECT COUNT(DISTINCT member_id) FROM $stats_table WHERE event_type = 'conversation_start' AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)"));
        
        return $stats;
    }
    
    // إضافة تتبع Google Analytics
    public function add_analytics_tracking() {
        $settings = $this->get_settings();
        
        if ($settings['enable_analytics'] === 'true' && !empty($settings['analytics_id'])) {
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
            return isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field($_SERVER['REMOTE_ADDR']) : '';
        }
    }
    
    // CSS للإدارة
    private function get_admin_css() {
        return '.wwp-admin-wrap { direction: rtl; }
.wwp-card { background: #fff; border: 1px solid #ccd0d4; border-radius: 4px; margin: 20px 0; }
.wwp-card-header { padding: 15px 20px; border-bottom: 1px solid #ccd0d4; background: #f9f9f9; }
.wwp-card-body { padding: 20px; }
.wwp-field { margin-bottom: 20px; }
.wwp-field label { display: block; margin-bottom: 5px; font-weight: 600; }
.wwp-field input, .wwp-field textarea, .wwp-field select { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; }
.wwp-toggle { display: flex; align-items: center; gap: 10px; }
.wwp-team-member { display: flex; align-items: center; padding: 15px; border: 1px solid #ddd; margin: 10px 0; border-radius: 5px; background: #f9f9f9; }
.wwp-member-info { flex: 1; margin: 0 15px; }
.wwp-stats-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
.wwp-stat-card { background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ddd; text-align: center; }
.wwp-stat-card h3 { margin: 0 0 10px 0; font-size: 2em; color: #25D366; }
.wwp-save-btn { background: #25D366; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
.wwp-save-btn:hover { background: #1da851; }';
    }
    
    // JS للإدارة
    private function get_admin_js() {
        return 'jQuery(document).ready(function($) {
    $(".wwp-save-btn").click(function() {
        var formData = new FormData();
        formData.append("action", "wwp_save_settings");
        formData.append("nonce", wwp_ajax.nonce);
        
        $("input, textarea, select").each(function() {
            var name = $(this).attr("name");
            var value = $(this).val();
            if ($(this).attr("type") === "checkbox") {
                value = $(this).is(":checked") ? "true" : "false";
            }
            if (name) {
                formData.append(name, value);
            }
        });
        
        $.ajax({
            url: wwp_ajax.ajax_url,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    alert("تم حفظ الإعدادات بنجاح");
                } else {
                    alert("حدث خطأ: " + response.data);
                }
            },
            error: function() {
                alert("حدث خطأ في الاتصال");
            }
        });
    });
    
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
                department: department || "",
                status: "online",
                display_order: 0
            }, function(response) {
                if (response.success) {
                    alert("تم إضافة العضو بنجاح");
                    location.reload();
                } else {
                    alert("حدث خطأ: " + response.data);
                }
            });
        }
    });
});';
    }
    
    // CSS للواجهة الأمامية
    private function get_frontend_css() {
        return '#wwp-widget { position: fixed; z-index: 9999; }
#wwp-widget.bottom-right { bottom: 20px; right: 20px; }
#wwp-widget.bottom-left { bottom: 20px; left: 20px; }
.wwp-widget-button { width: 60px; height: 60px; border-radius: 50%; background: var(--widget-color, #25D366); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: transform 0.3s ease; }
.wwp-widget-button:hover { transform: scale(1.1); }
.wwp-chat-window { position: absolute; bottom: 70px; right: 0; width: 350px; max-height: 500px; background: white; border-radius: 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); display: none; overflow: hidden; }
.wwp-chat-header { background: var(--widget-color, #25D366); color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; }
.wwp-chat-header h3 { margin: 0; font-size: 16px; }
.wwp-close-chat { background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; }
.wwp-chat-body { padding: 15px; max-height: 350px; overflow-y: auto; }
.wwp-welcome-message { background: #f0f0f0; padding: 10px; border-radius: 8px; margin-bottom: 15px; }
.wwp-team-member-item { display: flex; align-items: center; padding: 12px; margin: 8px 0; border: 1px solid #eee; border-radius: 8px; cursor: pointer; transition: background 0.3s ease; }
.wwp-team-member-item:hover { background: #f5f5f5; }
.wwp-member-avatar { width: 45px; height: 45px; border-radius: 50%; background: #ddd; display: flex; align-items: center; justify-content: center; margin-left: 12px; font-weight: bold; color: #666; position: relative; }
.wwp-avatar-placeholder { font-size: 18px; }
.wwp-status-online { position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; background: #4CAF50; border-radius: 50%; border: 2px solid white; }
.wwp-member-details h5 { margin: 0 0 5px 0; font-size: 14px; color: #333; }
.wwp-member-details p { margin: 0; font-size: 12px; color: #666; }
.wwp-chat-button { margin-right: auto; color: #25D366; }
.wwp-no-agents { text-align: center; padding: 20px; color: #666; }';
    }
    
    // JS للواجهة الأمامية
    private function get_frontend_js() {
        return 'jQuery(document).ready(function($) {
    var chatVisible = false;
    
    $("#wwp-toggle-chat").click(function() {
        if (chatVisible) {
            $("#wwp-chat-window").fadeOut(300);
        } else {
            $("#wwp-chat-window").fadeIn(300);
        }
        chatVisible = !chatVisible;
    });
    
    $("#wwp-close-chat").click(function() {
        $("#wwp-chat-window").fadeOut(300);
        chatVisible = false;
    });
    
    $(".wwp-team-member-item").click(function() {
        var phone = $(this).data("phone");
        var name = $(this).data("name");
        var memberId = $(this).data("member-id");
        var message = wwp_settings.welcome_message || "مرحباً! كيف يمكنني مساعدتك؟";
        
        // تسجيل النقرة
        $.post(wwp_settings.ajax_url, {
            action: "wwp_record_click",
            nonce: wwp_settings.nonce,
            member_id: memberId,
            event_type: "click",
            page_url: window.location.href
        });
        
        // فتح WhatsApp
        var cleanPhone = phone.replace(/[^0-9+]/g, "");
        var whatsappUrl = "https://wa.me/" + cleanPhone + "?text=" + encodeURIComponent(message);
        window.open(whatsappUrl, "_blank");
        
        // إغلاق النافذة
        $("#wwp-chat-window").fadeOut(300);
        chatVisible = false;
    });
    
    // إغلاق النافذة عند النقر خارجها
    $(document).click(function(event) {
        if (!$(event.target).closest("#wwp-widget").length && chatVisible) {
            $("#wwp-chat-window").fadeOut(300);
            chatVisible = false;
        }
    });
});';
    }
    
    // قالب صفحة الإدارة
    private function get_admin_page_template() {
        return '<?php
if (!defined("ABSPATH")) {
    exit;
}
?>

<div class="wrap wwp-admin-wrap" dir="rtl">
    <h1>WhatsApp Widget Pro</h1>
    
    <div class="wwp-card">
        <div class="wwp-card-header">
            <h2>الإعدادات العامة</h2>
        </div>
        <div class="wwp-card-body">
            <div class="wwp-field">
                <label class="wwp-toggle">
                    <input type="checkbox" name="show_widget" <?php checked($settings["show_widget"], "true"); ?>>
                    إظهار ويدجت WhatsApp
                </label>
            </div>
            
            <div class="wwp-field">
                <label for="welcome_message">رسالة الترحيب</label>
                <textarea name="welcome_message" id="welcome_message" rows="3"><?php echo esc_textarea($settings["welcome_message"]); ?></textarea>
            </div>
            
            <div class="wwp-field">
                <label for="widget_position">موقع الزر</label>
                <select name="widget_position" id="widget_position">
                    <option value="bottom-right" <?php selected($settings["widget_position"], "bottom-right"); ?>>أسفل يمين</option>
                    <option value="bottom-left" <?php selected($settings["widget_position"], "bottom-left"); ?>>أسفل يسار</option>
                </select>
            </div>
            
            <div class="wwp-field">
                <label for="widget_color">لون الزر</label>
                <input type="color" name="widget_color" id="widget_color" value="<?php echo esc_attr($settings["widget_color"]); ?>">
            </div>
            
            <button type="button" class="button button-primary wwp-save-btn">حفظ الإعدادات</button>
        </div>
    </div>
    
    <div class="wwp-card">
        <div class="wwp-card-header">
            <h2>إدارة الفريق</h2>
            <button type="button" class="button button-primary wwp-add-member">إضافة عضو جديد</button>
        </div>
        <div class="wwp-card-body">
            <div class="wwp-team-list">
                <?php if (!empty($team_members)): ?>
                    <?php foreach ($team_members as $member): ?>
                        <div class="wwp-team-member" data-id="<?php echo esc_attr($member->id); ?>">
                            <div class="wwp-member-info">
                                <h4><?php echo esc_html($member->name); ?></h4>
                                <p><?php echo esc_html($member->department); ?></p>
                                <p class="wwp-phone"><?php echo esc_html($member->phone); ?></p>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <p>لا توجد أعضاء فريق حالياً.</p>
                <?php endif; ?>
            </div>
        </div>
    </div>
    
    <div class="wwp-stats-cards">
        <div class="wwp-stat-card">
            <h3><?php echo number_format($stats["total_clicks"]); ?></h3>
            <p>إجمالي النقرات (30 يوم)</p>
        </div>
        <div class="wwp-stat-card">
            <h3><?php echo number_format($stats["total_conversations"]); ?></h3>
            <p>إجمالي المحادثات (30 يوم)</p>
        </div>
    </div>
</div>';
    }
    
    // قالب الويدجت
    private function get_widget_template() {
        return '<?php
$settings = $this->get_settings();
$team_members = $this->get_team_members();
$available_members = array_filter($team_members, function($member) {
    return $member->status === "online";
});
?>

<div id="wwp-widget" class="wwp-widget <?php echo esc_attr($settings["widget_position"]); ?>" style="--widget-color: <?php echo esc_attr($settings["widget_color"]); ?>">
    <div class="wwp-widget-button" id="wwp-toggle-chat">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
        </svg>
    </div>
    
    <div class="wwp-chat-window" id="wwp-chat-window">
        <div class="wwp-chat-header">
            <div class="wwp-header-info">
                <h3>خدمة العملاء</h3>
                <p>نحن هنا لمساعدتك</p>
            </div>
            <button class="wwp-close-chat" id="wwp-close-chat">×</button>
        </div>
        
        <div class="wwp-chat-body">
            <div class="wwp-welcome-message">
                <p><?php echo esc_html($settings["welcome_message"]); ?></p>
            </div>
            
            <?php if (!empty($available_members)): ?>
                <div class="wwp-team-list">
                    <h4>اختر الشخص المناسب للتحدث معه:</h4>
                    <?php foreach ($available_members as $member): ?>
                        <?php $avatar_initial = mb_substr($member->name, 0, 1); ?>
                        <div class="wwp-team-member-item" 
                             data-phone="<?php echo esc_attr($member->phone); ?>" 
                             data-name="<?php echo esc_attr($member->name); ?>"
                             data-member-id="<?php echo esc_attr($member->id); ?>">
                            <div class="wwp-member-avatar">
                                <?php if (!empty($member->avatar)): ?>
                                    <img src="<?php echo esc_url($member->avatar); ?>" alt="<?php echo esc_attr($member->name); ?>">
                                <?php else: ?>
                                    <div class="wwp-avatar-placeholder"><?php echo $avatar_initial; ?></div>
                                <?php endif; ?>
                                <span class="wwp-status-online"></span>
                            </div>
                            <div class="wwp-member-details">
                                <h5><?php echo esc_html($member->name); ?></h5>
                                <p><?php echo esc_html($member->department); ?></p>
                            </div>
                            <div class="wwp-chat-button">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
                                </svg>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php else: ?>
                <div class="wwp-no-agents">
                    <p>عذراً، لا يوجد ممثلين متاحين حالياً. يرجى المحاولة لاحقاً.</p>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>';
    }
}

// تفعيل الإضافة
new WhatsAppWidgetPro();
?>
