
jQuery(document).ready(function($) {
    // تبديل التبويبات
    $('.wwp-nav-link').click(function(e) {
        e.preventDefault();
        var tab = $(this).data('tab');
        
        // إزالة الفئة النشطة من جميع الروابط والتبويبات
        $('.wwp-nav-link').removeClass('active');
        $('.wwp-tab-content').removeClass('active');
        
        // إضافة الفئة النشطة للعنصر المحدد
        $(this).addClass('active');
        $('#' + tab + '-tab').addClass('active');
    });
    
    // حفظ الإعدادات
    $('.wwp-save-btn').click(function() {
        var formData = new FormData();
        formData.append('action', 'wwp_save_settings');
        formData.append('nonce', wwp_ajax.nonce);
        
        // جمع البيانات من النموذج
        $('input[type="text"], input[type="color"], select, textarea').each(function() {
            if ($(this).attr('name')) {
                formData.append($(this).attr('name'), $(this).val());
            }
        });
        
        // جمع checkboxes
        $('input[type="checkbox"]').each(function() {
            if ($(this).attr('name')) {
                formData.append($(this).attr('name'), $(this).is(':checked') ? '1' : '0');
            }
        });
        
        $.ajax({
            url: wwp_ajax.ajax_url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    alert('تم حفظ الإعدادات بنجاح');
                } else {
                    alert('حدث خطأ أثناء الحفظ');
                }
            },
            error: function() {
                alert('حدث خطأ في الاتصال');
            }
        });
    });
    
    // إضافة عضو فريق
    $('.wwp-add-member').click(function() {
        var name = prompt('اسم العضو:');
        var phone = prompt('رقم الهاتف:');
        var department = prompt('القسم:');
        
        if (name && phone) {
            $.post(wwp_ajax.ajax_url, {
                action: 'wwp_add_member',
                nonce: wwp_ajax.nonce,
                name: name,
                phone: phone,
                department: department || 'خدمة العملاء',
                status: 'online',
                display_order: 0
            }, function(response) {
                if (response.success) {
                    location.reload();
                } else {
                    alert('حدث خطأ أثناء الإضافة');
                }
            });
        }
    });
    
    // حذف عضو فريق
    $('.wwp-delete-member').click(function() {
        if (confirm('هل أنت متأكد من حذف هذا العضو؟')) {
            var memberId = $(this).closest('.wwp-team-member').data('id');
            
            $.post(wwp_ajax.ajax_url, {
                action: 'wwp_delete_member',
                nonce: wwp_ajax.nonce,
                member_id: memberId
            }, function(response) {
                if (response.success) {
                    location.reload();
                } else {
                    alert('حدث خطأ أثناء الحذف');
                }
            });
        }
    });
    
    // نسخة احتياطية
    $('.wwp-backup-btn').click(function() {
        window.location.href = wwp_ajax.ajax_url + '?action=wwp_export_data&nonce=' + wwp_ajax.nonce;
    });
});
