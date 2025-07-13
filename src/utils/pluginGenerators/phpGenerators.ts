
// PHP file generators for WordPress plugin
// Simplified main plugin file
export const generateMainPluginFile = (settings: any) => {
  return `<?php
/**
 * Plugin Name: WhatsApp Widget Pro
 * Plugin URI: https://your-website.com
 * Description: إضافة واتساب بسيطة وسريعة مع الميزات الأساسية
 * Version: 1.0.0
 * Author: Your Name
 * Text Domain: whatsapp-widget-pro
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Network: false
 */

// منع الوصول المباشر
if (!defined('ABSPATH')) {
    exit;
}

// Constants
define('WWP_VERSION', '1.0.0');
define('WWP_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WWP_PLUGIN_PATH', plugin_dir_path(__FILE__));

/**
 * WhatsApp Widget Pro - Main Class
 * إضافة واتساب مبسطة مع الميزات الأساسية فقط
 */
class WhatsAppWidgetPro {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    public function init() {
        // تحميل ملف الترجمة
        load_plugin_textdomain('whatsapp-widget-pro', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // خطافات الإدارة
        if (is_admin()) {
            add_action('admin_menu', array($this, 'admin_menu'));
            add_action('admin_enqueue_scripts', array($this, 'admin_scripts'));
            add_action('wp_ajax_save_wwp_settings', array($this, 'save_settings'));
        }
        
        // خطافات الواجهة الأمامية
        add_action('wp_enqueue_scripts', array($this, 'frontend_scripts'));
        add_action('wp_footer', array($this, 'render_widget'));
        add_action('wp_ajax_track_whatsapp_click', array($this, 'track_click'));
        add_action('wp_ajax_nopriv_track_whatsapp_click', array($this, 'track_click'));
    }
    
    public function activate() {
        // إنشاء الجداول والإعدادات الافتراضية
        $this->create_table();
        $this->set_default_settings();
    }
    
    public function deactivate() {
        // تنظيف مؤقت إذا لزم الأمر
    }
    
    private function create_table() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        $table_name = $wpdb->prefix . 'wwp_stats';
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            page_url varchar(255) NOT NULL,
            click_date datetime DEFAULT CURRENT_TIMESTAMP,
            ip_address varchar(45),
            PRIMARY KEY (id),
            KEY click_date (click_date)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        update_option('wwp_db_version', '1.0');
    }
    
    private function set_default_settings() {
        $default_settings = array(
            'phone_number' => '${settings.phone_number}',
            'welcome_message' => '${settings.welcome_message}',
            'position' => '${settings.position}',
            'widget_color' => '#25d366',
            'enabled' => '1'
        );
        
        add_option('wwp_settings', $default_settings);
        add_option('wwp_stats', array('total_clicks' => 0));
    }
    
    public function admin_menu() {
        add_options_page(
            __('WhatsApp Widget Pro', 'whatsapp-widget-pro'),
            __('WhatsApp Widget', 'whatsapp-widget-pro'),
            'manage_options',
            'whatsapp-widget-pro',
            array($this, 'admin_page')
        );
    }
    
    public function admin_page() {
        if (!current_user_can('manage_options')) {
            wp_die(__('غير مسموح لك بالوصول إلى هذه الصفحة.', 'whatsapp-widget-pro'));
        }
        
        include_once WWP_PLUGIN_PATH . 'templates/admin-page.php';
    }
    
    public function admin_scripts($hook) {
        if ($hook !== 'settings_page_whatsapp-widget-pro') {
            return;
        }
        
        wp_enqueue_style('wp-color-picker');
        wp_enqueue_script('wp-color-picker');
        wp_enqueue_style('wwp-style', WWP_PLUGIN_URL . 'assets/style.css', array(), WWP_VERSION);
        wp_enqueue_script('wwp-script', WWP_PLUGIN_URL . 'assets/script.js', array('jquery', 'wp-color-picker'), WWP_VERSION, true);
        
        wp_localize_script('wwp-script', 'wwp_admin', array(
            'nonce' => wp_create_nonce('wwp_admin_nonce')
        ));
    }
    
    public function frontend_scripts() {
        $settings = get_option('wwp_settings', array());
        
        if (empty($settings['enabled']) || empty($settings['phone_number'])) {
            return;
        }
        
        wp_enqueue_style('wwp-style', WWP_PLUGIN_URL . 'assets/style.css', array(), WWP_VERSION);
        wp_enqueue_script('wwp-script', WWP_PLUGIN_URL . 'assets/script.js', array('jquery'), WWP_VERSION, true);
        
        wp_localize_script('wwp-script', 'wwp_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wwp_frontend_nonce')
        ));
    }
    
    public function render_widget() {
        $settings = get_option('wwp_settings', array());
        
        if (empty($settings['enabled']) || empty($settings['phone_number'])) {
            return;
        }
        
        $phone = esc_attr($settings['phone_number']);
        $message = esc_attr($settings['welcome_message']);
        $position = esc_attr($settings['position']);
        $color = esc_attr($settings['widget_color']);
        
        $whatsapp_url = 'https://wa.me/' . str_replace(array('+', ' ', '-'), '', $phone) . '?text=' . urlencode($message);
        ?>
        <div id="whatsapp-widget" class="whatsapp-widget <?php echo $position; ?>">
            <button class="whatsapp-button" style="background-color: <?php echo $color; ?>;">
                📱
            </button>
            <div class="whatsapp-popup">
                <div class="whatsapp-header">
                    <h4><?php _e('تحدث معنا', 'whatsapp-widget-pro'); ?></h4>
                    <button class="whatsapp-close">×</button>
                </div>
                <div class="whatsapp-body">
                    <p><?php echo esc_html($message); ?></p>
                    <a href="<?php echo esc_url($whatsapp_url); ?>" target="_blank" class="whatsapp-chat-btn">
                        <?php _e('بدء المحادثة', 'whatsapp-widget-pro'); ?>
                    </a>
                </div>
            </div>
        </div>
        <?php
    }
    
    public function save_settings() {
        check_ajax_referer('wwp_settings_nonce', 'wwp_nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('غير مسموح', 'whatsapp-widget-pro'));
        }
        
        $settings = array(
            'enabled' => sanitize_text_field($_POST['wwp_enabled'] ?? '0'),
            'phone_number' => sanitize_text_field($_POST['wwp_phone_number'] ?? ''),
            'welcome_message' => sanitize_textarea_field($_POST['wwp_welcome_message'] ?? ''),
            'position' => sanitize_text_field($_POST['wwp_position'] ?? 'bottom-right'),
            'widget_color' => sanitize_hex_color($_POST['wwp_widget_color'] ?? '#25d366')
        );
        
        update_option('wwp_settings', $settings);
        wp_send_json_success(__('تم حفظ الإعدادات بنجاح', 'whatsapp-widget-pro'));
    }
    
    public function track_click() {
        if (!check_ajax_referer('wwp_frontend_nonce', 'nonce', false)) {
            wp_send_json_error('Invalid nonce');
        }
        
        global $wpdb;
        
        $page_url = sanitize_url($_POST['page_url'] ?? '');
        $ip_address = sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? '');
        
        // إدراج النقرة في قاعدة البيانات
        $wpdb->insert(
            $wpdb->prefix . 'wwp_stats',
            array(
                'page_url' => $page_url,
                'ip_address' => $ip_address,
                'click_date' => current_time('mysql')
            ),
            array('%s', '%s', '%s')
        );
        
        // تحديث العداد الإجمالي
        $stats = get_option('wwp_stats', array('total_clicks' => 0));
        $stats['total_clicks'] = intval($stats['total_clicks']) + 1;
        update_option('wwp_stats', $stats);
        
        wp_send_json_success();
    }
}

// تشغيل الإضافة
new WhatsAppWidgetPro();
?>`;
};

