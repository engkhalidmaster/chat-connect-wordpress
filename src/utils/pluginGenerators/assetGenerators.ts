
// Asset generators for CSS, JS and other files
export const generateAdminCSS = () => {
  return `.whatsapp-widget-admin {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.wwp-settings-tabs .nav-tab-wrapper {
    border-bottom: 1px solid #ccd0d4;
    margin-bottom: 20px;
}

.wwp-settings-tabs .nav-tab {
    background: #f1f1f1;
    border: 1px solid #ccd0d4;
    color: #555;
    padding: 10px 15px;
    text-decoration: none;
    margin-right: 5px;
}

.wwp-settings-tabs .nav-tab-active {
    background: #fff;
    border-bottom: 1px solid #fff;
    color: #000;
}

.tab-content .tab-pane {
    display: none;
    padding: 20px 0;
}

.tab-content .tab-pane.active {
    display: block;
}

.form-table th {
    width: 200px;
    padding: 20px 10px 20px 0;
    vertical-align: top;
}

.form-table td {
    padding: 15px 10px;
}

.wwp-color-picker {
    width: 100px;
}

.wwp-preview {
    border: 1px solid #ddd;
    padding: 20px;
    margin-top: 20px;
    background: #f9f9f9;
}`;
};

export const generateFrontendCSS = () => {
  return `.whatsapp-widget {
    position: fixed;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.whatsapp-widget.bottom-right {
    bottom: 20px;
    right: 20px;
}

.whatsapp-widget.bottom-left {
    bottom: 20px;
    left: 20px;
}

.whatsapp-widget.top-right {
    top: 20px;
    right: 20px;
}

.whatsapp-widget.top-left {
    top: 20px;
    left: 20px;
}

.whatsapp-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #25d366;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
}

.whatsapp-button:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.whatsapp-popup {
    position: absolute;
    bottom: 70px;
    right: 0;
    width: 300px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    overflow: hidden;
}

.whatsapp-header {
    background: #25d366;
    color: white;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.whatsapp-header h4 {
    margin: 0;
    font-size: 16px;
}

.whatsapp-close {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
}

.whatsapp-body {
    padding: 20px;
}

.whatsapp-body p {
    margin: 0 0 15px 0;
    color: #333;
}

.whatsapp-chat-btn {
    display: inline-block;
    background: #25d366;
    color: white;
    padding: 10px 20px;
    text-decoration: none;
    border-radius: 25px;
    font-weight: 500;
    transition: background 0.3s ease;
}

.whatsapp-chat-btn:hover {
    background: #1ea952;
    color: white;
}

@media (max-width: 768px) {
    .whatsapp-popup {
        width: 280px;
        bottom: 70px;
        right: -10px;
    }
}`;
};

export const generateAdminJavaScript = () => {
  return `(function($) {
    'use strict';
    
    $(document).ready(function() {
        // Tab switching
        $('.nav-tab').on('click', function(e) {
            e.preventDefault();
            
            var target = $(this).attr('href');
            
            // Update nav tabs
            $('.nav-tab').removeClass('nav-tab-active');
            $(this).addClass('nav-tab-active');
            
            // Update content
            $('.tab-pane').removeClass('active');
            $(target).addClass('active');
        });
        
        // Color picker
        if ($.fn.wpColorPicker) {
            $('.wwp-color-picker').wpColorPicker();
        }
        
        // Form submission
        $('#wwp-settings-form').on('submit', function(e) {
            e.preventDefault();
            
            var formData = $(this).serialize();
            
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: formData + '&action=save_wwp_settings&nonce=' + wwp_admin.nonce,
                success: function(response) {
                    if (response.success) {
                        $('<div class="notice notice-success is-dismissible"><p>Settings saved successfully!</p></div>')
                            .insertAfter('.wrap h1');
                    }
                },
                error: function() {
                    $('<div class="notice notice-error is-dismissible"><p>Error saving settings!</p></div>')
                        .insertAfter('.wrap h1');
                }
            });
        });
    });
})(jQuery);`;
};

export const generateFrontendJavaScript = () => {
  return `(function($) {
    'use strict';
    
    $(document).ready(function() {
        var $widget = $('#whatsapp-widget');
        var $button = $widget.find('.whatsapp-button');
        var $popup = $widget.find('.whatsapp-popup');
        var $close = $widget.find('.whatsapp-close');
        
        // Show/hide popup
        $button.on('click', function() {
            $popup.toggle();
            
            // Track click
            $.ajax({
                url: wwp_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'track_whatsapp_click',
                    nonce: wwp_ajax.nonce,
                    page_url: window.location.href
                }
            });
        });
        
        // Close popup
        $close.on('click', function() {
            $popup.hide();
        });
        
        // Close popup when clicking outside
        $(document).on('click', function(e) {
            if (!$widget.is(e.target) && $widget.has(e.target).length === 0) {
                $popup.hide();
            }
        });
        
        // Responsive behavior
        function handleResize() {
            if ($(window).width() < 768) {
                $widget.addClass('mobile');
            } else {
                $widget.removeClass('mobile');
            }
        }
        
        $(window).on('resize', handleResize);
        handleResize();
    });
})(jQuery);`;
};

