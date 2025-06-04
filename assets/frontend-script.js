
jQuery(document).ready(function($) {
    var chatVisible = false;
    var widget = $('#wwp-widget');
    var chatWindow = $('#wwp-chat-window');
    var toggleButton = $('#wwp-toggle-chat');
    var closeButton = $('#wwp-close-chat');
    
    // التحقق من وجود الويدجت
    if (!widget.length) {
        return;
    }
    
    // فتح/إغلاق نافذة الدردشة
    toggleButton.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (chatVisible) {
            chatWindow.fadeOut(200);
        } else {
            chatWindow.fadeIn(200);
            
            // تسجيل فتح النافذة
            if (typeof wwp_settings !== 'undefined') {
                recordEvent('chat_opened');
            }
        }
        chatVisible = !chatVisible;
    });
    
    // إغلاق النافذة بالزر
    closeButton.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        chatWindow.fadeOut(200);
        chatVisible = false;
    });
    
    // إغلاق النافذة بالنقر خارجها
    $(document).on('click', function(e) {
        if (chatVisible && !$(e.target).closest('#wwp-widget').length) {
            chatWindow.fadeOut(200);
            chatVisible = false;
        }
    });
    
    // النقر على عضو الفريق
    $('.wwp-team-member-item').on('click', function(e) {
        e.preventDefault();
        
        var phone = $(this).data('phone');
        var name = $(this).data('name');
        var memberId = $(this).data('member-id');
        
        if (!phone) {
            console.error('رقم الهاتف غير موجود');
            return;
        }
        
        // تنظيف رقم الهاتف
        var cleanPhone = phone.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');
        
        // إنشاء رسالة الترحيب
        var message = 'مرحباً، أريد التحدث معكم';
        if (typeof wwp_settings !== 'undefined' && wwp_settings.welcome_message) {
            message = wwp_settings.welcome_message;
        }
        
        // تسجيل النقرة
        recordEvent('member_clicked', {
            member_id: memberId,
            member_name: name,
            phone: phone
        });
        
        // فتح WhatsApp
        var whatsappUrl = 'https://wa.me/' + cleanPhone + '?text=' + encodeURIComponent(message);
        
        // محاولة فتح التطبيق أولاً، ثم المتصفح
        var newWindow = window.open(whatsappUrl, '_blank');
        
        if (!newWindow) {
            // إذا فشل فتح النافذة الجديدة، استخدم الرابط المباشر
            window.location.href = whatsappUrl;
        }
        
        // إغلاق نافذة الدردشة
        setTimeout(function() {
            chatWindow.fadeOut(200);
            chatVisible = false;
        }, 500);
    });
    
    // تسجيل الأحداث
    function recordEvent(eventType, eventData) {
        if (typeof wwp_settings === 'undefined' || !wwp_settings.ajax_url) {
            return;
        }
        
        var data = {
            action: 'wwp_record_click',
            nonce: wwp_settings.nonce,
            event_type: eventType,
            page_url: window.location.href,
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
        
        if (eventData) {
            data.user_data = JSON.stringify(eventData);
            if (eventData.member_id) {
                data.member_id = eventData.member_id;
            }
        }
        
        $.post(wwp_settings.ajax_url, data).fail(function() {
            console.log('فشل في تسجيل الحدث');
        });
        
        // إرسال حدث إلى Google Analytics إذا كان مفعلاً
        if (typeof gtag !== 'undefined' && wwp_settings.enable_analytics) {
            gtag('event', eventType, {
                event_category: 'WhatsApp Widget',
                event_label: eventData ? eventData.member_name : '',
                value: eventData ? eventData.member_id : 0
            });
        }
    }
    
    // تفعيل الويدجت تلقائياً بعد وقت معين (إذا كان مفعلاً)
    if (typeof wwp_settings !== 'undefined' && wwp_settings.auto_open && wwp_settings.auto_open !== 'false') {
        setTimeout(function() {
            if (!chatVisible) {
                chatWindow.fadeIn(300);
                chatVisible = true;
                recordEvent('auto_opened');
            }
        }, 5000); // 5 ثوان
    }
    
    // تسجيل تحميل الصفحة
    recordEvent('page_loaded');
});

// إضافة دعم للمس (touch) على الأجهزة المحمولة
if ('ontouchstart' in window) {
    document.addEventListener('touchstart', function() {}, false);
}
