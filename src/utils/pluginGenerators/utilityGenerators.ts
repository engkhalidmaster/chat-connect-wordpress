
// Utility file generators
// Security index file for all directories
export const generateSecurityIndex = () => {
  return `<?php
// Silence is golden.
// This file prevents directory browsing for security.
`;
};

export const generateHtaccessFile = () => {
  return `# Protect plugin files
<FilesMatch "\\.(php|js|css)$">
    Order Allow,Deny
    Allow from all
</FilesMatch>

# Prevent direct access to plugin folder
Options -Indexes

# Protect sensitive files
<FilesMatch "\\.(log|txt|md)$">
    Order Allow,Deny
    Deny from all
</FilesMatch>`;
};

export const generateIndexFile = () => {
  return `<?php
// Silence is golden.
?>`;
};

export const generateUpgradeFile = () => {
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}

class WWP_Upgrade {
    public static function upgrade_to_210() {
        global $wpdb;
        
        // Add new columns to analytics table
        $table_name = $wpdb->prefix . 'whatsapp_analytics';
        
        $wpdb->query("ALTER TABLE $table_name ADD COLUMN device_type VARCHAR(20) DEFAULT 'desktop'");
        $wpdb->query("ALTER TABLE $table_name ADD COLUMN referrer TEXT");
        $wpdb->query("ALTER TABLE $table_name ADD COLUMN session_id VARCHAR(50)");
        
        // Update version
        update_option('wwp_db_version', '2.1.0');
    }
    
    public static function upgrade_to_200() {
        global $wpdb;
        
        // Create team members table
        $table_name = $wpdb->prefix . 'whatsapp_team_members';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            phone varchar(20) NOT NULL,
            title varchar(100) DEFAULT '',
            avatar_url text DEFAULT '',
            is_online tinyint(1) DEFAULT 1,
            schedule text DEFAULT '',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        update_option('wwp_db_version', '2.0.0');
    }
}

// Run upgrades based on current version
$current_version = get_option('wwp_db_version', '1.0.0');

if (version_compare($current_version, '2.0.0', '<')) {
    WWP_Upgrade::upgrade_to_200();
}

if (version_compare($current_version, '2.1.0', '<')) {
    WWP_Upgrade::upgrade_to_210();
}
?>`;
};

export const generateConstantsFile = () => {
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('WWP_PLUGIN_NAME', 'WhatsApp Widget Pro');
define('WWP_PLUGIN_SLUG', 'whatsapp-widget-pro');
define('WWP_TEXT_DOMAIN', 'whatsapp-widget-pro');

// Database table names
define('WWP_ANALYTICS_TABLE', 'whatsapp_analytics');
define('WWP_TEAM_TABLE', 'whatsapp_team_members');

// Default settings
define('WWP_DEFAULT_POSITION', 'bottom-right');
define('WWP_DEFAULT_THEME', 'green');
define('WWP_DEFAULT_MESSAGE', 'Hello! How can we help you?');

// API endpoints
define('WWP_API_NAMESPACE', 'wwp/v1');

// Security
define('WWP_NONCE_ACTION', 'wwp_security_check');

// Limits
define('WWP_MAX_TEAM_MEMBERS', 10);
define('WWP_MAX_CLICK_RATE', 5); // clicks per minute per IP

// File paths
define('WWP_ASSETS_DIR', WWP_PLUGIN_PATH . 'assets/');
define('WWP_TEMPLATES_DIR', WWP_PLUGIN_PATH . 'templates/');
define('WWP_LANGUAGES_DIR', WWP_PLUGIN_PATH . 'languages/');

// URLs
define('WWP_ASSETS_URL', WWP_PLUGIN_URL . 'assets/');
define('WWP_ADMIN_URL', admin_url('admin.php?page=' . WWP_PLUGIN_SLUG));

// Hooks
define('WWP_WIDGET_HOOK', 'wwp_display_widget');
define('WWP_ANALYTICS_HOOK', 'wwp_track_click');

// Capabilities
define('WWP_MANAGE_CAP', 'manage_options');
define('WWP_VIEW_ANALYTICS_CAP', 'edit_posts');
?>`;
};

