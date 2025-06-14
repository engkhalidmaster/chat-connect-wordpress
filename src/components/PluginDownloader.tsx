import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';

const PluginDownloader: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePluginZip = async () => {
    setIsGenerating(true);
    
    try {
      const pluginFiles = createPluginFiles();
      
      const zip = new JSZip();
      
      Object.entries(pluginFiles).forEach(([fileName, content]) => {
        zip.file(fileName, content);
      });
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `whatsapp-widget-pro-v${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "تم إنشاء الإضافة بنجاح",
        description: "تم تنزيل ملف الإضافة الكامل مع جميع الملفات المطلوبة",
      });
      
    } catch (error) {
      console.error('Plugin generation error:', error);
      toast({
        title: "خطأ في إنشاء الإضافة",
        description: "حدث خطأ أثناء إنشاء ملف الإضافة",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const createPluginFiles = () => {
    const currentSettings = JSON.parse(localStorage.getItem('wwp_settings') || '{}');
    const teamMembers = JSON.parse(localStorage.getItem('wwp_team_members') || '[]');
    const analyticsSettings = JSON.parse(localStorage.getItem('wwp_analytics') || '{}');
    
    return {
      'whatsapp-widget-pro.php': generateMainPHPFile(),
      'includes/class-wwp-main.php': generateMainClassFile(),
      'includes/class-wwp-admin.php': generateAdminClassFile(),
      'includes/class-wwp-frontend.php': generateFrontendClassFile(),
      'includes/class-wwp-analytics.php': generateAnalyticsClassFile(),
      'includes/class-wwp-security.php': generateSecurityClassFile(),
      'includes/class-wwp-woocommerce.php': generateWooCommerceClassFile(),
      'readme.txt': generateReadmeFile(),
      'assets/css/admin-style.css': generateAdminCSS(),
      'assets/css/frontend-style.css': generateFrontendCSS(),
      'assets/css/widget-style.css': generateWidgetCSS(),
      'assets/js/admin-script.js': generateAdminJavaScript(),
      'assets/js/frontend-script.js': generateFrontendJavaScript(),
      'assets/js/analytics.js': generateAnalyticsJavaScript(),
      'templates/admin-page.php': generateAdminPageTemplate(),
      'templates/widget.php': generateWidgetTemplate(),
      'templates/team-popup.php': generateTeamPopupTemplate(),
      'templates/settings-tabs.php': generateSettingsTabsTemplate(),
      'languages/whatsapp-widget-pro-ar.po': generateTranslationFile(),
      'languages/whatsapp-widget-pro-ar.mo': generateBinaryTranslationFile(),
      'languages/whatsapp-widget-pro.pot': generatePOTFile(),
      'install.php': generateInstallFile(),
      'uninstall.php': generateUninstallFile(),
      'upgrade.php': generateUpgradeFile(),
      '.htaccess': generateHtaccessFile(),
      'index.php': generateIndexFile(),
      'config/default-settings.php': generateDefaultSettingsFile(),
      'config/constants.php': generateConstantsFile(),
      'ajax/admin-actions.php': generateAdminActionsFile(),
      'ajax/frontend-actions.php': generateFrontendActionsFile(),
      'backup/settings-backup.json': JSON.stringify({
        settings: currentSettings,
        team_members: teamMembers,
        analytics: analyticsSettings,
        export_date: new Date().toISOString(),
        version: '2.0.0'
      }, null, 2),
      'docs/user-guide.md': generateUserGuideFile(),
      'docs/installation.md': generateInstallationGuideFile(),
      'docs/troubleshooting.md': generateTroubleshootingGuideFile()
    };
  };

  const generateMainPHPFile = () => {
    return `<?php
/**
 * Plugin Name: WhatsApp Widget Pro
 * Description: إضافة احترافية لعرض زر WhatsApp مع تتبع Google Analytics وتكامل WooCommerce ونظام حماية IP
 * Version: 2.0.0
 * Author: WhatsApp Widget Pro Team
 * Text Domain: whatsapp-widget-pro
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

// منع الوصول المباشر
if (!defined('ABSPATH')) {
    exit;
}

// تعريف المتغيرات الأساسية
define('WWP_VERSION', '2.0.0');
define('WWP_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WWP_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('WWP_PLUGIN_BASENAME', plugin_basename(__FILE__));
define('WWP_INCLUDES_PATH', WWP_PLUGIN_PATH . 'includes/');
define('WWP_ASSETS_URL', WWP_PLUGIN_URL . 'assets/');
define('WWP_TEMPLATES_PATH', WWP_PLUGIN_PATH . 'templates/');

// تضمين ملف التثبيت
require_once WWP_PLUGIN_PATH . 'install.php';

// تضمين الفئات الأساسية
require_once WWP_INCLUDES_PATH . 'class-wwp-main.php';

// تفعيل الإضافة
register_activation_hook(__FILE__, array('WWP_Install', 'activate'));
register_deactivation_hook(__FILE__, array('WWP_Install', 'deactivate'));
register_uninstall_hook(__FILE__, array('WWP_Install', 'uninstall'));

// بدء تشغيل الإضافة
if (class_exists('WWP_Main')) {
    new WWP_Main();
}
?>`;
  };

  const generateMainClassFile = () => {
    return `<?php
if (!defined('ABSPATH')) exit;

class WWP_Main {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('plugins_loaded', array($this, 'load_textdomain'));
    }
    
    public function init() {
        $this->load_dependencies();
        
        if (is_admin()) {
            new WWP_Admin();
        }
        new WWP_Frontend();
        new WWP_Analytics();
        new WWP_Security();
        
        if (class_exists('WooCommerce')) {
            new WWP_WooCommerce();
        }
    }
    
    private function load_dependencies() {
        require_once WWP_INCLUDES_PATH . 'class-wwp-admin.php';
        require_once WWP_INCLUDES_PATH . 'class-wwp-frontend.php';
        require_once WWP_INCLUDES_PATH . 'class-wwp-analytics.php';
        require_once WWP_INCLUDES_PATH . 'class-wwp-security.php';
        require_once WWP_INCLUDES_PATH . 'class-wwp-woocommerce.php';
    }
    
    public function load_textdomain() {
        load_plugin_textdomain('whatsapp-widget-pro', false, dirname(WWP_PLUGIN_BASENAME) . '/languages');
    }
}
?>`;
  };

  const generateAdminClassFile = () => {
    return `<?php
if (!defined('ABSPATH')) exit;

class WWP_Admin {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('wp_ajax_wwp_save_settings', array($this, 'ajax_save_settings'));
        add_action('wp_ajax_wwp_get_stats', array($this, 'ajax_get_stats'));
    }
    
    public function add_admin_menu() {
        add_menu_page(
            __('WhatsApp Widget Pro', 'whatsapp-widget-pro'),
            __('WhatsApp Widget', 'whatsapp-widget-pro'),
            'manage_options',
            'whatsapp-widget-pro',
            array($this, 'admin_page'),
            'dashicons-format-chat',
            30
        );
        
        add_submenu_page(
            'whatsapp-widget-pro',
            __('الإعدادات العامة', 'whatsapp-widget-pro'),
            __('الإعدادات العامة', 'whatsapp-widget-pro'),
            'manage_options',
            'whatsapp-widget-pro'
        );
        
        add_submenu_page(
            'whatsapp-widget-pro',
            __('إدارة الفريق', 'whatsapp-widget-pro'),
            __('إدارة الفريق', 'whatsapp-widget-pro'),
            'manage_options',
            'wwp-team',
            array($this, 'team_page')
        );
        
        add_submenu_page(
            'whatsapp-widget-pro',
            __('الإحصائيات', 'whatsapp-widget-pro'),
            __('الإحصائيات', 'whatsapp-widget-pro'),
            'manage_options',
            'wwp-stats',
            array($this, 'stats_page')
        );
    }
    
    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, 'whatsapp-widget-pro') === false && strpos($hook, 'wwp-') === false) {
            return;
        }
        
        wp_enqueue_style('wwp-admin-style', WWP_ASSETS_URL . 'css/admin-style.css', array(), WWP_VERSION);
        wp_enqueue_script('wwp-admin-script', WWP_ASSETS_URL . 'js/admin-script.js', array('jquery'), WWP_VERSION, true);
        
        wp_localize_script('wwp-admin-script', 'wwp_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wwp_ajax_nonce')
        ));
    }
    
    public function register_settings() {
        register_setting('wwp_settings', 'wwp_general_settings');
        register_setting('wwp_settings', 'wwp_team_settings');
        register_setting('wwp_settings', 'wwp_analytics_settings');
    }
    
    public function admin_page() {
        include WWP_TEMPLATES_PATH . 'admin-page.php';
    }
    
    public function team_page() {
        include WWP_TEMPLATES_PATH . 'team-page.php';
    }
    
    public function stats_page() {
        include WWP_TEMPLATES_PATH . 'stats-page.php';
    }
    
    public function ajax_save_settings() {
        check_ajax_referer('wwp_ajax_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('غير مصرح لك بهذا الإجراء', 'whatsapp-widget-pro'));
        }
        
        $settings = $_POST['settings'];
        update_option('wwp_general_settings', $settings);
        
        wp_send_json_success(__('تم حفظ الإعدادات بنجاح', 'whatsapp-widget-pro'));
    }
    
    public function ajax_get_stats() {
        check_ajax_referer('wwp_ajax_nonce', 'nonce');
        
        global $wpdb;
        $stats_table = $wpdb->prefix . 'wwp_stats';
        
        $stats = $wpdb->get_results("
            SELECT DATE(created_at) as date, COUNT(*) as clicks 
            FROM $stats_table 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        ");
        
        wp_send_json_success($stats);
    }
}
?>`;
  };

  const generateFrontendClassFile = () => {
    return `<?php
if (!defined('ABSPATH')) exit;

class WWP_Frontend {
    
    public function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        add_action('wp_footer', array($this, 'display_widget'));
        add_action('wp_ajax_wwp_track_click', array($this, 'track_click'));
        add_action('wp_ajax_nopriv_wwp_track_click', array($this, 'track_click'));
    }
    
    public function enqueue_frontend_scripts() {
        $settings = get_option('wwp_general_settings', array());
        
        if (empty($settings['enable_widget'])) {
            return;
        }
        
        wp_enqueue_style('wwp-frontend-style', WWP_ASSETS_URL . 'css/frontend-style.css', array(), WWP_VERSION);
        wp_enqueue_style('wwp-widget-style', WWP_ASSETS_URL . 'css/widget-style.css', array(), WWP_VERSION);
        wp_enqueue_script('wwp-frontend-script', WWP_ASSETS_URL . 'js/frontend-script.js', array('jquery'), WWP_VERSION, true);
        
        wp_localize_script('wwp-frontend-script', 'wwp_frontend', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wwp_frontend_nonce'),
            'settings' => $settings
        ));
    }
    
    public function display_widget() {
        $settings = get_option('wwp_general_settings', array());
        
        if (empty($settings['enable_widget'])) {
            return;
        }
        
        include WWP_TEMPLATES_PATH . 'widget.php';
    }
    
    public function track_click() {
        check_ajax_referer('wwp_frontend_nonce', 'nonce');
        
        global $wpdb;
        $stats_table = $wpdb->prefix . 'wwp_stats';
        
        $member_id = intval($_POST['member_id']);
        $page_url = esc_url($_POST['page_url']);
        $user_ip = $this->get_user_ip();
        
        $wpdb->insert(
            $stats_table,
            array(
                'member_id' => $member_id,
                'page_url' => $page_url,
                'user_ip' => $user_ip,
                'created_at' => current_time('mysql')
            ),
            array('%d', '%s', '%s', '%s')
        );
        
        wp_send_json_success();
    }
    
    private function get_user_ip() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        return sanitize_text_field($ip);
    }
}
?>`;
  };

  const generateAnalyticsClassFile = () => {
    return `<?php
if (!defined('ABSPATH')) exit;

class WWP_Analytics {
    
    public function __construct() {
        add_action('wp_head', array($this, 'add_analytics_code'));
        add_action('wp_footer', array($this, 'add_analytics_events'));
    }
    
    public function add_analytics_code() {
        $analytics_settings = get_option('wwp_analytics_settings', array());
        
        if (empty($analytics_settings['ga_tracking_id'])) {
            return;
        }
        
        $tracking_id = $analytics_settings['ga_tracking_id'];
        ?>
        <!-- Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr($tracking_id); ?>"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '<?php echo esc_js($tracking_id); ?>');
        </script>
        <?php
    }
    
    public function add_analytics_events() {
        $analytics_settings = get_option('wwp_analytics_settings', array());
        
        if (empty($analytics_settings['enable_events'])) {
            return;
        }
        ?>
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('.wwp-widget, .wwp-team-member').forEach(function(element) {
                element.addEventListener('click', function() {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'whatsapp_click', {
                            event_category: 'WhatsApp Widget',
                            event_label: this.dataset.memberName || 'Widget',
                            value: 1
                        });
                    }
                });
            });
        });
        </script>
        <?php
    }
}
?>`;
  };

  const generateSecurityClassFile = () => {
    return `<?php
if (!defined('ABSPATH')) exit;

class WWP_Security {
    
    private $blocked_ips = array();
    
    public function __construct() {
        add_action('init', array($this, 'check_security'));
        add_action('wp_ajax_wwp_block_ip', array($this, 'block_ip'));
        $this->blocked_ips = get_option('wwp_blocked_ips', array());
    }
    
    public function check_security() {
        $user_ip = $this->get_user_ip();
        
        if (in_array($user_ip, $this->blocked_ips)) {
            wp_die(__('تم حظر عنوان IP الخاص بك', 'whatsapp-widget-pro'));
        }
        
        $this->check_suspicious_activity($user_ip);
    }
    
    private function check_suspicious_activity($ip) {
        global $wpdb;
        $stats_table = $wpdb->prefix . 'wwp_stats';
        
        $recent_clicks = $wpdb->get_var($wpdb->prepare("
            SELECT COUNT(*) 
            FROM $stats_table 
            WHERE user_ip = %s 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
        ", $ip));
        
        if ($recent_clicks > 10) {
            $this->add_to_blocked_ips($ip);
        }
    }
    
    public function block_ip() {
        check_ajax_referer('wwp_ajax_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('غير مصرح لك بهذا الإجراء', 'whatsapp-widget-pro'));
        }
        
        $ip = sanitize_text_field($_POST['ip']);
        $this->add_to_blocked_ips($ip);
        
        wp_send_json_success(__('تم حظر عنوان IP بنجاح', 'whatsapp-widget-pro'));
    }
    
    private function add_to_blocked_ips($ip) {
        if (!in_array($ip, $this->blocked_ips)) {
            $this->blocked_ips[] = $ip;
            update_option('wwp_blocked_ips', $this->blocked_ips);
        }
    }
    
    private function get_user_ip() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        return sanitize_text_field($ip);
    }
}
?>`;
  };

  const generateWooCommerceClassFile = () => {
    return `<?php
if (!defined('ABSPATH')) exit;

class WWP_WooCommerce {
    
    public function __construct() {
        add_action('woocommerce_order_status_completed', array($this, 'send_order_notification'));
        add_action('woocommerce_new_order', array($this, 'send_new_order_notification'));
        add_filter('woocommerce_checkout_fields', array($this, 'add_whatsapp_field'));
    }
    
    public function send_order_notification($order_id) {
        $woo_settings = get_option('wwp_woocommerce_settings', array());
        
        if (empty($woo_settings['enable_notifications'])) {
            return;
        }
        
        $order = wc_get_order($order_id);
        $customer_phone = $order->get_billing_phone();
        
        if ($customer_phone && !empty($woo_settings['completion_message'])) {
            $message = str_replace(
                array('[order_id]', '[customer_name]'),
                array($order_id, $order->get_billing_first_name()),
                $woo_settings['completion_message']
            );
            
            do_action('wwp_send_whatsapp_message', $customer_phone, $message);
        }
    }
    
    public function send_new_order_notification($order_id) {
        $woo_settings = get_option('wwp_woocommerce_settings', array());
        
        if (empty($woo_settings['admin_notifications']) || empty($woo_settings['admin_phone'])) {
            return;
        }
        
        $order = wc_get_order($order_id);
        $message = sprintf(
            __('طلب جديد رقم #%s من %s بقيمة %s', 'whatsapp-widget-pro'),
            $order_id,
            $order->get_billing_first_name(),
            $order->get_total()
        );
        
        do_action('wwp_send_whatsapp_message', $woo_settings['admin_phone'], $message);
    }
    
    public function add_whatsapp_field($fields) {
        $woo_settings = get_option('wwp_woocommerce_settings', array());
        
        if (!empty($woo_settings['add_whatsapp_field'])) {
            $fields['billing']['whatsapp_number'] = array(
                'label' => __('رقم WhatsApp', 'whatsapp-widget-pro'),
                'placeholder' => __('أدخل رقم WhatsApp', 'whatsapp-widget-pro'),
                'required' => false,
                'class' => array('form-row-wide'),
                'clear' => true
            );
        }
        
        return $fields;
    }
}
?>`;
  };

  const generateWidgetCSS = () => {
    return `/* WhatsApp Widget Specific Styles */
.wwp-widget-container {
    position: fixed;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.wwp-widget-container.position-bottom-right {
    bottom: 20px;
    right: 20px;
}

.wwp-widget-container.position-bottom-left {
    bottom: 20px;
    left: 20px;
}

.wwp-widget-container.position-top-right {
    top: 20px;
    right: 20px;
}

.wwp-widget-container.position-top-left {
    top: 20px;
    left: 20px;
}

.wwp-main-button {
    width: 60px;
    height: 60px;
    background: #25D366;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    border: none;
    outline: none;
}

.wwp-main-button:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(37, 211, 102, 0.6);
}

.wwp-main-button svg {
    width: 28px;
    height: 28px;
    fill: white;
}

.wwp-team-popup {
    position: absolute;
    bottom: 80px;
    right: 0;
    background: white;
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    padding: 20px;
    min-width: 280px;
    max-width: 320px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(20px) scale(0.95);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.wwp-team-popup.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
}

.wwp-team-header {
    text-align: center;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
}

.wwp-team-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.wwp-team-subtitle {
    font-size: 12px;
    color: #666;
    margin: 5px 0 0 0;
}

.wwp-team-member {
    display: flex;
    align-items: center;
    padding: 12px;
    margin: 8px -12px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    color: inherit;
}

.wwp-team-member:hover {
    background: #f8f9ff;
    transform: translateX(-3px);
}

.wwp-member-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #25D366, #128C7E);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 12px;
    font-weight: 600;
    color: white;
    font-size: 14px;
}

.wwp-member-info {
    flex: 1;
}

.wwp-member-name {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin: 0 0 2px 0;
}

.wwp-member-status {
    font-size: 12px;
    color: #666;
    margin: 0;
}

.wwp-status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    margin-left: 6px;
}

