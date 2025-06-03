
<?php
$team_members = $this->get_team_members();
$available_members = array_filter($team_members, function($member) {
    return $member->status === 'online';
});
?>

<div id="wwp-widget" class="wwp-widget <?php echo esc_attr($settings['widget_position']); ?>" style="--widget-color: <?php echo esc_attr($settings['widget_color']); ?>">
    <div class="wwp-widget-button" id="wwp-toggle-chat">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
        </svg>
    </div>
    
    <div class="wwp-chat-window" id="wwp-chat-window">
        <div class="wwp-chat-header">
            <div class="wwp-header-info">
                <h3>خدمة العملاء</h3>
                <p>نحن هنا لمساعدتك</p>
            </div>
            <button class="wwp-close-chat" id="wwp-close-chat">×</button>
        </div>
        
        <div class="wwp-chat-body">
            <div class="wwp-welcome-message">
                <p><?php echo esc_html($settings['welcome_message']); ?></p>
            </div>
            
            <?php if ($available_members): ?>
            <div class="wwp-team-list">
                <h4>اختر الشخص المناسب للتحدث معه:</h4>
                <?php foreach ($available_members as $member): ?>
                <div class="wwp-team-member-item" 
                     data-phone="<?php echo esc_attr($member->phone); ?>" 
                     data-name="<?php echo esc_attr($member->name); ?>"
                     data-member-id="<?php echo esc_attr($member->id); ?>">
                    <div class="wwp-member-avatar">
                        <?php if ($member->avatar): ?>
                            <img src="<?php echo esc_url($member->avatar); ?>" alt="<?php echo esc_attr($member->name); ?>">
                        <?php else: ?>
                            <div class="wwp-avatar-placeholder"><?php echo mb_substr($member->name, 0, 1); ?></div>
                        <?php endif; ?>
                        <span class="wwp-status-online"></span>
                    </div>
                    <div class="wwp-member-details">
                        <h5><?php echo esc_html($member->name); ?></h5>
                        <p><?php echo esc_html($member->department); ?></p>
                    </div>
                    <div class="wwp-chat-button">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
                        </svg>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            <?php else: ?>
            <div class="wwp-no-agents">
                <p>عذراً، لا يوجد ممثلين متاحين حالياً. يرجى المحاولة لاحقاً.</p>
            </div>
            <?php endif; ?>
        </div>
    </div>
</div>
