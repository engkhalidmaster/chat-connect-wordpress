<?php
/**
 * معالجات AJAX لإضافة WhatsApp Widget Pro
 */

if (!defined('ABSPATH')) {
    exit;
}

class WWP_Ajax_Handlers {
    
    /**
     * تهيئة المعالجات
     */
    public static function init() {
        // معالجات المدير
        add_action('wp_ajax_wwp_get_team_members', array(__CLASS__, 'getTeamMembers'));
        add_action('wp_ajax_wwp_save_team_member', array(__CLASS__, 'saveTeamMember'));
        add_action('wp_ajax_wwp_delete_team_member', array(__CLASS__, 'deleteTeamMember'));
        add_action('wp_ajax_wwp_get_advanced_statistics', array(__CLASS__, 'getAdvancedStatistics'));
        add_action('wp_ajax_wwp_export_statistics', array(__CLASS__, 'exportStatistics'));
        add_action('wp_ajax_wwp_save_appearance_settings', array(__CLASS__, 'saveAppearanceSettings'));
        add_action('wp_ajax_wwp_save_analytics_settings', array(__CLASS__, 'saveAnalyticsSettings'));
        add_action('wp_ajax_wwp_save_security_settings', array(__CLASS__, 'saveSecuritySettings'));
        add_action('wp_ajax_wwp_manage_blocked_ips', array(__CLASS__, 'manageBlockedIPs'));
        add_action('wp_ajax_wwp_save_woocommerce_settings', array(__CLASS__, 'saveWooCommerceSettings'));
        add_action('wp_ajax_wwp_test_woocommerce_message', array(__CLASS__, 'testWooCommerceMessage'));
        add_action('wp_ajax_wwp_complete_uninstall', array(__CLASS__, 'completeUninstall'));
        
        // معالجات الواجهة الأمامية
        add_action('wp_ajax_wwp_track_widget_action', array(__CLASS__, 'trackWidgetAction'));
        add_action('wp_ajax_nopriv_wwp_track_widget_action', array(__CLASS__, 'trackWidgetAction'));
    }
    
