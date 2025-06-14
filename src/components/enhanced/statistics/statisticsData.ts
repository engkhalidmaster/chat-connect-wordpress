
import { 
  MousePointer, MessageSquare, Target, Clock
} from 'lucide-react';

export const overviewStats = [
  { title: 'إجمالي النقرات', value: '2,847', change: '+12.5%', trend: 'up' as const, icon: MousePointer, color: 'blue' },
  { title: 'المحادثات المبدأة', value: '1,234', change: '+8.2%', trend: 'up' as const, icon: MessageSquare, color: 'green' },
  { title: 'معدل التحويل', value: '43.3%', change: '+2.1%', trend: 'up' as const, icon: Target, color: 'purple' },
  { title: 'متوسط الاستجابة', value: '2.4 د', change: '-15%', trend: 'down' as const, icon: Clock, color: 'orange' }
];

export const dailyStats = [
  { date: '2024-01-01', clicks: 120, conversations: 45, conversion: 37.5 },
  { date: '2024-01-02', clicks: 145, conversations: 62, conversion: 42.8 },
  { date: '2024-01-03', clicks: 98, conversations: 38, conversion: 38.8 },
  { date: '2024-01-04', clicks: 167, conversations: 71, conversion: 42.5 },
  { date: '2024-01-05', clicks: 134, conversations: 58, conversion: 43.3 },
  { date: '2024-01-06', clicks: 189, conversations: 84, conversion: 44.4 },
  { date: '2024-01-07', clicks: 156, conversations: 67, conversion: 42.9 }
];

export const teamPerformance = [
  { name: 'محمد أحمد', conversations: 145, responseTime: '1.8 د', satisfaction: 4.8 },
  { name: 'فاطمة علي', conversations: 132, responseTime: '2.1 د', satisfaction: 4.7 },
  { name: 'خالد محمد', conversations: 98, responseTime: '2.8 د', satisfaction: 4.5 }
];

export const pageStats = [
  { page: 'الصفحة الرئيسية', clicks: 1247, percentage: 43.8 },
  { page: 'صفحة المنتجات', clicks: 856, percentage: 30.1 },
  { page: 'من نحن', clicks: 432, percentage: 15.2 },
  { page: 'اتصل بنا', clicks: 312, percentage: 10.9 }
];

export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
