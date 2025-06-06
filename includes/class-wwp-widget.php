
<?php
/**
 * WhatsApp Widget Pro - Widget Class
 */

if (!defined('ABSPATH')) {
    exit;
}

class WWP_Widget {
    
    private $settings;
    private $team_members;
    
    public function __construct() {
        $this->settings = $this->get_settings();
        $this->team_members = $this->get_team_members();
    }
    
    public function display() {
        if (!$this->settings['show_widget']) {
            return;
        }
        
        $available_members = array_filter($this->team_members, function($member) {
            return $member->status === 'online';
        });
        
        include WWP_PLUGIN_PATH . 'templates/widget.php';
    }
    
    public function get_settings() {
        $defaults = array(
            'show_widget' => true,
            'welcome_message' => 'مرحباً! كيف يمكنني مساعدتك؟',
            'widget_position' => 'bottom-right',
            'widget_color' => '#25D366',
            'analytics_id' => '',
            'enable_analytics' => false
        );
        
        return wp_parse_args(get_option('wwp_settings', array()), $defaults);
    }
    
    public function get_team_members() {
        global $wpdb;
        return $wpdb->get_results("SELECT * FROM {$wpdb->prefix}wwp_team_members WHERE status != 'offline' ORDER BY display_order ASC");
    }
    
    public function enqueue_scripts() {
        if (!$this->settings['show_widget']) {
            return;
        }
        
        wp_enqueue_style(
            'wwp-frontend-style', 
            WWP_PLUGIN_URL . 'assets/frontend-style.css', 
            array(), 
            WWP_VERSION
        );
        
        wp_enqueue_script(
            'wwp-frontend-script', 
            WWP_PLUGIN_URL . 'assets/frontend-script.js', 
            array('jquery'), 
            WWP_VERSION, 
            true
        );
        
        // Add Google Analytics if enabled
        if ($this->settings['enable_analytics'] && !empty($this->settings['analytics_id'])) {
            $this->add_google_analytics();
        }
        
        wp_localize_script('wwp-frontend-script', 'wwp_settings', array_merge($this->settings, array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wwp_nonce')
        )));
    }
    
    private function add_google_analytics() {
        $tracking_id = $this->settings['analytics_id'];
        ?>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr($tracking_id); ?>"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '<?php echo esc_js($tracking_id); ?>');
        </script>
        <?php
    }
}
