<?php
/**
 * فئة قاعدة البيانات لإضافة WhatsApp Widget Pro
 */

if (!defined('ABSPATH')) {
    exit;
}

class WWP_Database {
    
    /**
     * أسماء الجداول
     */
    private $tables;
    
    /**
     * البناء
     */
    public function __construct() {
        global $wpdb;
        
        $this->tables = array(
            'team_members' => $wpdb->prefix . 'wwp_team_members',
            'statistics' => $wpdb->prefix . 'wwp_statistics',
            'blocked_ips' => $wpdb->prefix . 'wwp_blocked_ips',
            'woocommerce_settings' => $wpdb->prefix . 'wwp_woocommerce_settings',
        );
    }
    
    /**
     * إنشاء الجداول
     */
    public function createTables() {
        global $wpdb;
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // جدول أعضاء الفريق
        $sql_team = "CREATE TABLE {$this->tables['team_members']} (
            id int(11) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            phone varchar(20) NOT NULL,
            department varchar(100) DEFAULT 'عام',
            avatar text,
            status enum('online','away','busy','offline') DEFAULT 'online',
            work_hours text,
            work_days text,
            auto_reply_enabled tinyint(1) DEFAULT 0,
            auto_reply_message text,
            notifications_enabled tinyint(1) DEFAULT 1,
            performance_stats text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        // جدول الإحصائيات
        $sql_stats = "CREATE TABLE {$this->tables['statistics']} (
            id int(11) NOT NULL AUTO_INCREMENT,
            date date NOT NULL,
            page_url text,
            member_id int(11),
            action_type enum('widget_view','widget_click','chat_start') DEFAULT 'widget_click',
            ip_address varchar(45),
            user_agent text,
            conversion_completed tinyint(1) DEFAULT 0,
            response_time int(11) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY date_idx (date),
            KEY member_id_idx (member_id),
            KEY action_type_idx (action_type)
        ) $charset_collate;";
        
