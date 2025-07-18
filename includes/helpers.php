<?php
/**
 * دوال مساعدة لإضافة WhatsApp Widget Pro
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * تنسيق رقم الهاتف
 */
function wwp_format_phone($phone) {
    // إزالة جميع الأحرف غير الرقمية باستثناء +
    $phone = preg_replace('/[^0-9+]/', '', $phone);
    
    // إضافة رمز الدولة السعودي إذا لم يكن موجوداً
    if (!empty($phone) && !str_starts_with($phone, '+')) {
        if (str_starts_with($phone, '05')) {
            $phone = '+966' . substr($phone, 1);
        } elseif (str_starts_with($phone, '5')) {
            $phone = '+966' . $phone;
        } elseif (!str_starts_with($phone, '966')) {
            $phone = '+966' . $phone;
        } else {
            $phone = '+' . $phone;
        }
    }
    
    return $phone;
}

/**
 * التحقق من صحة رقم الهاتف
 */
function wwp_validate_phone($phone) {
    $formatted_phone = wwp_format_phone($phone);
    
    // التحقق من صيغة الرقم
    if (preg_match('/^\+[1-9]\d{1,14}$/', $formatted_phone)) {
        return $formatted_phone;
    }
    
    return false;
}

/**
 * إنشاء رابط واتساب
 */
function wwp_generate_whatsapp_url($phone, $message = '') {
    $formatted_phone = wwp_format_phone($phone);
    $clean_phone = str_replace('+', '', $formatted_phone);
    
    $url = 'https://wa.me/' . $clean_phone;
    
    if (!empty($message)) {
        $url .= '?text=' . urlencode($message);
    }
    
    return $url;
}

/**
 * الحصول على أيام الأسبوع باللغة العربية
 */
function wwp_get_weekdays() {
    return array(
        '1' => __('الاثنين', 'whatsapp-widget-pro'),
        '2' => __('الثلاثاء', 'whatsapp-widget-pro'),
        '3' => __('الأربعاء', 'whatsapp-widget-pro'),
        '4' => __('الخميس', 'whatsapp-widget-pro'),
        '5' => __('الجمعة', 'whatsapp-widget-pro'),
        '6' => __('السبت', 'whatsapp-widget-pro'),
        '0' => __('الأحد', 'whatsapp-widget-pro'),
    );
}

/**
 * التحقق من أوقات العمل
 */
function wwp_is_working_hours($work_hours, $work_days = null) {
    if (empty($work_hours)) {
        return true; // إذا لم يتم تحديد أوقات عمل، فالعضو متاح دائماً
    }
    
    $current_time = current_time('H:i');
    $current_day = current_time('w'); // 0 = الأحد، 1 = الاثنين
    
    // فحص أيام العمل
    if (!empty($work_days) && is_array($work_days) && !in_array($current_day, $work_days)) {
        return false;
    }
    
    // فحص أوقات العمل
    if (isset($work_hours['start']) && isset($work_hours['end'])) {
        $start_time = $work_hours['start'];
        $end_time = $work_hours['end'];
        
        // التعامل مع العمل عبر منتصف الليل
        if ($start_time > $end_time) {
            return ($current_time >= $start_time || $current_time <= $end_time);
        } else {
            return ($current_time >= $start_time && $current_time <= $end_time);
        }
    }
    
    return true;
}

/**
 * الحصول على ألوان الويدجت المحددة مسبقاً
 */
function wwp_get_preset_colors() {
    return array(
        '#25D366' => __('أخضر واتساب الكلاسيكي', 'whatsapp-widget-pro'),
        '#128C7E' => __('أخضر داكن', 'whatsapp-widget-pro'),
        '#075E54' => __('أخضر داكن جداً', 'whatsapp-widget-pro'),
        '#34B7F1' => __('أزرق فاتح', 'whatsapp-widget-pro'),
        '#1DA1F2' => __('أزرق تويتر', 'whatsapp-widget-pro'),
        '#4267B2' => __('أزرق فيسبوك', 'whatsapp-widget-pro'),
        '#E60023' => __('أحمر', 'whatsapp-widget-pro'),
        '#FF6B35' => __('برتقالي', 'whatsapp-widget-pro'),
        '#8B5CF6' => __('بنفسجي', 'whatsapp-widget-pro'),
        '#10B981' => __('أخضر مائل للزرقة', 'whatsapp-widget-pro'),
        '#F59E0B' => __('أصفر ذهبي', 'whatsapp-widget-pro'),
        '#EF4444' => __('أحمر فاتح', 'whatsapp-widget-pro'),
    );
}

/**
 * الحصول على مواضع الويدجت
 */
