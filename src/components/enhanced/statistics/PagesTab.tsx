
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface PageStat {
  page: string;
  clicks: number;
  percentage: number;
}

interface PagesTabProps {
  pageStats: PageStat[];
  colors: string[];
}

const PagesTab: React.FC<PagesTabProps> = ({ pageStats, colors }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>أكثر الصفحات نشاطاً</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pageStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percentage}) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="clicks"
              >
                {pageStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الصفحات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pageStats.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{backgroundColor: colors[index % colors.length]}} />
                  <span className="font-medium">{page.page}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{page.clicks}</p>
                  <p className="text-sm text-gray-600">{page.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PagesTab;