        // جدول العناوين المحظورة
        $sql_blocked = "CREATE TABLE {$this->tables['blocked_ips']} (
            id int(11) NOT NULL AUTO_INCREMENT,
            ip_address varchar(45) NOT NULL,
            reason text,
            blocked_at datetime DEFAULT CURRENT_TIMESTAMP,
            expires_at datetime,
            status enum('active','expired') DEFAULT 'active',
            click_count int(11) DEFAULT 0,
            PRIMARY KEY (id),
            UNIQUE KEY ip_address (ip_address)
        ) $charset_collate;";
        
        // جدول إعدادات WooCommerce
        $sql_woo = "CREATE TABLE {$this->tables['woocommerce_settings']} (
            id int(11) NOT NULL AUTO_INCREMENT,
            message_type varchar(50) NOT NULL,
            template text NOT NULL,
            enabled tinyint(1) DEFAULT 1,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY message_type (message_type)
        ) $charset_collate;";
        
        dbDelta($sql_team);
        dbDelta($sql_stats);
        dbDelta($sql_blocked);
        dbDelta($sql_woo);
        
        // إضافة البيانات الافتراضية
        $this->insertDefaultData();
    }
    
    /**
     * إدراج البيانات الافتراضية
     */
    private function insertDefaultData() {
        global $wpdb;
        
        // عضو فريق افتراضي
        $existing_member = $wpdb->get_var("SELECT COUNT(*) FROM {$this->tables['team_members']}");
        if ($existing_member == 0) {
            $wpdb->insert(
                $this->tables['team_members'],
                array(
                    'name' => 'خدمة العملاء',
                    'phone' => '966500000000',
                    'department' => 'دعم فني',
                    'status' => 'online',
                    'work_hours' => json_encode(array('start' => '09:00', 'end' => '17:00')),
                    'work_days' => json_encode(array('1', '2', '3', '4', '5')), // من الاثنين إلى الجمعة
                    'auto_reply_enabled' => 1,
                    'auto_reply_message' => 'مرحباً! سأقوم بالرد عليك في أقرب وقت ممكن.',
                    'notifications_enabled' => 1,
                    'performance_stats' => json_encode(array('chats' => 0, 'rating' => 5.0, 'response_time' => 300))
                )
            );
        }
        
        // قوالب رسائل WooCommerce الافتراضية
        $default_templates = array(
            'new_order' => 'مرحباً {customer_name}، تم استلام طلبك رقم {order_number} بقيمة {total_amount}. شكراً لثقتك بنا!',
            'processing' => 'عزيزي {customer_name}، طلبك رقم {order_number} قيد التجهيز حالياً.',
            'shipped' => 'طلبك رقم {order_number} تم شحنه! رقم التتبع: {tracking_number}',
            'completed' => 'تم تسليم طلبك رقم {order_number} بنجاح. نتمنى أن تكون راضياً عن خدمتنا!',
            'cancelled' => 'تم إلغاء طلبك رقم {order_number}. إذا كان لديك أي استفسار، يرجى التواصل معنا.',
            'refunded' => 'تم استرداد مبلغ {total_amount} لطلبك رقم {order_number}.'
        );
        
        foreach ($default_templates as $type => $template) {
            $existing = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$this->tables['woocommerce_settings']} WHERE message_type = %s",
                $type
            ));
            
            if ($existing == 0) {
                $wpdb->insert(
                    $this->tables['woocommerce_settings'],
                    array(
                        'message_type' => $type,
                        'template' => $template,
                        'enabled' => 1
                    )
                );
            }
        }
    }
    
    /**
     * إضافة عضو فريق جديد
     */
    public function addTeamMember($data) {
        global $wpdb;
        
        $clean_data = array(
            'name' => sanitize_text_field($data['name']),
            'phone' => sanitize_text_field($data['phone']),
            'department' => sanitize_text_field($data['department'] ?? 'عام'),
            'avatar' => esc_url_raw($data['avatar'] ?? ''),
            'status' => sanitize_text_field($data['status'] ?? 'online'),
            'work_hours' => json_encode($data['work_hours'] ?? array('start' => '09:00', 'end' => '17:00')),
            'work_days' => json_encode($data['work_days'] ?? array('1', '2', '3', '4', '5')),
            'auto_reply_enabled' => !empty($data['auto_reply_enabled']) ? 1 : 0,
            'auto_reply_message' => sanitize_textarea_field($data['auto_reply_message'] ?? ''),
            'notifications_enabled' => !empty($data['notifications_enabled']) ? 1 : 0,
            'performance_stats' => json_encode($data['performance_stats'] ?? array('chats' => 0, 'rating' => 5.0, 'response_time' => 300))
        );
        
        $result = $wpdb->insert($this->tables['team_members'], $clean_data);
        
        if ($result !== false) {
            return array(
                'success' => true,
                'id' => $wpdb->insert_id,
                'message' => __('تم إضافة عضو الفريق بنجاح', 'whatsapp-widget-pro')
            );
        }
        
        return array('success' => false, 'message' => __('خطأ في إضافة عضو الفريق', 'whatsapp-widget-pro'));
    }
    
    /**
     * تحديث عضو فريق
     */
    public function updateTeamMember($data) {
        global $wpdb;
        
        if (empty($data['id'])) {
            return array('success' => false, 'message' => __('معرف العضو مطلوب', 'whatsapp-widget-pro'));
        }
        
        $clean_data = array(
            'name' => sanitize_text_field($data['name']),
            'phone' => sanitize_text_field($data['phone']),
            'department' => sanitize_text_field($data['department'] ?? 'عام'),
            'avatar' => esc_url_raw($data['avatar'] ?? ''),
            'status' => sanitize_text_field($data['status'] ?? 'online'),
            'work_hours' => json_encode($data['work_hours'] ?? array()),
            'work_days' => json_encode($data['work_days'] ?? array()),
            'auto_reply_enabled' => !empty($data['auto_reply_enabled']) ? 1 : 0,
            'auto_reply_message' => sanitize_textarea_field($data['auto_reply_message'] ?? ''),
            'notifications_enabled' => !empty($data['notifications_enabled']) ? 1 : 0,
            'performance_stats' => json_encode($data['performance_stats'] ?? array())
        );
        
        $result = $wpdb->update(
            $this->tables['team_members'],
            $clean_data,
            array('id' => intval($data['id']))
        );
        
        if ($result !== false) {
            return array('success' => true, 'message' => __('تم تحديث عضو الفريق بنجاح', 'whatsapp-widget-pro'));
        }
        
        return array('success' => false, 'message' => __('خطأ في تحديث عضو الفريق', 'whatsapp-widget-pro'));
    }
    
    /**
     * حذف عضو فريق
     */
    public function deleteTeamMember($id) {
        global $wpdb;
        
        $result = $wpdb->delete(
            $this->tables['team_members'],
            array('id' => intval($id))
        );
        
        if ($result !== false) {
            return array('success' => true, 'message' => __('تم حذف عضو الفريق بنجاح', 'whatsapp-widget-pro'));
        }
        
        return array('success' => false, 'message' => __('خطأ في حذف عضو الفريق', 'whatsapp-widget-pro'));
    }
    
    /**
     * الحصول على جميع أعضاء الفريق
     */
    public function getTeamMembers() {
        global $wpdb;
        
        $members = $wpdb->get_results("SELECT * FROM {$this->tables['team_members']} ORDER BY created_at DESC");
        
        // تحويل JSON إلى arrays
        foreach ($members as &$member) {
            $member->work_hours = json_decode($member->work_hours, true);
            $member->work_days = json_decode($member->work_days, true);
            $member->performance_stats = json_decode($member->performance_stats, true);
        }
        
        return $members;
    }
    
    /**
     * تتبع النقرات
     */
    public function trackClick($data) {
        global $wpdb;
        
        $clean_data = array(
            'date' => current_time('Y-m-d'),
            'page_url' => esc_url_raw($data['page_url']),
            'member_id' => intval($data['member_id']),
            'action_type' => sanitize_text_field($data['action_type']),
            'ip_address' => sanitize_text_field($data['ip_address']),
            'user_agent' => sanitize_text_field($data['user_agent']),
        );
        
        $result = $wpdb->insert($this->tables['statistics'], $clean_data);
        
        if ($result !== false) {
            return array('success' => true, 'message' => __('تم تسجيل النقرة بنجاح', 'whatsapp-widget-pro'));
        }
        
        return array('success' => false, 'message' => __('خطأ في تسجيل النقرة', 'whatsapp-widget-pro'));
    }
    
    /**
     * الحصول على الإحصائيات
     */
    public function getStatistics($period = '7') {
        global $wpdb;
        
        $days = intval($period);
        $start_date = date('Y-m-d', strtotime("-{$days} days"));
        $end_date = date('Y-m-d');
        
        // النقرات الإجمالية
        $total_clicks = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->tables['statistics']} 
             WHERE date BETWEEN %s AND %s AND action_type = 'widget_click'",
            $start_date, $end_date
        ));
        
        // المحادثات المبدأة
        $total_chats = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->tables['statistics']} 
             WHERE date BETWEEN %s AND %s AND action_type = 'chat_start'",
            $start_date, $end_date
        ));
        
        // معدل التحويل
        $conversion_rate = $total_clicks > 0 ? round(($total_chats / $total_clicks) * 100, 2) : 0;
        
        // متوسط وقت الاستجابة
        $avg_response_time = $wpdb->get_var($wpdb->prepare(
            "SELECT AVG(response_time) FROM {$this->tables['statistics']} 
             WHERE date BETWEEN %s AND %s AND response_time > 0",
            $start_date, $end_date
        ));
        
        // الإحصائيات اليومية للمخططات
        $daily_stats = $wpdb->get_results($wpdb->prepare(
            "SELECT date, 
                    COUNT(CASE WHEN action_type = 'widget_click' THEN 1 END) as clicks,
                    COUNT(CASE WHEN action_type = 'chat_start' THEN 1 END) as chats
             FROM {$this->tables['statistics']} 
             WHERE date BETWEEN %s AND %s 
             GROUP BY date 
             ORDER BY date ASC",
            $start_date, $end_date
        ));
        
        // إحصائيات الفريق
        $team_stats = $wpdb->get_results($wpdb->prepare(
            "SELECT tm.name, tm.department,
                    COUNT(s.id) as total_chats,
                    AVG(s.response_time) as avg_response_time
             FROM {$this->tables['team_members']} tm
             LEFT JOIN {$this->tables['statistics']} s ON tm.id = s.member_id 
                 AND s.date BETWEEN %s AND %s 
                 AND s.action_type = 'chat_start'
             GROUP BY tm.id
             ORDER BY total_chats DESC",
            $start_date, $end_date
        ));
        
        // إحصائيات الصفحات
        $page_stats = $wpdb->get_results($wpdb->prepare(
            "SELECT page_url, COUNT(*) as clicks
             FROM {$this->tables['statistics']} 
             WHERE date BETWEEN %s AND %s AND action_type = 'widget_click'
             GROUP BY page_url 
             ORDER BY clicks DESC 
             LIMIT 10",
            $start_date, $end_date
        ));
        
        return array(
            'overview' => array(
                'total_clicks' => intval($total_clicks),
                'total_chats' => intval($total_chats),
                'conversion_rate' => floatval($conversion_rate),
                'avg_response_time' => round(floatval($avg_response_time ?? 0), 2),
            ),
            'daily_stats' => $daily_stats,
            'team_stats' => $team_stats,
            'page_stats' => $page_stats,
            'period' => $days
        );
    }
    
    /**
     * فحص حظر IP
     */
    public function isIPBlocked($ip) {
        global $wpdb;
        
        $blocked = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->tables['blocked_ips']} 
             WHERE ip_address = %s AND status = 'active' 
             AND (expires_at IS NULL OR expires_at > NOW())",
            $ip
        ));
        
        return $blocked > 0;
    }
    
    /**
     * إضافة IP للحظر
     */
    public function blockIP($ip, $reason = '', $expires_at = null) {
        global $wpdb;
        
        $data = array(
            'ip_address' => sanitize_text_field($ip),
            'reason' => sanitize_textarea_field($reason),
            'status' => 'active'
        );
        
        if ($expires_at) {
            $data['expires_at'] = $expires_at;
        }
        
        $result = $wpdb->replace($this->tables['blocked_ips'], $data);
        
        return $result !== false;
    }
    
    /**
     * إلغاء حظر IP
     */
    public function unblockIP($ip) {
        global $wpdb;
        
        $result = $wpdb->update(
            $this->tables['blocked_ips'],
            array('status' => 'expired'),
            array('ip_address' => $ip)
        );
        
        return $result !== false;
    }
    
    /**
     * الحصول على قائمة العناوين المحظورة
     */
    public function getBlockedIPs() {
        global $wpdb;
        
        return $wpdb->get_results(
            "SELECT * FROM {$this->tables['blocked_ips']} 
             ORDER BY blocked_at DESC"
        );
    }
    
    /**
     * حذف جميع الجداول
     */
    public function dropTables() {
        global $wpdb;
        
        foreach ($this->tables as $table) {
            $wpdb->query("DROP TABLE IF EXISTS $table");
        }
    }
    
    /**
     * حذف جميع البيانات
     */
    public function clearAllData() {
        global $wpdb;
        
        foreach ($this->tables as $table) {
            $wpdb->query("TRUNCATE TABLE $table");
        }
    }
}
?>