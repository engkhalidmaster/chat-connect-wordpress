
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GeneralSettings from './components/GeneralSettings';
import AppearanceSettings from './components/AppearanceSettings';
import AnalyticsSettings from './components/AnalyticsSettings';

// Enhanced components
import WooCommerceIntegration from './components/enhanced/WooCommerceIntegration';
import SecuritySettings from './components/enhanced/SecuritySettings';
import AdvancedStatistics from './components/enhanced/AdvancedStatistics';
import EnhancedTeamManagement from './components/enhanced/EnhancedTeamManagement';
import UninstallSettings from './components/enhanced/UninstallSettings';

const App = () => {
  const [activeTab, setActiveTab] = useState('general');

  const handleTabChange = useCallback((tab: string) => {
    console.log('App: Changing tab from', activeTab, 'to', tab);
    setActiveTab(tab);
  }, [activeTab]);

  const renderContent = () => {
    console.log('App: Rendering content for tab:', activeTab);
    
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
      case 'uninstall':
        return <UninstallSettings />;
      default:
        console.log('App: Unknown tab, showing GeneralSettings');
        return <GeneralSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      <div className="flex w-full">
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div key={activeTab} className="animate-in fade-in-0 duration-200">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
