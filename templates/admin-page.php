
<div class="wrap wwp-admin-wrap" dir="rtl">
    <div class="wwp-header">
        <div class="wwp-header-content">
            <div class="wwp-header-title">
                <div class="wwp-logo">
                    <div class="wwp-logo-icon">W</div>
                    <h1>WhatsApp Widget Pro</h1>
                </div>
                <p class="wwp-subtitle">نسخة أفضل مع Google Analytics. تأكد من إدخال معرف التتبع الصحيح وتفعيل النمودج.</p>
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
                    <li><a href="#analytics" class="wwp-nav-link" data-tab="analytics">📊 إعدادات Google Analytics</a></li>
                    <li><a href="#statistics" class="wwp-nav-link" data-tab="statistics">📈 إحصائيات الاستخدام (آخر 30 يوم)</a></li>
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
                        </div>
                    </div>
                </div>
            </div>

            <!-- إدارة الفريق -->
            <div id="team-tab" class="wwp-tab-content">
                <div class="wwp-section">
                    <h2>إدارة الفريق</h2>
                    <p class="description">إضافة وإدارة أعضاء فريق خدمة العملاء</p>
                    
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
                    <p class="description">تخصيص شكل وموقع زر WhatsApp</p>
                    
                    <div class="wwp-card">
                        <div class="wwp-card-body">
                            <div class="wwp-field">
                                <label for="widget_position">موقع الزر</label>
                                <select name="widget_position" id="widget_position">
                                    <option value="bottom-right" <?php selected($settings['widget_position'], 'bottom-right'); ?>>أسفل يمين</option>
                                    <option value="bottom-left" <?php selected($settings['widget_position'], 'bottom-left'); ?>>أسفل يسار</option>
                                    <option value="top-right" <?php selected($settings['widget_position'], 'top-right'); ?>>أعلى يمين</option>
                                    <option value="top-left" <?php selected($settings['widget_position'], 'top-left'); ?>>أعلى يسار</option>
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
                    <p class="description">ربط الإضافة مع Google Analytics لتتبع النقرات والمحادثات</p>
                    
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
                                <label for="analytics_id">معرف التتبع (Tracking ID)</label>
                                <input type="text" name="analytics_id" id="analytics_id" value="<?php echo esc_attr($settings['analytics_id']); ?>" placeholder="G-XXXXXXXXXX">
                                <p class="description">أدخل معرف التتبع من Google Analytics</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- الإحصائيات -->
            <div id="statistics-tab" class="wwp-tab-content">
                <div class="wwp-section">
                    <h2>إحصائيات الاستخدام</h2>
                    <p class="description">إحصائيات النقرات والمحادثات خلال آخر 30 يوم</p>
                    
                    <div class="wwp-stats-cards">
                        <div class="wwp-stat-card">
                            <div class="wwp-stat-icon">📱</div>
                            <div class="wwp-stat-content">
                                <h3><?php echo number_format($stats['total_clicks'] ?: 0); ?></h3>
                                <p>إجمالي النقرات</p>
                            </div>
                        </div>
                        <div class="wwp-stat-card">
                            <div class="wwp-stat-icon">💬</div>
                            <div class="wwp-stat-content">
                                <h3><?php echo number_format($stats['total_conversations'] ?: 0); ?></h3>
                                <p>إجمالي المحادثات</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="wwp-card">
                        <div class="wwp-card-header">
                            <h3>الإحصائيات اليومية</h3>
                        </div>
                        <div class="wwp-card-body">
                            <canvas id="wwp-stats-chart" width="400" height="200"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