.wwp-status-online {
    background: #4CAF50;
}

.wwp-status-busy {
    background: #FF9800;
}

.wwp-status-away {
    background: #FFC107;
}

.wwp-status-offline {
    background: #9E9E9E;
}

/* Responsive Design */
@media (max-width: 768px) {
    .wwp-widget-container {
        bottom: 15px;
        right: 15px;
    }
    
    .wwp-main-button {
        width: 55px;
        height: 55px;
    }
    
    .wwp-main-button svg {
        width: 24px;
        height: 24px;
    }
    
    .wwp-team-popup {
        min-width: 260px;
        max-width: calc(100vw - 40px);
    }
}

/* RTL Support */
[dir="rtl"] .wwp-widget-container.position-bottom-right {
    left: 20px;
    right: auto;
}

[dir="rtl"] .wwp-widget-container.position-bottom-left {
    right: 20px;
    left: auto;
}

[dir="rtl"] .wwp-team-popup {
    left: 0;
    right: auto;
}

[dir="rtl"] .wwp-team-popup::before {
    left: 20px;
    right: auto;
}

[dir="rtl"] .wwp-member-avatar {
    margin-right: 12px;
    margin-left: 0;
}

[dir="rtl"] .wwp-status-indicator {
    margin-right: 6px;
    margin-left: 0;
}

