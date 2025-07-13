
// Template generators for WordPress plugin
// Simplified admin template
export const generateAdminTemplate = () => {
  return `<?php
/**
 * WhatsApp Widget Pro - Admin Page Template
 * Simple and clean admin interface
 */

// منع الوصول المباشر
if (!defined('ABSPATH')) {
    exit;
}

$settings = get_option('wwp_settings', array(
    'phone_number' => '',
    'welcome_message' => 'مرحباً! كيف يمكننا مساعدتك؟',
    'position' => 'bottom-right',
    'widget_color' => '#25d366',
    'enabled' => '1'
));

$stats = get_option('wwp_stats', array('total_clicks' => 0));
?>

<div class="wrap whatsapp-widget-admin">
    <h1>إعدادات WhatsApp Widget Pro</h1>
    
    <!-- إحصائيات بسيطة -->
    <div class="wwp-stats">
        <div class="wwp-stat-card">
            <div class="wwp-stat-number"><?php echo esc_html($stats['total_clicks']); ?></div>
            <div class="wwp-stat-label">إجمالي النقرات</div>
        </div>
        <div class="wwp-stat-card">
            <div class="wwp-stat-number"><?php echo $settings['enabled'] ? 'مفعل' : 'معطل'; ?></div>
            <div class="wwp-stat-label">حالة الويدجت</div>
        </div>
    </div>

    <form method="post" id="wwp-settings-form">
        <?php wp_nonce_field('wwp_settings_nonce', 'wwp_nonce'); ?>
        
        <table class="form-table wwp-form-table">
            <tbody>
                <tr>
                    <th scope="row">
                        <label for="wwp_enabled">تفعيل الويدجت</label>
                    </th>
                    <td>
                        <label>
                            <input type="checkbox" id="wwp_enabled" name="wwp_enabled" value="1" 
                                   <?php checked($settings['enabled'], '1'); ?> />
                            عرض ويدجت واتساب في الموقع
                        </label>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="wwp_phone_number">رقم الهاتف</label>
                    </th>
                    <td>
                        <input type="text" id="wwp_phone_number" name="wwp_phone_number" 
                               value="<?php echo esc_attr($settings['phone_number']); ?>" 
                               class="regular-text" placeholder="+966501234567" />
                        <p class="description">أدخل رقم الهاتف مع رمز البلد (مثال: +966501234567)</p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="wwp_welcome_message">رسالة الترحيب</label>
                    </th>
                    <td>
                        <textarea id="wwp_welcome_message" name="wwp_welcome_message" 
                                  rows="3" class="large-text"><?php echo esc_textarea($settings['welcome_message']); ?></textarea>
                        <p class="description">الرسالة التي ستظهر في نافذة الواتساب</p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="wwp_position">موضع الويدجت</label>
                    </th>
                    <td>
                        <select id="wwp_position" name="wwp_position">
                            <option value="bottom-right" <?php selected($settings['position'], 'bottom-right'); ?>>
                                أسفل يمين
                            </option>
                            <option value="bottom-left" <?php selected($settings['position'], 'bottom-left'); ?>>
                                أسفل يسار
                            </option>
                            <option value="top-right" <?php selected($settings['position'], 'top-right'); ?>>
                                أعلى يمين
                            </option>
                            <option value="top-left" <?php selected($settings['position'], 'top-left'); ?>>
                                أعلى يسار
                            </option>
                        </select>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="wwp_widget_color">لون الويدجت</label>
                    </th>
                    <td>
                        <input type="text" id="wwp_widget_color" name="wwp_widget_color" 
                               value="<?php echo esc_attr($settings['widget_color']); ?>" 
                               class="wwp-color-picker" />
                        <p class="description">اختر لون الويدجت</p>
                    </td>
                </tr>
            </tbody>
        </table>
        
        <?php submit_button('حفظ الإعدادات', 'primary', 'submit', false); ?>
    </form>
    
    <!-- معاينة الويدجت -->
    <div style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px;">
        <h3>معاينة الويدجت</h3>
        <p>سيظهر الويدجت في الموقع بهذا الشكل:</p>
        <div style="position: relative; height: 100px; background: #fff; border: 1px solid #ddd;">
            <div class="whatsapp-widget <?php echo esc_attr($settings['position']); ?>" 
                 style="position: absolute;">
                <div class="whatsapp-button" 
                     style="background-color: <?php echo esc_attr($settings['widget_color']); ?>;">
                    📱
                </div>
            </div>
        </div>
    </div>
</div>`;
};

