
jQuery(document).ready(function($) {
    
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
        var message = encodeURIComponent(wwp_settings.welcome_message || 'مرحباً');
        
        // فتح WhatsApp
        var whatsappUrl = 'https://wa.me/' + memberPhone.replace(/[^0-9]/g, '') + '?text=' + message;
        
        // تتبع النقرة في Google Analytics
        if (wwp_settings.enable_analytics && typeof gtag !== 'undefined') {
            gtag('event', 'whatsapp_click', {
                'event_category': 'WhatsApp Widget',
                'event_label': memberName,
                'member_phone': memberPhone
            });
        }
        
        // تسجيل النقرة في قاعدة البيانات
        recordClick($(this).data('member-id'));
        
        // فتح الرابط
        window.open(whatsappUrl, '_blank');
        
        // إغلاق نافذة الدردشة
        closeChatWindow();
    });
    
    function openChatWindow() {
        chatWindow.addClass('open');
        toggleButton.addClass('active');
        
        // إيقاف التأثير المتحرك
        toggleButton.removeClass('bounce');
    }
    
    function closeChatWindow() {
        chatWindow.removeClass('open');
        toggleButton.removeClass('active');
    }
    
    function recordClick(memberId) {
        $.ajax({
            url: wwp_settings.ajax_url,
            type: 'POST',
            data: {
                action: 'wwp_record_click',
                member_id: memberId,
                nonce: wwp_settings.nonce
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
});
