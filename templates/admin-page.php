<div class="wrap wwp-admin-wrap" dir="rtl">
    <div class="wwp-header">
        <div class="wwp-header-content">
            <div class="wwp-header-title">
                <div class="wwp-logo">
                    <div class="wwp-logo-icon">W</div>
                    <h1>WhatsApp Widget Pro v2.0</h1>
                </div>
                <p class="wwp-subtitle">إضافة احترافية لعرض زر WhatsApp مع تكامل WooCommerce ونظام حماية IP متقدم</p>
            </div>
            <div class="wwp-header-actions">
                <button type="button" class="button button-secondary wwp-backup-btn">نسخة احتياطية</button>
                <button type="button" class="button button-primary wwp-save-btn">حفظ الإعدادات</button>
            </div>
        </div>
    </div>

    <div class="wwp-main-content">
        <div class="wwp-sidebar">
            <nav class="wwp-nav">
                <ul>
                    <li><a href="#general" class="wwp-nav-link active" data-tab="general">⚙️ الإعدادات العامة</a></li>
                    <li><a href="#team" class="wwp-nav-link" data-tab="team">👥 إدارة الفريق</a></li>
                    <li><a href="#appearance" class="wwp-nav-link" data-tab="appearance">🎨 إعدادات المظهر</a></li>
                    <li><a href="#analytics" class="wwp-nav-link" data-tab="analytics">📊 إعدادات Google Analytics</a></li>
                    <li><a href="#woocommerce" class="wwp-nav-link" data-tab="woocommerce">🛒 تكامل WooCommerce</a></li>
                    <li><a href="#security" class="wwp-nav-link" data-tab="security">🔒 إعدادات الأمان</a></li>
                    <li><a href="#statistics" class="wwp-nav-link" data-tab="statistics">📈 إحصائيات الاستخدام</a></li>
                </ul>
            </nav>
        </div>

        <div class="wwp-content">
            <!-- الإعدادات العامة -->
            <div id="general-tab" class="wwp-tab-content active">
                <div class="wwp-section">
                    <h2>الإعدادات العامة</h2>
                    <p class="description">إعدادات عامة لزر WhatsApp والرسائل</p>
                    
                    <div class="wwp-card">
                        <div class="wwp-card-header">
                            <label class="wwp-toggle">
                                <input type="checkbox" name="show_widget" <?php checked($settings['show_widget']); ?>>
                                <span class="wwp-toggle-slider"></span>
                                إظهار ويدجت WhatsApp في الموقع
                            </label>
                        </div>
                        <div class="wwp-card-body">
                            <div class="wwp-field">
                                <label for="welcome_message">الرسالة التي ستظهر عند فتح المحادثة</label>
                                <textarea name="welcome_message" id="welcome_message" rows="3" placeholder="الرسالة التي ستظهر عند فتح نافذة الدردشة"><?php echo esc_textarea($settings['welcome_message']); ?></textarea>
                            </div>
                            
                            <div class="wwp-field">
                                <label class="wwp-toggle">
                                    <input type="checkbox" name="show_outside_hours" <?php checked($settings['show_outside_hours'] ?? false); ?>>
                                    <span class="wwp-toggle-slider"></span>
                                    إظهار الويدجت خارج ساعات العمل
                                </label>
                            </div>
                            
                            <div class="wwp-field">
                                <label for="outside_hours_message">رسالة خارج ساعات العمل</label>
                                <textarea name="outside_hours_message" id="outside_hours_message" rows="2" placeholder="الرسالة التي ستظهر خارج ساعات العمل"><?php echo esc_textarea($settings['outside_hours_message'] ?? ''); ?></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- إدارة الفريق -->
            <div id="team-tab" class="wwp-tab-content">
                <div class="wwp-section">
                    <h2>إدارة الفريق المحسنة</h2>
                    <p class="description">إضافة وإدارة أعضاء فريق خدمة العملاء مع ساعات العمل</p>
                    
                    <div class="wwp-card">
                        <div class="wwp-card-header">
                            <h3>أعضاء الفريق</h3>
                            <button type="button" class="button button-primary wwp-add-member">إضافة عضو جديد</button>
                        </div>
                        <div class="wwp-card-body">
                            <div class="wwp-team-list">
                                <?php foreach ($team_members as $member): ?>
                                <div class="wwp-team-member" data-id="<?php echo $member->id; ?>">
                                    <div class="wwp-member-avatar">
                                        <?php if ($member->avatar): ?>
                                            <img src="<?php echo esc_url($member->avatar); ?>" alt="<?php echo esc_attr($member->name); ?>">
                                        <?php else: ?>
                                            <div class="wwp-avatar-placeholder"><?php echo mb_substr($member->name, 0, 1); ?></div>
                                        <?php endif; ?>
                                        <span class="wwp-status-indicator <?php echo $member->status; ?>"></span>
                                    </div>
                                    <div class="wwp-member-info">
                                        <h4><?php echo esc_html($member->name); ?></h4>
                                        <p><?php echo esc_html($member->department); ?></p>
                                        <p class="wwp-phone"><?php echo esc_html($member->phone); ?></p>
                                        <p class="wwp-hours">
                                            🕐 <?php echo date('g:i A', strtotime($member->working_hours_start)); ?> - 
                                            <?php echo date('g:i A', strtotime($member->working_hours_end)); ?>
                                        </p>
                                        <p class="wwp-days">
                                            📅 <?php 
                                            $days = explode(',', $member->working_days);
                                            $day_names = ['', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
                                            echo implode(', ', array_map(function($day) use ($day_names) { return $day_names[$day]; }, $days));
                                            ?>
                                        </p>
                                    </div>
                                    <div class="wwp-member-actions">
                                        <button type="button" class="button wwp-edit-member">تعديل</button>
                                        <button type="button" class="button wwp-delete-member">حذف</button>
                                    </div>
                                </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- إعدادات المظهر -->
            <div id="appearance-tab" class="wwp-tab-content">
                <div class="wwp-section">
                    <h2>إعدادات المظهر</h2>
                    <p class="description">تخصيص مظهر زر WhatsApp</p>
                    
                    <div class="wwp-card">
                        <div class="wwp-card-header">
                            <h3>لون الويدجت</h3>
                        </div>
                        <div class="wwp-card-body">
                            <div class="wwp-color-preview">
                                <div class="wwp-color-sample" style="background-color: <?php echo esc_attr($settings['widget_color']); ?>"></div>
                                <p>اللون الأساسي للويدجت</p>
                            </div>
                            <div class="wwp-color-palette">
                                <button type="button" class="wwp-color-option" data-color="#25D366" style="background-color: #25D366" <?php echo ($settings['widget_color'] === '#25D366') ? 'class="active"' : ''; ?>></button>
                                <button type="button" class="wwp-color-option" data-color="#0088CC" style="background-color: #0088CC" <?php echo ($settings['widget_color'] === '#0088CC') ? 'class="active"' : ''; ?>></button>
                                <button type="button" class="wwp-color-option" data-color="#FF6B35" style="background-color: #FF6B35" <?php echo ($settings['widget_color'] === '#FF6B35') ? 'class="active"' : ''; ?>></button>
                                <button type="button" class="wwp-color-option" data-color="#8B5CF6" style="background-color: #8B5CF6" <?php echo ($settings['widget_color'] === '#8B5CF6') ? 'class="active"' : ''; ?>></button>
                            </div>
                            <div class="wwp-field">
                                <label for="widget_color">أو اختر لون مخصص</label>
                                <input type="color" name="widget_color" id="widget_color" value="<?php echo esc_attr($settings['widget_color']); ?>">
                            </div>
                        </div>
                    </div>

                    <div class="wwp-card">
                        <div class="wwp-card-header">
                            <h3>موقع الويدجت</h3>
                        </div>
                        <div class="wwp-card-body">
                            <div class="wwp-field">
                                <label for="widget_position">اختر موقع الزر على الشاشة</label>
                                <select name="widget_position" id="widget_position">
                                    <option value="bottom-right" <?php selected($settings['widget_position'], 'bottom-right'); ?>>أسفل يمين</option>
                                    <option value="bottom-left" <?php selected($settings['widget_position'], 'bottom-left'); ?>>أسفل يسار</option>
                                    <option value="top-right" <?php selected($settings['widget_position'], 'top-right'); ?>>أعلى يمين</option>
                                    <option value="top-left" <?php selected($settings['widget_position'], 'top-left'); ?>>أعلى يسار</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- إعدادات Google Analytics -->
            <div id="analytics-tab" class="wwp-tab-content">
                <div class="wwp-section">
                    <h2>إعدادات Google Analytics</h2>
                    <p class="description">تتبع إحصائيات استخدام زر WhatsApp</p>
                    
                    <div class="wwp-card">
                        <div class="wwp-card-header">
                            <label class="wwp-toggle">
                                <input type="checkbox" name="enable_analytics" <?php checked($settings['enable_analytics']); ?>>
                                <span class="wwp-toggle-slider"></span>
                                تفعيل تتبع الأحداث في Google Analytics
                            </label>
                        </div>
                        <div class="wwp-card-body">
                            <div class="wwp-field">
                                <label for="analytics_id">معرف التتبع</label>
                                <input type="text" name="analytics_id" id="analytics_id" value="<?php echo esc_attr($settings['analytics_id']); ?>" placeholder="UA-XXXXXXXXX-X أو G-XXXXXXXXXX">
                                <p class="description">معرف Google Analytics الخاص بموقعك</p>
                            </div>
                            
                            <div class="wwp-info-box">
                                <h4>الأحداث المتتبعة:</h4>
                                <ul>
                                    <li><strong>widget_opened:</strong> عند فتح نافذة الدردشة</li>
                                    <li><strong>chat_started:</strong> عند بدء محادثة مع أحد أعضاء الفريق</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- تكامل WooCommerce -->
            <div id="woocommerce-tab" class="wwp-tab-content">
                <div class="wwp-section">
                    <h2>تكامل WooCommerce</h2>
                    <p class="description">إرسال رسائل WhatsApp تلقائية للعملاء عند تحديث الطلبات</p>
                    
                    <?php if (!class_exists('WooCommerce')): ?>
                        <div class="wwp-notice notice notice-warning">
                            <p><strong>تنبيه:</strong> لم يتم العثور على إضافة WooCommerce. يرجى تثبيت وتفعيل WooCommerce لاستخدام هذه الميزة.</p>
                        </div>
                    <?php endif; ?>
                    
                    <div class="wwp-card">
                        <div class="wwp-card-header">
                            <label class="wwp-toggle">
                                <input type="checkbox" name="enable_woocommerce" <?php checked($woocommerce_settings['enable_woocommerce'] ?? false); ?>>
                                <span class="wwp-toggle-slider"></span>
                                تفعيل تكامل WooCommerce
                            </label>
                        </div>
                        <div class="wwp-card-body wwp-woocommerce-settings" style="<?php echo empty($woocommerce_settings['enable_woocommerce']) ? 'display: none;' : ''; ?>">
                            <div class="wwp-field">
                                <label class="wwp-toggle">
                                    <input type="checkbox" name="send_order_notifications" <?php checked($woocommerce_settings['send_order_notifications'] ?? false); ?>>
                                    <span class="wwp-toggle-slider"></span>
                                    إرسال رسالة تأكيد الطلب
                                </label>
                            </div>
                            
                            <div class="wwp-field">
                                <label for="order_confirmation_template">قالب رسالة تأكيد الطلب</label>
                                <textarea name="order_confirmation_template" id="order_confirmation_template" rows="3" placeholder="شكراً لك! تم استلام طلبك رقم #{order_number} بنجاح."><?php echo esc_textarea($woocommerce_settings['order_confirmation_template'] ?? ''); ?></textarea>
                                <p class="description">المتغيرات المتاحة: {order_number}, {customer_name}, {total}</p>
                            </div>
                            
                            <div class="wwp-field">
                                <label class="wwp-toggle">
                                    <input type="checkbox" name="send_processing_notifications" <?php checked($woocommerce_settings['send_processing_notifications'] ?? false); ?>>
                                    <span class="wwp-toggle-slider"></span>
                                    إرسال رسالة عند معالجة الطلب
                                </label>
                            </div>
                            
                            <div class="wwp-field">
                                <label for="shipping_update_template">قالب رسالة تحديث الشحن</label>
                                <textarea name="shipping_update_template" id="shipping_update_template" rows="3" placeholder="طلبك رقم #{order_number} قيد التجهيز وسيتم شحنه قريباً."><?php echo esc_textarea($woocommerce_settings['shipping_update_template'] ?? ''); ?></textarea>
                            </div>
                            
                            <div class="wwp-field">
                                <label class="wwp-toggle">
                                    <input type="checkbox" name="send_completion_notifications" <?php checked($woocommerce_settings['send_completion_notifications'] ?? false); ?>>
                                    <span class="wwp-toggle-slider"></span>
                                    إرسال رسالة عند اكتمال الطلب
                                </label>
                            </div>
                            
                            <div class="wwp-field">
                                <label for="delivery_notice_template">قالب رسالة التسليم</label>
                                <textarea name="delivery_notice_template" id="delivery_notice_template" rows="3" placeholder="تم تسليم طلبك رقم #{order_number} بنجاح. شكراً لثقتك بنا!"><?php echo esc_textarea($woocommerce_settings['delivery_notice_template'] ?? ''); ?></textarea>
                            </div>
                            
                            <div class="wwp-field">
                                <button type="button" class="button button-primary wwp-save-woocommerce-btn">حفظ إعدادات WooCommerce</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- إعدادات الأمان -->
            <div id="security-tab" class="wwp-tab-content">
                <div class="wwp-section">
                    <h2>إعدادات الأمان وحظر IP</h2>
                    <p class="description">حماية الويدجت من الاستخدام المفرط والسبام</p>
                    
                    <div class="wwp-card">
                        <div class="wwp-card-header">
                            <label class="wwp-toggle">
                                <input type="checkbox" name="enable_ip_blocking" <?php checked($security_settings['enable_ip_blocking'] ?? false); ?>>
                                <span class="wwp-toggle-slider"></span>
                                تفعيل نظام حظر IP
                            </label>
                        </div>
                        <div class="wwp-card-body wwp-security-settings" style="<?php echo empty($security_settings['enable_ip_blocking']) ? 'display: none;' : ''; ?>">
                            <div class="wwp-field">
                                <label for="max_clicks_per_hour">الحد الأقصى للنقرات في الساعة</label>
                                <input type="number" name="max_clicks_per_hour" id="max_clicks_per_hour" value="<?php echo esc_attr($security_settings['max_clicks_per_hour'] ?? '100'); ?>" min="1" max="1000">
                                <p class="description">سيتم حظر IP تلقائياً عند تجاوز هذا العدد</p>
                            </div>
                            
                            <div class="wwp-field">
                                <label class="wwp-toggle">
                                    <input type="checkbox" name="auto_block_suspicious" <?php checked($security_settings['auto_block_suspicious'] ?? false); ?>>
                                    <span class="wwp-toggle-slider"></span>
                                    حظر النشاطات المشبوهة تلقائياً
                                </label>
                            </div>
                            
                            <div class="wwp-field">
                                <label for="whitelist_ips">قائمة IP المسموحة (IP في كل سطر)</label>
                                <textarea name="whitelist_ips" id="whitelist_ips" rows="5" placeholder="192.168.1.1&#10;10.0.0.0/8"><?php echo esc_textarea($security_settings['whitelist_ips'] ?? ''); ?></textarea>
                                <p class="description">عناوين IP هذه لن يتم حظرها أبداً</p>
                            </div>
                            
                            <div class="wwp-field">
                                <button type="button" class="button button-primary wwp-save-security-btn">حفظ إعدادات الأمان</button>
                                <button type="button" class="button button-secondary wwp-block-ip-btn">حظر IP يدوياً</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- قائمة IP المحظورة -->
                    <div class="wwp-card">
                        <div class="wwp-card-header">
                            <h3>عناوين IP المحظورة</h3>
                        </div>
                        <div class="wwp-card-body">
                            <?php
                            global $wpdb;
                            $blocked_ips = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}wwp_blocked_ips WHERE is_active = 1 ORDER BY blocked_at DESC LIMIT 20");
                            ?>
                            
                            <?php if ($blocked_ips): ?>
                                <table class="wp-list-table widefat fixed striped">
                                    <thead>
                                        <tr>
                                            <th>عنوان IP</th>
                                            <th>السبب</th>
                                            <th>تاريخ الحظر</th>
                                            <th>ينتهي في</th>
                                            <th>الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php foreach ($blocked_ips as $blocked_ip): ?>
                                        <tr>
                                            <td><?php echo esc_html($blocked_ip->ip_address); ?></td>
                                            <td><?php echo esc_html($blocked_ip->reason ?: 'غير محدد'); ?></td>
                                            <td><?php echo date('Y-m-d H:i', strtotime($blocked_ip->blocked_at)); ?></td>
                                            <td>
                                                <?php echo $blocked_ip->expires_at ? date('Y-m-d H:i', strtotime($blocked_ip->expires_at)) : 'دائم'; ?>
                                            </td>
                                            <td>
                                                <button type="button" class="button button-small wwp-unblock-ip-btn" data-ip="<?php echo esc_attr($blocked_ip->ip_address); ?>">
                                                    إلغاء الحظر
                                                </button>
                                            </td>
                                        </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
                            <?php else: ?>
                                <p>لا توجد عناوين IP محظورة حالياً.</p>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>

            <!-- الإحصائيات المحسنة -->
            <div id="statistics-tab" class="wwp-tab-content">
                <div class="wwp-section">
                    <h2>إحصائيات الاستخدام المحسنة (آخر 30 يوم)</h2>
                    <p class="description">بيانات شاملة ومفصلة عن أداء ويدجت WhatsApp</p>
                    
                    <div class="wwp-stats-overview">
                        <div class="wwp-stat-card orange">
                            <div class="wwp-stat-content">
                                <div class="wwp-stat-value"><?php echo $stats['total_clicks'] > 0 ? round(($stats['total_conversations'] / $stats['total_clicks']) * 100, 1) : 0; ?>%</div>
                                <div class="wwp-stat-label">معدل التحويل</div>
                            </div>
                        </div>
                        
                        <div class="wwp-stat-card green">
                            <div class="wwp-stat-content">
                                <div class="wwp-stat-value"><?php echo number_format($stats['total_conversations'] ?: 0); ?></div>
                                <div class="wwp-stat-label">محادثة بدأت</div>
                            </div>
                        </div>
                        
                        <div class="wwp-stat-card blue">
                            <div class="wwp-stat-content">
                                <div class="wwp-stat-value"><?php echo number_format($stats['total_clicks'] ?: 0); ?></div>
                                <div class="wwp-stat-label">فتح الويدجت</div>
                            </div>
                        </div>
                        
                        <div class="wwp-stat-card purple">
                            <div class="wwp-stat-content">
                                <div class="wwp-stat-value"><?php echo number_format($stats['unique_ips'] ?: 0); ?></div>
                                <div class="wwp-stat-label">زائر فريد</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- الصفحات الأكثر استخداماً -->
                    <div class="wwp-card">
                        <div class="wwp-card-header">
                            <h3>الصفحات الأكثر استخداماً للويدجت</h3>
                        </div>
                        <div class="wwp-card-body">
                            <?php if (!empty($stats['top_pages'])): ?>
                                <table class="wp-list-table widefat fixed striped">
                                    <thead>
                                        <tr>
                                            <th>الصفحة</th>
                                            <th>عدد النقرات</th>
                                            <th>النسبة</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php foreach ($stats['top_pages'] as $page): ?>
                                        <tr>
                                            <td><?php echo esc_html($page->page_url ?: 'الصفحة الرئيسية'); ?></td>
                                            <td><?php echo number_format($page->clicks); ?></td>
                                            <td><?php echo $stats['total_clicks'] >0 ? round(($page->clicks / $stats['total_clicks']) * 100, 1) : 0; ?>%</td>
                                        </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
                            <?php else: ?>
                                <p>لا توجد بيانات كافية لعرض الصفحات الأكثر استخداماً.</p>
                            <?php endif; ?>
                        </div>
                    </div>
                    
                    <div class="wwp-card">
                        <div class="wwp-card-header">
                            <h3>إحصائيات مفصلة</h3>
                        </div>
                        <div class="wwp-card-body">
                            <?php if (!empty($stats['daily_stats']) && $stats['total_clicks'] > 0): ?>
                                <canvas id="wwp-stats-chart" width="400" height="200"></canvas>
                            <?php else: ?>
                                <div class="wwp-no-data">
                                    <div class="wwp-no-data-icon">📊</div>
                                    <p>لا توجد بيانات كافية لعرض الإحصائيات</p>
                                    <p class="description">ستظهر البيانات هنا بعد استخدام الويدجت</p>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
