
<?php
if (!defined('ABSPATH')) {
    exit;
}

$settings = $this->get_settings();
$team_members = $this->get_team_members();
$stats = $this->get_usage_stats();
?>

<div class="wrap wwp-admin-wrap" dir="rtl">
    <div class="wwp-header">
        <div class="wwp-header-content">
            <div class="wwp-header-title">
                <div class="wwp-logo">
                    <div class="wwp-logo-icon">📱</div>
                    <h1>WhatsApp Widget Pro</h1>
                </div>
                <p class="wwp-subtitle">إضافة احترافية لإدارة محادثات WhatsApp مع تتبع Google Analytics</p>
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
                    <li><a href="#appearance" class="wwp-nav-link" data-tab="appearance">🎨 المظهر</a></li>
                    <li><a href="#analytics" class="wwp-nav-link" data-tab="analytics">📊 Google Analytics</a></li>
                    <li><a href="#statistics" class="wwp-nav-link" data-tab="statistics">📈 الإحصائيات</a></li>
                </ul>
            </nav>
        </div>

        <div class="wwp-content">
            <!-- الإعدادات العامة -->
            <div id="general-tab" class="wwp-tab-content active">
                <div class="wwp-section">
                    <h2>الإعدادات العامة</h2>
                    
                    <div class="wwp-card">
                        <div class="wwp-card-header">
                            <label class="wwp-toggle">
                                <input type="checkbox" name="show_widget" <?php checked($settings['show_widget']); ?>>
                                <span class="wwp-toggle-slider"></span>
                                إظهار ويدجت WhatsApp
                            </label>
                        </div>
                        <div class="wwp-card-body">
                            <div class="wwp-field">
                                <label for="welcome_message">رسالة الترحيب</label>
                                <textarea name="welcome_message" id="welcome_message" rows="3"><?php echo esc_textarea($settings['welcome_message']); ?></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- إدارة الفريق -->
            <div id="team-tab" class="wwp-tab-content">
                <div class="wwp-section">
                    <h2>إدارة الفريق</h2>
                    
                    <div class="wwp-card">
                        <div class="wwp-card-header">
                            <h3>أعضاء الفريق</h3>
                            <button type="button" class="button button-primary wwp-add-member">إضافة عضو جديد</button>
                        </div>
                        <div class="wwp-card-body">
                            <div class="wwp-team-list">
                                <?php foreach ($team_members as $member): ?>
                                <div class="wwp-team-member" data-id="<?php echo $member->id; ?>">
                                    <div class="wwp-member-info">
                                        <h4><?php echo esc_html($member->name); ?></h4>
                                        <p><?php echo esc_html($member->department); ?></p>
                                        <p class="wwp-phone"><?php echo esc_html($member->phone); ?></p>
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

            <!-- المظهر -->
            <div id="appearance-tab" class="wwp-tab-content">
                <div class="wwp-section">
                    <h2>إعدادات المظهر</h2>
                    
                    <div class="wwp-card">
                        <div class="wwp-card-body">
                            <div class="wwp-field">
                                <label for="widget_position">موقع الزر</label>
                                <select name="widget_position" id="widget_position">
                                    <option value="bottom-right" <?php selected($settings['widget_position'], 'bottom-right'); ?>>أسفل يمين</option>
                                    <option value="bottom-left" <?php selected($settings['widget_position'], 'bottom-left'); ?>>أسفل يسار</option>
                                </select>
                            </div>
                            <div class="wwp-field">
                                <label for="widget_color">لون الزر</label>
                                <input type="color" name="widget_color" id="widget_color" value="<?php echo esc_attr($settings['widget_color']); ?>">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Google Analytics -->
            <div id="analytics-tab" class="wwp-tab-content">
                <div class="wwp-section">
                    <h2>إعدادات Google Analytics</h2>
                    
                    <div class="wwp-card">
                        <div class="wwp-card-body">
                            <div class="wwp-field">
                                <label class="wwp-toggle">
                                    <input type="checkbox" name="enable_analytics" <?php checked($settings['enable_analytics']); ?>>
                                    <span class="wwp-toggle-slider"></span>
                                    تفعيل تتبع Google Analytics
                                </label>
                            </div>
                            <div class="wwp-field">
                                <label for="analytics_id">معرف التتبع</label>
                                <input type="text" name="analytics_id" id="analytics_id" value="<?php echo esc_attr($settings['analytics_id']); ?>" placeholder="G-XXXXXXXXXX">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- الإحصائيات -->
            <div id="statistics-tab" class="wwp-tab-content">
                <div class="wwp-section">
                    <h2>إحصائيات الاستخدام</h2>
                    
                    <div class="wwp-stats-cards">
                        <div class="wwp-stat-card">
                            <h3><?php echo number_format($stats['total_clicks'] ?: 0); ?></h3>
                            <p>إجمالي النقرات</p>
                        </div>
                        <div class="wwp-stat-card">
                            <h3><?php echo number_format($stats['total_conversations'] ?: 0); ?></h3>
                            <p>إجمالي المحادثات</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
