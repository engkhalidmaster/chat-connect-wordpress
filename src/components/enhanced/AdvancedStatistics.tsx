
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, MessageSquare, Clock, Target, Download,
  Calendar, Filter, Eye, MousePointer, Phone
} from 'lucide-react';

const AdvancedStatistics = () => {
  const [timeRange, setTimeRange] = useState('30days');
  
  // Sample data - في التطبيق الحقيقي سيتم جلبها من API
  const overviewStats = [
    { title: 'إجمالي النقرات', value: '2,847', change: '+12.5%', trend: 'up', icon: MousePointer, color: 'blue' },
    { title: 'المحادثات المبدأة', value: '1,234', change: '+8.2%', trend: 'up', icon: MessageSquare, color: 'green' },
    { title: 'معدل التحويل', value: '43.3%', change: '+2.1%', trend: 'up', icon: Target, color: 'purple' },
    { title: 'متوسط الاستجابة', value: '2.4 د', change: '-15%', trend: 'down', icon: Clock, color: 'orange' }
  ];

  const dailyStats = [
    { date: '2024-01-01', clicks: 120, conversations: 45, conversion: 37.5 },
    { date: '2024-01-02', clicks: 145, conversations: 62, conversion: 42.8 },
    { date: '2024-01-03', clicks: 98, conversations: 38, conversion: 38.8 },
    { date: '2024-01-04', clicks: 167, conversations: 71, conversion: 42.5 },
    { date: '2024-01-05', clicks: 134, conversations: 58, conversion: 43.3 },
    { date: '2024-01-06', clicks: 189, conversations: 84, conversion: 44.4 },
    { date: '2024-01-07', clicks: 156, conversations: 67, conversion: 42.9 }
  ];

  const teamPerformance = [
    { name: 'محمد أحمد', conversations: 145, responseTime: '1.8 د', satisfaction: 4.8 },
    { name: 'فاطمة علي', conversations: 132, responseTime: '2.1 د', satisfaction: 4.7 },
    { name: 'خالد محمد', conversations: 98, responseTime: '2.8 د', satisfaction: 4.5 }
  ];

  const pageStats = [
    { page: 'الصفحة الرئيسية', clicks: 1247, percentage: 43.8 },
    { page: 'صفحة المنتجات', clicks: 856, percentage: 30.1 },
    { page: 'من نحن', clicks: 432, percentage: 15.2 },
    { page: 'اتصل بنا', clicks: 312, percentage: 10.9 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className={`h-3 w-3 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
          <TabsTrigger value="team">أداء الفريق</TabsTrigger>
          <TabsTrigger value="pages">الصفحات</TabsTrigger>
          <TabsTrigger value="conversion">التحويل</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>النقرات والمحادثات اليومية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="clicks" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="conversations" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>معدل التحويل</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="conversion" stroke="#ff7300" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أداء أعضاء الفريق</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamPerformance.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.conversations} محادثة</p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{member.responseTime}</p>
                        <p className="text-gray-600">متوسط الرد</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{member.satisfaction}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                        <p className="text-gray-600">التقييم</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
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
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                        <div className="h-3 w-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}} />
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
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>مسار التحويل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">مشاهدة الويدجت</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">5,642</p>
                    <p className="text-sm text-gray-600">100%</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MousePointer className="h-5 w-5 text-green-600" />
                    <span className="font-medium">النقر على الويدجت</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">2,847</p>
                    <p className="text-sm text-gray-600">50.5%</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">بدء محادثة WhatsApp</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-purple-600">1,234</p>
                    <p className="text-sm text-gray-600">43.3%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedStatistics;
