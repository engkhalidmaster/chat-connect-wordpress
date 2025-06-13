
/* WhatsApp Widget Pro - Combined Scripts v2.0 */

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
        
        // حفظ الإعدادات العامة
        $('.wwp-save-btn').on('click', function() {
            var settings = {
                action: 'wwp_save_settings',
                nonce: wwp_ajax.nonce,
                show_widget: $('input[name="show_widget"]').is(':checked') ? '1' : '0',
                welcome_message: $('textarea[name="welcome_message"]').val() || '',
                widget_position: $('select[name="widget_position"]').val() || 'bottom-right',
                widget_color: $('input[name="widget_color"]').val() || '#25D366',
                analytics_id: $('input[name="analytics_id"]').val() || '',
                enable_analytics: $('input[name="enable_analytics"]').is(':checked') ? '1' : '0',
                show_outside_hours: $('input[name="show_outside_hours"]').is(':checked') ? '1' : '0',
                outside_hours_message: $('textarea[name="outside_hours_message"]').val() || ''
            };
            
            saveSettings(settings, 'تم حفظ الإعدادات بنجاح');
        });
        
        // حفظ إعدادات WooCommerce
        $('.wwp-save-woocommerce-btn').on('click', function() {
            var settings = {
                action: 'wwp_save_woocommerce_settings',
                nonce: wwp_ajax.nonce,
                enable_woocommerce: $('input[name="enable_woocommerce"]').is(':checked') ? '1' : '0',
                send_order_notifications: $('input[name="send_order_notifications"]').is(':checked') ? '1' : '0',
                send_processing_notifications: $('input[name="send_processing_notifications"]').is(':checked') ? '1' : '0',
                send_completion_notifications: $('input[name="send_completion_notifications"]').is(':checked') ? '1' : '0',
                order_confirmation_template: $('textarea[name="order_confirmation_template"]').val() || '',
                shipping_update_template: $('textarea[name="shipping_update_template"]').val() || '',
                delivery_notice_template: $('textarea[name="delivery_notice_template"]').val() || ''
            };
            
            saveSettings(settings, 'تم حفظ إعدادات WooCommerce بنجاح');
        });
        
        // حفظ إعدادات الأمان
        $('.wwp-save-security-btn').on('click', function() {
            var settings = {
                action: 'wwp_save_security_settings',
                nonce: wwp_ajax.nonce,
                enable_ip_blocking: $('input[name="enable_ip_blocking"]').is(':checked') ? '1' : '0',
                max_clicks_per_hour: $('input[name="max_clicks_per_hour"]').val() || '100',
                auto_block_suspicious: $('input[name="auto_block_suspicious"]').is(':checked') ? '1' : '0',
                whitelist_ips: $('textarea[name="whitelist_ips"]').val() || ''
            };
            
            saveSettings(settings, 'تم حفظ إعدادات الأمان بنجاح');
        });
        
        // دالة مشتركة لحفظ الإعدادات
        function saveSettings(settings, successMessage) {
            var $btn = $('.wwp-save-btn, .wwp-save-woocommerce-btn, .wwp-save-security-btn').filter(':focus');
            var originalText = $btn.text();
            
            $.ajax({
                url: wwp_ajax.ajax_url,
                type: 'POST',
                data: settings,
                beforeSend: function() {
                    $btn.prop('disabled', true).text('جاري الحفظ...');
                },
                success: function(response) {
                    if (response.success) {
                        showNotice(successMessage, 'success');
                    } else {
                        showNotice(response.data || 'حدث خطأ أثناء الحفظ', 'error');
                    }
                },
                error: function(xhr, status, error) {
                    showNotice('حدث خطأ في الاتصال: ' + error, 'error');
                },
                complete: function() {
                    $btn.prop('disabled', false).text(originalText);
                }
            });
        }
        
        // إظهار/إخفاء إعدادات WooCommerce
        $('input[name="enable_woocommerce"]').on('change', function() {
            if ($(this).is(':checked')) {
                $('.wwp-woocommerce-settings').slideDown();
            } else {
                $('.wwp-woocommerce-settings').slideUp();
            }
        });
        
        // إظهار/إخفاء إعدادات الأمان
        $('input[name="enable_ip_blocking"]').on('change', function() {
            if ($(this).is(':checked')) {
                $('.wwp-security-settings').slideDown();
            } else {
                $('.wwp-security-settings').slideUp();
            }
        });
        
        // حظر IP
        $('.wwp-block-ip-btn').on('click', function() {
            var ip = prompt('أدخل عنوان IP المراد حظره:');
            if (ip) {
                var reason = prompt('سبب الحظر (اختياري):') || '';
                var expires_hours = prompt('مدة الحظر بالساعات (اتركه فارغاً للحظر الدائم):');
                
                $.ajax({
                    url: wwp_ajax.ajax_url,
                    type: 'POST',
                    data: {
                        action: 'wwp_block_ip',
                        nonce: wwp_ajax.nonce,
                        ip_address: ip,
                        reason: reason,
                        expires_hours: expires_hours
                    },
                    success: function(response) {
                        if (response.success) {
                            showNotice('تم حظر العنوان بنجاح', 'success');
                            location.reload(); // إعادة تحميل الصفحة لإظهار التحديثات
                        } else {
                            showNotice(response.data || 'فشل في حظر العنوان', 'error');
                        }
                    }
                });
            }
        });
        
        // إلغاء حظر IP
        $('.wwp-unblock-ip-btn').on('click', function() {
            var ip = $(this).data('ip');
            
            if (confirm('هل أنت متأكد من إلغاء حظر هذا العنوان؟')) {
                $.ajax({
                    url: wwp_ajax.ajax_url,
                    type: 'POST',
                    data: {
                        action: 'wwp_unblock_ip',
                        nonce: wwp_ajax.nonce,
                        ip_address: ip
                    },
                    success: function(response) {
                        if (response.success) {
                            showNotice('تم إلغاء حظر العنوان بنجاح', 'success');
                            location.reload();
                        } else {
                            showNotice(response.data || 'فشل في إلغاء حظر العنوان', 'error');
                        }
                    }
                });
            }
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
        
        // Team Management - Enhanced
        $('.wwp-add-member').on('click', function() {
            openMemberModal();
        });
        
        $('.wwp-edit-member').on('click', function() {
            var memberId = $(this).closest('.wwp-team-member').data('id');
            openMemberModal(memberId);
        });
        
        $('.wwp-delete-member').on('click', function() {
            var memberId = $(this).closest('.wwp-team-member').data('id');
            if (confirm('هل أنت متأكد من حذف هذا العضو؟')) {
                deleteMember(memberId);
            }
        });
        
        function openMemberModal(memberId) {
            // إنشاء نموذج إضافة/تعديل عضو
            var modalHTML = `
                <div class="wwp-modal-overlay">
                    <div class="wwp-modal">
                        <div class="wwp-modal-header">
                            <h3>${memberId ? 'تعديل عضو' : 'إضافة عضو جديد'}</h3>
                            <button class="wwp-modal-close">&times;</button>
                        </div>
                        <div class="wwp-modal-body">
                            <form class="wwp-member-form">
                                <div class="wwp-field">
                                    <label>الاسم</label>
                                    <input type="text" name="name" required>
                                </div>
                                <div class="wwp-field">
                                    <label>رقم الهاتف</label>
                                    <input type="text" name="phone" required>
                                </div>
                                <div class="wwp-field">
                                    <label>القسم</label>
                                    <input type="text" name="department">
                                </div>
                                <div class="wwp-field">
                                    <label>الحالة</label>
                                    <select name="status">
                                        <option value="online">متاح</option>
                                        <option value="away">مشغول</option>
                                        <option value="offline">غير متاح</option>
                                        <option value="busy">مشغول جداً</option>
                                    </select>
                                </div>
                                <div class="wwp-field">
                                    <label>ساعة بداية العمل</label>
                                    <input type="time" name="working_hours_start" value="09:00">
                                </div>
                                <div class="wwp-field">
                                    <label>ساعة نهاية العمل</label>
                                    <input type="time" name="working_hours_end" value="17:00">
                                </div>
                                <div class="wwp-field">
                                    <label>أيام العمل</label>
                                    <div class="wwp-days-selector">
                                        <label><input type="checkbox" name="working_days" value="1" checked> الإثنين</label>
                                        <label><input type="checkbox" name="working_days" value="2" checked> الثلاثاء</label>
                                        <label><input type="checkbox" name="working_days" value="3" checked> الأربعاء</label>
                                        <label><input type="checkbox" name="working_days" value="4" checked> الخميس</label>
                                        <label><input type="checkbox" name="working_days" value="5" checked> الجمعة</label>
                                        <label><input type="checkbox" name="working_days" value="6"> السبت</label>
                                        <label><input type="checkbox" name="working_days" value="7"> الأحد</label>
                                    </div>
                                </div>
                                <div class="wwp-field">
                                    <label>ترتيب العرض</label>
                                    <input type="number" name="display_order" value="1" min="1">
                                </div>
                            </form>
                        </div>
                        <div class="wwp-modal-footer">
                            <button class="button button-secondary wwp-modal-close">إلغاء</button>
                            <button class="button button-primary wwp-save-member">${memberId ? 'تحديث' : 'إضافة'}</button>
                        </div>
                    </div>
                </div>
            `;
            
            $('body').append(modalHTML);
            
            // إذا كان تعديل، املأ البيانات
            if (memberId) {
                // يمكن إضافة AJAX لجلب بيانات العضو
            }
        }
        
        // إغلاق النموذج
        $(document).on('click', '.wwp-modal-close, .wwp-modal-overlay', function(e) {
            if (e.target === this) {
                $('.wwp-modal-overlay').remove();
            }
        });
        
        // حفظ العضو
        $(document).on('click', '.wwp-save-member', function() {
            var form = $('.wwp-member-form');
            var workingDays = [];
            form.find('input[name="working_days"]:checked').each(function() {
                workingDays.push($(this).val());
            });
            
            var memberData = {
                action: 'wwp_add_member', // أو wwp_edit_member
                nonce: wwp_ajax.nonce,
                name: form.find('input[name="name"]').val(),
                phone: form.find('input[name="phone"]').val(),
                department: form.find('input[name="department"]').val(),
                status: form.find('select[name="status"]').val(),
                working_hours_start: form.find('input[name="working_hours_start"]').val(),
                working_hours_end: form.find('input[name="working_hours_end"]').val(),
                working_days: workingDays.join(','),
                display_order: form.find('input[name="display_order"]').val()
            };
            
            $.ajax({
                url: wwp_ajax.ajax_url,
                type: 'POST',
                data: memberData,
                success: function(response) {
                    if (response.success) {
                        showNotice('تم حفظ بيانات العضو بنجاح', 'success');
                        $('.wwp-modal-overlay').remove();
                        location.reload();
                    } else {
                        showNotice(response.data || 'حدث خطأ', 'error');
                    }
                }
            });
        });
        
        function deleteMember(memberId) {
            $.ajax({
                url: wwp_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'wwp_delete_member',
                    nonce: wwp_ajax.nonce,
                    member_id: memberId
                },
                success: function(response) {
                    if (response.success) {
                        showNotice('تم حذف العضو بنجاح', 'success');
                        location.reload();
                    } else {
                        showNotice(response.data || 'حدث خطأ', 'error');
                    }
                }
            });
        }
        
        // تحديث الإحصائيات تلقائياً
        setInterval(function() {
            if ($('#statistics-tab').hasClass('active')) {
                updateStats();
            }
        }, 30000); // كل 30 ثانية
        
        function updateStats() {
            $.ajax({
                url: wwp_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'wwp_get_stats',
                    nonce: wwp_ajax.nonce
                },
                success: function(response) {
                    if (response.success) {
                        // تحديث الإحصائيات في الواجهة
                        var stats = response.data;
                        $('.wwp-stat-card.blue .wwp-stat-value').text(stats.total_clicks.toLocaleString());
                        $('.wwp-stat-card.green .wwp-stat-value').text(stats.total_conversations.toLocaleString());
                        $('.wwp-stat-card.orange .wwp-stat-value').text(
                            stats.total_clicks > 0 ? 
                            Math.round((stats.total_conversations / stats.total_clicks) * 100) + '%' : 
                            '0%'
                        );
                    }
                }
            });
        }
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
                    action: 'wwp_recor
