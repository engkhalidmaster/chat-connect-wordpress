<?php
/**
 * Plugin Name: WhatsApp Widget Pro
 * Description: إضافة احترافية لعرض زر WhatsApp مع تتبع Google Analytics وتكامل WooCommerce ونظام حماية IP
 * Version: 2.0.0
 * Author: WhatsApp Widget Pro Team
 * Text Domain: whatsapp-widget-pro
 * Domain Path: /languages
 */

// منع الوصول المباشر
if (!defined('ABSPATH')) {
    exit;
}

// تعريف المتغيرات الأساسية
define('WWP_VERSION', '2.0.0');
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
            status enum('online','offline','away','busy') DEFAULT 'online',
            display_order int(11) DEFAULT 0,
            working_hours_start time DEFAULT '09:00:00',
            working_hours_end time DEFAULT '17:00:00',
            working_days varchar(20) DEFAULT '1,2,3,4,5',
            auto_reply_message text DEFAULT '',
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
        
        // جدول منع الـ IP
        $blocked_ips_table = $wpdb->prefix . 'wwp_blocked_ips';
        $blocked_ips_sql = "CREATE TABLE $blocked_ips_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            ip_address varchar(45) NOT NULL,
            reason varchar(255) DEFAULT '',
            blocked_by int(11) DEFAULT 0,
            blocked_at datetime DEFAULT CURRENT_TIMESTAMP,
            expires_at datetime DEFAULT NULL,
            is_active tinyint(1) DEFAULT 1,
            PRIMARY KEY (id),
            UNIQUE KEY ip_address (ip_address),
            KEY is_active (is_active),
            KEY expires_at (expires_at)
        ) $charset_collate;";
        
        // جدول تكامل WooCommerce
        $woocommerce_table = $wpdb->prefix . 'wwp_woocommerce_integration';
        $woocommerce_sql = "CREATE TABLE $woocommerce_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            order_id int(11) NOT NULL,
            customer_phone varchar(20) DEFAULT '',
            whatsapp_sent tinyint(1) DEFAULT 0,
            message_type enum('order_confirmation','shipping_update','delivery_notice') DEFAULT 'order_confirmation',
            sent_at datetime DEFAULT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY order_id (order_id),
            KEY whatsapp_sent (whatsapp_sent)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($team_sql);
        dbDelta($stats_sql);
        dbDelta($blocked_ips_sql);
        dbDelta($woocommerce_sql);
        
        // إضافة بيانات تجريبية
        self::insert_sample_data();
        
        // حفظ إصدار قاعدة البيانات
        update_option('wwp_db_version', '2.0.0');
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
            array('محمد أحمد', '+966501234567', 'المبيعات', 'online', 1, '09:00:00', '17:00:00', '1,2,3,4,5'),
            array('فاطمة علي', '+966507654321', 'الدعم الفني', 'online', 2, '10:00:00', '18:00:00', '1,2,3,4,5'),
            array('خالد محمد', '+966509876543', 'خدمة العملاء', 'away', 3, '08:00:00', '16:00:00', '1,2,3,4,5,6')
        );
        
        foreach ($sample_members as $member) {
            $wpdb->insert(
                $team_table,
                array(
                    'name' => $member[0],
                    'phone' => $member[1],
                    'department' => $member[2],
                    'status' => $member[3],
                    'display_order' => $member[4],
                    'working_hours_start' => $member[5],
                    'working_hours_end' => $member[6],
                    'working_days' => $member[7]
                ),
                array('%s', '%s', '%s', '%s', '%d', '%s', '%s', '%s')
            );
        }
    }
    
    public static function drop_tables() {
        global $wpdb;
        
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wwp_team_members");
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wwp_stats");
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wwp_blocked_ips");
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wwp_woocommerce_integration");
        
        delete_option('wwp_db_version');
        delete_option('wwp_settings');
        delete_option('wwp_woocommerce_settings');
        delete_option('wwp_security_settings');
    }
    
    public static function get_team_members() {
        global $wpdb;
        return $wpdb->get_results("SELECT * FROM {$wpdb->prefix}wwp_team_members ORDER BY display_order ASC");
    }
    
    public static function get_available_members() {
        global $wpdb;
        $current_time = current_time('H:i:s');
        $current_day = date('N'); // 1 = Monday, 7 = Sunday
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}wwp_team_members 
             WHERE status = 'online' 
             AND working_hours_start <= %s 
             AND working_hours_end >= %s 
             AND FIND_IN_SET(%d, working_days) > 0
             ORDER BY display_order ASC",
            $current_time, $current_time, $current_day
        ));
    }
    
    public static function is_ip_blocked($ip) {
        global $wpdb;
        
        $result = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}wwp_blocked_ips 
             WHERE ip_address = %s 
             AND is_active = 1 
             AND (expires_at IS NULL OR expires_at > NOW())",
            $ip
        ));
        
        return !empty($result);
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
        
        $stats['top_pages'] = $wpdb->get_results(
            "SELECT page_url, SUM(clicks) as clicks 
             FROM {$wpdb->prefix}wwp_stats 
             WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
             GROUP BY page_url 
             ORDER BY clicks DESC 
             LIMIT 10"
        );
        
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
 * فئة الأمان ومنع الـ IP
 */