/* Animation للظهور والاختفاء */
@keyframes wwp-bounce-in {
    0% {
        opacity: 0;
        transform: scale(0.3);
    }
    50% {
        opacity: 1;
        transform: scale(1.05);
    }
    70% {
        transform: scale(0.9);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.wwp-widget-container.animate-in {
    animation: wwp-bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}`;
  };

  const generateDefaultSettingsFile = () => {
    return `<?php
if (!defined('ABSPATH')) exit;

return array(
    'general' => array(
        'enable_widget' => true,
        'widget_position' => 'bottom-right',
        'widget_color' => '#25D366',
        'welcome_message' => 'مرحباً! كيف يمكننا مساعدتك؟',
        'show_on_mobile' => true,
        'show_on_desktop' => true
    ),
    'team' => array(
        'enable_team_mode' => false,
        'show_team_popup' => true,
        'default_member' => array(
            'name' => 'فريق الدعم',
            'phone' => '',
            'department' => 'الدعم الفني',
            'status' => 'online'
        )
    ),
    'analytics' => array(
        'enable_tracking' => false,
        'ga_tracking_id' => '',
        'enable_events' => true,
        'track_conversions' => false
    ),
    'security' => array(
        'enable_ip_blocking' => false,
        'max_clicks_per_minute' => 10,
        'blocked_countries' => array()
    ),
    'woocommerce' => array(
        'enable_integration' => false,
        'enable_notifications' => false,
        'admin_phone' => '',
        'completion_message' => 'شكراً لك! تم تأكيد طلبك رقم [order_id]'
    )
);
?>`;
  };

  const generateReadmeFile = () => {
    return `=== WhatsApp Widget Pro ===
Contributors: whatsappwidgetpro
Tags: whatsapp, chat, widget, customer support, analytics
Requires at least: 5.0
Tested up to: 6.4
Stable tag: 2.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

إضافة احترافية لعرض زر WhatsApp مع تتبع Google Analytics وتكامل WooCommerce ونظام حماية IP

== Description ==

WhatsApp Widget Pro هي إضافة احترافية تتيح لك إضافة زر WhatsApp مخصص لموقعك مع ميزات متقدمة:

* **إدارة فريق متعددة** - أضف أعضاء فريق متعددين مع إدارة ساعات العمل
* **تتبع Google Analytics** - تتبع النقرات والتحويلات
* **تكامل WooCommerce** - إرسال إشعارات طلبات تلقائية
* **نظام حماية IP** - منع الإساءة والنقرات المشبوهة
* **تخصيص كامل** - ألوان ومواضع وخيارات متعددة
* **دعم RTL** - دعم كامل للغة العربية

== Installation ==

1. ارفع مجلد الإضافة إلى مجلد `/wp-content/plugins/`
2. فعل الإضافة من خلال قائمة 'الإضافات' في WordPress
3. اذهب إلى 'WhatsApp Widget' لتكوين الإعدادات

== Frequently Asked Questions ==

= هل الإضافة مجانية؟ =

نعم، الإضافة مجانية بالكامل مع جميع الميزات.

= هل تدعم الإضافة اللغة العربية؟ =

نعم، الإضافة تدعم اللغة العربية بالكامل مع واجهة RTL.

== Screenshots ==

1. لوحة التحكم الرئيسية
2. إدارة أعضاء الفريق
3. إعدادات المظهر
4. الإحصائيات والتحليلات

== Changelog ==

= 2.0.0 =
* إضافة إدارة فريق متقدمة
* تحسين نظام الأمان
* تكامل WooCommerce المحسن
* واجهة إدارية جديدة

= 1.0.0 =
* الإصدار الأول

== Upgrade Notice ==

= 2.0.0 =
تحديث رئيسي مع ميزات جديدة. يُنصح بعمل نسخة احتياطية قبل التحديث.`;
  };

  const generateAdminCSS = () => {
    return `/* WhatsApp Widget Pro Admin Styles */
.wwp-admin-container {
    max-width: 1200px;
    margin: 20px 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.wwp-header {
    background: linear-gradient(135deg, #25D366, #128C7E);
    color: white;
    padding: 30px;
    border-radius: 8px;
    margin-bottom: 30px;
    text-align: center;
}

.wwp-header h1 {
    font-size: 28px;
    margin: 0 0 10px 0;
    font-weight: 600;
}

.wwp-header p {
    font-size: 16px;
    opacity: 0.9;
    margin: 0;
}

.wwp-tabs {
    display: flex;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 30px;
    overflow: hidden;
}

.wwp-tab {
    flex: 1;
    padding: 15px 20px;
    background: #f8f9fa;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    transition: all 0.3s ease;
    border-right: 1px solid #e9ecef;
}

.wwp-tab:last-child {
    border-right: none;
}

.wwp-tab.active {
    background: #25D366;
    color: white;
}

.wwp-tab:hover:not(.active) {
    background: #e9ecef;
    color: #333;
}

.wwp-content {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.wwp-form-group {
    margin-bottom: 25px;
}

.wwp-form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
}

.wwp-form-group input,
.wwp-form-group textarea,
.wwp-form-group select {
    width: 100%;
    padding: 12px;
    border: 2px solid #e9ecef;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.3s ease;
}

.wwp-form-group input:focus,
.wwp-form-group textarea:focus,
.wwp-form-group select:focus {
    outline: none;
    border-color: #25D366;
    box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
}

.wwp-checkbox-group {
    display: flex;
    align-items: center;
    gap: 10px;
}

.wwp-checkbox-group input[type="checkbox"] {
    width: auto;
    margin: 0;
}

.wwp-button {
    background: #25D366;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.wwp-button:hover {
    background: #128C7E;
    transform: translateY(-1px);
}

.wwp-button-secondary {
    background: #6c757d;
}

.wwp-button-secondary:hover {
    background: #5a6268;
}

.wwp-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.wwp-stat-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.wwp-stat-number {
    font-size: 32px;
    font-weight: 700;
    color: #25D366;
    margin-bottom: 5px;
}

.wwp-stat-label {
    font-size: 14px;
    color: #666;
    font-weight: 500;
}

.wwp-team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.wwp-team-card {
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    padding: 20px;
    transition: all 0.3s ease;
}

.wwp-team-card:hover {
    border-color: #25D366;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.wwp-team-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
}

.wwp-team-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #25D366, #128C7E);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    margin-left: 15px;
}

.wwp-team-info h3 {
    margin: 0 0 5px 0;
    font-size: 16px;
    color: #333;
}

.wwp-team-info p {
    margin: 0;
    font-size: 14px;
    color: #666;
}

.wwp-status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
}

.wwp-status-online {
    background: #d4edda;
    color: #155724;
}

.wwp-status-offline {
    background: #f8d7da;
    color: #721c24;
}

.wwp-status-away {
    background: #fff3cd;
    color: #856404;
}

.wwp-status-busy {
    background: #fde5e5;
    color: #c53030;
}

@media (max-width: 768px) {
    .wwp-tabs {
        flex-direction: column;
    }
    
    .wwp-tab {
        border-right: none;
        border-bottom: 1px solid #e9ecef;
    }
    
    .wwp-tab:last-child {
        border-bottom: none;
    }
    
    .wwp-stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
    
    .wwp-team-grid {
        grid-template-columns: 1fr;
    }
}`;
  };

  const generateFrontendCSS = () => {
    return `/* WhatsApp Widget Pro Frontend Styles */
.wwp-widget-container {
    position: fixed;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    direction: ltr;
}

.wwp-widget-container.position-bottom-right {
    bottom: 20px;
    right: 20px;
}

.wwp-widget-container.position-bottom-left {
    bottom: 20px;
    left: 20px;
}

.wwp-widget-container.position-top-right {
    top: 20px;
    right: 20px;
}

.wwp-widget-container.position-top-left {
    top: 20px;
    left: 20px;
}

.wwp-main-button {
    width: 60px;
    height: 60px;
    background: #25D366;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    border: none;
    outline: none;
    position: relative;
}

.wwp-main-button:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(37, 211, 102, 0.6);
}

.wwp-main-button svg {
    width: 28px;
    height: 28px;
    fill: white;
}

.wwp-pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(37, 211, 102, 0.3);
    animation: wwp-pulse 2s infinite;
}

@keyframes wwp-pulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    100% {
        transform: scale(1.5);
        opacity: 0;
    }
}

.wwp-team-popup {
    position: absolute;
    bottom: 80px;
    right: 0;
    background: white;
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    padding: 20px;
    min-width: 280px;
    max-width: 320px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(20px) scale(0.95);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.wwp-team-popup.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
}

.wwp-team-popup::before {
    content: '';
    position: absolute;
    bottom: -8px;
    right: 20px;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid white;
}

.wwp-team-header {
    text-align: center;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
}

.wwp-team-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.wwp-team-subtitle {
    font-size: 12px;
    color: #666;
    margin: 5px 0 0 0;
}

.wwp-team-member {
    display: flex;
    align-items: center;
    padding: 12px;
    margin: 8px -12px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    color: inherit;
}

.wwp-team-member:hover {
    background: #f8f9ff;
    transform: translateX(-3px);
}

.wwp-member-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #25D366, #128C7E);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 12px;
    font-weight: 600;
    color: white;
    font-size: 14px;
}

.wwp-member-info {
    flex: 1;
}

.wwp-member-name {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin: 0 0 2px 0;
}

.wwp-member-status {
    font-size: 12px;
    color: #666;
    margin: 0;
    display: flex;
    align-items: center;
}

.wwp-status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    margin-left: 6px;
}

.wwp-status-online {
    background: #4CAF50;
}

.wwp-status-busy {
    background: #FF9800;
}

.wwp-status-away {
    background: #FFC107;
}

.wwp-status-offline {
    background: #9E9E9E;
}

.wwp-outside-hours {
    text-align: center;
    padding: 15px;
    color: #666;
    font-size: 14px;
    line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 768px) {
    .wwp-widget-container {
        bottom: 15px;
        right: 15px;
    }
    
    .wwp-main-button {
        width: 55px;
        height: 55px;
    }
    
    .wwp-main-button svg {
        width: 24px;
        height: 24px;
    }
    
    .wwp-team-popup {
        min-width: 260px;
        max-width: calc(100vw - 40px);
        bottom: 75px;
    }
}

/* RTL Support */
[dir="rtl"] .wwp-widget-container.position-bottom-right {
    left: 20px;
    right: auto;
}

[dir="rtl"] .wwp-widget-container.position-bottom-left {
    right: 20px;
    left: auto;
}

[dir="rtl"] .wwp-team-popup {
    left: 0;
    right: auto;
}

[dir="rtl"] .wwp-team-popup::before {
    left: 20px;
    right: auto;
}

[dir="rtl"] .wwp-member-avatar {
    margin-right: 12px;
    margin-left: 0;
}

[dir="rtl"] .wwp-status-indicator {
    margin-right: 6px;
    margin-left: 0;
}