function wwp_get_widget_positions() {
    return array(
        'bottom-right' => __('أسفل يمين', 'whatsapp-widget-pro'),
        'bottom-left' => __('أسفل يسار', 'whatsapp-widget-pro'),
        'top-right' => __('أعلى يمين', 'whatsapp-widget-pro'),
        'top-left' => __('أعلى يسار', 'whatsapp-widget-pro'),
    );
}

/**
 * الحصول على أحجام الويدجت
 */
function wwp_get_widget_sizes() {
    return array(
        'small' => __('صغير', 'whatsapp-widget-pro'),
        'medium' => __('متوسط', 'whatsapp-widget-pro'),
        'large' => __('كبير', 'whatsapp-widget-pro'),
    );
}

/**
 * الحصول على حالات أعضاء الفريق
 */
function wwp_get_member_statuses() {
    return array(
        'online' => array(
            'label' => __('متاح', 'whatsapp-widget-pro'),
            'color' => '#10B981',
            'icon' => '🟢'
        ),
        'away' => array(
            'label' => __('بعيد', 'whatsapp-widget-pro'),
            'color' => '#F59E0B',
            'icon' => '🟡'
        ),
        'busy' => array(
            'label' => __('مشغول', 'whatsapp-widget-pro'),
            'color' => '#EF4444',
            'icon' => '🔴'
        ),
        'offline' => array(
            'label' => __('غير متاح', 'whatsapp-widget-pro'),
            'color' => '#6B7280',
            'icon' => '⚫'
        ),
    );
}

/**
 * الحصول على أقسام الفريق
 */
function wwp_get_team_departments() {
    return array(
        'support' => __('الدعم الفني', 'whatsapp-widget-pro'),
        'sales' => __('المبيعات', 'whatsapp-widget-pro'),
        'customer_service' => __('خدمة العملاء', 'whatsapp-widget-pro'),
        'management' => __('الإدارة', 'whatsapp-widget-pro'),
        'billing' => __('الفوترة', 'whatsapp-widget-pro'),
        'general' => __('عام', 'whatsapp-widget-pro'),
    );
}

/**
 * تحويل الوقت إلى تنسيق قابل للقراءة
 */
function wwp_format_time_ago($timestamp) {
    $time_ago = time() - strtotime($timestamp);
    
    if ($time_ago < 60) {
        return __('الآن', 'whatsapp-widget-pro');
    } elseif ($time_ago < 3600) {
        $minutes = floor($time_ago / 60);
        return sprintf(_n('منذ دقيقة واحدة', 'منذ %d دقيقة', $minutes, 'whatsapp-widget-pro'), $minutes);
    } elseif ($time_ago < 86400) {
        $hours = floor($time_ago / 3600);
        return sprintf(_n('منذ ساعة واحدة', 'منذ %d ساعة', $hours, 'whatsapp-widget-pro'), $hours);
    } elseif ($time_ago < 2592000) {
        $days = floor($time_ago / 86400);
        return sprintf(_n('منذ يوم واحد', 'منذ %d يوم', $days, 'whatsapp-widget-pro'), $days);
    } else {
        return date('Y-m-d', strtotime($timestamp));
    }
}

/**
 * تنسيق الأرقام بالعربية
 */
function wwp_format_number($number) {
    if ($number >= 1000000) {
        return round($number / 1000000, 1) . __('م', 'whatsapp-widget-pro');
    } elseif ($number >= 1000) {
        return round($number / 1000, 1) . __('ك', 'whatsapp-widget-pro');
    }
    
    return number_format($number);
}

/**
 * حساب النسبة المئوية للتغيير
 */
function wwp_calculate_percentage_change($current, $previous) {
    if ($previous == 0) {
        return $current > 0 ? 100 : 0;
    }
    
    return round((($current - $previous) / $previous) * 100, 2);
}

/**
 * الحصول على نص النسبة المئوية مع اللون
 */
function wwp_get_percentage_change_display($percentage) {
    $class = '';
    $icon = '';
    
    if ($percentage > 0) {
        $class = 'positive';
        $icon = '↗️';
        $text = '+' . $percentage . '%';
    } elseif ($percentage < 0) {
        $class = 'negative';
        $icon = '↘️';
        $text = $percentage . '%';
    } else {
        $class = 'neutral';
        $icon = '➡️';
        $text = '0%';
    }
    
    return array(
        'class' => $class,
        'icon' => $icon,
        'text' => $text,
        'value' => $percentage
    );
}

/**
 * التحقق من وجود WooCommerce
 */
function wwp_is_woocommerce_active() {
    return class_exists('WooCommerce');
}

/**
 * الحصول على معلومات النظام
 */