class WWP_Security {
    
    public static function check_ip_access() {
        $user_ip = self::get_user_ip();
        
        if (WWP_Database::is_ip_blocked($user_ip)) {
            return false;
        }
        
        return true;
    }
    
    public static function get_user_ip() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            return $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            return $_SERVER['REMOTE_ADDR'];
        }
    }
    
    public static function block_ip($ip, $reason = '', $expires_hours = null) {
        global $wpdb;
        
        $expires_at = null;
        if ($expires_hours) {
            $expires_at = date('Y-m-d H:i:s', strtotime("+{$expires_hours} hours"));
        }
        
        return $wpdb->insert(
            $wpdb->prefix . 'wwp_blocked_ips',
            array(
                'ip_address' => $ip,
                'reason' => $reason,
                'blocked_by' => get_current_user_id(),
                'expires_at' => $expires_at
            ),
            array('%s', '%s', '%d', '%s')
        );
    }
    
    public static function unblock_ip($ip) {
        global $wpdb;
        
        return $wpdb->update(
            $wpdb->prefix . 'wwp_blocked_ips',
            array('is_active' => 0),
            array('ip_address' => $ip),
            array('%d'),
            array('%s')
        );
    }
}

/**
 * فئة تكامل WooCommerce
 */
class WWP_WooCommerce {
    
    public function __construct() {
        if (class_exists('WooCommerce')) {
            add_action('woocommerce_new_order', array($this, 'handle_new_order'));
            add_action('woocommerce_order_status_processing', array($this, 'handle_order_processing'));
            add_action('woocommerce_order_status_completed', array($this, 'handle_order_completed'));
        }
    }
    
    public function handle_new_order($order_id) {
        $settings = get_option('wwp_woocommerce_settings', array());
        
        if (!isset($settings['send_order_notifications']) || !$settings['send_order_notifications']) {
            return;
        }
        
        $order = wc_get_order($order_id);
        $phone = $order->get_billing_phone();
        
        if ($phone) {
            $this->send_whatsapp_message($order_id, $phone, 'order_confirmation');
        }
    }
    
    public function handle_order_processing($order_id) {
        $settings = get_option('wwp_woocommerce_settings', array());
        
        if (!isset($settings['send_processing_notifications']) || !$settings['send_processing_notifications']) {
            return;
        }
        
        $order = wc_get_order($order_id);
        $phone = $order->get_billing_phone();
        
        if ($phone) {
            $this->send_whatsapp_message($order_id, $phone, 'shipping_update');
        }
    }
    
    public function handle_order_completed($order_id) {
        $settings = get_option('wwp_woocommerce_settings', array());
        
        if (!isset($settings['send_completion_notifications']) || !$settings['send_completion_notifications']) {
            return;
        }
        
        $order = wc_get_order($order_id);
        $phone = $order->get_billing_phone();
        
        if ($phone) {
            $this->send_whatsapp_message($order_id, $phone, 'delivery_notice');
        }
    }
    
