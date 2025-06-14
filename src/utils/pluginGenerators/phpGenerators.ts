
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

class WhatsAppWidgetPro {
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('wp_footer', array($this, 'display_widget'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }

    public function init() {
        load_plugin_textdomain('whatsapp-widget-pro', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }

    public function enqueue_frontend_scripts() {
        wp_enqueue_style('wwp-frontend-style', WWP_PLUGIN_URL . 'assets/frontend-style.css', array(), WWP_VERSION);
        wp_enqueue_script('wwp-frontend-script', WWP_PLUGIN_URL . 'assets/wwp-combined.js', array('jquery'), WWP_VERSION, true);
        
        $settings = get_option('whatsapp_widget_settings', array());
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
        $settings = get_option('whatsapp_widget_settings', array());
        if (!empty($settings['phone_number'])) {
            include WWP_PLUGIN_PATH . 'templates/widget.php';
        }
    }

    public function activate() {
        $default_settings = array(
            'phone_number' => '',
            'welcome_message' => __('Hello! How can we help you?', 'whatsapp-widget-pro'),
            'position' => 'bottom-right',
            'theme' => 'green',
            'show_on_mobile' => true,
            'show_on_desktop' => true
        );
        add_option('whatsapp_widget_settings', $default_settings);
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
delete_option('whatsapp_widget_settings');
delete_option('wwp_db_version');

// Drop custom table
global $wpdb;
$table_name = $wpdb->prefix . 'whatsapp_analytics';
$wpdb->query("DROP TABLE IF EXISTS $table_name");
?>`;
};