export const generateInstallFile = () => {
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}

function wwp_install() {
    global $wpdb;
    
    $table_name = $wpdb->prefix . 'whatsapp_analytics';
    
    $charset_collate = $wpdb->get_charset_collate();
    
    $sql = "CREATE TABLE $table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        user_ip varchar(100) DEFAULT '' NOT NULL,
        page_url text DEFAULT '' NOT NULL,
        click_time datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        user_agent text DEFAULT '' NOT NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
    
    add_option('wwp_db_version', '1.0');
}

register_activation_hook(__FILE__, 'wwp_install');
?>`;
};

export const generateUninstallFile = () => {
  return `<?php
/**
 * WhatsApp Widget Pro - Uninstall Script
 * تنظيف البيانات عند إلغاء تثبيت الإضافة
 */

// إذا لم يتم استدعاء uninstall من ووردبريس، فاخرج
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// حذف الجداول
global $wpdb;
$wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wwp_stats");

// حذف الإعدادات
delete_option('wwp_settings');
delete_option('wwp_stats');
delete_option('wwp_db_version');

// حذف أي ملفات مؤقتة أو cache
$upload_dir = wp_upload_dir();
$plugin_uploads = $upload_dir['basedir'] . '/whatsapp-widget-pro/';

if (is_dir($plugin_uploads)) {
    // حذف المجلد وجميع محتوياته
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($plugin_uploads, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );

    foreach ($files as $fileinfo) {
        $todo = ($fileinfo->isDir() ? 'rmdir' : 'unlink');
        $todo($fileinfo->getRealPath());
    }

    rmdir($plugin_uploads);
}`;
};