    private function send_whatsapp_message($order_id, $phone, $message_type) {
        global $wpdb;
        
        $order = wc_get_order($order_id);
        $settings = get_option('wwp_woocommerce_settings', array());
        
        // إنشاء الرسالة حسب النوع
        $message = $this->get_message_template($order, $message_type, $settings);
        
        // تسجيل في قاعدة البيانات
        $wpdb->insert(
            $wpdb->prefix . 'wwp_woocommerce_integration',
            array(
                'order_id' => $order_id,
                'customer_phone' => $phone,
                'whatsapp_sent' => 1,
                'message_type' => $message_type,
                'sent_at' => current_time('mysql')
            ),
            array('%d', '%s', '%d', '%s', '%s')
        );
        
        // إرسال رسالة WhatsApp (يمكن تطويرها لاحقاً للإرسال الفعلي)
        do_action('wwp_woocommerce_message_sent', $order_id, $phone, $message, $message_type);
    }
    
    private function get_message_template($order, $message_type, $settings) {
        $templates = array(
            'order_confirmation' => $settings['order_confirmation_template'] ?? 'شكراً لك! تم استلام طلبك رقم #{order_number} بنجاح. سيتم التواصل معك قريباً.',
            'shipping_update' => $settings['shipping_update_template'] ?? 'طلبك رقم #{order_number} قيد التجهيز وسيتم شحنه قريباً.',
            'delivery_notice' => $settings['delivery_notice_template'] ?? 'تم تسليم طلبك رقم #{order_number} بنجاح. شكراً لثقتك بنا!'
        );
        
        $message = $templates[$message_type];
        
        // استبدال المتغيرات
        $message = str_replace('{order_number}', $order->get_order_number(), $message);
        $message = str_replace('{customer_name}', $order->get_billing_first_name(), $message);
        $message = str_replace('{total}', $order->get_formatted_order_total(), $message);
        
        return $message;
    }
}

/**
 * فئة معالجة AJAX
 */
class WWP_Ajax {
    
    public function __construct() {
        add_action('wp_ajax_wwp_save_settings', array($this, 'save_settings'));
        add_action('wp_ajax_wwp_save_woocommerce_settings', array($this, 'save_woocommerce_settings'));
        add_action('wp_ajax_wwp_save_security_settings', array($this, 'save_security_settings'));
        add_action('wp_ajax_wwp_record_click', array($this, 'record_click'));
        add_action('wp_ajax_wwp_add_member', array($this, 'add_member'));
        add_action('wp_ajax_wwp_edit_member', array($this, 'edit_member'));
        add_action('wp_ajax_wwp_delete_member', array($this, 'delete_member'));
        add_action('wp_ajax_wwp_get_stats', array($this, 'get_stats'));
        add_action('wp_ajax_wwp_block_ip', array($this, 'block_ip'));
        add_action('wp_ajax_wwp_unblock_ip', array($this, 'unblock_ip'));
        add_action('wp_ajax_wwp_uninstall_plugin', array($this, 'uninstall_plugin'));
        
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
            'enable_analytics' => isset($_POST['enable_analytics']) ? sanitize_text_field($_POST['enable_analytics']) : '0',
            'show_outside_hours' => isset($_POST['show_outside_hours']) ? sanitize_text_field($_POST['show_outside_hours']) : '0',
            'outside_hours_message' => isset($_POST['outside_hours_message']) ? sanitize_textarea_field($_POST['outside_hours_message']) : 'نحن غير متاحين حالياً. ساعات العمل: 9 صباحاً - 5 مساءً'
        );
        
        // حفظ الإعدادات
        $result = update_option('wwp_settings', $settings);
        
