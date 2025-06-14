
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import GeneralSettings from './components/GeneralSettings';
import AppearanceSettings from './components/AppearanceSettings';
import AnalyticsSettings from './components/AnalyticsSettings';
import UsageStatistics from './components/UsageStatistics';

// Enhanced components
import WooCommerceIntegration from './components/enhanced/WooCommerceIntegration';
import SecuritySettings from './components/enhanced/SecuritySettings';
import AdvancedStatistics from './components/enhanced/AdvancedStatistics';
import EnhancedTeamManagement from './components/enhanced/EnhancedTeamManagement';

const App = () => {
  const [activeTab, setActiveTab] = useState('general');

  console.log('App activeTab:', activeTab);

  const renderContent = () => {
    console.log('Rendering content for tab:', activeTab);
    
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'team':
        return <EnhancedTeamManagement />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'analytics':
        return <AnalyticsSettings />;
      case 'woocommerce':
        return <WooCommerceIntegration />;
      case 'security':
        return <SecuritySettings />;
      case 'statistics':
        return <AdvancedStatistics />;
      default:
        console.log('Default case, showing GeneralSettings');
        return <GeneralSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="flex w-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
