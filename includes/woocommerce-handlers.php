<?php
/**
 * معالج تكامل WooCommerce لإضافة WhatsApp Widget Pro
 */

if (!defined('ABSPATH')) {
    exit;
}

class WWP_WooCommerce_Handler {
    
    /**
     * إرسال رسالة حسب حالة الطلب
     */
    public static function sendMessage($order, $status, $settings) {
        if (!$order || !class_exists('WooCommerce')) {
            return false;
        }
        
        // التحقق من تفعيل نوع الرسالة
        $message_key = 'woocommerce_' . $status . '_enabled';
        if (empty($settings[$message_key])) {
            return false;
        }
        
        // الحصول على قالب الرسالة
        $template_key = 'woocommerce_' . $status . '_template';
        $template = $settings[$template_key] ?? '';
        
        if (empty($template)) {
            return false;
        }
        
        // إعداد متغيرات الرسالة
        $variables = self::getOrderVariables($order);
        $message = self::replaceVariables($template, $variables);
        
        // الحصول على رقم هاتف العميل
        $customer_phone = self::getCustomerPhone($order);
        
        if (empty($customer_phone)) {
            return false;
        }
        
        // إرسال الرسالة (محاكاة - في التطبيق الحقيقي ستحتاج إلى API لإرسال الرسائل)
        return self::simulateMessageSending($customer_phone, $message, $order->get_id());
    }
    
    /**
     * الحصول على متغيرات الطلب
     */
    private static function getOrderVariables($order) {
        return array(
            '{customer_name}' => $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(),
            '{order_number}' => $order->get_order_number(),
            '{total_amount}' => $order->get_formatted_order_total(),
            '{order_date}' => $order->get_date_created()->format('Y-m-d H:i'),
            '{tracking_number}' => self::getTrackingNumber($order),
            '{estimated_delivery}' => self::getEstimatedDelivery($order),
            '{order_status}' => wc_get_order_status_name($order->get_status()),
            '{payment_method}' => $order->get_payment_method_title(),
            '{shipping_method}' => $order->get_shipping_method(),
            '{customer_email}' => $order->get_billing_email(),
            '{customer_phone}' => $order->get_billing_phone(),
            '{order_url}' => $order->get_view_order_url(),
        );
    }
    
    /**
     * استبدال المتغيرات في القالب
     */
    private static function replaceVariables($template, $variables) {
        return str_replace(array_keys($variables), array_values($variables), $template);
    }
    