        if ($result !== false) {
            wp_send_json_success('تم حفظ الإعدادات بنجاح');
        } else {
            wp_send_json_error('فشل في حفظ الإعدادات');
        }
    }
    
    public function save_woocommerce_settings() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('فشل في التحقق من الأمان');
        }
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
        }
        
        $settings = array(
            'enable_woocommerce' => isset($_POST['enable_woocommerce']) ? sanitize_text_field($_POST['enable_woocommerce']) : '0',
            'send_order_notifications' => isset($_POST['send_order_notifications']) ? sanitize_text_field($_POST['send_order_notifications']) : '0',
            'send_processing_notifications' => isset($_POST['send_processing_notifications']) ? sanitize_text_field($_POST['send_processing_notifications']) : '0',
            'send_completion_notifications' => isset($_POST['send_completion_notifications']) ? sanitize_text_field($_POST['send_completion_notifications']) : '0',
            'order_confirmation_template' => isset($_POST['order_confirmation_template']) ? sanitize_textarea_field($_POST['order_confirmation_template']) : '',
            'shipping_update_template' => isset($_POST['shipping_update_template']) ? sanitize_textarea_field($_POST['shipping_update_template']) : '',
            'delivery_notice_template' => isset($_POST['delivery_notice_template']) ? sanitize_textarea_field($_POST['delivery_notice_template']) : ''
        );
        
        $result = update_option('wwp_woocommerce_settings', $settings);
        
        if ($result !== false) {
            wp_send_json_success('تم حفظ إعدادات WooCommerce بنجاح');
        } else {
            wp_send_json_error('فشل في حفظ إعدادات WooCommerce');
        }
    }
    
    public function save_security_settings() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('فشل في التحقق من الأمان');
        }
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
        }
        
        $settings = array(
            'enable_ip_blocking' => isset($_POST['enable_ip_blocking']) ? sanitize_text_field($_POST['enable_ip_blocking']) : '0',
            'max_clicks_per_hour' => isset($_POST['max_clicks_per_hour']) ? intval($_POST['max_clicks_per_hour']) : 100,
            'auto_block_suspicious' => isset($_POST['auto_block_suspicious']) ? sanitize_text_field($_POST['auto_block_suspicious']) : '0',
            'whitelist_ips' => isset($_POST['whitelist_ips']) ? sanitize_textarea_field($_POST['whitelist_ips']) : ''
        );
        
        $result = update_option('wwp_security_settings', $settings);
        
        if ($result !== false) {
            wp_send_json_success('تم حفظ إعدادات الأمان بنجاح');
        } else {
            wp_send_json_error('فشل في حفظ إعدادات الأمان');
        }
    }
    
    public function record_click() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('فشل في التحقق من الأمان');
        }
        
        // التحقق من حظر IP
        if (!WWP_Security::check_ip_access()) {
            wp_send_json_error('تم حظر الوصول من هذا العنوان');
        }
        
        global $wpdb;
        $member_id = intval($_POST['member_id']);
        $today = current_time('Y-m-d');
        $user_ip = WWP_Security::get_user_ip();
        $page_url = isset($_POST['page_url']) ? sanitize_text_field($_POST['page_url']) : '';
        $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field($_SERVER['HTTP_USER_AGENT']) : '';
        
        // تحديث أو إدراج إحصائيات اليوم
        $result = $wpdb->query($wpdb->prepare(
            "INSERT INTO {$wpdb->prefix}wwp_stats (date, clicks, member_id, user_ip, page_url, user_agent) 
             VALUES (%s, 1, %d, %s, %s, %s) 
             ON DUPLICATE KEY UPDATE clicks = clicks + 1",
            $today, $member_id, $user_ip, $page_url, $user_agent
        ));
        
        if ($result !== false) {
            wp_send_json_success('تم تسجيل النقرة');
        } else {
            wp_send_json_error('فشل في تسجيل النقرة');
        }
    }
    
    public function block_ip() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('فشل في التحقق من الأمان');
        }
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
        }
        
        $ip = sanitize_text_field($_POST['ip_address']);
        $reason = sanitize_text_field($_POST['reason']);
        $expires_hours = isset($_POST['expires_hours']) ? intval($_POST['expires_hours']) : null;
        
        $result = WWP_Security::block_ip($ip, $reason, $expires_hours);
        
        if ($result) {
            wp_send_json_success('تم حظر العنوان بنجاح');
        } else {
            wp_send_json_error('فشل في حظر العنوان');
        }
    }
    
    public function unblock_ip() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('فشل في التحقق من الأمان');
        }
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
        }
        
        $ip = sanitize_text_field($_POST['ip_address']);
        
        $result = WWP_Security::unblock_ip($ip);
        
        if ($result) {
            wp_send_json_success('تم إلغاء حظر العنوان بنجاح');
        } else {
            wp_send_json_error('فشل في إلغاء حظر العنوان');
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
                'display_order' => intval($_POST['display_order']),
                'working_hours_start' => sanitize_text_field($_POST['working_hours_start']),
                'working_hours_end' => sanitize_text_field($_POST['working_hours_end']),
                'working_days' => sanitize_text_field($_POST['working_days'])
            ),
            array('%s', '%s', '%s', '%s', '%d', '%s', '%s', '%s')
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
                'display_order' => intval($_POST['display_order']),
                'working_hours_start' => sanitize_text_field($_POST['working_hours_start']),
                'working_hours_end' => sanitize_text_field($_POST['working_hours_end']),
                'working_days' => sanitize_text_field($_POST['working_days'])
            ),
            array('id' => intval($_POST['member_id'])),
            array('%s', '%s', '%s', '%s', '%d', '%s', '%s', '%s'),
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
    
    public function uninstall_plugin() {
        if (!check_ajax_referer('wwp_nonce', 'nonce', false)) {
            wp_send_json_error('فشل في التحقق من الأمان');
        }
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error('غير مصرح لك بهذا الإجراء');
        }
        
        try {
            // حذف جداول قاعدة البيانات
            WWP_Database::drop_tables();
            
            // حذف الإعدادات
            delete_option('wwp_settings');
            delete_option('wwp_db_version');
            delete_option('wwp_woocommerce_settings');
            delete_option('wwp_security_settings');
            
            // حذف ملفات التحميل
            $upload_dir = wp_upload_dir();
            $plugin_uploads = $upload_dir['basedir'] . '/whatsapp-widget-pro/';
            
            if (is_dir($plugin_uploads)) {
                $this->delete_directory($plugin_uploads);
            }
            
            // إلغاء تفعيل الإضافة
            deactivate_plugins(plugin_basename(__FILE__));
            
            wp_send_json_success('تم إلغاء تثبيت الإضافة بنجاح');
            
        } catch (Exception $e) {
            wp_send_json_error('حدث خطأ أثناء إلغاء التثبيت: ' . $e->getMessage());
        }
    }
    
    private function delete_directory($dir) {
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
        
        // التحقق من حظر IP
        if (!WWP_Security::check_ip_access()) {
            return;
        }
        
        $settings = $this->settings;
        $team_members = $this->team_members;
        $available_members = WWP_Database::get_available_members();
        
        // التحقق من ساعات العمل
        $show_outside_hours = isset($settings['show_outside_hours']) && $settings['show_outside_hours'];
        
        if (empty($available_members) && !$show_outside_hours) {
            return;
        }
        
        include WWP_PLUGIN_PATH . 'templates/widget.php';
    }
    
    public function get_settings() {
        $defaults = array(
            'show_widget' => true,
            'welcome_message' => 'مرحباً! كيف يمكنني مساعدتك؟',
            'widget_position' => 'bottom-right',
            'widget_color' => '#25D366',
            'analytics_id' => '',
            'enable_analytics' => false,
            'show_outside_hours' => false,
            'outside_hours_message' => 'نحن غير متاحين حالياً. ساعات العمل: 9 صباحاً - 5 مساءً'
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
            'nonce' => wp_create_nonce('wwp_nonce'),
            'current_page' => get_permalink()
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
    private $woocommerce;
    
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
        $this->woocommerce = new WWP_WooCommerce();
        
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
        $woocommerce_settings = get_option('wwp_woocommerce_settings', array());
        $security_settings = get_option('wwp_security_settings', array());
        
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
