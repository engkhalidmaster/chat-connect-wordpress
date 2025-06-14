
// PHP file generators for WordPress plugin
export const generateMainPluginFile = (settings: any) => {
  return `<?php
/**
 * Plugin Name: WhatsApp Widget Pro
 * Plugin URI: https://example.com/whatsapp-widget-pro
 * Description: Advanced WhatsApp widget with team management and analytics
 * Version: 2.1.0
 * Author: Your Name
 * License: GPL v2 or later
 * Text Domain: whatsapp-widget-pro
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit;
}

define('WWP_VERSION', '2.1.0');
define('WWP_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WWP_PLUGIN_PATH', plugin_dir_path(__FILE__));

// Include necessary files
require_once WWP_PLUGIN_PATH . 'install.php';

/**
 * Database management class
 */
class WWP_Database {
    
    public static function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Team members table
        $team_table = $wpdb->prefix . 'wwp_team_members';
        $team_sql = "CREATE TABLE $team_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            phone varchar(20) NOT NULL,
            department varchar(100) DEFAULT '',
            avatar varchar(255) DEFAULT '',
            status enum('online','offline','away','busy') DEFAULT 'online',
            display_order int(11) DEFAULT 0,
            working_hours_start time DEFAULT '09:00:00',
            working_hours_end time DEFAULT '17:00:00',
            working_days varchar(20) DEFAULT '1,2,3,4,5',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY status (status),
            KEY display_order (display_order)
        ) $charset_collate;";
        
        // Statistics table
        $stats_table = $wpdb->prefix . 'wwp_stats';
        $stats_sql = "CREATE TABLE $stats_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            date date NOT NULL,
            clicks int(11) DEFAULT 0,
            conversations int(11) DEFAULT 0,
            member_id mediumint(9) DEFAULT NULL,
            page_url varchar(255) DEFAULT '',
            user_ip varchar(45) DEFAULT '',
            user_agent text DEFAULT '',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY date_member_ip (date, member_id, user_ip),
            KEY date (date),
            KEY member_id (member_id),
            KEY user_ip (user_ip)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($team_sql);
        dbDelta($stats_sql);
        
        // Insert sample data
        self::insert_sample_data();
        
        // Save database version
        update_option('wwp_db_version', '2.1.0');
    }
    
    private static function insert_sample_data() {
        global $wpdb;
        
        $team_table = $wpdb->prefix . 'wwp_team_members';
        
        // Check if data already exists
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
        
        $stats['unique_ips'] = intval($wpdb->get_var(
            "SELECT COUNT(DISTINCT user_ip) FROM {$wpdb->prefix}wwp_stats WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
        ));
        
        return $stats;
    }
    
    public static function drop_tables() {
        global $wpdb;
        
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wwp_team_members");
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wwp_stats");
        
        delete_option('wwp_db_version');
        delete_option('wwp_settings');
    }
}

/**
 * AJAX handler class
 */
class WWP_Ajax {
    
    public function __construct() {
        add_action('wp_ajax_wwp_save_settings', array($this, 'save_settings'));
        add_action('wp_ajax_wwp_get_stats', array($this, 'get_stats'));
        add_action('wp_ajax_wwp_add_member', array($this, 'add_member'));
        add_action('wp_ajax_wwp_edit_member', array($this, 'edit_member'));
        add_action('wp_ajax_wwp_delete_member', array($this, 'delete_member'));
        add_action('wp_ajax_wwp_record_click', array($this, 'record_click'));
        
        // For non-logged users (frontend clicks)
        add_action('wp_ajax_nopriv_wwp_record_click', array($this, 'record_click'));
    }
    
    public function save_settings() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('Security check failed');
        }
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }
        
        $settings = array(
            'show_widget' => isset($_POST['show_widget']) ? sanitize_text_field($_POST['show_widget']) : '0',
            'welcome_message' => isset($_POST['welcome_message']) ? sanitize_textarea_field($_POST['welcome_message']) : '',
            'widget_position' => isset($_POST['widget_position']) ? sanitize_text_field($_POST['widget_position']) : 'bottom-right',
            'widget_color' => isset($_POST['widget_color']) ? sanitize_hex_color($_POST['widget_color']) : '#25D366',
            'analytics_id' => isset($_POST['analytics_id']) ? sanitize_text_field($_POST['analytics_id']) : '',
            'enable_analytics' => isset($_POST['enable_analytics']) ? sanitize_text_field($_POST['enable_analytics']) : '0'
        );
        
        $result = update_option('wwp_settings', $settings);
        
        if ($result !== false) {
            wp_send_json_success('Settings saved successfully');
        } else {
            wp_send_json_error('Failed to save settings');
        }
    }
    
    public function get_stats() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }
        
        $stats = WWP_Database::get_usage_stats();
        wp_send_json_success($stats);
    }
    
    public function record_click() {
        global $wpdb;
        
        $member_id = isset($_POST['member_id']) ? intval($_POST['member_id']) : 0;
        $today = current_time('Y-m-d');
        $user_ip = $_SERVER['REMOTE_ADDR'];
        $page_url = isset($_POST['page_url']) ? sanitize_text_field($_POST['page_url']) : '';
        $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field($_SERVER['HTTP_USER_AGENT']) : '';
        
        $result = $wpdb->query($wpdb->prepare(
            "INSERT INTO {$wpdb->prefix}wwp_stats (date, clicks, member_id, user_ip, page_url, user_agent) 
             VALUES (%s, 1, %d, %s, %s, %s) 
             ON DUPLICATE KEY UPDATE clicks = clicks + 1",
            $today, $member_id, $user_ip, $page_url, $user_agent
        ));
        
        if ($result !== false) {
            wp_send_json_success('Click recorded');
        } else {
            wp_send_json_error('Failed to record click');
        }
    }
    
    public function add_member() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('Security check failed');
        }
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
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
            wp_send_json_success('Member added successfully');
        } else {
            wp_send_json_error('Failed to add member');
        }
    }
    
    public function edit_member() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('Security check failed');
        }
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
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
            wp_send_json_success('Member updated successfully');
        } else {
            wp_send_json_error('Failed to update member');
        }
    }
    
    public function delete_member() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('Security check failed');
        }
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
        }
        
        global $wpdb;
        
        $result = $wpdb->delete(
            $wpdb->prefix . 'wwp_team_members',
            array('id' => intval($_POST['member_id'])),
            array('%d')
        );
        
        if ($result) {
            wp_send_json_success('Member deleted successfully');
        } else {
            wp_send_json_error('Failed to delete member');
        }
    }
}

class WhatsAppWidgetPro {
    
    private $ajax;
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('wp_footer', array($this, 'display_widget'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Initialize AJAX handler
        $this->ajax = new WWP_Ajax();
    }

    public function init() {
        load_plugin_textdomain('whatsapp-widget-pro', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }

    public function enqueue_frontend_scripts() {
        $settings = get_option('wwp_settings', array());
        
        if (!isset($settings['show_widget']) || $settings['show_widget'] !== '1') {
            return;
        }
        
        wp_enqueue_style('wwp-frontend-style', WWP_PLUGIN_URL . 'assets/frontend-style.css', array(), WWP_VERSION);
        wp_enqueue_script('wwp-frontend-script', WWP_PLUGIN_URL . 'assets/wwp-combined.js', array('jquery'), WWP_VERSION, true);
        
        wp_localize_script('wwp-frontend-script', 'wwp_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wwp_nonce'),
            'settings' => $settings
        ));
    }

    public function enqueue_admin_scripts($hook) {
        if ($hook !== 'toplevel_page_whatsapp-widget-pro') {
            return;
        }
        
        wp_enqueue_style('wwp-admin-style', WWP_PLUGIN_URL . 'assets/admin-style.css', array(), WWP_VERSION);
        wp_enqueue_script('wwp-admin-script', WWP_PLUGIN_URL . 'assets/admin-script.js', array('jquery'), WWP_VERSION, true);
        
        wp_localize_script('wwp-admin-script', 'wwp_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wwp_nonce')
        ));
    }

    public function add_admin_menu() {
        add_menu_page(
            __('WhatsApp Widget Pro', 'whatsapp-widget-pro'),
            __('WhatsApp Widget', 'whatsapp-widget-pro'),
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

    public function display_widget() {
        $settings = get_option('wwp_settings', array());
        
        if (!isset($settings['show_widget']) || $settings['show_widget'] !== '1') {
            return;
        }
        
        if (!empty($settings)) {
            include WWP_PLUGIN_PATH . 'templates/widget.php';
        }
    }

    public function activate() {
        // Create database tables
        WWP_Database::create_tables();
        
        // Set default settings
        $default_settings = array(
            'show_widget' => '1',
            'welcome_message' => __('مرحباً! كيف يمكنني مساعدتك؟', 'whatsapp-widget-pro'),
            'widget_position' => 'bottom-right',
            'widget_color' => '#25D366',
            'analytics_id' => '',
            'enable_analytics' => '0'
        );
        add_option('wwp_settings', $default_settings);
    }

    public function deactivate() {
        // Cleanup if needed
    }
}

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
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Delete options
delete_option('wwp_settings');
delete_option('wwp_db_version');

// Drop custom table
global $wpdb;
$table_name = $wpdb->prefix . 'wwp_team_members';
$wpdb->query("DROP TABLE IF EXISTS $table_name");

$stats_table = $wpdb->prefix . 'wwp_stats';
$wpdb->query("DROP TABLE IF EXISTS $stats_table");
?>`;
};
