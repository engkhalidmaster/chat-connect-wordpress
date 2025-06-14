
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download } from 'lucide-react';

// Import the new components
import OverviewStats from './statistics/OverviewStats';
import TrendsTab from './statistics/TrendsTab';
import TeamTab from './statistics/TeamTab';
import PagesTab from './statistics/PagesTab';
import ConversionTab from './statistics/ConversionTab';

// Import the data
import { 
  overviewStats, 
  dailyStats, 
  teamPerformance, 
  pageStats, 
  COLORS 
} from './statistics/statisticsData';

const AdvancedStatistics = () => {
  const [timeRange, setTimeRange] = useState('30days');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الإحصائيات المتقدمة</h2>
          <p className="text-gray-600">تحليل شامل لأداء ويدجت WhatsApp</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">آخر 7 أيام</SelectItem>
              <SelectItem value="30days">آخر 30 يوم</SelectItem>
              <SelectItem value="90days">آخر 3 أشهر</SelectItem>
              <SelectItem value="1year">آخر سنة</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      <OverviewStats stats={overviewStats} />

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
          <TabsTrigger value="team">أداء الفريق</TabsTrigger>
          <TabsTrigger value="pages">الصفحات</TabsTrigger>
          <TabsTrigger value="conversion">التحويل</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <TrendsTab dailyStats={dailyStats} />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <TeamTab teamPerformance={teamPerformance} />
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <PagesTab pageStats={pageStats} colors={COLORS} />
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <ConversionTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedStatistics;
