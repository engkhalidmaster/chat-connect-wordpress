
<div class="wwp-team-management">
    <div class="wwp-card">
        <div class="wwp-card-header">
            <h3>أعضاء الفريق</h3>
            <button type="button" class="button button-primary wwp-add-member">إضافة عضو جديد</button>
        </div>
        <div class="wwp-card-body">
            <table class="widefat">
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>الهاتف</th>
                        <th>القسم</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($team_members as $member): ?>
                    <tr>
                        <td><?php echo esc_html($member->name); ?></td>
                        <td><?php echo esc_html($member->phone); ?></td>
                        <td><?php echo esc_html($member->department); ?></td>
                        <td>
                            <span class="status-<?php echo esc_attr($member->status); ?>">
                                <?php echo esc_html($member->status); ?>
                            </span>
                        </td>
                        <td>
                            <button class="button wwp-edit-member" data-id="<?php echo $member->id; ?>">تعديل</button>
                            <button class="button wwp-delete-member" data-id="<?php echo $member->id; ?>">حذف</button>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