/* Animation للظهور والاختفاء */
@keyframes wwp-bounce-in {
    0% {
        opacity: 0;
        transform: scale(0.3);
    }
    50% {
        opacity: 1;
        transform: scale(1.05);
    }
    70% {
        transform: scale(0.9);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.wwp-widget-container.animate-in {
    animation: wwp-bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}`;
  };

  const generateAdminJavaScript = () => {
    return `/* WhatsApp Widget Pro Admin JavaScript */
(function($) {
    'use strict';
    
    var WWPAdmin = {
        init: function() {
            this.bindEvents();
            this.initTabs();
            this.initColorPicker();
            this.loadStats();
        },
        
        bindEvents: function() {
            $(document).on('click', '.wwp-tab', this.switchTab);
            $(document).on('submit', '#wwp-settings-form', this.saveSettings);
            $(document).on('click', '.wwp-add-member', this.addMember);
            $(document).on('click', '.wwp-edit-member', this.editMember);
            $(document).on('click', '.wwp-delete-member', this.deleteMember);
            $(document).on('click', '.wwp-block-ip', this.blockIP);
            $(document).on('click', '.wwp-unblock-ip', this.unblockIP);
            $(document).on('click', '.wwp-refresh-stats', this.loadStats);
        },
        
        initTabs: function() {
            var activeTab = localStorage.getItem('wwp-active-tab') || 'general';
            this.showTab(activeTab);
        },
        
        switchTab: function(e) {
            e.preventDefault();
            var tabId = $(this).data('tab');
            WWPAdmin.showTab(tabId);
            localStorage.setItem('wwp-active-tab', tabId);
        },
        
        showTab: function(tabId) {
            $('.wwp-tab').removeClass('active');
            $('.wwp-tab[data-tab="' + tabId + '"]').addClass('active');
            
            $('.wwp-tab-content').hide();
            $('#wwp-tab-' + tabId).show();
        },
        
        initColorPicker: function() {
            if ($.fn.wpColorPicker) {
                $('.wwp-color-picker').wpColorPicker();
            }
        },
        
        saveSettings: function(e) {
            e.preventDefault();
            
            var $form = $(this);
            var formData = $form.serialize();
            formData += '&action=wwp_save_settings&nonce=' + wwp_ajax.nonce;
            
            $.ajax({
                url: wwp_ajax.ajax_url,
                type: 'POST',
                data: formData,
                beforeSend: function() {
                    $form.find('.wwp-button').prop('disabled', true).text('جاري الحفظ...');
                },
                success: function(response) {
                    if (response.success) {
                        WWPAdmin.showNotice('success', response.data);
                    } else {
                        WWPAdmin.showNotice('error', response.data);
                    }
                },
                error: function() {
                    WWPAdmin.showNotice('error', 'حدث خطأ في الاتصال');
                },
                complete: function() {
                    $form.find('.wwp-button').prop('disabled', false).text('حفظ الإعدادات');
                }
            });
        },
        
        addMember: function() {
            var memberData = {
                name: $('#member-name').val(),
                phone: $('#member-phone').val(),
                department: $('#member-department').val(),
                status: $('#member-status').val(),
                working_hours_start: $('#working-hours-start').val(),
                working_hours_end: $('#working-hours-end').val(),
                working_days: $('#working-days').val()
            };
            
            if (!memberData.name || !memberData.phone) {
                WWPAdmin.showNotice('error', 'الرجاء ملء جميع الحقول المطلوبة');
                return;
            }
            
            $.ajax({
                url: wwp_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'wwp_add_member',
                    nonce: wwp_ajax.nonce,
                    ...memberData
                },
                success: function(response) {
                    if (response.success) {
                        WWPAdmin.showNotice('success', response.data);
                        WWPAdmin.reloadTeamList();
                        WWPAdmin.clearMemberForm();
                    } else {
                        WWPAdmin.showNotice('error', response.data);
                    }
                }
            });
        },
        
        editMember: function() {
            var memberId = $(this).data('member-id');
            // Implementation for editing member
        },
        
        deleteMember: function() {
            var memberId = $(this).data('member-id');
            
            if (!confirm('هل أنت متأكد من حذف هذا العضو؟')) {
                return;
            }
            
            $.ajax({
                url: wwp_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'wwp_delete_member',
                    nonce: wwp_ajax.nonce,
                    member_id: memberId
                },
                success: function(response) {
                    if (response.success) {
                        WWPAdmin.showNotice('success', response.data);
                        WWPAdmin.reloadTeamList();
                    } else {
                        WWPAdmin.showNotice('error', response.data);
                    }
                }
            });
        },
        
        blockIP: function() {
            var ip = $(this).data('ip');
            var reason = prompt('سبب الحظر:');
            
            if (!reason) return;
            
            $.ajax({
                url: wwp_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'wwp_block_ip',
                    nonce: wwp_ajax.nonce,
                    ip_address: ip,
                    reason: reason
                },
                success: function(response) {
                    if (response.success) {
                        WWPAdmin.showNotice('success', response.data);
                        WWPAdmin.loadStats();
                    } else {
                        WWPAdmin.showNotice('error', response.data);
                    }
                }
            });
        },
        
        unblockIP: function() {
            var ip = $(this).data('ip');
            
            $.ajax({
                url: wwp_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'wwp_unblock_ip',
                    nonce: wwp_ajax.nonce,
                    ip_address: ip
                },
                success: function(response) {
                    if (response.success) {
                        WWPAdmin.showNotice('success', response.data);
                        WWPAdmin.loadStats();
                    } else {
                        WWPAdmin.showNotice('error', response.data);
                    }
                }
            });
        },
        
        loadStats: function() {
            $.ajax({
                url: wwp_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'wwp_get_stats',
                    nonce: wwp_ajax.nonce
                },
                success: function(response) {
                    if (response.success) {
                        WWPAdmin.updateStats(response.data);
                    }
                }
            });
        },
        
        updateStats: function(stats) {
            $('#total-clicks').text(stats.total_clicks || 0);
            $('#total-conversations').text(stats.total_conversations || 0);
            $('#unique-visitors').text(stats.unique_ips || 0);
            
            if (stats.daily_stats && stats.daily_stats.length > 0) {
                WWPAdmin.drawChart(stats.daily_stats);
            }
        },
        
        drawChart: function(data) {
            // Implementation for drawing charts
            console.log('Chart data:', data);
        },
        
        reloadTeamList: function() {
            location.reload();
        },
        
        clearMemberForm: function() {
            $('#member-form')[0].reset();
        },
        
        showNotice: function(type, message) {
            var noticeClass = type === 'success' ? 'notice-success' : 'notice-error';
            var $notice = $('<div class="notice ' + noticeClass + ' is-dismissible"><p>' + message + '</p></div>');
            
            $('.wwp-admin-container').prepend($notice);
            
            setTimeout(function() {
                $notice.fadeOut(function() {
                    $(this).remove();
                });
            }, 5000);
        }
    };
    
    $(document).ready(function() {
        WWPAdmin.init();
    });
    
})(jQuery);`;
  };

  const generateFrontendJavaScript = () => {
    return `/* WhatsApp Widget Pro Frontend JavaScript */
(function($) {
    'use strict';
    
    var WWPWidget = {
        settings: wwp_settings || {},
        
        init: function() {
            if (!this.settings.show_widget) {
                return;
            }
            
            this.createWidget();
            this.bindEvents();
            this.trackAnalytics();
        },
        
        createWidget: function() {
            var widget = this.buildWidget();
            $('body').append(widget);
            
            setTimeout(function() {
                $('.wwp-widget-container').addClass('animate-in');
            }, 500);
        },
        
        buildWidget: function() {
            var position = this.settings.widget_position || 'bottom-right';
            var color = this.settings.widget_color || '#25D366';
            
            var html = '<div class="wwp-widget-container position-' + position + '">';
            html += '<div class="wwp-pulse"></div>';
            html += '<button class="wwp-main-button" style="background-color: ' + color + '">';
            html += '<svg viewBox="0 0 32 32"><path d="M16.1 2.4c-7.5 0-13.6 6.1-13.6 13.6 0 2.4.6 4.7 1.8 6.7l-1.9 7 7.2-1.9c1.9 1.1 4.1 1.7 6.5 1.7 7.5 0 13.6-6.1 13.6-13.6S23.6 2.4 16.1 2.4zm6.9 19.3c-.3.8-1.5 1.5-2.5 1.7-.7.1-1.5.2-4.4-1-3.1-1.2-5.1-4.4-5.3-4.6-.2-.2-1.5-2-1.5-3.8s.9-2.7 1.3-3.1c.3-.3.7-.4 1-.4.1 0 .3 0 .5.4.2.4.7 1.7.8 1.8.1.1.1.3 0 .4-.1.2-.2.3-.4.5-.2.2-.4.4-.6.6-.2.2-.4.4-.2.8.2.4.9 1.5 2 2.4 1.4 1.2 2.6 1.6 3 1.8.4.2.6.3.7.5.1.2.1.9-.2 1.7z"/></svg>';
            html += '</button>';
            
            if (this.settings.team_members && this.settings.team_members.length > 0) {
                html += this.buildTeamPopup();
            }
            
            html += '</div>';
            
            return html;
        },
        
        buildTeamPopup: function() {
            var html = '<div class="wwp-team-popup">';
            html += '<div class="wwp-team-header">';
            html += '<h3 class="wwp-team-title">' + (this.settings.welcome_message || 'كيف يمكننا مساعدتك؟') + '</h3>';
            html += '<p class="wwp-team-subtitle">اختر عضو الفريق للتحدث معه</p>';
            html += '</div>';
            
            if (this.settings.team_members) {
                this.settings.team_members.forEach(function(member) {
                    html += WWPWidget.buildMemberCard(member);
                });
            }
            
            html += '</div>';
            return html;
        },
        
        buildMemberCard: function(member) {
            var statusClass = 'wwp-status-' + (member.status || 'online');
            var statusText = this.getStatusText(member.status);
            var initials = this.getInitials(member.name);
            var phone = this.formatPhone(member.phone);
            
            var html = '<a href="https://wa.me/' + phone + '?text=' + encodeURIComponent(this.settings.welcome_message || 'مرحباً') + '" ';
            html += 'class="wwp-team-member" data-member-id="' + (member.id || 0) + '" data-member-name="' + member.name + '" target="_blank">';
            html += '<div class="wwp-member-avatar">' + initials + '</div>';
            html += '<div class="wwp-member-info">';
            html += '<h4 class="wwp-member-name">' + member.name + '</h4>';
            html += '<p class="wwp-member-status">';
            html += '<span class="wwp-status-indicator ' + statusClass + '"></span>';
            html += statusText;
            if (member.department) {
                html += ' - ' + member.department;
            }
            html += '</p>';
            html += '</div>';
            html += '</a>';
            
            return html;
        },
        
        bindEvents: function() {
            $(document).on('click', '.wwp-main-button', this.toggleTeamPopup);
            $(document).on('click', '.wwp-team-member', this.trackClick);
            $(document).on('click', function(e) {
                if (!$(e.target).closest('.wwp-widget-container').length) {
                    $('.wwp-team-popup').removeClass('show');
                }
            });
        },
        
        toggleTeamPopup: function(e) {
            e.preventDefault();
            
            if ($('.wwp-team-popup').length > 0) {
                $('.wwp-team-popup').toggleClass('show');
            } else {
                // Direct WhatsApp link if no team members
                var phone = WWPWidget.settings.default_phone || '';
                var message = WWPWidget.settings.welcome_message || 'مرحباً';
                
                if (phone) {
                    window.open('https://wa.me/' + WWPWidget.formatPhone(phone) + '?text=' + encodeURIComponent(message), '_blank');
                    WWPWidget.trackClick();
                }
            }
        },
        
        trackClick: function(e) {
            var memberId = $(this).data('member-id') || 0;
            var memberName = $(this).data('member-name') || 'Widget';
            
            // Track in database
            $.ajax({
                url: wwp_settings.ajax_url,
                type: 'POST',
                data: {
                    action: 'wwp_record_click',
                    nonce: wwp_settings.nonce,
                    member_id: memberId,
                    page_url: window.location.href
                }
            });
            
            // Track in Google Analytics
            if (typeof gtag !== 'undefined' && wwp_settings.enable_analytics) {
                gtag('event', 'whatsapp_click', {
                    event_category: 'WhatsApp Widget',
                    event_label: memberName,
                    value: 1
                });
            }
        },
        
        trackAnalytics: function() {
            if (!this.settings.enable_analytics || !this.settings.analytics_id) {
                return;
            }
            
            // Google Analytics integration is handled in PHP
        },
        
        formatPhone: function(phone) {
            return phone.replace(/[^0-9]/g, '');
        },
        
        getInitials: function(name) {
            return name.split(' ').map(function(word) {
                return word.charAt(0);
            }).join('').substring(0, 2).toUpperCase();
        },
        
        getStatusText: function(status) {
            var statusTexts = {
                'online': 'متاح الآن',
                'offline': 'غير متاح',
                'away': 'بعيد مؤقتاً',
                'busy': 'مشغول'
            };
            
            return statusTexts[status] || 'متاح الآن';
        }
    };
    
    $(document).ready(function() {
        WWPWidget.init();
    });
    
})(jQuery);`;
  };

  const generateAnalyticsJavaScript = () => {
    return `/* WhatsApp Widget Pro Analytics */