// Simplified generators for essential files only
export const generateSimplifiedCSS = () => {
  return `/* WhatsApp Widget Pro - Simplified Styles */

/* Frontend Widget Styles */
.whatsapp-widget {
    position: fixed;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.whatsapp-widget.bottom-right {
    bottom: 20px;
    right: 20px;
}

.whatsapp-widget.bottom-left {
    bottom: 20px;
    left: 20px;
}

.whatsapp-widget.top-right {
    top: 20px;
    right: 20px;
}

.whatsapp-widget.top-left {
    top: 20px;
    left: 20px;
}

.whatsapp-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #25d366;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    border: none;
    font-size: 24px;
}

.whatsapp-button:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.whatsapp-popup {
    position: absolute;
    bottom: 70px;
    right: 0;
    width: 300px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    display: none;
}

.whatsapp-popup.show {
    display: block;
}

.whatsapp-header {
    background: #25d366;
    color: white;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.whatsapp-header h4 {
    margin: 0;
    font-size: 16px;
}

.whatsapp-close {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
}

.whatsapp-body {
    padding: 20px;
}

.whatsapp-body p {
    margin: 0 0 15px 0;
    color: #333;
}

.whatsapp-chat-btn {
    display: inline-block;
    background: #25d366;
    color: white;
    padding: 10px 20px;
    text-decoration: none;
    border-radius: 25px;
    font-weight: 500;
    transition: background 0.3s ease;
}

.whatsapp-chat-btn:hover {
    background: #1ea952;
    color: white;
}

/* Admin Styles */
.whatsapp-widget-admin {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.wwp-form-table th {
    width: 200px;
    padding: 15px 0;
    vertical-align: top;
}

.wwp-form-table td {
    padding: 15px 0;
}

.wwp-color-picker {
    width: 100px;
}

.wwp-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 20px 0;
}

.wwp-stat-card {
    background: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
}

.wwp-stat-number {
    font-size: 24px;
    font-weight: bold;
    color: #25d366;
}

.wwp-stat-label {
    color: #666;
    margin-top: 5px;
}

/* Responsive */
@media (max-width: 768px) {
    .whatsapp-popup {
        width: 280px;
        bottom: 70px;
        right: -10px;
    }
}`;
};

export const generateSimplifiedJavaScript = () => {
  return `/* WhatsApp Widget Pro - Simplified Script */
(function($) {
    'use strict';
    
    $(document).ready(function() {
        var $widget = $('#whatsapp-widget');
        var $button = $widget.find('.whatsapp-button');
        var $popup = $widget.find('.whatsapp-popup');
        var $close = $widget.find('.whatsapp-close');
        
        // Show/hide popup
        $button.on('click', function() {
            $popup.toggleClass('show');
            
            // Track click
            if (typeof wwp_ajax !== 'undefined') {
                $.post(wwp_ajax.ajax_url, {
                    action: 'track_whatsapp_click',
                    nonce: wwp_ajax.nonce,
                    page_url: window.location.href
                });
            }
        });
        
        // Close popup
        $close.on('click', function() {
            $popup.removeClass('show');
        });
        
        // Close popup when clicking outside
        $(document).on('click', function(e) {
            if (!$widget.is(e.target) && $widget.has(e.target).length === 0) {
                $popup.removeClass('show');
            }
        });
        
        // Admin settings
        if ($('.wwp-color-picker').length && $.fn.wpColorPicker) {
            $('.wwp-color-picker').wpColorPicker();
        }
        
        // Admin form
        $('#wwp-settings-form').on('submit', function(e) {
            e.preventDefault();
            
            var $form = $(this);
            var formData = $form.serialize();
            
            $.post(ajaxurl, formData + '&action=save_wwp_settings&nonce=' + wwp_admin.nonce)
                .done(function(response) {
                    if (response.success) {
                        $('<div class="notice notice-success is-dismissible"><p>تم حفظ الإعدادات بنجاح!</p></div>')
                            .insertAfter('.wrap h1');
                    } else {
                        $('<div class="notice notice-error is-dismissible"><p>خطأ في حفظ الإعدادات!</p></div>')
                            .insertAfter('.wrap h1');
                    }
                })
                .fail(function() {
                    $('<div class="notice notice-error is-dismissible"><p>خطأ في الاتصال!</p></div>')
                        .insertAfter('.wrap h1');
                });
        });
    });
})(jQuery);`;
};
