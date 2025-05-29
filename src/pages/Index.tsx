
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import GeneralSettings from '@/components/GeneralSettings';
import TeamManagement from '@/components/TeamManagement';
import AppearanceSettings from '@/components/AppearanceSettings';
import AnalyticsSettings from '@/components/AnalyticsSettings';
import UsageStatistics from '@/components/UsageStatistics';

const Index = () => {
  const [activeTab, setActiveTab] = useState('general');

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'team':
        return <TeamManagement />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'analytics':
        return <AnalyticsSettings />;
      case 'statistics':
        return <UsageStatistics />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