(function() {
    'use strict';
    
    var WWPAnalytics = {
        init: function() {
            if (typeof wwp_settings === 'undefined' || !wwp_settings.enable_analytics) {
                return;
            }
            
            this.trackPageView();
            this.bindEvents();
        },
        
        trackPageView: function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_view', {
                    page_title: document.title,
                    page_location: window.location.href,
                    custom_map: {
                        'dimension1': 'whatsapp_widget_active'
                    }
                });
            }
        },
        
        bindEvents: function() {
            document.addEventListener('click', function(e) {
                if (e.target.closest('.wwp-widget-container')) {
                    WWPAnalytics.trackWidgetInteraction(e);
                }
            });
        },
        
        trackWidgetInteraction: function(event) {
            var element = event.target.closest('[data-member-name]');
            var memberName = element ? element.getAttribute('data-member-name') : 'Main Widget';
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'widget_interaction', {
                    event_category: 'WhatsApp Widget',
                    event_label: memberName,
                    custom_map: {
                        'dimension2': 'widget_click'
                    }
                });
            }
            
            // Facebook Pixel tracking if available
            if (typeof fbq !== 'undefined') {
                fbq('track', 'Contact', {
                    content_name: 'WhatsApp Widget Click',
                    content_category: 'Customer Support'
                });
            }
        },
        
        trackConversion: function(value, currency) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'conversion', {
                    send_to: wwp_settings.analytics_id + '/WWP_CONVERSION',
                    value: value || 1,
                    currency: currency || 'USD'
                });
            }
        }
    };
    
    document.addEventListener('DOMContentLoaded', function() {
        WWPAnalytics.init();
    });
    
    // Export for external use
    window.WWPAnalytics = WWPAnalytics;
    
})();`;
  };

  const generateAdminPageTemplate = () => {
    return `<?php
if (!defined('ABSPATH')) exit;

// Get current settings
$settings = get_option('wwp_settings', array());
$team_members = WWP_Database::get_team_members();
$stats = WWP_Database::get_usage_stats();
$woocommerce_settings = get_option('wwp_woocommerce_settings', array());
$security_settings = get_option('wwp_security_settings', array());
?>

<div class="wwp-admin-container">
    <!-- Header -->
    <div class="wwp-header">
        <h1><?php _e('WhatsApp Widget Pro', 'whatsapp-widget-pro'); ?></h1>
        <p><?php _e('إدارة إضافة WhatsApp الاحترافية مع جميع الميزات المتقدمة', 'whatsapp-widget-pro'); ?></p>
    </div>

    <!-- Tabs Navigation -->
    <div class="wwp-tabs">
        <button class="wwp-tab active" data-tab="general"><?php _e('الإعدادات العامة', 'whatsapp-widget-pro'); ?></button>
        <button class="wwp-tab" data-tab="team"><?php _e('إدارة الفريق', 'whatsapp-widget-pro'); ?></button>
        <button class="wwp-tab" data-tab="analytics"><?php _e('التحليلات', 'whatsapp-widget-pro'); ?></button>
        <button class="wwp-tab" data-tab="woocommerce"><?php _e('WooCommerce', 'whatsapp-widget-pro'); ?></button>
        <button class="wwp-tab" data-tab="security"><?php _e('الأمان', 'whatsapp-widget-pro'); ?></button>
        <button class="wwp-tab" data-tab="stats"><?php _e('الإحصائيات', 'whatsapp-widget-pro'); ?></button>
    </div>

    <!-- General Settings Tab -->
    <div id="wwp-tab-general" class="wwp-tab-content wwp-content">
        <form id="wwp-settings-form" method="post">
            <div class="wwp-form-group">
                <label><?php _e('تفعيل الويدجت', 'whatsapp-widget-pro'); ?></label>
                <div class="wwp-checkbox-group">
                    <input type="checkbox" name="show_widget" value="1" <?php checked(!empty($settings['show_widget'])); ?>>
                    <span><?php _e('عرض ويدجت WhatsApp في الموقع', 'whatsapp-widget-pro'); ?></span>
                </div>
            </div>

            <div class="wwp-form-group">
                <label><?php _e('رسالة الترحيب', 'whatsapp-widget-pro'); ?></label>
                <textarea name="welcome_message" rows="3"><?php echo esc_textarea($settings['welcome_message'] ?? 'مرحباً! كيف يمكنني مساعدتك؟'); ?></textarea>
            </div>

            <div class="wwp-form-group">
                <label><?php _e('موضع الويدجت', 'whatsapp-widget-pro'); ?></label>
                <select name="widget_position">
                    <option value="bottom-right" <?php selected($settings['widget_position'] ?? '', 'bottom-right'); ?>><?php _e('أسفل يمين', 'whatsapp-widget-pro'); ?></option>
                    <option value="bottom-left" <?php selected($settings['widget_position'] ?? '', 'bottom-left'); ?>><?php _e('أسفل يسار', 'whatsapp-widget-pro'); ?></option>
                    <option value="top-right" <?php selected($settings['widget_position'] ?? '', 'top-right'); ?>><?php _e('أعلى يمين', 'whatsapp-widget-pro'); ?></option>
                    <option value="top-left" <?php selected($settings['widget_position'] ?? '', 'top-left'); ?>><?php _e('أعلى يسار', 'whatsapp-widget-pro'); ?></option>
                </select>
            </div>

            <div class="wwp-form-group">
                <label><?php _e('لون الويدجت', 'whatsapp-widget-pro'); ?></label>
                <input type="text" name="widget_color" value="<?php echo esc_attr($settings['widget_color'] ?? '#25D366'); ?>" class="wwp-color-picker">
            </div>

            <div class="wwp-form-group">
                <label><?php _e('العرض خارج ساعات العمل', 'whatsapp-widget-pro'); ?></label>
                <div class="wwp-checkbox-group">
                    <input type="checkbox" name="show_outside_hours" value="1" <?php checked(!empty($settings['show_outside_hours'])); ?>>
                    <span><?php _e('عرض الويدجت خارج ساعات العمل', 'whatsapp-widget-pro'); ?></span>
                </div>
            </div>

            <div class="wwp-form-group">
                <label><?php _e('رسالة خارج ساعات العمل', 'whatsapp-widget-pro'); ?></label>
                <textarea name="outside_hours_message" rows="2"><?php echo esc_textarea($settings['outside_hours_message'] ?? 'نحن غير متاحين حالياً. ساعات العمل: 9 صباحاً - 5 مساءً'); ?></textarea>
            </div>

            <button type="submit" class="wwp-button"><?php _e('حفظ الإعدادات', 'whatsapp-widget-pro'); ?></button>
        </form>
    </div>

    <!-- Team Management Tab -->
    <div id="wwp-tab-team" class="wwp-tab-content wwp-content" style="display: none;">
        <h3><?php _e('إضافة عضو جديد', 'whatsapp-widget-pro'); ?></h3>
        
        <form id="member-form">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div class="wwp-form-group">
                    <label><?php _e('اسم العضو', 'whatsapp-widget-pro'); ?></label>
                    <input type="text" id="member-name" required>
                </div>
                
                <div class="wwp-form-group">
                    <label><?php _e('رقم الهاتف', 'whatsapp-widget-pro'); ?></label>
                    <input type="text" id="member-phone" required>
                </div>
                
                <div class="wwp-form-group">
                    <label><?php _e('القسم', 'whatsapp-widget-pro'); ?></label>
                    <input type="text" id="member-department">
                </div>
                
                <div class="wwp-form-group">
                    <label><?php _e('الحالة', 'whatsapp-widget-pro'); ?></label>
                    <select id="member-status">
                        <option value="online"><?php _e('متاح', 'whatsapp-widget-pro'); ?></option>
                        <option value="busy"><?php _e('مشغول', 'whatsapp-widget-pro'); ?></option>
                        <option value="away"><?php _e('بعيد مؤقتاً', 'whatsapp-widget-pro'); ?></option>
                        <option value="offline"><?php _e('غير متاح', 'whatsapp-widget-pro'); ?></option>
                    </select>
                </div>
            </div>
            
            <button type="button" class="wwp-button wwp-add-member"><?php _e('إضافة العضو', 'whatsapp-widget-pro'); ?></button>
        </form>

        <h3><?php _e('أعضاء الفريق الحاليين', 'whatsapp-widget-pro'); ?></h3>
        
        <div class="wwp-team-grid">
            <?php foreach ($team_members as $member): ?>
            <div class="wwp-team-card">
                <div class="wwp-team-header">
                    <div class="wwp-team-avatar">
                        <?php echo esc_html(strtoupper(substr($member->name, 0, 2))); ?>
                    </div>
                    <div class="wwp-team-info">
                        <h3><?php echo esc_html($member->name); ?></h3>
                        <p><?php echo esc_html($member->department ?: __('غير محدد', 'whatsapp-widget-pro')); ?></p>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <span class="wwp-status-badge wwp-status-<?php echo esc_attr($member->status); ?>">
                        <?php echo esc_html(ucfirst($member->status)); ?>
                    </span>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button class="wwp-button wwp-button-secondary wwp-edit-member" data-member-id="<?php echo esc_attr($member->id); ?>">
                        <?php _e('تعديل', 'whatsapp-widget-pro'); ?>
                    </button>
                    <button class="wwp-button wwp-button-secondary wwp-delete-member" data-member-id="<?php echo esc_attr($member->id); ?>">
                        <?php _e('حذف', 'whatsapp-widget-pro'); ?>
                    </button>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Analytics Tab -->
    <div id="wwp-tab-analytics" class="wwp-tab-content wwp-content" style="display: none;">
        <form method="post" action="<?php echo admin_url('admin-ajax.php'); ?>">
            <input type="hidden" name="action" value="wwp_save_settings">
            <?php wp_nonce_field('wwp_nonce', 'nonce'); ?>
            
            <div class="wwp-form-group">
                <label><?php _e('تفعيل تتبع Google Analytics', 'whatsapp-widget-pro'); ?></label>
                <div class="wwp-checkbox-group">
                    <input type="checkbox" name="enable_analytics" value="1" <?php checked(!empty($settings['enable_analytics'])); ?>>
                    <span><?php _e('تفعيل تتبع النقرات والتحويلات', 'whatsapp-widget-pro'); ?></span>
                </div>
            </div>

            <div class="wwp-form-group">
                <label><?php _e('معرف Google Analytics', 'whatsapp-widget-pro'); ?></label>
                <input type="text" name="analytics_id" value="<?php echo esc_attr($settings['analytics_id'] ?? ''); ?>" placeholder="G-XXXXXXXXXX">
            </div>

            <button type="submit" class="wwp-button"><?php _e('حفظ إعدادات التحليلات', 'whatsapp-widget-pro'); ?></button>
        </form>
    </div>

    <!-- WooCommerce Tab -->
    <div id="wwp-tab-woocommerce" class="wwp-tab-content wwp-content" style="display: none;">
        <?php if (class_exists('WooCommerce')): ?>
        <form method="post">
            <div class="wwp-form-group">
                <label><?php _e('تفعيل تكامل WooCommerce', 'whatsapp-widget-pro'); ?></label>
                <div class="wwp-checkbox-group">
                    <input type="checkbox" name="enable_woocommerce" value="1" <?php checked(!empty($woocommerce_settings['enable_woocommerce'])); ?>>
                    <span><?php _e('تفعيل الإشعارات التلقائية للطلبات', 'whatsapp-widget-pro'); ?></span>
                </div>
            </div>

            <div class="wwp-form-group">
                <label><?php _e('إشعار تأكيد الطلب', 'whatsapp-widget-pro'); ?></label>
                <textarea name="order_confirmation_template" rows="3"><?php echo esc_textarea($woocommerce_settings['order_confirmation_template'] ?? 'شكراً لك! تم استلام طلبك رقم #{order_number} بنجاح.'); ?></textarea>
            </div>

            <button type="submit" class="wwp-button"><?php _e('حفظ إعدادات WooCommerce', 'whatsapp-widget-pro'); ?></button>
        </form>
        <?php else: ?>
        <div style="text-align: center; padding: 40px;">
            <h3><?php _e('WooCommerce غير مثبت', 'whatsapp-widget-pro'); ?></h3>
            <p><?php _e('يرجى تثبيت وتفعيل إضافة WooCommerce للاستفادة من هذه الميزة', 'whatsapp-widget-pro'); ?></p>
        </div>
        <?php endif; ?>
    </div>

    <!-- Security Tab -->
    <div id="wwp-tab-security" class="wwp-tab-content wwp-content" style="display: none;">
        <form method="post">
            <div class="wwp-form-group">
                <label><?php _e('تفعيل نظام حماية IP', 'whatsapp-widget-pro'); ?></label>
                <div class="wwp-checkbox-group">
                    <input type="checkbox" name="enable_ip_blocking" value="1" <?php checked(!empty($security_settings['enable_ip_blocking'])); ?>>
                    <span><?php _e('حظر عناوين IP المشبوهة تلقائياً', 'whatsapp-widget-pro'); ?></span>
                </div>
            </div>

            <div class="wwp-form-group">
                <label><?php _e('الحد الأقصى للنقرات في الساعة', 'whatsapp-widget-pro'); ?></label>
                <input type="number" name="max_clicks_per_hour" value="<?php echo esc_attr($security_settings['max_clicks_per_hour'] ?? 100); ?>" min="1" max="1000">
            </div>

            <button type="submit" class="wwp-button"><?php _e('حفظ إعدادات الأمان', 'whatsapp-widget-pro'); ?></button>
        </form>
    </div>

    <!-- Statistics Tab -->
    <div id="wwp-tab-stats" class="wwp-tab-content wwp-content" style="display: none;">
        <div class="wwp-stats-grid">
            <div class="wwp-stat-card">
                <div class="wwp-stat-number" id="total-clicks"><?php echo number_format($stats['total_clicks'] ?? 0); ?></div>
                <div class="wwp-stat-label"><?php _e('إجمالي النقرات', 'whatsapp-widget-pro'); ?></div>
            </div>
            
            <div class="wwp-stat-card">
                <div class="wwp-stat-number" id="total-conversations"><?php echo number_format($stats['total_conversations'] ?? 0); ?></div>
                <div class="wwp-stat-label"><?php _e('المحادثات', 'whatsapp-widget-pro'); ?></div>
            </div>
            
            <div class="wwp-stat-card">
                <div class="wwp-stat-number" id="unique-visitors"><?php echo number_format($stats['unique_ips'] ?? 0); ?></div>
                <div class="wwp-stat-label"><?php _e('زوار فريدون', 'whatsapp-widget-pro'); ?></div>
            </div>
        </div>

        <div style="margin-top: 30px;">
            <h3><?php _e('الصفحات الأكثر نشاطاً', 'whatsapp-widget-pro'); ?></h3>
            
            <?php if (!empty($stats['top_pages'])): ?>
            <table class="widefat">
                <thead>
                    <tr>
                        <th><?php _e('الصفحة', 'whatsapp-widget-pro'); ?></th>
                        <th><?php _e('النقرات', 'whatsapp-widget-pro'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($stats['top_pages'] as $page): ?>
                    <tr>
                        <td><?php echo esc_html($page->page_url); ?></td>
                        <td><?php echo number_format($page->clicks); ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php else: ?>
            <p><?php _e('لا توجد بيانات متاحة بعد', 'whatsapp-widget-pro'); ?></p>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    // Tab switching functionality
    $('.wwp-tab').click(function() {
        var tabId = $(this).data('tab');
        $('.wwp-tab').removeClass('active');
        $(this).addClass('active');
        $('.wwp-tab-content').hide();
        $('#wwp-tab-' + tabId).show();
    });
});
</script>`;
  };

  const generateWidgetTemplate = () => {
    return `// Widget template is generated dynamically by JavaScript
