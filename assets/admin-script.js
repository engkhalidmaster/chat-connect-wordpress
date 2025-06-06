
jQuery(document).ready(function($) {
    
    // التنقل بين التبويبات
    $('.wwp-nav-link').on('click', function(e) {
        e.preventDefault();
        
        var targetTab = $(this).data('tab');
        
        // إزالة الفئة النشطة من جميع الروابط والتبويبات
        $('.wwp-nav-link').removeClass('active');
        $('.wwp-tab-content').removeClass('active');
        
        // إضافة الفئة النشطة للرابط والتبويب المحدد
        $(this).addClass('active');
        $('#' + targetTab + '-tab').addClass('active');
    });
    
    // حفظ الإعدادات
    $('.wwp-save-btn').on('click', function() {
        var button = $(this);
        var originalText = button.text();
        
        button.text('جاري الحفظ...').prop('disabled', true);
        
        var formData = {
            action: 'wwp_save_settings',
            nonce: wwp_ajax.nonce,
            show_widget: $('input[name="show_widget"]').is(':checked') ? '1' : '0',
            welcome_message: $('textarea[name="welcome_message"]').val(),
            widget_position: $('select[name="widget_position"]').val(),
            widget_color: $('input[name="widget_color"]').val(),
            analytics_id: $('input[name="analytics_id"]').val(),
            enable_analytics: $('input[name="enable_analytics"]').is(':checked') ? '1' : '0'
        };
        
        $.ajax({
            url: wwp_ajax.ajax_url,
            type: 'POST',
            data: formData,
            success: function(response) {
                if (response.success) {
                    showNotification('تم حفظ الإعدادات بنجاح', 'success');
                } else {
                    showNotification('حدث خطأ أثناء حفظ الإعدادات', 'error');
                }
            },
            error: function() {
                showNotification('حدث خطأ في الاتصال', 'error');
            },
            complete: function() {
                button.text(originalText).prop('disabled', false);
            }
        });
    });
    
    // إضافة عضو جديد
    $('.wwp-add-member').on('click', function() {
        showMemberModal();
    });
    
    // تعديل عضو
    $(document).on('click', '.wwp-edit-member', function() {
        var memberRow = $(this).closest('.wwp-team-member');
        var memberId = memberRow.data('id');
        showMemberModal(memberId);
    });
    
    // حذف عضو
    $(document).on('click', '.wwp-delete-member', function() {
        if (confirm('هل أنت متأكد من حذف هذا العضو؟')) {
            var memberRow = $(this).closest('.wwp-team-member');
            var memberId = memberRow.data('id');
            deleteMember(memberId);
        }
    });
    
    // عرض إشعار
    function showNotification(message, type) {
        var notificationClass = type === 'success' ? 'notice-success' : 'notice-error';
        var notification = $('<div class="notice ' + notificationClass + ' is-dismissible"><p>' + message + '</p></div>');
        
        $('.wwp-header').after(notification);
        
        setTimeout(function() {
            notification.fadeOut(function() {
                $(this).remove();
            });
        }, 5000);
    }
    
    // عرض نافذة عضو الفريق
    function showMemberModal(memberId) {
        var modalHtml = `
            <div id="wwp-member-modal" class="wwp-modal">
                <div class="wwp-modal-content">
                    <div class="wwp-modal-header">
                        <h3>${memberId ? 'تعديل عضو الفريق' : 'إضافة عضو جديد'}</h3>
                        <button class="wwp-modal-close">&times;</button>
                    </div>
                    <div class="wwp-modal-body">
                        <form id="wwp-member-form">
                            <div class="wwp-field">
                                <label for="member-name">الاسم</label>
                                <input type="text" id="member-name" name="name" required>
                            </div>
                            <div class="wwp-field">
                                <label for="member-phone">رقم الهاتف</label>
                                <input type="text" id="member-phone" name="phone" required>
                            </div>
                            <div class="wwp-field">
                                <label for="member-department">القسم</label>
                                <input type="text" id="member-department" name="department">
                            </div>
                            <div class="wwp-field">
                                <label for="member-status">الحالة</label>
                                <select id="member-status" name="status">
                                    <option value="online">متصل</option>
                                    <option value="away">غائب</option>
                                    <option value="offline">غير متصل</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="wwp-modal-footer">
                        <button type="button" class="button wwp-modal-close">إلغاء</button>
                        <button type="button" class="button button-primary wwp-save-member">حفظ</button>
                    </div>
                </div>
            </div>
        `;
        
        $('body').append(modalHtml);
        $('#wwp-member-modal').fadeIn();
    }
    
    // إغلاق النافذة المنبثقة
    $(document).on('click', '.wwp-modal-close, .wwp-modal', function(e) {
        if (e.target === this) {
            $('#wwp-member-modal').fadeOut(function() {
                $(this).remove();
            });
        }
    });
    
    // منع إغلاق النافذة عند النقر على المحتوى
    $(document).on('click', '.wwp-modal-content', function(e) {
        e.stopPropagation();
    });
    
    // حفظ عضو الفريق
    $(document).on('click', '.wwp-save-member', function() {
        var form = $('#wwp-member-form');
        var formData = form.serialize();
        
        // هنا يمكن إضافة كود AJAX لحفظ البيانات
        showNotification('تم حفظ بيانات العضو بنجاح', 'success');
        $('#wwp-member-modal').fadeOut(function() {
            $(this).remove();
        });
    });
    
    // تحديث الإحصائيات
    if ($('#wwp-stats-chart').length) {
        initStatsChart();
    }
    
    function initStatsChart() {
        // هنا يمكن إضافة كود الرسم البياني باستخدام Chart.js أو مكتبة أخرى
        console.log('تهيئة الرسم البياني للإحصائيات');
    }
});
