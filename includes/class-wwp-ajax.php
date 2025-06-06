
<?php
/**
 * WhatsApp Widget Pro - AJAX Handler
 */

if (!defined('ABSPATH')) {
    exit;
}

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
        
        $settings = array(
            'show_widget' => sanitize_text_field($_POST['show_widget']),
            'welcome_message' => sanitize_textarea_field($_POST['welcome_message']),
            'widget_position' => sanitize_text_field($_POST['widget_position']),
            'widget_color' => sanitize_hex_color($_POST['widget_color']),
            'analytics_id' => sanitize_text_field($_POST['analytics_id']),
            'enable_analytics' => sanitize_text_field($_POST['enable_analytics'])
        );
        
        update_option('wwp_settings', $settings);
        wp_send_json_success('تم حفظ الإعدادات بنجاح');
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
        
        global $wpdb;
        
        $stats = array();
        $stats['total_clicks'] = intval($wpdb->get_var(
            "SELECT SUM(clicks) FROM {$wpdb->prefix}wwp_stats WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
        ));
        
        $stats['daily_stats'] = $wpdb->get_results(
            "SELECT date, SUM(clicks) as clicks FROM {$wpdb->prefix}wwp_stats 
             WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
             GROUP BY date ORDER BY date ASC"
        );
        
        wp_send_json_success($stats);
    }
}

new WWP_Ajax();