    /**
     * الحصول على رقم هاتف العميل
     */
    private static function getCustomerPhone($order) {
        $phone = $order->get_billing_phone();
        
        // تنظيف رقم الهاتف
        $phone = preg_replace('/[^0-9+]/', '', $phone);
        
        // إضافة رمز الدولة إذا لم يكن موجوداً
        if (!empty($phone) && !str_starts_with($phone, '+')) {
            // افتراض أن الرقم سعودي إذا بدأ بـ 05
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
     * الحصول على رقم التتبع
     */
    private static function getTrackingNumber($order) {
        // البحث في meta data عن رقم التتبع
        $tracking_keys = array(
            '_tracking_number',
            '_shipment_tracking_number',
            'tracking_number',
            '_wc_shipment_tracking_items'
        );
        
        foreach ($tracking_keys as $key) {
            $tracking = $order->get_meta($key);
            if (!empty($tracking)) {
                // إذا كان array (مثل WooCommerce Shipment Tracking)
                if (is_array($tracking)) {
                    return $tracking[0]['tracking_number'] ?? '';
                }
                return $tracking;
            }
        }
        
        return __('سيتم توفيره قريباً', 'whatsapp-widget-pro');
    }
    
    /**
     * الحصول على تاريخ التسليم المتوقع
     */
    private static function getEstimatedDelivery($order) {
        // البحث عن تاريخ التسليم المتوقع
        $delivery_date = $order->get_meta('_estimated_delivery_date');
        
        if (!empty($delivery_date)) {
            return date('Y-m-d', strtotime($delivery_date));
        }
        
        // حساب تاريخ تقديري بناءً على طريقة الشحن
        $shipping_method = $order->get_shipping_method();
        $days_to_add = 3; // افتراضي
        
        if (stripos($shipping_method, 'express') !== false) {
            $days_to_add = 1;
        } elseif (stripos($shipping_method, 'standard') !== false) {
            $days_to_add = 5;
        }
        
        return date('Y-m-d', strtotime("+{$days_to_add} days"));
    }
    
    /**
     * محاكاة إرسال الرسالة
     */
    private static function simulateMessageSending($phone, $message, $order_id) {
        // في التطبيق الحقيقي، هنا ستقوم بإرسال الرسالة عبر API
        // حالياً سنحفظ السجل فقط
        
        global $wpdb;
        $table = $wpdb->prefix . 'wwp_woocommerce_messages';
        
        // إنشاء الجدول إذا لم يكن موجوداً
        self::createMessagesTable();
        
        $result = $wpdb->insert(
            $table,
            array(
                'order_id' => $order_id,
                'customer_phone' => $phone,
                'message' => $message,
                'status' => 'sent', // في التطبيق الحقيقي قد تكون 'pending', 'sent', 'failed'
                'sent_at' => current_time('mysql'),
                'whatsapp_url' => 'https://wa.me/' . str_replace('+', '', $phone) . '?text=' . urlencode($message)
            ),
            array('%d', '%s', '%s', '%s', '%s', '%s')
        );
        
        return $result !== false;
    }
    
    /**
     * إنشاء جدول رسائل WooCommerce
     */
    private static function createMessagesTable() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'wwp_woocommerce_messages';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id int(11) NOT NULL AUTO_INCREMENT,
            order_id int(11) NOT NULL,
            customer_phone varchar(20) NOT NULL,
            message text NOT NULL,
            status enum('pending','sent','failed') DEFAULT 'pending',
            sent_at datetime DEFAULT CURRENT_TIMESTAMP,
            whatsapp_url text,
            error_message text,
            PRIMARY KEY (id),
            KEY order_id_idx (order_id),
            KEY status_idx (status)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * الحصول على سجل الرسائل المرسلة للطلب
     */
    public static function getOrderMessages($order_id) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'wwp_woocommerce_messages';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table WHERE order_id = %d ORDER BY sent_at DESC",
            $order_id
        ));
    }
    
    /**
     * الحصول على إحصائيات رسائل WooCommerce
     */
    public static function getMessagesStatistics($days = 30) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'wwp_woocommerce_messages';
        $start_date = date('Y-m-d', strtotime("-{$days} days"));
        
        $stats = $wpdb->get_row($wpdb->prepare(
            "SELECT 
                COUNT(*) as total_messages,
                COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_messages,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_messages,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_messages
            FROM $table 
            WHERE sent_at >= %s",
            $start_date
        ));
        
        return $stats;
    }
    
    /**
     * إعادة إرسال رسالة فاشلة
     */
    public static function resendMessage($message_id) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'wwp_woocommerce_messages';
        
        $message = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE id = %d",
            $message_id
        ));
        
        if (!$message) {
            return false;
        }
        
        // محاولة إعادة الإرسال
        $success = true; // في التطبيق الحقيقي سيكون هناك منطق إرسال فعلي
        
        if ($success) {
            $wpdb->update(
                $table,
                array(
                    'status' => 'sent',
                    'sent_at' => current_time('mysql'),
                    'error_message' => null
                ),
                array('id' => $message_id)
            );
        }
        
        return $success;
    }
    
    /**
     * حذف الرسائل القديمة
     */
    public static function cleanupOldMessages($days = 90) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'wwp_woocommerce_messages';
        $cutoff_date = date('Y-m-d', strtotime("-{$days} days"));
        
        return $wpdb->query($wpdb->prepare(
            "DELETE FROM $table WHERE sent_at < %s",
            $cutoff_date
        ));
    }
    
    /**
     * الحصول على قوالب الرسائل الافتراضية
     */
    public static function getDefaultTemplates() {
        return array(
            'new_order' => array(
                'title' => __('طلب جديد', 'whatsapp-widget-pro'),
                'template' => __('مرحباً {customer_name}، تم استلام طلبك رقم {order_number} بقيمة {total_amount}. شكراً لثقتك بنا!', 'whatsapp-widget-pro'),
                'description' => __('يرسل عند إنشاء طلب جديد', 'whatsapp-widget-pro')
            ),
            'processing' => array(
                'title' => __('قيد التجهيز', 'whatsapp-widget-pro'),
                'template' => __('عزيزي {customer_name}، طلبك رقم {order_number} قيد التجهيز حالياً. سنقوم بإشعارك عند الشحن.', 'whatsapp-widget-pro'),
                'description' => __('يرسل عندما يصبح الطلب قيد التجهيز', 'whatsapp-widget-pro')
            ),
            'on-hold' => array(
                'title' => __('في الانتظار', 'whatsapp-widget-pro'),
                'template' => __('طلبك رقم {order_number} في انتظار الدفع. يرجى إتمام الدفع لتجهيز طلبك.', 'whatsapp-widget-pro'),
                'description' => __('يرسل عندما يكون الطلب في انتظار الدفع', 'whatsapp-widget-pro')
            ),
            'completed' => array(
                'title' => __('مكتمل', 'whatsapp-widget-pro'),
                'template' => __('تم تسليم طلبك رقم {order_number} بنجاح! نتمنى أن تكون راضياً عن خدمتنا. يمكنك تقييم المنتج على موقعنا.', 'whatsapp-widget-pro'),
                'description' => __('يرسل عند اكتمال الطلب', 'whatsapp-widget-pro')
            ),
            'cancelled' => array(
                'title' => __('ملغي', 'whatsapp-widget-pro'),
                'template' => __('تم إلغاء طلبك رقم {order_number}. إذا كان لديك أي استفسار، يرجى التواصل معنا.', 'whatsapp-widget-pro'),
                'description' => __('يرسل عند إلغاء الطلب', 'whatsapp-widget-pro')
            ),
            'refunded' => array(
                'title' => __('مسترد', 'whatsapp-widget-pro'),
                'template' => __('تم استرداد مبلغ {total_amount} لطلبك رقم {order_number}. سيتم إيداع المبلغ في حسابك خلال 3-5 أيام عمل.', 'whatsapp-widget-pro'),
                'description' => __('يرسل عند استرداد قيمة الطلب', 'whatsapp-widget-pro')
            ),
            'failed' => array(
                'title' => __('فشل في الدفع', 'whatsapp-widget-pro'),
                'template' => __('عذراً، فشل في دفع طلبك رقم {order_number}. يرجى المحاولة مرة أخرى أو التواصل معنا للمساعدة.', 'whatsapp-widget-pro'),
                'description' => __('يرسل عند فشل عملية الدفع', 'whatsapp-widget-pro')
            )
        );
    }
    
    /**
     * الحصول على المتغيرات المتاحة
     */
    public static function getAvailableVariables() {
        return array(
            '{customer_name}' => __('اسم العميل', 'whatsapp-widget-pro'),
            '{order_number}' => __('رقم الطلب', 'whatsapp-widget-pro'),
            '{total_amount}' => __('المبلغ الإجمالي', 'whatsapp-widget-pro'),
            '{order_date}' => __('تاريخ الطلب', 'whatsapp-widget-pro'),
            '{tracking_number}' => __('رقم التتبع', 'whatsapp-widget-pro'),
            '{estimated_delivery}' => __('تاريخ التسليم المتوقع', 'whatsapp-widget-pro'),
            '{order_status}' => __('حالة الطلب', 'whatsapp-widget-pro'),
            '{payment_method}' => __('طريقة الدفع', 'whatsapp-widget-pro'),
            '{shipping_method}' => __('طريقة الشحن', 'whatsapp-widget-pro'),
            '{customer_email}' => __('بريد العميل الإلكتروني', 'whatsapp-widget-pro'),
            '{customer_phone}' => __('هاتف العميل', 'whatsapp-widget-pro'),
            '{order_url}' => __('رابط الطلب', 'whatsapp-widget-pro'),
        );
    }
}
?>