d_click',
                    member_id: memberId,
                    nonce: wwp_settings.nonce,
                    page_url: wwp_settings.current_page || window.location.href
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
        
        // تحديث حالة الأعضاء كل دقيقة
        setInterval(function() {
            // يمكن إضافة AJAX لتحديث حالة الأعضاء
            checkMemberStatus();
        }, 60000);
        
        function checkMemberStatus() {
            // فحص ساعات العمل وتحديث الحالة
            var currentTime = new Date();
            var currentHour = currentTime.getHours();
            var currentDay = currentTime.getDay(); // 0 = Sunday, 6 = Saturday
            
            $('.wwp-team-member-item').each(function() {
                var $member = $(this);
                // يمكن إضافة منطق فحص ساعات العمل هنا
            });
        }
        
        // معالجة الرسائل التلقائية خارج ساعات العمل
        if (wwp_settings.show_outside_hours && $('.wwp-team-member-item').length === 0) {
            $('.wwp-team-list').html(`
                <div class="wwp-outside-hours-message">
                    <div class="wwp-outside-hours-icon">🕐</div>
                    <p>${wwp_settings.outside_hours_message}</p>
                    <button class="wwp-leave-message-btn">ترك رسالة</button>
                </div>
            `);
            
            $('.wwp-leave-message-btn').on('click', function() {
                var message = prompt('اترك رسالتك وسنتواصل معك قريباً:');
                if (message) {
                    // يمكن إرسال الرسالة إلى الإدارة أو حفظها في قاعدة البيانات
                    alert('شكراً لك! تم استلام رسالتك وسنتواصل معك قريباً.');
                    closeChatWindow();
                }
            });
        }
    }
});