    /**
     * الحصول على أعضاء الفريق
     */
    public static function getTeamMembers() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('غير مصرح لك بهذا الإجراء', 'whatsapp-widget-pro'));
        }
        
        $database = new WWP_Database();
        $members = $database->getTeamMembers();
        
        wp_send_json_success($members);
    }
    
    /**
     * حفظ عضو فريق
     */
    public static function saveTeamMember() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('غير مصرح لك بهذا الإجراء', 'whatsapp-widget-pro'));
        }
        
        $data = $_POST['member_data'] ?? array();
        $is_update = !empty($_POST['member_id']);
        
        if ($is_update) {
            $data['id'] = intval($_POST['member_id']);
        }
        
        $database = new WWP_Database();
        
        if ($is_update) {
            $result = $database->updateTeamMember($data);
        } else {
            $result = $database->addTeamMember($data);
        }
        
        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result['message']);
        }
    }
    
    /**
     * حذف عضو فريق
     */
    public static function deleteTeamMember() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('غير مصرح لك بهذا الإجراء', 'whatsapp-widget-pro'));
        }
        
        $member_id = intval($_POST['member_id'] ?? 0);
        
        if (!$member_id) {
            wp_send_json_error(__('معرف العضو مطلوب', 'whatsapp-widget-pro'));
        }
        
        $database = new WWP_Database();
        $result = $database->deleteTeamMember($member_id);
        
        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result['message']);
        }
    }
    
    /**
     * الحصول على الإحصائيات المتقدمة
     */
    public static function getAdvancedStatistics() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('غير مصرح لك بهذا الإجراء', 'whatsapp-widget-pro'));
        }
        
        $period = sanitize_text_field($_POST['period'] ?? '7');
        $tab = sanitize_text_field($_POST['tab'] ?? 'overview');
        
        $database = new WWP_Database();
        $statistics = $database->getStatistics($period);
        
        // إضافة إحصائيات إضافية حسب التبويب
        switch ($tab) {
            case 'trends':
                $statistics['trends'] = self::getTrendsData($period);
                break;
            case 'conversion':
                $statistics['conversion'] = self::getConversionData($period);
                break;
            case 'team':
                $statistics['team_performance'] = self::getTeamPerformanceData($period);
                break;
            case 'pages':
                $statistics['page_analytics'] = self::getPageAnalyticsData($period);
                break;
        }
        
        wp_send_json_success($statistics);
    }
    
    /**
     * بيانات الاتجاهات
     */
    private static function getTrendsData($period) {
        global $wpdb;
        
        $database = new WWP_Database();
        $tables = array(
            'statistics' => $wpdb->prefix . 'wwp_statistics'
        );
        
        $days = intval($period);
        $start_date = date('Y-m-d', strtotime("-{$days} days"));
        $end_date = date('Y-m-d');
        
        // بيانات يومية للمخططات
        $trends = $wpdb->get_results($wpdb->prepare(
            "SELECT 
                date,
                COUNT(CASE WHEN action_type = 'widget_click' THEN 1 END) as clicks,
                COUNT(CASE WHEN action_type = 'chat_start' THEN 1 END) as chats,
                ROUND(
                    CASE 
                        WHEN COUNT(CASE WHEN action_type = 'widget_click' THEN 1 END) > 0 
                        THEN (COUNT(CASE WHEN action_type = 'chat_start' THEN 1 END) * 100.0 / COUNT(CASE WHEN action_type = 'widget_click' THEN 1 END))
                        ELSE 0 
                    END, 2
                ) as conversion_rate,
                AVG(CASE WHEN response_time > 0 THEN response_time END) as avg_response_time
            FROM {$tables['statistics']} 
            WHERE date BETWEEN %s AND %s 
            GROUP BY date 
            ORDER BY date ASC",
            $start_date, $end_date
        ));
        
        return $trends;
    }
    
    /**
     * بيانات التحويل
     */
    private static function getConversionData($period) {
        global $wpdb;
        
        $database = new WWP_Database();
        $tables = array(
            'statistics' => $wpdb->prefix . 'wwp_statistics'
        );
        
        $days = intval($period);
        $start_date = date('Y-m-d', strtotime("-{$days} days"));
        $end_date = date('Y-m-d');
        
        // مرحلة 1: مشاهدة الويدجت
        $widget_views = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$tables['statistics']} 
             WHERE date BETWEEN %s AND %s AND action_type = 'widget_view'",
            $start_date, $end_date
        ));
        
        // مرحلة 2: النقر على الويدجت
        $widget_clicks = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$tables['statistics']} 
             WHERE date BETWEEN %s AND %s AND action_type = 'widget_click'",
            $start_date, $end_date
        ));
        
        // مرحلة 3: بدء المحادثة
        $chat_starts = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$tables['statistics']} 
             WHERE date BETWEEN %s AND %s AND action_type = 'chat_start'",
            $start_date, $end_date
        ));
        
        $funnel = array(
            array(
                'stage' => __('مشاهدة الويدجت', 'whatsapp-widget-pro'),
                'count' => intval($widget_views),
                'percentage' => 100
            ),
            array(
                'stage' => __('النقر على الويدجت', 'whatsapp-widget-pro'),
                'count' => intval($widget_clicks),
                'percentage' => $widget_views > 0 ? round(($widget_clicks / $widget_views) * 100, 2) : 0
            ),
            array(
                'stage' => __('بدء المحادثة', 'whatsapp-widget-pro'),
                'count' => intval($chat_starts),
                'percentage' => $widget_clicks > 0 ? round(($chat_starts / $widget_clicks) * 100, 2) : 0
            )
        );
        
        return $funnel;
    }
    
    /**
     * بيانات أداء الفريق
     */
    private static function getTeamPerformanceData($period) {
        global $wpdb;
        
        $database = new WWP_Database();
        $tables = array(
            'team_members' => $wpdb->prefix . 'wwp_team_members',
            'statistics' => $wpdb->prefix . 'wwp_statistics'
        );
        
        $days = intval($period);
        $start_date = date('Y-m-d', strtotime("-{$days} days"));
        $end_date = date('Y-m-d');
        
        $team_performance = $wpdb->get_results($wpdb->prepare(
            "SELECT 
                tm.id,
                tm.name,
                tm.department,
                tm.status,
                COUNT(s.id) as total_chats,
                AVG(CASE WHEN s.response_time > 0 THEN s.response_time END) as avg_response_time,
                tm.performance_stats
            FROM {$tables['team_members']} tm
            LEFT JOIN {$tables['statistics']} s ON tm.id = s.member_id 
                AND s.date BETWEEN %s AND %s 
                AND s.action_type = 'chat_start'
            GROUP BY tm.id
            ORDER BY total_chats DESC",
            $start_date, $end_date
        ));
        
        // تحويل performance_stats من JSON
        foreach ($team_performance as &$member) {
            $stats = json_decode($member->performance_stats, true);
            $member->rating = $stats['rating'] ?? 5.0;
            $member->total_historical_chats = $stats['chats'] ?? 0;
            unset($member->performance_stats);
        }
        
        return $team_performance;
    }
    
    /**
     * بيانات تحليل الصفحات
     */
    private static function getPageAnalyticsData($period) {
        global $wpdb;
        
        $database = new WWP_Database();
        $tables = array(
            'statistics' => $wpdb->prefix . 'wwp_statistics'
        );
        
        $days = intval($period);
        $start_date = date('Y-m-d', strtotime("-{$days} days"));
        $end_date = date('Y-m-d');
        
        $page_stats = $wpdb->get_results($wpdb->prepare(
            "SELECT 
                page_url,
                COUNT(CASE WHEN action_type = 'widget_click' THEN 1 END) as clicks,
                COUNT(CASE WHEN action_type = 'chat_start' THEN 1 END) as chats,
                ROUND(
                    CASE 
                        WHEN COUNT(CASE WHEN action_type = 'widget_click' THEN 1 END) > 0 
                        THEN (COUNT(CASE WHEN action_type = 'chat_start' THEN 1 END) * 100.0 / COUNT(CASE WHEN action_type = 'widget_click' THEN 1 END))
                        ELSE 0 
                    END, 2
                ) as conversion_rate
            FROM {$tables['statistics']} 
            WHERE date BETWEEN %s AND %s 
            GROUP BY page_url 
            ORDER BY clicks DESC 
            LIMIT 15",
            $start_date, $end_date
        ));
        
        return $page_stats;
    }
    
    /**
     * تصدير الإحصائيات
     */
    public static function exportStatistics() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('غير مصرح لك بهذا الإجراء', 'whatsapp-widget-pro'));
        }
        
        $period = sanitize_text_field($_POST['period'] ?? '30');
        $format = sanitize_text_field($_POST['format'] ?? 'csv');
        
        $database = new WWP_Database();
        $statistics = $database->getStatistics($period);
        
        $filename = 'whatsapp-widget-statistics-' . date('Y-m-d') . '.' . $format;
        
        if ($format === 'csv') {
            $csv_data = self::generateCSV($statistics);
            wp_send_json_success(array(
                'filename' => $filename,
                'data' => base64_encode($csv_data),
                'mime_type' => 'text/csv'
            ));
        } else {
            wp_send_json_error(__('صيغة غير مدعومة', 'whatsapp-widget-pro'));
        }
    }
    
    /**
     * إنشاء ملف CSV
     */
    private static function generateCSV($statistics) {
        $csv = '';
        
        // العناوين
        $headers = array(
            __('التاريخ', 'whatsapp-widget-pro'),
            __('النقرات', 'whatsapp-widget-pro'),
            __('المحادثات', 'whatsapp-widget-pro'),
            __('معدل التحويل', 'whatsapp-widget-pro')
        );
        $csv .= implode(',', $headers) . "\n";
        
        // البيانات
        foreach ($statistics['daily_stats'] as $day) {
            $row = array(
                $day->date,
                $day->clicks,
                $day->chats,
                $day->clicks > 0 ? round(($day->chats / $day->clicks) * 100, 2) . '%' : '0%'
            );
            $csv .= implode(',', $row) . "\n";
        }
        
        return $csv;
    }
    
    /**
     * حفظ إعدادات المظهر
     */
    public static function saveAppearanceSettings() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('غير مصرح لك بهذا الإجراء', 'whatsapp-widget-pro'));
        }
        
        $settings = get_option('wwp_settings', array());
        
        $settings['widget_position'] = sanitize_text_field($_POST['widget_position'] ?? 'bottom-right');
        $settings['widget_color'] = sanitize_hex_color($_POST['widget_color'] ?? '#25D366');
        $settings['widget_size'] = sanitize_text_field($_POST['widget_size'] ?? 'medium');
        $settings['custom_css'] = sanitize_textarea_field($_POST['custom_css'] ?? '');
        
        update_option('wwp_settings', $settings);
        
        wp_send_json_success(__('تم حفظ إعدادات المظهر بنجاح', 'whatsapp-widget-pro'));
    }
    
    /**
     * حفظ إعدادات Google Analytics
     */
    public static function saveAnalyticsSettings() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('غير مصرح لك بهذا الإجراء', 'whatsapp-widget-pro'));
        }
        
        $settings = get_option('wwp_settings', array());
        
        $settings['analytics_enabled'] = !empty($_POST['analytics_enabled']);
        $settings['analytics_tracking_id'] = sanitize_text_field($_POST['analytics_tracking_id'] ?? '');
        $settings['track_widget_views'] = !empty($_POST['track_widget_views']);
        $settings['track_widget_clicks'] = !empty($_POST['track_widget_clicks']);
        $settings['track_chat_starts'] = !empty($_POST['track_chat_starts']);
        
        update_option('wwp_settings', $settings);
        
        wp_send_json_success(__('تم حفظ إعدادات Google Analytics بنجاح', 'whatsapp-widget-pro'));
    }
    
    /**
     * حفظ إعدادات الأمان
     */
    public static function saveSecuritySettings() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('غير مصرح لك بهذا الإجراء', 'whatsapp-widget-pro'));
        }
        
        $settings = get_option('wwp_settings', array());
        
        $settings['security_enabled'] = !empty($_POST['security_enabled']);
        $settings['max_clicks_per_hour'] = intval($_POST['max_clicks_per_hour'] ?? 10);
        $settings['auto_block_enabled'] = !empty($_POST['auto_block_enabled']);
        $settings['block_duration_hours'] = intval($_POST['block_duration_hours'] ?? 24);
        
        update_option('wwp_settings', $settings);
        
        wp_send_json_success(__('تم حفظ إعدادات الأمان بنجاح', 'whatsapp-widget-pro'));
    }
    
    /**
     * إدارة العناوين المحظورة
     */
    public static function manageBlockedIPs() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('غير مصرح لك بهذا الإجراء', 'whatsapp-widget-pro'));
        }
        
        $action = sanitize_text_field($_POST['ip_action'] ?? '');
        $database = new WWP_Database();
        
        switch ($action) {
            case 'block':
                $ip = sanitize_text_field($_POST['ip_address'] ?? '');
                $reason = sanitize_textarea_field($_POST['reason'] ?? '');
                $duration = intval($_POST['duration_hours'] ?? 0);
                
                $expires_at = null;
                if ($duration > 0) {
                    $expires_at = date('Y-m-d H:i:s', time() + ($duration * 3600));
                }
                
                $result = $database->blockIP($ip, $reason, $expires_at);
                
                if ($result) {
                    wp_send_json_success(__('تم حظر العنوان بنجاح', 'whatsapp-widget-pro'));
                } else {
                    wp_send_json_error(__('خطأ في حظر العنوان', 'whatsapp-widget-pro'));
                }
                break;
                
            case 'unblock':
                $ip = sanitize_text_field($_POST['ip_address'] ?? '');
                $result = $database->unblockIP($ip);
                
                if ($result) {
                    wp_send_json_success(__('تم إلغاء حظر العنوان بنجاح', 'whatsapp-widget-pro'));
                } else {
                    wp_send_json_error(__('خطأ في إلغاء حظر العنوان', 'whatsapp-widget-pro'));
                }
                break;
                
            case 'get_list':
                $blocked_ips = $database->getBlockedIPs();
                wp_send_json_success($blocked_ips);
                break;
                
            default:
                wp_send_json_error(__('إجراء غير صحيح', 'whatsapp-widget-pro'));
        }
    }
    
    /**
     * حفظ إعدادات WooCommerce
     */
    public static function saveWooCommerceSettings() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('غير مصرح لك بهذا الإجراء', 'whatsapp-widget-pro'));
        }
        
        $settings = get_option('wwp_settings', array());
        
        $settings['woocommerce_enabled'] = !empty($_POST['woocommerce_enabled']);
        
        // حفظ قوالب الرسائل
        $message_templates = $_POST['message_templates'] ?? array();
        foreach ($message_templates as $type => $template) {
            $settings['woocommerce_' . $type . '_template'] = sanitize_textarea_field($template);
            $settings['woocommerce_' . $type . '_enabled'] = !empty($_POST['message_enabled'][$type]);
        }
        
        update_option('wwp_settings', $settings);
        
        wp_send_json_success(__('تم حفظ إعدادات WooCommerce بنجاح', 'whatsapp-widget-pro'));
    }
    
    /**
     * اختبار رسالة WooCommerce
     */
    public static function testWooCommerceMessage() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('غير مصرح لك بهذا الإجراء', 'whatsapp-widget-pro'));
        }
        
        $message_type = sanitize_text_field($_POST['message_type'] ?? '');
        $template = sanitize_textarea_field($_POST['template'] ?? '');
        
        // استبدال المتغيرات بقيم تجريبية
        $test_variables = array(
            '{customer_name}' => 'أحمد محمد',
            '{order_number}' => '12345',
            '{total_amount}' => '250 ريال',
            '{order_date}' => date('Y-m-d'),
            '{tracking_number}' => 'TRK123456789',
            '{estimated_delivery}' => date('Y-m-d', strtotime('+3 days'))
        );
        
        $test_message = str_replace(array_keys($test_variables), array_values($test_variables), $template);
        
        wp_send_json_success(array(
            'message' => $test_message,
            'whatsapp_url' => 'https://wa.me/966500000000?text=' . urlencode($test_message)
        ));
    }
    
    /**
     * إتمام إلغاء التثبيت
     */
    public static function completeUninstall() {
        check_ajax_referer('wwp_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('غير مصرح لك بهذا الإجراء', 'whatsapp-widget-pro'));
        }
        
        $confirm = sanitize_text_field($_POST['confirm'] ?? '');
        
        if ($confirm !== 'DELETE_ALL_DATA') {
            wp_send_json_error(__('يجب تأكيد الحذف بكتابة النص المطلوب', 'whatsapp-widget-pro'));
        }
        
        // حذف جميع البيانات
        $database = new WWP_Database();
        $database->dropTables();
        
        // حذف الإعدادات
        delete_option('wwp_settings');
        
        wp_send_json_success(__('تم حذف جميع البيانات بنجاح', 'whatsapp-widget-pro'));
    }
    
    /**
     * تتبع إجراءات الويدجت - واجهة أمامية
     */
    public static function trackWidgetAction() {
        check_ajax_referer('wwp_frontend_nonce', 'nonce');
        
        $database = new WWP_Database();
        
        $data = array(
            'page_url' => esc_url_raw($_POST['page_url'] ?? ''),
            'member_id' => intval($_POST['member_id'] ?? 0),
            'action_type' => sanitize_text_field($_POST['action_type'] ?? 'widget_click'),
            'ip_address' => self::getUserIP(),
            'user_agent' => sanitize_text_field($_SERVER['HTTP_USER_AGENT'] ?? ''),
        );
        
        // فحص الأمان
        $settings = get_option('wwp_settings', array());
        if (!empty($settings['security_enabled']) && $database->isIPBlocked($data['ip_address'])) {
            wp_send_json_error(__('تم حظر عنوان IP', 'whatsapp-widget-pro'));
        }
        
        $result = $database->trackClick($data);
        
        // إرسال بيانات Google Analytics
        if (!empty($settings['analytics_enabled']) && !empty($settings['analytics_tracking_id'])) {
            self::sendGoogleAnalyticsEvent($data['action_type'], $settings['analytics_tracking_id']);
        }
        
        wp_send_json_success($result);
    }
    
    /**
     * إرسال حدث إلى Google Analytics
     */
    private static function sendGoogleAnalyticsEvent($action, $tracking_id) {
        // سيتم إرسال الحدث عبر JavaScript في الواجهة الأمامية
        // هذه الوظيفة للتوثيق فقط
    }
    
    /**
     * الحصول على عنوان IP للمستخدم
     */
    private static function getUserIP() {
        $ip_keys = array('HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR');
        
        foreach ($ip_keys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                foreach (explode(',', $_SERVER[$key]) as $ip) {
                    $ip = trim($ip);
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                        return $ip;
                    }
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
}

// تهيئة معالجات AJAX
WWP_Ajax_Handlers::init();
?>