
/* WhatsApp Widget Pro - Combined Scripts */

jQuery(document).ready(function($) {
    
    // Admin Panel Functionality
    if (typeof wwp_ajax !== 'undefined') {
        
        // Tab Navigation
        $('.wwp-nav-link').on('click', function(e) {
            e.preventDefault();
            
            var tab = $(this).data('tab');
            
            // Remove active class from all links
            $('.wwp-nav-link').removeClass('active');
            
            // Add active class to clicked link
            $(this).addClass('active');
            
            // Hide all tab contents
            $('.wwp-tab-content').removeClass('active');
            
            // Show selected tab content
            $('#' + tab + '-tab').addClass('active');
        });
        
        // معالجة ألوان المظهر
        $('.wwp-color-option').on('click', function() {
            var selectedColor = $(this).data('color');
            
            $('.wwp-color-option').removeClass('active');
            $(this).addClass('active');
            $('.wwp-color-sample').css('background-color', selectedColor);
            $('#widget_color').val(selectedColor);
        });
        
        // تحديث اللون عند تغيير حقل اللون المخصص
        $('#widget_color').on('change', function() {
            var selectedColor = $(this).val();
            $('.wwp-color-option').removeClass('active');
            $('.wwp-color-sample').css('background-color', selectedColor);
            $('.wwp-color-option[data-color="' + selectedColor + '"]').addClass('active');
        });
        
        // حفظ الإعدادات
        $('.wwp-save-btn').on('click', function() {
            var settings = {
                action: 'wwp_save_settings',
                nonce: wwp_ajax.nonce,
                show_widget: $('input[name="show_widget"]').is(':checked') ? '1' : '0',
                welcome_message: $('textarea[name="welcome_message"]').val() || '',
                widget_position: $('select[name="widget_position"]').val() || 'bottom-right',
                widget_color: $('input[name="widget_color"]').val() || '#25D366',
                analytics_id: $('input[name="analytics_id"]').val() || '',
                enable_analytics: $('input[name="enable_analytics"]').is(':checked') ? '1' : '0'
            };
            
            $.ajax({
                url: wwp_ajax.ajax_url,
                type: 'POST',
                data: settings,
                beforeSend: function() {
                    $('.wwp-save-btn').prop('disabled', true).text('جاري الحفظ...');
                },
                success: function(response) {
                    if (response.success) {
                        showNotice('تم حفظ الإعدادات بنجاح', 'success');
                    } else {
                        showNotice(response.data || 'حدث خطأ أثناء الحفظ', 'error');
                    }
                },
                error: function(xhr, status, error) {
                    showNotice('حدث خطأ في الاتصال: ' + error, 'error');
                },
                complete: function() {
                    $('.wwp-save-btn').prop('disabled', false).text('حفظ الإعدادات');
                }
            });
        });
        
        // إظهار الإشعارات
        function showNotice(message, type) {
            var noticeClass = type === 'success' ? 'notice-success' : 'notice-error';
            var notice = $('<div class="notice ' + noticeClass + ' is-dismissible"><p>' + message + '</p></div>');
            
            $('.wwp-admin-wrap').prepend(notice);
            
            setTimeout(function() {
                notice.fadeOut();
            }, 3000);
        }
        
        // Team Management
        $('.wwp-add-member').on('click', function() {
            alert('Implement Add New Member Form');
        });
        
        $('.wwp-edit-member').on('click', function() {
            var memberId = $(this).closest('.wwp-team-member').data('id');
            alert('Implement Edit Member Form for member ID: ' + memberId);
        });
        
        $('.wwp-delete-member').on('click', function() {
            var memberId = $(this).closest('.wwp-team-member').data('id');
            if (confirm('Are you sure you want to delete this member?')) {
                alert('Implement AJAX request to delete member ID: ' + memberId);
            }
        });
    }
    
    // Frontend Widget Functionality
    if (typeof wwp_settings !== 'undefined') {
        
        var chatWindow = $('#wwp-chat-window');
        var toggleButton = $('#wwp-toggle-chat');
        var closeButton = $('#wwp-close-chat');
        
        // فتح/إغلاق نافذة الدردشة
        toggleButton.on('click', function() {
            if (chatWindow.hasClass('open')) {
                closeChatWindow();
            } else {
                openChatWindow();
            }
        });
        
        // إغلاق نافذة الدردشة
        closeButton.on('click', function() {
            closeChatWindow();
        });
        
        // النقر على عضو الفريق
        $('.wwp-team-member-item').on('click', function() {
            var memberName = $(this).data('name');
            var memberPhone = $(this).data('phone');
            var memberId = $(this).data('member-id') || 0;
            var message = encodeURIComponent(wwp_settings.welcome_message || 'مرحباً');
            
            // فتح WhatsApp
            var whatsappUrl = 'https://wa.me/' + memberPhone.replace(/[^0-9]/g, '') + '?text=' + message;
            
            // تتبع بدء المحادثة في Google Analytics
            if (wwp_settings.enable_analytics && typeof gtag !== 'undefined') {
                gtag('event', 'chat_started', {
                    'event_category': 'WhatsApp Widget',
                    'event_label': memberName,
                    'member_phone': memberPhone
                });
            }
            
            // تسجيل النقرة في قاعدة البيانات
            if (memberId > 0) {
                recordClick(memberId);
            }
            
            // فتح الرابط
            window.open(whatsappUrl, '_blank');
            
            // إغلاق نافذة الدردشة
            closeChatWindow();
        });
        
        function openChatWindow() {
            chatWindow.addClass('open');
            toggleButton.addClass('active');
            
            // تتبع فتح الويدجت في Google Analytics
            if (wwp_settings.enable_analytics && typeof gtag !== 'undefined') {
                gtag('event', 'widget_opened', {
                    'event_category': 'WhatsApp Widget',
                    'event_label': 'Chat Window Opened'
                });
            }
            
            // إيقاف التأثير المتحرك
            toggleButton.removeClass('bounce');
        }
        
        function closeChatWindow() {
            chatWindow.removeClass('open');
            toggleButton.removeClass('active');
        }
        
        function recordClick(memberId) {
            if (typeof wwp_settings.ajax_url === 'undefined' || typeof wwp_settings.nonce === 'undefined') {
                return;
            }
            
            $.ajax({
                url: wwp_settings.ajax_url,
                type: 'POST',
                data: {
                    action: 'wwp_record_click',
                    member_id: memberId,
                    nonce: wwp_settings.nonce
                },
                success: function(response) {
                    console.log('تم تسجيل النقرة بنجاح');
                },
                error: function() {
                    console.log('خطأ في تسجيل النقرة');
                }
            });
        }
        
        // إضافة تأثير متحرك للزر كل 10 ثوان
        setInterval(function() {
            if (!chatWindow.hasClass('open')) {
                toggleButton.addClass('bounce');
                setTimeout(function() {
                    toggleButton.removeClass('bounce');
                }, 2000);
            }
        }, 10000);
        
        // إغلاق النافذة عند النقر خارجها
        $(document).on('click', function(e) {
            if (!$(e.target).closest('#wwp-widget').length) {
                closeChatWindow();
            }
        });
        
        // تحسين الاستجابة للموبايل
        if (window.innerWidth <= 480) {
            $('#wwp-widget').addClass('mobile-optimized');
        }
    }
});
