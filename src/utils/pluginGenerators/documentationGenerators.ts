
// Documentation generators
export const generateReadmeFile = () => {
  return `=== WhatsApp Widget Pro ===
Contributors: yourname
Tags: whatsapp, chat, widget, contact, support
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 2.1.0
License: GPL v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Advanced WhatsApp widget with team management, analytics, and customization options.

== Description ==

WhatsApp Widget Pro is a comprehensive solution for adding WhatsApp chat functionality to your WordPress website. With advanced features like team management, detailed analytics, and extensive customization options, it's perfect for businesses looking to improve customer communication.

= Key Features =

* **Easy Setup** - Quick installation and configuration
* **Team Management** - Add multiple team members with different roles
* **Advanced Analytics** - Track clicks, conversions, and user behavior
* **Customizable Design** - Multiple themes and positioning options
* **Mobile Responsive** - Works perfectly on all devices
* **WooCommerce Integration** - Enhanced e-commerce features
* **Security Features** - Built-in security and spam protection
* **Multilingual Ready** - Translation ready with .pot file included

= Pro Features =

* Advanced statistics and reporting
* Team member scheduling
* Custom CSS styling
* Priority support
* Regular updates

== Installation ==

1. Upload the plugin files to the '/wp-content/plugins/whatsapp-widget-pro' directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Use the WhatsApp Widget screen to configure the plugin
4. Add your phone number and customize the appearance
5. Save settings and the widget will appear on your website

== Frequently Asked Questions ==

= How do I add my WhatsApp number? =

Go to the plugin settings page and enter your WhatsApp number in international format (e.g., +1234567890).

= Can I add multiple team members? =

Yes, the Pro version supports multiple team members with individual phone numbers and availability schedules.

= Is the widget mobile-friendly? =

Absolutely! The widget is fully responsive and optimized for mobile devices.

= Does it work with WooCommerce? =

Yes, there's built-in WooCommerce integration for product-specific chat options.

== Screenshots ==

1. Admin settings panel
2. Widget appearance on frontend
3. Team management interface
4. Analytics dashboard
5. Mobile responsive design

== Changelog ==

= 2.1.0 =
* Added advanced statistics
* Improved team management
* Enhanced security features
* WooCommerce integration
* Performance optimizations

= 2.0.0 =
* Complete rewrite with React admin interface
* Added analytics functionality
* Team management features
* Security improvements

= 1.0.0 =
* Initial release

== Upgrade Notice ==

= 2.1.0 =
Major update with new features and improvements. Backup your settings before upgrading.`;
};

export const generateUserGuideFile = () => {
  return `# WhatsApp Widget Pro - User Guide

## Getting Started

Welcome to WhatsApp Widget Pro! This guide will help you set up and configure your WhatsApp widget.

### Initial Setup

1. **Activate the Plugin**
   - Go to Plugins > Installed Plugins
   - Find "WhatsApp Widget Pro" and click "Activate"

2. **Access Settings**
   - Navigate to WhatsApp Widget in your WordPress admin menu
   - You'll see the main settings dashboard

3. **Basic Configuration**
   - Enter your WhatsApp number in international format (+country code + number)
   - Set a welcome message for your visitors
   - Choose widget position (bottom-right, bottom-left, top-right, top-left)
   - Select a color theme

### Team Management

Add multiple team members to handle different types of inquiries:

1. Go to the Team tab
2. Click "Add Team Member"
3. Fill in member details:
   - Name
   - Phone number
   - Role/Title
   - Availability schedule
   - Profile picture

### Appearance Customization

Customize the widget to match your brand:

- **Colors**: Choose from preset themes or use custom colors
- **Position**: Place the widget where it works best for your site
- **Size**: Adjust the widget size for optimal visibility
- **Animation**: Enable/disable hover animations

### Analytics & Reports

Track your widget performance:

- **Click Analytics**: See how many visitors interact with your widget
- **Conversion Tracking**: Monitor leads generated through WhatsApp
- **Page Performance**: Identify which pages generate the most chats
- **Team Performance**: Compare team member response rates

### WooCommerce Integration

For e-commerce sites:

- **Product-Specific Chat**: Different team members for different products
- **Order Support**: Quick access to order-related chat
- **Abandoned Cart Recovery**: Proactive chat for abandoned carts

### Security Settings

Protect your widget from spam:

- **Rate Limiting**: Limit clicks per IP address
- **Blocked Countries**: Prevent access from specific countries
- **Spam Detection**: Automatic spam filtering

### Troubleshooting

Common issues and solutions:

1. **Widget Not Showing**
   - Check if plugin is activated
   - Verify phone number is entered correctly
   - Clear cache if using caching plugins

2. **Analytics Not Working**
   - Ensure JavaScript is enabled
   - Check for conflicts with other plugins
   - Verify database tables were created

3. **Mobile Issues**
   - Test responsive settings
   - Check mobile-specific positioning
   - Verify touch interactions work

### Support

Need help? Contact our support team:
- Email: support@example.com
- Documentation: https://docs.example.com
- Community Forum: https://forum.example.com

## Advanced Features

### Custom CSS

Add custom styling to match your theme perfectly:

\`\`\`css
.whatsapp-widget {
    /* Your custom styles here */
}
\`\`\`

### JavaScript Hooks

Developers can use these hooks for custom functionality:

\`\`\`javascript
// Before widget opens
document.addEventListener('whatsapp-widget-before-open', function(e) {
    // Custom logic here
});

// After widget opens
document.addEventListener('whatsapp-widget-after-open', function(e) {
    // Custom logic here
});
\`\`\`

### API Integration

Connect with external services using our API endpoints:

- GET /wp-json/wwp/v1/analytics
- POST /wp-json/wwp/v1/track-click
- GET /wp-json/wwp/v1/team-members

Remember to check our documentation for the latest updates and features!`;
};

