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
    
    .wwp-team-popup {
        min-width: 260px;
        max-width: calc(100vw - 40px);
    }
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