// This file serves as a placeholder for the widget template structure`;
  };

  const generateTeamPopupTemplate = () => {
    return `// Team popup template is generated dynamically by JavaScript
// This file serves as a placeholder for the team popup template structure`;
  };

  const generateSettingsTabsTemplate = () => {
    return `// Settings tabs template is included in the main admin page
// This file serves as a placeholder for additional settings templates`;
  };

  const generateTranslationFile = () => {
    return `# Arabic translation for WhatsApp Widget Pro
msgid ""
msgstr ""
"Project-Id-Version: WhatsApp Widget Pro\\n"
"Language: ar\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"

msgid "WhatsApp Widget Pro"
msgstr "ويدجت WhatsApp الاحترافي"

msgid "General Settings"
msgstr "الإعدادات العامة"

msgid "Team Management"
msgstr "إدارة الفريق"

msgid "Analytics"
msgstr "التحليلات"

msgid "Statistics"
msgstr "الإحصائيات"

msgid "Security"
msgstr "الأمان"

msgid "Enable Widget"
msgstr "تفعيل الويدجت"

msgid "Welcome Message"
msgstr "رسالة الترحيب"

msgid "Widget Position"
msgstr "موضع الويدجت"

msgid "Widget Color"
msgstr "لون الويدجت"

msgid "Save Settings"
msgstr "حفظ الإعدادات"`;
  };

  const generateBinaryTranslationFile = () => {
    return `Binary translation file placeholder - this would be the compiled .mo file`;
  };

  const generatePOTFile = () => {
    return `# WhatsApp Widget Pro Translation Template
#, fuzzy
msgid ""
msgstr ""
"Project-Id-Version: WhatsApp Widget Pro\\n"
"Report-Msgid-Bugs-To: \\n"
"POT-Creation-Date: 2024-01-01 00:00+0000\\n"
"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\\n"
"Last-Translator: FULL NAME <EMAIL@ADDRESS>\\n"
"Language-Team: LANGUAGE <LL@li.org>\\n"
"Language: \\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"

msgid "WhatsApp Widget Pro"
msgstr ""

msgid "General Settings"
msgstr ""

msgid "Team Management"
msgstr ""`;
  };

  const generateInstallFile = () => {
    return `<?php
if (!defined('ABSPATH')) exit;

class WWP_Install {
    
    public static function activate() {
        // Create database tables
        WWP_Database::create_tables();
        
        // Set default options
        self::set_default_options();
        
        // Schedule cleanup events
        if (!wp_next_scheduled('wwp_daily_cleanup')) {
            wp_schedule_event(time(), 'daily', 'wwp_daily_cleanup');
        }
        
        // Create upload directory
        self::create_upload_directory();
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    public static function deactivate() {
        // Clear scheduled events
        wp_clear_scheduled_hook('wwp_daily_cleanup');
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    public static function uninstall() {
        // Remove database tables
        WWP_Database::drop_tables();
        
        // Remove options
        delete_option('wwp_settings');
        delete_option('wwp_db_version');
        delete_option('wwp_woocommerce_settings');
        delete_option('wwp_security_settings');
        
        // Remove upload directory
        self::remove_upload_directory();
        
        // Clear scheduled events
        wp_clear_scheduled_hook('wwp_daily_cleanup');
    }
    
    private static function set_default_options() {
        $default_settings = array(
            'show_widget' => true,
            'welcome_message' => 'مرحباً! كيف يمكنني مساعدتك؟',
            'widget_position' => 'bottom-right',
            'widget_color' => '#25D366',
            'enable_analytics' => false,
            'show_outside_hours' => false
        );
        
        add_option('wwp_settings', $default_settings);
        add_option('wwp_db_version', WWP_VERSION);
    }
    
    private static function create_upload_directory() {
        $upload_dir = wp_upload_dir();
        $wwp_dir = $upload_dir['basedir'] . '/whatsapp-widget-pro';
        
        if (!file_exists($wwp_dir)) {
            wp_mkdir_p($wwp_dir);
            
            // Create index.php file for security
            file_put_contents($wwp_dir . '/index.php', '<?php // Silence is golden');
        }
    }
    
    private static function remove_upload_directory() {
        $upload_dir = wp_upload_dir();
        $wwp_dir = $upload_dir['basedir'] . '/whatsapp-widget-pro';
        
        if (file_exists($wwp_dir)) {
            self::delete_directory($wwp_dir);
        }
    }
    
    private static function delete_directory($dir) {
        if (!is_dir($dir)) {
            return;
        }
        
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        
        foreach ($files as $fileinfo) {
            $todo = ($fileinfo->isDir() ? 'rmdir' : 'unlink');
            $todo($fileinfo->getRealPath());
        }
        
        rmdir($dir);
    }
}
?>`;
  };

  const generateUninstallFile = () => {
    return `<?php
// If uninstall not called from WordPress, then exit.
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Include the main plugin file to access classes
require_once plugin_dir_path(__FILE__) . 'whatsapp-widget-pro.php';

// Remove all plugin data
WWP_Install::uninstall();
?>`;
  };

  const generateUpgradeFile = () => {
    return `<?php
if (!defined('ABSPATH')) exit;

class WWP_Upgrade {
    
    public static function check_version() {
        $current_version = get_option('wwp_db_version');
        
        if (version_compare($current_version, WWP_VERSION, '<')) {
            self::upgrade_database($current_version);
            update_option('wwp_db_version', WWP_VERSION);
        }
    }
    
    private static function upgrade_database($from_version) {
        global $wpdb;
        
        // Upgrade from version 1.x to 2.0
        if (version_compare($from_version, '2.0.0', '<')) {
            // Add new columns to existing tables
            $wpdb->query("ALTER TABLE {$wpdb->prefix}wwp_team_members ADD COLUMN working_hours_start TIME DEFAULT '09:00:00'");
            $wpdb->query("ALTER TABLE {$wpdb->prefix}wwp_team_members ADD COLUMN working_hours_end TIME DEFAULT '17:00:00'");
            $wpdb->query("ALTER TABLE {$wpdb->prefix}wwp_team_members ADD COLUMN working_days VARCHAR(20) DEFAULT '1,2,3,4,5'");
            
            // Create new tables
            WWP_Database::create_tables();
        }
    }
}
?>`;
  };

  const generateHtaccessFile = () => {
    return `# WhatsApp Widget Pro Security
<Files "*.php">
    Order Deny,Allow
    Deny from all
</Files>

<Files "*.log">
    Order Deny,Allow
    Deny from all
</Files>

# Prevent direct access to sensitive files  
<FilesMatch "\\.(sql|log|conf)$">
    Order Allow,Deny
    Deny from all
</FilesMatch>`;
  };

  const generateIndexFile = () => {
    return `<?php
// Silence is golden
?>`;
  };

  const generateConstantsFile = () => {
    return `<?php
if (!defined('ABSPATH')) exit;

// Plugin version and paths
define('WWP_PLUGIN_NAME', 'WhatsApp Widget Pro');
define('WWP_PLUGIN_SLUG', 'whatsapp-widget-pro');
define('WWP_TEXT_DOMAIN', 'whatsapp-widget-pro');

// API endpoints
define('WWP_API_VERSION', 'v1');
define('WWP_API_NAMESPACE', 'wwp/' . WWP_API_VERSION);

// Database table names
define('WWP_TEAM_TABLE', 'wwp_team_members');
define('WWP_STATS_TABLE', 'wwp_stats');
define('WWP_BLOCKED_IPS_TABLE', 'wwp_blocked_ips');
define('WWP_WOOCOMMERCE_TABLE', 'wwp_woocommerce_integration');

// Cache settings
define('WWP_CACHE_DURATION', 3600); // 1 hour
define('WWP_STATS_CACHE_DURATION', 1800); // 30 minutes

// Security settings
define('WWP_MAX_UPLOAD_SIZE', 2 * 1024 * 1024); // 2MB
define('WWP_ALLOWED_FILE_TYPES', 'jpg,jpeg,png,gif');

// Default values
define('WWP_DEFAULT_POSITION', 'bottom-right');
define('WWP_DEFAULT_COLOR', '#25D366');
define('WWP_DEFAULT_MESSAGE', 'مرحباً! كيف يمكنني مساعدتك؟');

// WhatsApp API
define('WWP_WHATSAPP_API_URL', 'https://wa.me/');
define('WWP_WHATSAPP_WEB_URL', 'https://web.whatsapp.com/send');
?>`;
  };

  const generateAdminActionsFile = () => {
    return `<?php
if (!defined('ABSPATH')) exit;

// Handle admin AJAX actions
add_action('wp_ajax_wwp_save_settings', 'wwp_handle_save_settings');
add_action('wp_ajax_wwp_add_team_member', 'wwp_handle_add_team_member');
add_action('wp_ajax_wwp_edit_team_member', 'wwp_handle_edit_team_member');
add_action('wp_ajax_wwp_delete_team_member', 'wwp_handle_delete_team_member');
add_action('wp_ajax_wwp_get_statistics', 'wwp_handle_get_statistics');
add_action('wp_ajax_wwp_export_data', 'wwp_handle_export_data');
add_action('wp_ajax_wwp_import_data', 'wwp_handle_import_data');

function wwp_handle_save_settings() {
    check_ajax_referer('wwp_nonce', 'nonce');
    
    if (!current_user_can('manage_options')) {
        wp_send_json_error('غير مصرح لك بهذا الإجراء');
    }
    
    $settings = array();
    $allowed_fields = array(
        'show_widget', 'welcome_message', 'widget_position', 
        'widget_color', 'enable_analytics', 'analytics_id',
        'show_outside_hours', 'outside_hours_message'
    );
    
    foreach ($allowed_fields as $field) {
        if (isset($_POST[$field])) {
            $settings[$field] = sanitize_text_field($_POST[$field]);
        }
    }
    
    $result = update_option('wwp_settings', $settings);
    
    if ($result !== false) {
        wp_send_json_success('تم حفظ الإعدادات بنجاح');
    } else {
        wp_send_json_error('فشل في حفظ الإعدادات');
    }
}

function wwp_handle_add_team_member() {
    check_ajax_referer('wwp_nonce', 'nonce');
    
    if (!current_user_can('manage_options')) {
        wp_send_json_error('غير مصرح لك بهذا الإجراء');
    }
    
    global $wpdb;
    
    $name = sanitize_text_field($_POST['name']);
    $phone = sanitize_text_field($_POST['phone']);
    $department = sanitize_text_field($_POST['department']);
    $status = sanitize_text_field($_POST['status']);
    
    if (empty($name) || empty($phone)) {
        wp_send_json_error('الاسم ورقم الهاتف مطلوبان');
    }
    
    $result = $wpdb->insert(
        $wpdb->prefix . WWP_TEAM_TABLE,
        array(
            'name' => $name,
            'phone' => $phone,
            'department' => $department,
            'status' => $status,
            'created_at' => current_time('mysql')
        ),
        array('%s', '%s', '%s', '%s', '%s')
    );
    
    if ($result) {
        wp_send_json_success('تم إضافة العضو بنجاح');
    } else {
        wp_send_json_error('فشل في إضافة العضو');
    }
}

function wwp_handle_get_statistics() {
    check_ajax_referer('wwp_nonce', 'nonce');
    
    if (!current_user_can('manage_options')) {
        wp_send_json_error('غير مصرح لك بهذا الإجراء');
    }
    
    $stats = WWP_Database::get_usage_stats();
    wp_send_json_success($stats);
}

function wwp_handle_export_data() {
    check_ajax_referer('wwp_nonce', 'nonce');
    
    if (!current_user_can('manage_options')) {
        wp_send_json_error('غير مصرح لك بهذا الإجراء');
    }
    
    $export_data = array(
        'settings' => get_option('wwp_settings'),
        'team_members' => WWP_Database::get_team_members(),
        'export_date' => current_time('mysql'),
        'version' => WWP_VERSION
    );
    
    wp_send_json_success($export_data);
}
?>`;
  };

  const generateFrontendActionsFile = () => {
    return `<?php
if (!defined('ABSPATH')) exit;

// Handle frontend AJAX actions
add_action('wp_ajax_wwp_track_click', 'wwp_handle_track_click');
add_action('wp_ajax_nopriv_wwp_track_click', 'wwp_handle_track_click');
add_action('wp_ajax_wwp_get_team_status', 'wwp_handle_get_team_status');
add_action('wp_ajax_nopriv_wwp_get_team_status', 'wwp_handle_get_team_status');

function wwp_handle_track_click() {
    check_ajax_referer('wwp_nonce', 'nonce');
    
    // Check IP blocking
    if (!WWP_Security::check_ip_access()) {
        wp_send_json_error('تم حظر الوصول');
    }
    
    global $wpdb;
    
    $member_id = intval($_POST['member_id']);
    $page_url = esc_url_raw($_POST['page_url']);
    $user_ip = WWP_Security::get_user_ip();
    $user_agent = sanitize_text_field($_SERVER['HTTP_USER_AGENT']);
    $today = current_time('Y-m-d');
    
    // Insert or update daily stats
    $result = $wpdb->query($wpdb->prepare(
        "INSERT INTO {$wpdb->prefix}" . WWP_STATS_TABLE . " (date, clicks, member_id, user_ip, page_url, user_agent) 
         VALUES (%s, 1, %d, %s, %s, %s) 
         ON DUPLICATE KEY UPDATE clicks = clicks + 1",
        $today, $member_id, $user_ip, $page_url, $user_agent
    ));
    
    if ($result !== false) {
        // Track in Google Analytics if enabled
        $settings = get_option('wwp_settings', array());
        if (!empty($settings['enable_analytics']) && !empty($settings['analytics_id'])) {
            // Analytics tracking handled by frontend JavaScript
        }
        
        wp_send_json_success('تم تسجيل النقرة');
    } else {
        wp_send_json_error('فشل في تسجيل النقرة');
    }
}

function wwp_handle_get_team_status() {
    $available_members = WWP_Database::get_available_members();
    $current_time = current_time('H:i:s');
    $current_day = date('N');
    
    $team_status = array();
    
    foreach ($available_members as $member) {
        $working_days = explode(',', $member->working_days);
        $is_working_day = in_array($current_day, $working_days);
        $is_working_hours = ($current_time >= $member->working_hours_start && $current_time <= $member->working_hours_end);
        
        $status = 'offline';
        if ($is_working_day && $is_working_hours && $member->status === 'online') {
            $status = 'online';
        } elseif ($member->status === 'busy') {
            $status = 'busy';
        } elseif ($member->status === 'away') {
            $status = 'away';
        }
        
        $team_status[] = array(
            'id' => $member->id,
            'name' => $member->name,
            'phone' => $member->phone,
            'department' => $member->department,
            'status' => $status,
            'is_available' => ($status === 'online')
        );
    }
    
    wp_send_json_success($team_status);
}
?>`;
  };

  const generateUserGuideFile = () => {
    return `# دليل المستخدم - WhatsApp Widget Pro

## مقدمة
WhatsApp Widget Pro هي إضافة WordPress احترافية تتيح لك إضافة ويدجت WhatsApp متقدم لموقعك مع إمكانيات إدارة الفريق والتحليلات المتقدمة.

## الميزات الرئيسية
- إدارة فريق متعددة الأعضاء
- تتبع Google Analytics المتقدم
- تكامل WooCommerce للإشعارات التلقائية
- نظام حماية IP من الإساءة
- تخصيص كامل للمظهر والألوان
- دعم RTL للغة العربية

## البدء السريع

### 1. التثبيت
1. ارفع مجلد الإضافة إلى `/wp-content/plugins/`
2. فعل الإضافة من لوحة تحكم WordPress
3. اذهب إلى "WhatsApp Widget" من القائمة الجانبية

### 2. الإعداد الأساسي
1. **تفعيل الويدجت**: ضع علامة صح على "تفعيل الويدجت"
2. **رسالة الترحيب**: اكتب الرسالة التي ستظهر للزوار
3. **موضع الويدجت**: اختر المكان المناسب (أسفل يمين، يسار، إلخ)
4. **لون الويدجت**: اختر اللون المناسب لموقعك

## إدارة الفريق

### إضافة أعضاء جديدة
1. اذهب إلى تبويب "إدارة الفريق"
2. املأ بيانات العضو:
   - الاسم
   - رقم الهاتف (مع رمز البلد)
   - القسم
   - الحالة (متاح، مشغول، إلخ)
3. اضغط "إضافة العضو"

### ساعات العمل
- يمكنك تحديد ساعات العمل لكل عضو
- الويدجت سيظهر الأعضاء المتاحين فقط حسب التوقيت
- يمكن تفعيل العرض خارج ساعات العمل مع رسالة مخصصة

## التحليلات والإحصائيات

### Google Analytics
1. فعل "تتبع Google Analytics"
2. أدخل معرف GA4 (مثل: G-XXXXXXXXXX)
3. سيتم تتبع النقرات والتحويلات تلقائياً

### الإحصائيات المحلية
- إجمالي النقرات
- عدد المحادثات
- الزوار الفريدون
- الصفحات الأكثر نشاطاً

## تكامل WooCommerce

### إعداد الإشعارات
1. فعل "تكامل WooCommerce"
2. اكتب قوالب الرسائل:
   - إشعار تأكيد الطلب
   - إشعار الشحن
   - إشعار التسليم

### المتغيرات المتاحة
- `{order_number}`: رقم الطلب
- `{customer_name}`: اسم العميل
- `{total}`: إجمالي المبلغ

## الأمان وحماية IP

### الحماية التلقائية
- منع النقرات المشبوهة
- حظر IP تلقائياً عند تجاوز الحد المسموح
- قائمة بيضاء للـ IP المسموحة

### الإعدادات
- الحد الأقصى للنقرات في الساعة
- تفعيل الحظر التلقائي
- إدارة قائمة IP المحظورة

## التخصيص المتقدم

### الألوان والمظهر
- لون الويدجت الرئيسي
- موضع الظهور
- حجم وشكل الزر

### الرسائل المخصصة
- رسالة الترحيب
- رسالة خارج ساعات العمل
- رسائل WooCommerce

## استكشاف الأخطاء

### الويدجت لا يظهر
1. تأكد من تفعيل "عرض الويدجت"
2. تحقق من إعدادات ساعات العمل
3. امسح الكاش إذا كنت تستخدم إضافة كاش

### النقرات لا تُسجل
1. تحقق من إعدادات JavaScript
2. تأكد من عدم حظر IP الخاص بك
3. تحقق من إعدادات الأمان

## الدعم الفني
للحصول على الدعم الفني، يرجى زيارة موقعنا الرسمي أو إرسال رسالة عبر WhatsApp Widget نفسه!`;
  };

  const generateInstallationGuideFile = () => {
    return `# دليل التثبيت - WhatsApp Widget Pro

## متطلبات النظام
- WordPress 5.0 أو أحدث
- PHP 7.4 أو أحدث
- MySQL 5.6 أو أحدث
- مساحة قرص: 10 ميجابايت على الأقل

## طرق التثبيت

### الطريقة الأولى: التثبيت عبر لوحة تحكم WordPress
1. اذهب إلى "إضافات" > "إضافة جديد"
2. اضغط "رفع إضافة"
3. اختر ملف الإضافة المضغوط
4. اضغط "تثبيت الآن"
5. فعل الإضافة

### الطريقة الثانية: التثبيت عبر FTP
1. استخرج ملف الإضافة المضغوط
2. ارفع مجلد "whatsapp-widget-pro" إلى "/wp-content/plugins/"
3. اذهب إلى "إضافات" في لوحة التحكم
4. فعل "WhatsApp Widget Pro"

## الإعداد الأولي

### 1. التفعيل
بعد تفعيل الإضافة، ستظهر صفحة ترحيب بالميزات الجديدة.

### 2. إنشاء قاعدة البيانات
الإضافة ستنشئ الجداول التالية تلقائياً:
- wwp_team_members: بيانات أعضاء الفريق
- wwp_stats: إحصائيات الاستخدام
- wwp_blocked_ips: عناوين IP المحظورة
- wwp_woocommerce_integration: تكامل WooCommerce

### 3. الإعدادات الافتراضية
سيتم تطبيق الإعدادات التالية:
- موضع الويدجت: أسفل يمين
- لون الويدجت: #25D366 (الأخضر)
- رسالة الترحيب: "مرحباً! كيف يمكنني مساعدتك؟"

## التحقق من التثبيت

### 1. فحص قاعدة البيانات
تأكد من إنشاء الجداول بنجاح:
\`\`\`sql
SHOW TABLES LIKE 'wp_wwp_%';
\`\`\`

### 2. فحص الملفات
تأكد من وجود الملفات الأساسية:
- whatsapp-widget-pro.php
- assets/frontend-style.css
- assets/wwp-combined.js

### 3. فحص الأذونات
تأكد من أذونات الكتابة لمجلد:
- /wp-content/uploads/whatsapp-widget-pro/

## الترقية من إصدار سابق

### النسخ الاحتياطي
قبل الترقية، انسخ:
1. إعدادات الإضافة من قاعدة البيانات
2. أي تخصيصات في ملفات CSS/JS

### عملية الترقية
1. إلغاء تفعيل الإضافة القديمة
2. حذف الملفات القديمة
3. تثبيت الإصدار الجديد
4. تفعيل الإضافة

## استكشاف مشاكل التثبيت

### خطأ في قاعدة البيانات
إذا فشل إنشاء الجداول:
1. تحقق من أذونات قاعدة البيانات
2. تأكد من توفر مساحة كافية
3. فحص سجل أخطاء MySQL

### مشاكل الملفات
إذا لم تظهر الملفات:
1. تحقق من أذونات مجلد الإضافات
2. تأكد من اكتمال عملية الرفع
3. فحص سجل أخطاء PHP

### تعارض مع إضافات أخرى
في حالة تعارض:
1. إلغاء تفعيل الإضافات الأخرى مؤقتاً
2. تفعيل WhatsApp Widget Pro
3. إعادة تفعيل الإضافات واحدة تلو الأخرى

## الدعم الفني
إذا واجهت أي مشاكل في التثبيت:
- تحقق من متطلبات النظام
- راجع سجل أخطاء WordPress
- تواصل مع فريق الدعم`;
  };

  const generateTroubleshootingGuideFile = () => {
    return `# دليل استكشاف الأخطاء - WhatsApp Widget Pro

## المشاكل الشائعة وحلولها

### 1. الويدجت لا يظهر في الموقع

#### الأسباب المحتملة:
- الويدجت غير مفعل في الإعدادات
- تعارض مع CSS الخاص بالقالب
- خطأ في JavaScript
- حظر IP

#### الحلول:
1. **تحقق من الإعدادات**:
   - اذهب إلى لوحة التحكم > WhatsApp Widget
   - تأكد من تفعيل "عرض الويدجت"

2. **فحص CSS**:
   - افتح أدوات المطور في المتصفح (F12)
   - ابحث عن عنصر `.wwp-widget-container`
   - تحقق من قيم `display` و `visibility`

3. **فحص JavaScript**:
   - تحقق من وجود أخطاء في Console
   - تأكد من تحميل ملف `wwp-combined.js`

### 2. النقرات لا تُسجل في الإحصائيات

#### الأسباب المحتملة:
- خطأ في AJAX
- مشكلة في ق‍اعدة البيانات
- حظر الـ IP

#### الحلول:
1. **فحص AJAX**:
   \`\`\`javascript
   // في Console المتصفح
   console.log(wwp_settings);
   \`\`\`

2. **فحص قاعدة البيانات**:
   \`\`\`sql
   SELECT * FROM wp_wwp_stats ORDER BY created_at DESC LIMIT 10;
   \`\`\`

3. **فحص حظر IP**:
   - اذهب إلى تبويب "الأمان"
   - تحقق من قائمة IP المحظورة

### 3. Google Analytics لا يتتبع النقرات

#### الحلول:
1. **تحقق من معرف GA**:
   - يجب أن يكون بصيغة `G-XXXXXXXXXX`
   - تأكد من تفعيل "تتبع الأحداث"

2. **فحص كود التتبع**:
   - اعرض مصدر الصفحة
   - ابحث عن `gtag('config'`

### 4. رسائل WooCommerce لا تُرسل

#### الأسباب:
- تكامل WooCommerce غير مفعل
- أخطاء في قوالب الرسائل
- مشكلة في أرقام الهواتف

#### الحلول:
1. **تفعيل التكامل**:
   - اذهب إلى تبويب "WooCommerce"
   - فعل "تكامل WooCommerce"

2. **فحص القوالب**:
   - تأكد من وجود المتغيرات الضرورية
   - اختبر القوالب مع طلب تجريبي

### 5. مشاكل الأداء

#### الأعراض:
- بطء في تحميل الصفحات
- استهلاك عالي للذاكرة
- قاعدة بيانات كبيرة

#### الحلول:
1. **تنظيف قاعدة البيانات**:
   \`\`\`sql
   DELETE FROM wp_wwp_stats WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
   \`\`\`

2. **تحسين الإعدادات**:
   - قلل من تكرار تحديث الإحصائيات
   - فعل الكاش إذا متوفر

## رسائل الخطأ الشائعة

### "فشل في التحقق من الأمان"
**السبب**: انتهاء صلاحية nonce
**الحل**: إعادة تحميل الصفحة

### "غير مصرح لك بهذا الإجراء"
**السبب**: نقص في الصلاحيات
**الحل**: تسجيل الدخول كمدير

### "تم حظر الوصول من هذا العنوان"
**السبب**: حظر IP
**الحل**: إلغاء حظر IP من إعدادات الأمان

## أدوات التشخيص

### 1. فحص صحة النظام
\`\`\`php
// أضف هذا الكود في functions.php مؤقتاً
function wwp_system_check() {
    echo "PHP Version: " . PHP_VERSION . "<br>";
    echo "WordPress Version: " . get_bloginfo('version') . "<br>";
    echo "WWP Version: " . WWP_VERSION . "<br>";
    echo "Database Tables: ";
    global $wpdb;
    $tables = $wpdb->get_results("SHOW TABLES LIKE '{$wpdb->prefix}wwp_%'");
    echo count($tables) . " tables found<br>";
}
// استدعي الدالة في أي صفحة
\`\`\`

### 2. تشخيص JavaScript
\`\`\`javascript
// في Console المتصفح
// فحص تحميل الإضافة
console.log('WWP Settings:', typeof wwp_settings !== 'undefined' ? wwp_settings : 'Not loaded');

// فحص الويدجت
console.log('Widget Element:', document.querySelector('.wwp-widget-container'));

// تسجيل نقرة تجريبية
jQuery.ajax({
    url: wwp_settings.ajax_url,
    type: 'POST',
    data: {
        action: 'wwp_record_click',
        nonce: wwp_settings.nonce,
        member_id: 0,
        page_url: window.location.href
    },
    success: function(response) {
        console.log('Test click recorded:', response);
    }
});
\`\`\`

## طلب المساعدة

### معلومات مطلوبة عند طلب الدعم:
1. إصدار WordPress
2. إصدار PHP
3. إصدار الإضافة
4. وصف تفصيلي للمشكلة
5. خطوات إعادة إنتاج المشكلة
6. رسائل الخطأ (إن وجدت)
7. لقطة شاشة من المشكلة

### معلومات النظام:
\`\`\`
WordPress: [إصدار]
PHP: [إصدار]
MySQL: [إصدار]
القالب: [اسم القالب]
الإضافات النشطة: [قائمة الإضافات]
\`\`\`

## الصيانة الدورية

### شهرياً:
- تنظيف جدول الإحصائيات
- فحص أداء قاعدة البيانات
- مراجعة سجل الأخطاء

### سنوياً:
- نسخ احتياطي من الإعدادات
- ترقية الإضافة للإصدار الأحدث
- مراجعة إعدادات الأمان`;
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={generatePluginZip}
      disabled={isGenerating}
      className="flex items-center gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
    >
      {isGenerating ? (
        <>
          <Package className="h-4 w-4 animate-spin" />
          جاري التحضير...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          تنزيل الإضافة
        </>
      )}
    </Button>
  );
};

export default PluginDownloader;