export const generateAdminActionsFile = () => {
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}

class WWP_Admin_Actions {
    public function __construct() {
        add_action('wp_ajax_save_wwp_settings', array($this, 'save_settings'));
        add_action('wp_ajax_get_analytics_data', array($this, 'get_analytics_data'));
        add_action('wp_ajax_add_team_member', array($this, 'add_team_member'));
        add_action('wp_ajax_update_team_member', array($this, 'update_team_member'));
        add_action('wp_ajax_delete_team_member', array($this, 'delete_team_member'));
        add_action('wp_ajax_export_analytics', array($this, 'export_analytics'));
    }
    
    public function save_settings() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $settings = array(
            'phone_number' => sanitize_text_field($_POST['phone_number']),
            'welcome_message' => sanitize_textarea_field($_POST['welcome_message']),
            'position' => sanitize_text_field($_POST['position']),
            'theme' => sanitize_text_field($_POST['theme']),
            'show_on_mobile' => isset($_POST['show_on_mobile']),
            'show_on_desktop' => isset($_POST['show_on_desktop'])
        );
        
        update_option('whatsapp_widget_settings', $settings);
        
        wp_send_json_success('Settings saved successfully');
    }
    
    public function get_analytics_data() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_die('Unauthorized');
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'whatsapp_analytics';
        
        $date_range = sanitize_text_field($_POST['date_range']);
        $where_clause = $this->get_date_where_clause($date_range);
        
        $results = $wpdb->get_results(
            "SELECT DATE(click_time) as date, COUNT(*) as clicks 
             FROM $table_name 
             $where_clause 
             GROUP BY DATE(click_time) 
             ORDER BY date ASC"
        );
        
        wp_send_json_success($results);
    }
    
    public function add_team_member() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'whatsapp_team_members';
        
        $result = $wpdb->insert(
            $table_name,
            array(
                'name' => sanitize_text_field($_POST['name']),
                'phone' => sanitize_text_field($_POST['phone']),
                'title' => sanitize_text_field($_POST['title']),
                'avatar_url' => esc_url_raw($_POST['avatar_url']),
                'is_online' => intval($_POST['is_online'])
            )
        );
        
        if ($result !== false) {
            wp_send_json_success('Team member added successfully');
        } else {
            wp_send_json_error('Failed to add team member');
        }
    }
    
    public function update_team_member() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'whatsapp_team_members';
        
        $member_id = intval($_POST['member_id']);
        
        $result = $wpdb->update(
            $table_name,
            array(
                'name' => sanitize_text_field($_POST['name']),
                'phone' => sanitize_text_field($_POST['phone']),
                'title' => sanitize_text_field($_POST['title']),
                'avatar_url' => esc_url_raw($_POST['avatar_url']),
                'is_online' => intval($_POST['is_online'])
            ),
            array('id' => $member_id)
        );
        
        if ($result !== false) {
            wp_send_json_success('Team member updated successfully');
        } else {
            wp_send_json_error('Failed to update team member');
        }
    }
    
    public function delete_team_member() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'whatsapp_team_members';
        
        $member_id = intval($_POST['member_id']);
        
        $result = $wpdb->delete($table_name, array('id' => $member_id));
        
        if ($result !== false) {
            wp_send_json_success('Team member deleted successfully');
        } else {
            wp_send_json_error('Failed to delete team member');
        }
    }
    
    public function export_analytics() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'whatsapp_analytics';
        
        $format = sanitize_text_field($_GET['format']);
        $results = $wpdb->get_results("SELECT * FROM $table_name ORDER BY click_time DESC", ARRAY_A);
        
        if ($format === 'csv') {
            $this->export_as_csv($results);
        } else {
            $this->export_as_json($results);
        }
    }
    
    private function get_date_where_clause($date_range) {
        switch ($date_range) {
            case 'today':
                return "WHERE DATE(click_time) = CURDATE()";
            case 'week':
                return "WHERE click_time >= DATE_SUB(NOW(), INTERVAL 1 WEEK)";
            case 'month':
                return "WHERE click_time >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
            default:
                return "";
        }
    }
    
    private function export_as_csv($data) {
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="whatsapp-analytics.csv"');
        
        $output = fopen('php://output', 'w');
        
        if (!empty($data)) {
            fputcsv($output, array_keys($data[0]));
            foreach ($data as $row) {
                fputcsv($output, $row);
            }
        }
        
        fclose($output);
        exit;
    }
    
    private function export_as_json($data) {
        header('Content-Type: application/json');
        header('Content-Disposition: attachment; filename="whatsapp-analytics.json"');
        
        echo json_encode($data, JSON_PRETTY_PRINT);
        exit;
    }
}