export const generateAdminPageTemplate = () => {
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}

// Get current settings
$settings = get_option('wwp_settings', array());
$team_members = WWP_Database::get_team_members();
$woocommerce_settings = get_option('wwp_woocommerce_settings', array());
$security_settings = get_option('wwp_security_settings', array());

// Set defaults
$defaults = array(
    'show_widget' => '1',
    'welcome_message' => 'مرحباً! كيف يمكنني مساعدتك؟',
    'widget_position' => 'bottom-right',
    'widget_color' => '#25D366',
    'analytics_id' => '',
    'enable_analytics' => '0'
);
$settings = wp_parse_args($settings, $defaults);
?>

<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    
    <div class="wwp-admin-container">
        <!-- Navigation Tabs -->
        <nav class="nav-tab-wrapper">
            <a href="#general" class="nav-tab nav-tab-active" data-tab="general">
                <?php _e('الإعدادات العامة', 'whatsapp-widget-pro'); ?>
            </a>
            <a href="#team" class="nav-tab" data-tab="team">
                <?php _e('إدارة الفريق', 'whatsapp-widget-pro'); ?>
            </a>
            <a href="#appearance" class="nav-tab" data-tab="appearance">
                <?php _e('المظهر', 'whatsapp-widget-pro'); ?>
            </a>
            <a href="#analytics" class="nav-tab" data-tab="analytics">
                <?php _e('الإحصائيات', 'whatsapp-widget-pro'); ?>
            </a>
            <?php if (class_exists('WooCommerce')): ?>
            <a href="#woocommerce" class="nav-tab" data-tab="woocommerce">
                <?php _e('WooCommerce', 'whatsapp-widget-pro'); ?>
            </a>
            <?php endif; ?>
            <a href="#security" class="nav-tab" data-tab="security">
                <?php _e('الأمان', 'whatsapp-widget-pro'); ?>
            </a>
        </nav>

        <form method="post" action="" id="wwp-settings-form">
            <?php wp_nonce_field('wwp_settings_save', 'wwp_nonce'); ?>
            
            <!-- General Settings Tab -->
            <div id="general-tab" class="tab-content active">
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="show_widget"><?php _e('تفعيل الويدجت', 'whatsapp-widget-pro'); ?></label>
                        </th>
                        <td>
                            <input type="checkbox" id="show_widget" name="show_widget" value="1" <?php checked($settings['show_widget'], '1'); ?> />
                            <label for="show_widget"><?php _e('إظهار أيقونة WhatsApp في الموقع', 'whatsapp-widget-pro'); ?></label>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="welcome_message"><?php _e('رسالة الترحيب', 'whatsapp-widget-pro'); ?></label>
                        </th>
                        <td>
                            <textarea id="welcome_message" name="welcome_message" rows="3" cols="50" class="regular-text"><?php echo esc_textarea($settings['welcome_message']); ?></textarea>
                            <p class="description"><?php _e('الرسالة التي ستظهر للزائرين عند النقر على الأيقونة', 'whatsapp-widget-pro'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="widget_position"><?php _e('موضع الأيقونة', 'whatsapp-widget-pro'); ?></label>
                        </th>
                        <td>
                            <select id="widget_position" name="widget_position">
                                <option value="bottom-right" <?php selected($settings['widget_position'], 'bottom-right'); ?>><?php _e('أسفل اليمين', 'whatsapp-widget-pro'); ?></option>
                                <option value="bottom-left" <?php selected($settings['widget_position'], 'bottom-left'); ?>><?php _e('أسفل اليسار', 'whatsapp-widget-pro'); ?></option>
                                <option value="top-right" <?php selected($settings['widget_position'], 'top-right'); ?>><?php _e('أعلى اليمين', 'whatsapp-widget-pro'); ?></option>
                                <option value="top-left" <?php selected($settings['widget_position'], 'top-left'); ?>><?php _e('أعلى اليسار', 'whatsapp-widget-pro'); ?></option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="widget_color"><?php _e('لون الأيقونة', 'whatsapp-widget-pro'); ?></label>
                        </th>
                        <td>
                            <input type="color" id="widget_color" name="widget_color" value="<?php echo esc_attr($settings['widget_color']); ?>" />
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Team Management Tab -->
            <div id="team-tab" class="tab-content" style="display: none;">
                <div class="team-management-section">
                    <div class="team-header">
                        <h3><?php _e('أعضاء الفريق', 'whatsapp-widget-pro'); ?></h3>
                        <button type="button" class="button button-primary" id="add-team-member">
                            <?php _e('إضافة عضو جديد', 'whatsapp-widget-pro'); ?>
                        </button>
                    </div>
                    
                    <div class="team-members-list">
                        <?php if (!empty($team_members)): ?>
                            <?php foreach ($team_members as $member): ?>
                            <div class="team-member-card" data-member-id="<?php echo esc_attr($member->id); ?>">
                                <div class="member-info">
                                    <h4><?php echo esc_html($member->name); ?></h4>
                                    <p><?php echo esc_html($member->department); ?></p>
                                    <span class="member-phone"><?php echo esc_html($member->phone); ?></span>
                                    <span class="member-status status-<?php echo esc_attr($member->status); ?>">
                                        <?php echo esc_html(ucfirst($member->status)); ?>
                                    </span>
                                </div>
                                <div class="member-actions">
                                    <button type="button" class="button edit-member" data-member-id="<?php echo esc_attr($member->id); ?>">
                                        <?php _e('تعديل', 'whatsapp-widget-pro'); ?>
                                    </button>
                                    <button type="button" class="button delete-member" data-member-id="<?php echo esc_attr($member->id); ?>">
                                        <?php _e('حذف', 'whatsapp-widget-pro'); ?>
                                    </button>
                                </div>
                            </div>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <p><?php _e('لا توجد أعضاء فريق حالياً. قم بإضافة أول عضو.', 'whatsapp-widget-pro'); ?></p>
                        <?php endif; ?>
                    </div>
                </div>
            </div>

            <!-- Analytics Tab -->
            <div id="analytics-tab" class="tab-content" style="display: none;">
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="enable_analytics"><?php _e('تفعيل Google Analytics', 'whatsapp-widget-pro'); ?></label>
                        </th>
                        <td>
                            <input type="checkbox" id="enable_analytics" name="enable_analytics" value="1" <?php checked($settings['enable_analytics'], '1'); ?> />
                            <label for="enable_analytics"><?php _e('تتبع النقرات عبر Google Analytics', 'whatsapp-widget-pro'); ?></label>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="analytics_id"><?php _e('معرف Google Analytics', 'whatsapp-widget-pro'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="analytics_id" name="analytics_id" value="<?php echo esc_attr($settings['analytics_id']); ?>" class="regular-text" placeholder="G-XXXXXXXXXX" />
                            <p class="description"><?php _e('أدخل معرف Google Analytics الخاص بك', 'whatsapp-widget-pro'); ?></p>
                        </td>
                    </tr>
                </table>
                
                <div class="analytics-stats">
                    <h3><?php _e('إحصائيات الاستخدام', 'whatsapp-widget-pro'); ?></h3>
                    <div class="stats-cards">
                        <div class="stat-card">
                            <h4><?php _e('إجمالي النقرات', 'whatsapp-widget-pro'); ?></h4>
                            <span class="stat-number" id="total-clicks">0</span>
                        </div>
                        <div class="stat-card">
                            <h4><?php _e('المحادثات', 'whatsapp-widget-pro'); ?></h4>
                            <span class="stat-number" id="total-conversations">0</span>
                        </div>
                        <div class="stat-card">
                            <h4><?php _e('الزائرين الفريدين', 'whatsapp-widget-pro'); ?></h4>
                            <span class="stat-number" id="unique-visitors">0</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Security Tab -->
            <div id="security-tab" class="tab-content" style="display: none;">
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="enable_ip_blocking"><?php _e('تفعيل حظر IP', 'whatsapp-widget-pro'); ?></label>
                        </th>
                        <td>
                            <input type="checkbox" id="enable_ip_blocking" name="enable_ip_blocking" value="1" />
                            <label for="enable_ip_blocking"><?php _e('حظر العناوين المشبوهة تلقائياً', 'whatsapp-widget-pro'); ?></label>
                        </td>
                    </tr>
                </table>
            </div>

            <?php submit_button(__('حفظ الإعدادات', 'whatsapp-widget-pro')); ?>
        </form>
    </div>
</div>

<!-- Team Member Modal -->
<div id="team-member-modal" style="display: none;">
    <div class="modal-content">
        <h3 id="modal-title"><?php _e('إضافة عضو جديد', 'whatsapp-widget-pro'); ?></h3>
        <form id="team-member-form">
            <table class="form-table">
                <tr>
                    <th><label for="member-name"><?php _e('الاسم', 'whatsapp-widget-pro'); ?></label></th>
                    <td><input type="text" id="member-name" name="name" required /></td>
                </tr>
                <tr>
                    <th><label for="member-phone"><?php _e('رقم الهاتف', 'whatsapp-widget-pro'); ?></label></th>
                    <td><input type="text" id="member-phone" name="phone" required placeholder="+966xxxxxxxxx" /></td>
                </tr>
                <tr>
                    <th><label for="member-department"><?php _e('القسم', 'whatsapp-widget-pro'); ?></label></th>
                    <td><input type="text" id="member-department" name="department" /></td>
                </tr>
                <tr>
                    <th><label for="member-status"><?php _e('الحالة', 'whatsapp-widget-pro'); ?></label></th>
                    <td>
                        <select id="member-status" name="status">
                            <option value="online"><?php _e('متاح', 'whatsapp-widget-pro'); ?></option>
                            <option value="away"><?php _e('مشغول', 'whatsapp-widget-pro'); ?></option>
                            <option value="offline"><?php _e('غير متاح', 'whatsapp-widget-pro'); ?></option>
                        </select>
                    </td>
                </tr>
            </table>
            <div class="modal-actions">
                <button type="submit" class="button button-primary"><?php _e('حفظ', 'whatsapp-widget-pro'); ?></button>
                <button type="button" class="button" id="cancel-modal"><?php _e('إلغاء', 'whatsapp-widget-pro'); ?></button>
            </div>
        </form>
    </div>
</div>

<style>
.wwp-admin-container {
    margin-top: 20px;
}

.tab-content {
    background: #fff;
    padding: 20px;
    border: 1px solid #ccd0d4;
    border-top: none;
}

.team-management-section {
    max-width: 800px;
}

.team-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.team-members-list {
    display: grid;
    gap: 15px;
}

.team-member-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background: #f9f9f9;
}

.member-info h4 {
    margin: 0 0 5px 0;
    color: #23282d;
}

.member-info p {
    margin: 0 0 5px 0;
    color: #666;
    font-size: 13px;
}

.member-phone {
    font-family: monospace;
    background: #e7e7e7;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
}

.member-status {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
    margin-right: 10px;
}

.status-online {
    background: #46b450;
    color: white;
}

.status-away {
    background: #ffb900;
    color: white;
}

.status-offline {
    background: #dc3232;
    color: white;
}

.member-actions {
    display: flex;
    gap: 5px;
}

.stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.stat-card {
    background: #f7f7f7;
    padding: 20px;
    text-align: center;
    border-radius: 5px;
    border: 1px solid #ddd;
}

.stat-card h4 {
    margin: 0 0 10px 0;
    color: #23282d;
}

.stat-number {
    font-size: 2em;
    font-weight: bold;
    color: #0073aa;
}

#team-member-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 100000;
}

.modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 5px;
    min-width: 400px;
    max-width: 90%;
}

.modal-actions {
    text-align: center;
    margin-top: 20px;
}

.modal-actions .button {
    margin: 0 5px;
}
</style>

<script>
jQuery(document).ready(function($) {
    // Tab switching
    $('.nav-tab').on('click', function(e) {
        e.preventDefault();
        
        var tabId = $(this).data('tab');
        
        // Update active tab
        $('.nav-tab').removeClass('nav-tab-active');
        $(this).addClass('nav-tab-active');
        
        // Show/hide content
        $('.tab-content').hide();
        $('#' + tabId + '-tab').show();
    });
    
    // Team member management
    $('#add-team-member').on('click', function() {
        $('#modal-title').text('<?php _e('إضافة عضو جديد', 'whatsapp-widget-pro'); ?>');
        $('#team-member-form')[0].reset();
        $('#team-member-modal').show();
    });
    
    $('#cancel-modal').on('click', function() {
        $('#team-member-modal').hide();
    });
    
    // Form submission
    $('#wwp-settings-form').on('submit', function(e) {
        e.preventDefault();
        
        var formData = $(this).serialize();
        formData += '&action=wwp_save_settings';
        
        $.post(ajaxurl, formData, function(response) {
            if (response.success) {
                alert('<?php _e('تم حفظ الإعدادات بنجاح', 'whatsapp-widget-pro'); ?>');
            } else {
                alert('<?php _e('حدث خطأ أثناء الحفظ', 'whatsapp-widget-pro'); ?>');
            }
        });
    });
    
    // Load statistics
    loadStatistics();
    
    function loadStatistics() {
        $.post(ajaxurl, {
            action: 'wwp_get_stats',
            nonce: '<?php echo wp_create_nonce('wwp_nonce'); ?>'
        }, function(response) {
            if (response.success) {
                $('#total-clicks').text(response.data.total_clicks || 0);
                $('#total-conversations').text(response.data.total_conversations || 0);
                $('#unique-visitors').text(response.data.unique_ips || 0);
            }
        });
    }
});
</script>`;
};

export const generateWidgetTemplate = () => {
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}

$settings = get_option('whatsapp_widget_settings', array());
$phone = isset($settings['phone_number']) ? $settings['phone_number'] : '';
$message = isset($settings['welcome_message']) ? $settings['welcome_message'] : '';
$position = isset($settings['position']) ? $settings['position'] : 'bottom-right';
$theme = isset($settings['theme']) ? $settings['theme'] : 'green';
?>

<div id="whatsapp-widget" class="whatsapp-widget <?php echo esc_attr($position); ?> <?php echo esc_attr($theme); ?>">
    <div class="whatsapp-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
        </svg>
    </div>
    <div class="whatsapp-popup" style="display: none;">
        <div class="whatsapp-header">
            <h4><?php _e('WhatsApp Chat', 'whatsapp-widget-pro'); ?></h4>
            <button class="whatsapp-close">&times;</button>
        </div>
        <div class="whatsapp-body">
            <p><?php echo esc_html($message); ?></p>
            <a href="https://wa.me/<?php echo esc_attr($phone); ?>?text=<?php echo urlencode($message); ?>" 
               target="_blank" class="whatsapp-chat-btn">
                <?php _e('Start Chat', 'whatsapp-widget-pro'); ?>
            </a>
        </div>
    </div>
</div>`;
};