export const generateInstallationGuideFile = () => {
  return `# Installation Guide - WhatsApp Widget Pro

## System Requirements

Before installing, ensure your system meets these requirements:

- WordPress 5.0 or higher
- PHP 7.4 or higher
- MySQL 5.6 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation Methods

### Method 1: WordPress Admin Dashboard

1. **Download the Plugin**
   - Log into your WordPress admin dashboard
   - Navigate to Plugins > Add New
   - Click "Upload Plugin"
   - Choose the whatsapp-widget-pro.zip file
   - Click "Install Now"

2. **Activate the Plugin**
   - After installation, click "Activate Plugin"
   - You'll be redirected to the plugins page
   - Look for "WhatsApp Widget Pro" in the active plugins list

### Method 2: FTP Upload

1. **Extract Plugin Files**
   - Unzip the whatsapp-widget-pro.zip file
   - You should see a folder named "whatsapp-widget-pro"

2. **Upload via FTP**
   - Connect to your website using FTP client
   - Navigate to /wp-content/plugins/
   - Upload the entire "whatsapp-widget-pro" folder
   - Ensure all files are uploaded correctly

3. **Activate from Dashboard**
   - Go to your WordPress admin dashboard
   - Navigate to Plugins > Installe Plugins
   - Find "WhatsApp Widget Pro" and click "Activate"

### Method 3: Direct Server Upload

1. **Access Your Server**
   - Use cPanel File Manager or SSH access
   - Navigate to your WordPress installation directory

2. **Upload and Extract**
   - Go to wp-content/plugins/
   - Upload the zip file
   - Extract it in the plugins directory
   - Remove the zip file after extraction

3. **Set Permissions**
   - Ensure proper file permissions (644 for files, 755 for directories)
   - The plugin folder should be writable by WordPress

## Post-Installation Setup

### 1. Database Setup

The plugin automatically creates necessary database tables:
- wp_whatsapp_analytics (for tracking data)
- wp_whatsapp_team_members (for team management)
- wp_whatsapp_settings (for configuration)

### 2. Initial Configuration

1. **Access Plugin Settings**
   - Go to WhatsApp Widget in your admin menu
   - You'll see the main dashboard

2. **Basic Settings**
   - Enter your WhatsApp business number
   - Set welcome message
   - Choose widget position
   - Select color theme

3. **Test Installation**
   - Visit your website's frontend
   - Look for the WhatsApp widget
   - Click to test functionality

## Verification Steps

### Check Plugin Status
- Plugins > Installed Plugins
- Ensure "WhatsApp Widget Pro" shows as active
- Version should display correctly

### Verify Database Tables
Run this SQL query in phpMyAdmin:
\`\`\`sql
SHOW TABLES LIKE 'wp_whatsapp_%';
\`\`\`

### Test Frontend Display
- Visit your website
- Check widget appears in chosen position
- Test click functionality
- Verify mobile responsiveness

## Common Installation Issues

### Plugin Won't Activate
**Causes:**
- PHP version too old
- Memory limit too low
- File permissions incorrect

**Solutions:**
- Update PHP to 7.4+
- Increase memory limit to 256MB
- Set correct file permissions (644/755)

### Database Errors
**Causes:**
- MySQL version incompatibility
- Database user lacks privileges
- Corrupted installation

**Solutions:**
- Update MySQL to 5.6+
- Grant necessary database privileges
- Reinstall the plugin

### Widget Not Displaying
**Causes:**
- Theme conflicts
- JavaScript errors
- Caching issues

**Solutions:**
- Switch to default theme temporarily
- Check browser console for errors
- Clear all caches

### Permission Errors
**Causes:**
- Incorrect file permissions
- Server security restrictions
- WordPress file ownership issues

**Solutions:**
- Set files to 644, directories to 755
- Contact hosting provider
- Fix WordPress file ownership

## Security Considerations

### File Permissions
- Plugin files: 644
- Plugin directories: 755
- wp-config.php: 600

### Database Security
- Use strong database passwords
- Limit database user privileges
- Regular backups recommended

## Backup Before Installation

Always backup before installing:

1. **Files Backup**
   - Download /wp-content/plugins/ directory
   - Backup your theme files
   - Save wp-config.php

2. **Database Backup**
   - Export your WordPress database
   - Store in secure location
   - Test backup restoration

## Updating the Plugin

### Automatic Updates
- WordPress will notify of available updates
- Click "Update Now" when available
- Plugin will update automatically

### Manual Updates
- Download new version
- Deactivate current plugin
- Replace plugin files
- Reactivate plugin

## Getting Help

If you encounter issues:

1. **Check Documentation**
   - Review this installation guide
   - Check troubleshooting section
   - Read FAQ

2. **Contact Support**
   - Email: support@example.com
   - Include WordPress version
   - Describe the issue in detail
   - Provide error messages

3. **Community Support**
   - WordPress.org forums
   - Plugin support forums
   - Community Discord server

Remember to always test on a staging site first!`;
};

