
<div class="wrap wwp-admin-wrap" dir="rtl">
    <div class="wwp-header">
        <div class="wwp-header-content">
            <div class="wwp-header-title">
                <div class="wwp-logo">
                    <div class="wwp-logo-icon">W</div>
                    <h1>WhatsApp Widget Pro</h1>
                </div>
                <p class="wwp-subtitle">إضافة احترافية لعرض زر WhatsApp مع تتبع Google Analytics ولوحة تحكم شاملة</p>
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

            <!-- الإحصائيات -->
            <div id="statistics-tab" class="wwp-tab-content">
                <div class="wwp-section">
                    <h2>إحصائيات الاستخدام (آخر 30 يوم)</h2>
                    <p class="description">بيانات شاملة عن أداء ويدجت WhatsApp</p>
                    
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