new WWP_Admin_Actions();
?>`;
};

export const generateFrontendActionsFile = () => {
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}

class WWP_Frontend_Actions {
    public function __construct() {
        add_action('wp_ajax_track_whatsapp_click', array($this, 'track_click'));
        add_action('wp_ajax_nopriv_track_whatsapp_click', array($this, 'track_click'));
        add_action('wp_ajax_get_team_members', array($this, 'get_team_members'));
        add_action('wp_ajax_nopriv_get_team_members', array($this, 'get_team_members'));
    }
    
    public function track_click() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        // Rate limiting
        if ($this->is_rate_limited()) {
            wp_send_json_error('Rate limit exceeded');
            return;
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'whatsapp_analytics';
        
        $user_ip = $this->get_user_ip();
        $page_url = esc_url_raw($_POST['page_url']);
        $user_agent = sanitize_text_field($_SERVER['HTTP_USER_AGENT']);
        $device_type = $this->detect_device_type($user_agent);
        $referrer = isset($_SERVER['HTTP_REFERER']) ? esc_url_raw($_SERVER['HTTP_REFERER']) : '';
        
        $result = $wpdb->insert(
            $table_name,
            array(
                'user_ip' => $user_ip,
                'page_url' => $page_url,
                'user_agent' => $user_agent,
                'device_type' => $device_type,
                'referrer' => $referrer,
                'click_time' => current_time('mysql')
            )
        );
        
        if ($result !== false) {
            // Update rate limiting counter
            $this->update_rate_limit_counter($user_ip);
            
            wp_send_json_success('Click tracked');
        } else {
            wp_send_json_error('Failed to track click');
        }
    }
    
    public function get_team_members() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'whatsapp_team_members';
        
        $members = $wpdb->get_results(
            "SELECT name, phone, title, avatar_url, is_online 
             FROM $table_name 
             WHERE is_online = 1 
             ORDER BY name ASC"
        );
        
        wp_send_json_success($members);
    }
    
    private function get_user_ip() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return sanitize_text_field($_SERVER['HTTP_CLIENT_IP']);
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            return sanitize_text_field($_SERVER['HTTP_X_FORWARDED_FOR']);
        } else {
            return sanitize_text_field($_SERVER['REMOTE_ADDR']);
        }
    }
    
    private function detect_device_type($user_agent) {
        if (preg_match('/Mobile|Android|iPhone|iPad/', $user_agent)) {
            return 'mobile';
        } elseif (preg_match('/Tablet/', $user_agent)) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }
    
    private function is_rate_limited() {
        $user_ip = $this->get_user_ip();
        $rate_limit_key = 'wwp_rate_limit_' . md5($user_ip);
        $current_count = get_transient($rate_limit_key);
        
        return $current_count && $current_count >= WWP_MAX_CLICK_RATE;
    }
    
    private function update_rate_limit_counter($user_ip) {
        $rate_limit_key = 'wwp_rate_limit_' . md5($user_ip);
        $current_count = get_transient($rate_limit_key);
        
        if ($current_count) {
            set_transient($rate_limit_key, $current_count + 1, 60);
        } else {
            set_transient($rate_limit_key, 1, 60);
        }
    }
}

new WWP_Frontend_Actions();
?>`;
};
