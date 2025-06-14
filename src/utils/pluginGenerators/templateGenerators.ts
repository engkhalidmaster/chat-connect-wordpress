
// Template generators for WordPress plugin
export const generateAdminPageTemplate = () => {
  return `<?php
if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    <div id="whatsapp-widget-admin-root"></div>
</div>
<script>
    // Mount React admin interface here
    document.addEventListener('DOMContentLoaded', function() {
        // This would be where your React app mounts
        console.log('WhatsApp Widget Pro admin loaded');
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