function wwp_get_system_info() {
    global $wp_version;
    
    return array(
        'wordpress_version' => $wp_version,
        'php_version' => PHP_VERSION,
        'plugin_version' => WWP_VERSION,
        'woocommerce_active' => wwp_is_woocommerce_active(),
        'woocommerce_version' => wwp_is_woocommerce_active() ? WC()->version : __('غير مثبت', 'whatsapp-widget-pro'),
        'memory_limit' => ini_get('memory_limit'),
        'max_execution_time' => ini_get('max_execution_time'),
        'upload_max_filesize' => ini_get('upload_max_filesize'),
        'timezone' => wp_timezone_string(),
    );
}

/**
 * تسجيل خطأ في سجل WordPress
 */
function wwp_log_error($message, $data = null) {
    if (WP_DEBUG && WP_DEBUG_LOG) {
        $log_message = '[WhatsApp Widget Pro] ' . $message;
        
        if ($data !== null) {
            $log_message .= ' | Data: ' . print_r($data, true);
        }
        
        error_log($log_message);
    }
}

/**
 * التحقق من صلاحيات المستخدم
 */
function wwp_current_user_can_manage() {
    return current_user_can('manage_options');
}

/**
 * إنشاء nonce للأمان
 */
function wwp_create_nonce($action = 'wwp_nonce') {
    return wp_create_nonce($action);
}

/**
 * التحقق من nonce
 */
function wwp_verify_nonce($nonce, $action = 'wwp_nonce') {
    return wp_verify_nonce($nonce, $action);
}

/**
 * تنظيف البيانات المدخلة
 */
function wwp_sanitize_input($input, $type = 'text') {
    switch ($type) {
        case 'email':
            return sanitize_email($input);
        case 'url':
            return esc_url_raw($input);
        case 'textarea':
            return sanitize_textarea_field($input);
        case 'html':
            return wp_kses_post($input);
        case 'int':
            return intval($input);
        case 'float':
            return floatval($input);
        case 'bool':
            return (bool) $input;
        case 'array':
            return is_array($input) ? array_map('sanitize_text_field', $input) : array();
        default:
            return sanitize_text_field($input);
    }
}

/**
 * الحصول على عنوان IP الحقيقي للمستخدم
 */
function wwp_get_user_ip() {
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

/**
 * فحص إذا كان الموقع يستخدم HTTPS
 */
function wwp_is_ssl() {
    return is_ssl();
}

/**
 * الحصول على رابط الموقع
 */
function wwp_get_site_url() {
    return get_site_url();
}

/**
 * الحصول على معلومات المتصفح
 */
function wwp_get_browser_info() {
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    // تحديد المتصفح
    if (strpos($user_agent, 'Chrome') !== false) {
        $browser = 'Chrome';
    } elseif (strpos($user_agent, 'Firefox') !== false) {
        $browser = 'Firefox';
    } elseif (strpos($user_agent, 'Safari') !== false) {
        $browser = 'Safari';
    } elseif (strpos($user_agent, 'Edge') !== false) {
        $browser = 'Edge';
    } else {
        $browser = 'Unknown';
    }
    
    // تحديد نظام التشغيل
    if (strpos($user_agent, 'Windows') !== false) {
        $os = 'Windows';
    } elseif (strpos($user_agent, 'Mac') !== false) {
        $os = 'macOS';
    } elseif (strpos($user_agent, 'Linux') !== false) {
        $os = 'Linux';
    } elseif (strpos($user_agent, 'Android') !== false) {
        $os = 'Android';
    } elseif (strpos($user_agent, 'iOS') !== false) {
        $os = 'iOS';
    } else {
        $os = 'Unknown';
    }
    
    return array(
        'browser' => $browser,
        'os' => $os,
        'user_agent' => $user_agent
    );
}

/**
 * تحويل البيانات إلى JSON بأمان
 */
function wwp_json_encode($data) {
    return json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}

/**
 * فك تشفير JSON بأمان
 */
function wwp_json_decode($json, $assoc = true) {
    return json_decode($json, $assoc);
}

/**
 * تحديد ما إذا كان المستخدم على جهاز محمول
 */
function wwp_is_mobile() {
    return wp_is_mobile();
}

/**
 * الحصول على معلومات الجهاز
 */
function wwp_get_device_info() {
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    if (wp_is_mobile()) {
        if (strpos($user_agent, 'iPhone') !== false) {
            return 'iPhone';
        } elseif (strpos($user_agent, 'iPad') !== false) {
            return 'iPad';
        } elseif (strpos($user_agent, 'Android') !== false) {
            return 'Android';
        } else {
            return 'Mobile';
        }
    } else {
        return 'Desktop';
    }
}
?>