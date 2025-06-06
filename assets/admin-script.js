
jQuery(document).ready(function($) {
    'use strict';
    
    // Tab Navigation
    $('.wwp-nav-link').on('click', function(e) {
        e.preventDefault();
        
        var targetTab = $(this).data('tab');
        
        // Update navigation
        $('.wwp-nav-link').removeClass('active');
        $(this).addClass('active');
        
        // Update content
        $('.wwp-tab-content').removeClass('active');
        $('#' + targetTab + '-tab').addClass('active');
    });
    
    // Save Settings
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
                    showNotification('حدث خطأ: ' + response.data, 'error');
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
    
    // Backup Settings
    $('.wwp-backup-btn').on('click', function() {
        var settings = {
            timestamp: new Date().toISOString(),
            widget_settings: {
                show_widget: $('input[name="show_widget"]').is(':checked'),
                welcome_message: $('textarea[name="welcome_message"]').val(),
                widget_position: $('select[name="widget_position"]').val(),
                widget_color: $('input[name="widget_color"]').val(),
                analytics_id: $('input[name="analytics_id"]').val(),
                enable_analytics: $('input[name="enable_analytics"]').is(':checked')
            }
        };
        
        var dataStr = JSON.stringify(settings, null, 2);
        var dataBlob = new Blob([dataStr], { type: 'application/json' });
        var url = URL.createObjectURL(dataBlob);
        
        var link = document.createElement('a');
        link.href = url;
        link.download = 'whatsapp-widget-backup-' + new Date().toISOString().split('T')[0] + '.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showNotification('تم إنشاء النسخة الاحتياطية', 'success');
    });
    
    // Add Team Member
    $('.wwp-add-member').on('click', function() {
        showMemberModal();
    });
    
    // Edit Team Member
    $(document).on('click', '.wwp-edit-member', function() {
        var memberRow = $(this).closest('.wwp-team-member');
        var memberId = memberRow.data('id');
        var memberName = memberRow.find('h4').text();
        var memberDepartment = memberRow.find('p').first().text();
        var memberPhone = memberRow.find('.wwp-phone').text();
        var memberStatus = memberRow.find('.wwp-status-indicator').attr('class').split(' ')[1];
        
        showMemberModal(memberId, memberName, memberDepartment, memberPhone, memberStatus);
    });
    
    // Delete Team Member
    $(document).on('click', '.wwp-delete-member', function() {
        if (!confirm('هل أنت متأكد من حذف هذا العضو؟')) {
            return;
        }
        
        var memberRow = $(this).closest('.wwp-team-member');
        var memberId = memberRow.data('id');
        
        $.ajax({
            url: wwp_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'wwp_delete_member',
                member_id: memberId,
                nonce: wwp_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    memberRow.fadeOut(function() {
                        $(this).remove();
                    });
                    showNotification('تم حذف العضو بنجاح', 'success');
                } else {
                    showNotification('حدث خطأ: ' + response.data, 'error');
                }
            },
            error: function() {
                showNotification('حدث خطأ في الاتصال', 'error');
            }
        });
    });
    
    function showMemberModal(id, name, department, phone, status) {
        var isEdit = id !== undefined;
        var modalHtml = `
            <div class="wwp-modal active">
                <div class="wwp-modal-content">
                    <div class="wwp-modal-header">
                        <h3>${isEdit ? 'تعديل عضو الفريق' : 'إضافة عضو جديد'}</h3>
                        <button type="button" class="wwp-modal-close">&times;</button>
                    </div>
                    <form class="wwp-member-form">
                        <div class="wwp-field">
                            <label>الاسم</label>
                            <input type="text" name="member_name" value="${name || ''}" required>
                        </div>
                        <div class="wwp-field">
                            <label>رقم الهاتف</label>
                            <input type="text" name="member_phone" value="${phone || ''}" placeholder="+966501234567" required>
                        </div>
                        <div class="wwp-field">
                            <label>القسم</label>
                            <input type="text" name="member_department" value="${department || ''}" placeholder="المبيعات, الدعم الفني...">
                        </div>
                        <div class="wwp-field">
                            <label>الحالة</label>
                            <select name="member_status" required>
                                <option value="online" ${status === 'online' ? 'selected' : ''}>متصل</option>
                                <option value="away" ${status === 'away' ? 'selected' : ''}>غائب</option>
                                <option value="offline" ${status === 'offline' ? 'selected' : ''}>غير متصل</option>
                            </select>
                        </div>
                        <div class="wwp-field">
                            <label>ترتيب العرض</label>
                            <input type="number" name="member_order" value="1" min="1">
                        </div>
                        <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                            <button type="button" class="button wwp-modal-close">إلغاء</button>
                            <button type="submit" class="button button-primary">${isEdit ? 'تحديث' : 'إضافة'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        $('body').append(modalHtml);
        
        // Handle form submission
        $('.wwp-member-form').on('submit', function(e) {
            e.preventDefault();
            
            var formData = {
                action: isEdit ? 'wwp_edit_member' : 'wwp_add_member',
                nonce: wwp_ajax.nonce,
                name: $(this).find('input[name="member_name"]').val(),
                phone: $(this).find('input[name="member_phone"]').val(),
                department: $(this).find('input[name="member_department"]').val(),
                status: $(this).find('select[name="member_status"]').val(),
                display_order: $(this).find('input[name="member_order"]').val()
            };
            
            if (isEdit) {
                formData.member_id = id;
            }
            
            $.ajax({
                url: wwp_ajax.ajax_url,
                type: 'POST',
                data: formData,
                success: function(response) {
                    if (response.success) {
                        $('.wwp-modal').remove();
                        showNotification(isEdit ? 'تم تحديث العضو بنجاح' : 'تم إضافة العضو بنجاح', 'success');
                        location.reload(); // Reload to show updated data
                    } else {
                        showNotification('حدث خطأ: ' + response.data, 'error');
                    }
                },
                error: function() {
                    showNotification('حدث خطأ في الاتصال', 'error');
                }
            });
        });
    }
    
    // Close Modal
    $(document).on('click', '.wwp-modal-close, .wwp-modal', function(e) {
        if (e.target === this) {
            $('.wwp-modal').remove();
        }
    });
    
    // Statistics Chart
    if ($('#wwp-stats-chart').length) {
        // This would be implemented with Chart.js or similar library
        // For now, we'll just show a placeholder
        var canvas = document.getElementById('wwp-stats-chart');
        var ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#6b7280';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('الرسم البياني للإحصائيات', canvas.width / 2, canvas.height / 2);
    }
    
    function showNotification(message, type) {
        var notificationHtml = `
            <div class="notice notice-${type === 'success' ? 'success' : 'error'} is-dismissible" style="position: fixed; top: 32px; right: 20px; z-index: 10000; min-width: 300px;">
                <p>${message}</p>
                <button type="button" class="notice-dismiss">
                    <span class="screen-reader-text">رفض هذا الإشعار.</span>
                </button>
            </div>
        `;
        
        $('body').append(notificationHtml);
        
        setTimeout(function() {
            $('.notice').fadeOut(function() {
                $(this).remove();
            });
        }, 3000);
        
        $(document).on('click', '.notice-dismiss', function() {
            $(this).closest('.notice').fadeOut(function() {
                $(this).remove();
            });
        });
    }
});
