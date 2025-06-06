
<?php
/**
 * WhatsApp Widget Pro - Uninstall Script
 */

// إذا لم يتم استدعاء uninstall من ووردبريس، فاخرج
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// حذف الجداول
global $wpdb;

$wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wwp_team_members");
$wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wwp_stats");

// حذف الإعدادات
delete_option('wwp_settings');
delete_option('wwp_db_version');

// حذف أي ملفات مؤقتة أو cache
$upload_dir = wp_upload_dir();
$plugin_uploads = $upload_dir['basedir'] . '/whatsapp-widget-pro/';

if (is_dir($plugin_uploads)) {
    // حذف المجلد وجميع محتوياته
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($plugin_uploads, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );

    foreach ($files as $fileinfo) {
        $todo = ($fileinfo->isDir() ? 'rmdir' : 'unlink');
        $todo($fileinfo->getRealPath());
    }

    rmdir($plugin_uploads);
}
