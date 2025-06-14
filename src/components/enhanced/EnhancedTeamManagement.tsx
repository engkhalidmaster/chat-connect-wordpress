
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Plus, Edit, Trash2, Phone, Clock, Star, MessageSquare,
  Calendar, Settings, Award, TrendingUp
} from 'lucide-react';

const EnhancedTeamManagement = () => {
  const [members] = useState([
    {
      id: 1,
      name: 'محمد أحمد',
      phone: '+966501234567',
      department: 'المبيعات',
      status: 'online',
      avatar: null,
      workingHours: { start: '09:00', end: '17:00' },
      workingDays: ['1', '2', '3', '4', '5'],
      performance: { conversations: 145, rating: 4.8, responseTime: '1.8 د' },
      joinDate: '2024-01-01'
    },
    {
      id: 2,
      name: 'فاطمة علي',
      phone: '+966507654321',
      department: 'الدعم الفني',
      status: 'online',
      avatar: null,
      workingHours: { start: '10:00', end: '18:00' },
      workingDays: ['1', '2', '3', '4', '5'],
      performance: { conversations: 132, rating: 4.7, responseTime: '2.1 د' },
      joinDate: '2024-01-15'
    },
    {
      id: 3,
      name: 'خالد محمد',
      phone: '+966509876543',
      department: 'خدمة العملاء',
      status: 'away',
      avatar: null,
      workingHours: { start: '08:00', end: '16:00' },
      workingDays: ['1', '2', '3', '4', '5', '6'],
      performance: { conversations: 98, rating: 4.5, responseTime: '2.8 د' },
      joinDate: '2023-12-01'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'متاح';
      case 'away': return 'بعيد';
      case 'busy': return 'مشغول';
      case 'offline': return 'غير متاح';
      default: return 'غير محدد';
    }
  };

  const getDayName = (dayNumber) => {
    const days = {
      '1': 'الإثنين', '2': 'الثلاثاء', '3': 'الأربعاء', 
      '4': 'الخميس', '5': 'الجمعة', '6': 'السبت', '7': 'الأحد'
    };
    return days[dayNumber] || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة الفريق المتقدمة</h2>
          <p className="text-gray-600">إدارة شاملة لأعضاء فريق خدمة العملاء</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedMember(null)}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة عضو جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedMember ? 'تعديل بيانات العضو' : 'إضافة عضو جديد'}
              </DialogTitle>
            </DialogHeader>
            <MemberForm member={selectedMember} onClose={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.department}</p>
                  </div>
                </div>
                <Badge variant={member.status === 'online' ? 'default' : 'secondary'}>
                  {getStatusText(member.status)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{member.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{member.workingHours.start} - {member.workingHours.end}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    <MessageSquare className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium text-blue-600">المحادثات</span>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{member.performance.conversations}</p>
                </div>
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-3 w-3 text-yellow-600" />
                    <span className="text-xs font-medium text-yellow-600">التقييم</span>
                  </div>
                  <p className="text-lg font-bold text-yellow-600">{member.performance.rating}</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium text-green-600">الاستجابة</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">{member.performance.responseTime}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedMember(member);
                    setIsDialogOpen(true);
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  تعديل
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            إحصائيات الفريق
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{members.length}</div>
              <div className="text-sm text-gray-600">إجمالي الأعضاء</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {members.filter(m => m.status === 'online').length}
              </div>
              <div className="text-sm text-gray-600">متاح الآن</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {members.reduce((sum, m) => sum + m.performance.conversations, 0)}
              </div>
              <div className="text-sm text-gray-600">إجمالي المحادثات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(members.reduce((sum, m) => sum + m.performance.rating, 0) / members.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">متوسط التقييم</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const MemberForm = ({ member, onClose }) => {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    phone: member?.phone || '',
    department: member?.department || '',
    status: member?.status || 'online',
    workingHoursStart: member?.workingHours?.start || '09:00',
    workingHoursEnd: member?.workingHours?.end || '17:00',
    workingDays: member?.workingDays || ['1', '2', '3', '4', '5'],
    autoReply: member?.autoReply || '',
    notifications: member?.notifications || true
  });

  const handleWorkingDayToggle = (day) => {
    const updatedDays = formData.workingDays.includes(day)
      ? formData.workingDays.filter(d => d !== day)
      : [...formData.workingDays, day];
    setFormData({ ...formData, workingDays: updatedDays });
  };

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
        <TabsTrigger value="schedule">جدولة العمل</TabsTrigger>
        <TabsTrigger value="settings">الإعدادات</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4 mt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>الاسم الكامل</Label>
            <Input 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="أدخل الاسم..."
            />
          </div>
          <div className="space-y-2">
            <Label>رقم الهاتف</Label>
            <Input 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+966xxxxxxxxx"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>القسم</Label>
            <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
              <SelectTrigger>
                <SelectValue placeholder="اختر القسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="المبيعات">المبيعات</SelectItem>
                <SelectItem value="الدعم الفني">الدعم الفني</SelectItem>
                <SelectItem value="خدمة العملاء">خدمة العملاء</SelectItem>
                <SelectItem value="الإدارة">الإدارة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>الحالة الافتراضية</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">متاح</SelectItem>
                <SelectItem value="away">بعيد</SelectItem>
                <SelectItem value="busy">مشغول</SelectItem>
                <SelectItem value="offline">غير متاح</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="schedule" className="space-y-4 mt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>بداية العمل</Label>
            <Input 
              type="time"
              value={formData.workingHoursStart}
              onChange={(e) => setFormData({...formData, workingHoursStart: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>نهاية العمل</Label>
            <Input 
              type="time"
              value={formData.workingHoursEnd}
              onChange={(e) => setFormData({...formData, workingHoursEnd: e.target.value})}
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <Label>أيام العمل</Label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: '1', label: 'الإثنين' },
              { value: '2', label: 'الثلاثاء' },
              { value: '3', label: 'الأربعاء' },
              { value: '4', label: 'الخميس' },
              { value: '5', label: 'الجمعة' },
              { value: '6', label: 'السبت' },
              { value: '7', label: 'الأحد' }
            ].map((day) => (
              <div key={day.value} className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  checked={formData.workingDays.includes(day.value)}
                  onCheckedChange={() => handleWorkingDayToggle(day.value)}
                />
                <Label className="text-sm">{day.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="settings" className="space-y-4 mt-6">
        <div className="space-y-2">
          <Label>رسالة الرد التلقائي</Label>
          <Textarea 
            value={formData.autoReply}
            onChange={(e) => setFormData({...formData, autoReply: e.target.value})}
            placeholder="رسالة ترحيب تلقائية..."
            className="text-right"
          />
        </div>
        
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <Label className="font-medium">تلقي الإشعارات</Label>
            <p className="text-sm text-gray-600">إشعارات المحادثات الجديدة</p>
          </div>
          <Switch 
            checked={formData.notifications}
            onCheckedChange={(checked) => setFormData({...formData, notifications: checked})}
          />
        </div>
      </TabsContent>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>إلغاء</Button>
        <Button>{member ? 'تحديث' : 'إضافة'}</Button>
      </div>
    </Tabs>
  );
};

export default EnhancedTeamManagement;