export const generateTroubleshootingGuideFile = () => {
  return `# Troubleshooting Guide - WhatsApp Widget Pro

## Common Issues and Solutions

### Widget Not Displaying

#### Symptoms:
- Widget doesn't appear on frontend
- No visible WhatsApp button
- Console shows no errors

#### Possible Causes:
1. Plugin not activated
2. Phone number not configured
3. Theme conflicts
4. Caching issues
5. JavaScript conflicts

#### Solutions:

**Step 1: Check Basic Configuration**
- Verify plugin is activated in Plugins > Installed Plugins
- Ensure phone number is entered in international format (+country code)
- Check that widget is enabled in settings

**Step 2: Theme Compatibility**
- Switch to a default WordPress theme (Twenty Twenty-Three)
- If widget appears, there's a theme conflict
- Check theme's footer.php includes wp_footer() hook

**Step 3: Clear Caches**
- Clear all caching plugins
- Clear browser cache
- Clear CDN cache if applicable

**Step 4: Check for JavaScript Conflicts**
- Open browser developer tools
- Look for JavaScript errors in console
- Deactivate other plugins temporarily
- Test if widget appears

### Analytics Not Recording

#### Symptoms:
- Zero clicks showing in analytics
- Dashboard shows no data
- Database tables empty

#### Solutions:

**Check Database Tables**
\`\`\`sql
SELECT * FROM wp_whatsapp_analytics LIMIT 10;
\`\`\`

**Verify JavaScript Loading**
- Check browser network tab
- Ensure wwp-frontend-script.js loads
- Verify AJAX calls are being made

**Test Click Tracking**
- Open browser developer tools
- Click widget button
- Check network tab for AJAX requests
- Verify nonce is valid

### Team Management Issues

#### Adding Team Members Fails

**Check User Permissions:**
- Ensure current user has 'manage_options' capability
- Verify nonce is being passed correctly

**Database Issues:**
- Check if wp_whatsapp_team_members table exists
- Verify table has correct structure

### Performance Issues

#### Widget Loads Slowly

**Optimize Assets:**
- Enable GZIP compression
- Minify CSS/JS files
- Use CDN for static assets

**Database Optimization:**
- Clean old analytics data
- Add database indexes
- Optimize MySQL queries

#### High Memory Usage

**Check Plugin Conflicts:**
- Deactivate other plugins
- Monitor memory usage
- Increase PHP memory limit if needed

### Mobile Responsiveness Issues

#### Widget Not Working on Mobile

**CSS Issues:**
- Check media queries in CSS
- Verify touch events work
- Test on actual devices

**JavaScript Issues:**
- Ensure touch events are handled
- Check for mobile browser conflicts
- Verify responsive breakpoints

### WooCommerce Integration Problems

#### Product-Specific Chat Not Working

**Check Configuration:**
- Verify WooCommerce is active
- Check product settings
- Test with default products

**Hook Issues:**
- Ensure WooCommerce hooks are firing
- Check theme compatibility
- Verify integration settings

### Security and Spam Issues

#### Too Many Fake Clicks

**Enable Rate Limiting:**
- Set click limits per IP
- Add CAPTCHA if needed
- Block suspicious IPs

**Configure Spam Protection:**
- Enable country blocking
- Set up honeypots
- Monitor analytics for patterns

## Error Messages and Solutions

### "Plugin could not be activated"

**Cause:** PHP version incompatibility
**Solution:** Update PHP to 7.4 or higher

### "Database error occurred"

**Cause:** Missing database privileges
**Solution:** Grant CREATE, INSERT, UPDATE privileges

### "Widget settings could not be saved"

**Cause:** Nonce verification failed
**Solution:** Clear cache and try again

### "Analytics data corrupted"

**Cause:** Database table corruption
**Solution:** 
\`\`\`sql
REPAIR TABLE wp_whatsapp_analytics;
\`\`\`

## Debugging Tools

### Enable WordPress Debug Mode

Add to wp-config.php:
\`\`\`php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
\`\`\`

### Browser Developer Tools

**Console Tab:**
- Check for JavaScript errors
- Monitor AJAX requests
- Verify element loading

**Network Tab:**
- Check resource loading
- Monitor API calls
- Verify response codes

**Elements Tab:**
- Inspect widget HTML
- Check CSS styles
- Debug responsive issues

### Plugin Debug Information

Add this to functions.php for debugging:
\`\`\`php
function wwp_debug_info() {
    if (current_user_can('manage_options')) {
        $settings = get_option('whatsapp_widget_settings', array());
        echo '<pre>' . print_r($settings, true) . '</pre>';
    }
}
add_action('wp_footer', 'wwp_debug_info');
\`\`\`

## Compatibility Issues

### Known Plugin Conflicts

**Caching Plugins:**
- W3 Total Cache: Exclude widget JS from minification
- WP Rocket: Add widget to JS exclusions
- WP Super Cache: Clear cache after settings change

**Security Plugins:**
- Wordfence: Whitelist plugin AJAX calls
- Sucuri: Allow widget resources
- iThemes Security: Exclude from file change monitoring

**Page Builders:**
- Elementor: Use HTML widget for custom placement
- Beaver Builder: Add via custom HTML module
- Divi: Insert in theme footer

### Theme Compatibility

**Common Issues:**
- Missing wp_footer() hook
- CSS conflicts with widget styles
- JavaScript library conflicts

**Solutions:**
- Add wp_footer() before </body> tag
- Increase CSS specificity
- Load widget scripts in footer

## Performance Optimization

### Database Optimization

**Clean Old Data:**
\`\`\`sql
DELETE FROM wp_whatsapp_analytics 
WHERE click_time < DATE_SUB(NOW(), INTERVAL 6 MONTH);
\`\`\`

**Add Indexes:**
\`\`\`sql
ALTER TABLE wp_whatsapp_analytics 
ADD INDEX idx_click_time (click_time);
\`\`\`

### Frontend Optimization

**Lazy Load Widget:**
- Load widget only when needed
- Use intersection observer
- Defer non-critical scripts

**Minimize HTTP Requests:**
- Combine CSS/JS files
- Use sprite images
- Optimize image sizes

## Getting Additional Help

### Before Contacting Support

1. **Gather Information:**
   - WordPress version
   - Plugin version
   - Active theme name
   - List of active plugins
   - Error messages (exact text)
   - Browser and version
   - Device type (desktop/mobile)

2. **Test in Safe Mode:**
   - Deactivate all other plugins
   - Switch to default theme
   - Test if issue persists

3. **Check Recent Changes:**
   - Recent plugin updates
   - Theme modifications
   - Server changes
   - WordPress updates

### Support Channels

**Email Support:**
- support@example.com
- Include all gathered information
- Attach screenshots if helpful

**Community Forums:**
- WordPress.org plugin forums
- Search existing topics first
- Provide detailed problem description

**Documentation:**
- Check online documentation
- Video tutorials available
- FAQ section

Remember: Most issues can be resolved by following this troubleshooting guide systematically!`;
};