export const generateTeamPopupTemplate = () => {
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}

$team_members = get_option('whatsapp_team_members', array());
?>

<div class="whatsapp-team-popup">
    <div class="team-header">
        <h4><?php _e('Choose a team member', 'whatsapp-widget-pro'); ?></h4>
    </div>
    <div class="team-members">
        <?php foreach ($team_members as $member): ?>
        <div class="team-member">
            <div class="member-avatar">
                <img src="<?php echo esc_url($member['avatar']); ?>" alt="<?php echo esc_attr($member['name']); ?>">
            </div>
            <div class="member-info">
                <h5><?php echo esc_html($member['name']); ?></h5>
                <p><?php echo esc_html($member['title']); ?></p>
                <span class="member-status <?php echo $member['online'] ? 'online' : 'offline'; ?>">
                    <?php echo $member['online'] ? __('Online', 'whatsapp-widget-pro') : __('Offline', 'whatsapp-widget-pro'); ?>
                </span>
            </div>
            <a href="https://wa.me/<?php echo esc_attr($member['phone']); ?>" class="chat-member-btn">
                <?php _e('Chat', 'whatsapp-widget-pro'); ?>
            </a>
        </div>
        <?php endforeach; ?>
    </div>
</div>`;
};

export const generateSettingsTabsTemplate = () => {
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wwp-settings-tabs">
    <nav class="nav-tab-wrapper">
        <a href="#general" class="nav-tab nav-tab-active"><?php _e('General', 'whatsapp-widget-pro'); ?></a>
        <a href="#team" class="nav-tab"><?php _e('Team', 'whatsapp-widget-pro'); ?></a>
        <a href="#appearance" class="nav-tab"><?php _e('Appearance', 'whatsapp-widget-pro'); ?></a>
        <a href="#analytics" class="nav-tab"><?php _e('Analytics', 'whatsapp-widget-pro'); ?></a>
    </nav>
    
    <div class="tab-content">
        <div id="general" class="tab-pane active">
            <!-- General settings content -->
        </div>
        <div id="team" class="tab-pane">
            <!-- Team settings content -->
        </div>
        <div id="appearance" class="tab-pane">
            <!-- Appearance settings content -->
        </div>
        <div id="analytics" class="tab-pane">
            <!-- Analytics settings content -->
        </div>
    </div>
</div>`;
};
