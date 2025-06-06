
jQuery(document).ready(function($) {
    
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
    
    // Add New Member Form
    $('.wwp-add-member').on('click', function() {
        // You can implement a modal or inline form here
        alert('Implement Add New Member Form');
    });
    
    // Edit Member Form
    $('.wwp-edit-member').on('click', function() {
        var memberId = $(this).closest('.wwp-team-member').data('id');
        // You can implement a modal or inline form here
        alert('Implement Edit Member Form for member ID: ' + memberId);
    });
    
    // Delete Member
    $('.wwp-delete-member').on('click', function() {
        var memberId = $(this).closest('.wwp-team-member').data('id');
        if (confirm('Are you sure you want to delete this member?')) {
            // Implement AJAX request to delete member
            alert('Implement AJAX request to delete member ID: ' + memberId);
        }
    });
    
    // معالجة ألوان المظهر
    $('.wwp-color-option').on('click', function() {
        var selectedColor = $(this).data('color');
        
        // إزالة التحديد من جميع الألوان
        $('.wwp-color-option').removeClass('active');
        
        // تحديد اللون المختار
        $(this).addClass('active');
        
        // تحديث معاينة اللون
        $('.wwp-color-sample').css('background-color', selectedColor);
        
        // تحديث حقل اللون
        $('#widget_color').val(selectedColor);
    });
    
    // تحديث اللون عند تغيير حقل اللون المخصص
    $('#widget_color').on('change', function() {
        var selectedColor = $(this).val();
        
        // إزالة التحديد من الألوان المحددة مسبقاً
        $('.wwp-color-option').removeClass('active');
        
        // تحديث معاينة اللون
        $('.wwp-color-sample').css('background-color', selectedColor);
        
        // تحديد اللون إذا كان من الألوان المحددة مسبقاً
        $('.wwp-color-option[data-color="' + selectedColor + '"]').addClass('active');
    });
    
    // حفظ الإعدادات - إصلاح المشكلة
    $('.wwp-save-btn').on('click', function() {
        console.log('تم النقر على زر حفظ الإعدادات');
        
        // التحقق من وجود wwp_ajax
        if (typeof wwp_ajax === 'undefined') {
            console.error('wwp_ajax غير متوفر');
            showNotice('خطأ: البيانات المطلوبة غير متوفرة', 'error');
            return;
        }
        
        // جمع جميع الإعدادات
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
        
        console.log('البيانات المُرسلة:', settings);
        
        $.ajax({
            url: wwp_ajax.ajax_url,
            type: 'POST',
            data: settings,
            beforeSend: function() {
                $('.wwp-save-btn').prop('disabled', true).text('جاري الحفظ...');
                console.log('بدء إرسال البيانات');
            },
            success: function(response) {
                console.log('الاستجابة:', response);
                if (response.success) {
                    showNotice('تم حفظ الإعدادات بنجاح', 'success');
                } else {
                    var errorMessage = response.data || 'حدث خطأ أثناء الحفظ';
                    console.error('خطأ في الحفظ:', errorMessage);
                    showNotice(errorMessage, 'error');
                }
            },
            error: function(xhr, status, error) {
                console.error('خطأ AJAX:', {xhr: xhr, status: status, error: error});
                showNotice('حدث خطأ في الاتصال: ' + error, 'error');
            },
            complete: function() {
                $('.wwp-save-btn').prop('disabled', false).text('حفظ الإعدادات');
                console.log('انتهى طلب AJAX');
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
    
    // AJAX Form Submission
    $('body').on('submit', '#add-member-form', function(e) {
        e.preventDefault();
        
        var formData = $(this).serialize();
        
        $.ajax({
            url: wwp_ajax.ajax_url,
            type: 'POST',
            data: formData,
            success: function(response) {
                if (response.success) {
                    // Reload team members list or display success message
                    alert(response.data);
                } else {
                    alert(response.data);
                }
            }
        });
    });
    
    // التحقق من تحميل wwp_ajax عند تحميل الصفحة
    console.log('wwp_ajax متوفر:', typeof wwp_ajax !== 'undefined');
    if (typeof wwp_ajax !== 'undefined') {
        console.log('wwp_ajax البيانات:', wwp_ajax);
    }
});
