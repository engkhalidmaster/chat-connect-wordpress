
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, AlertTriangle, Ban, CheckCircle, Clock, Trash2, Plus } from 'lucide-react';

const SecuritySettings = () => {
  const [settings, setSettings] = useState({
    ipBlocking: true,
    maxClicksPerHour: 100,
    autoBlock: true,
    suspiciousActivity: true,
    rateLimiting: true
  });

  const [blockedIPs] = useState([
    { ip: '192.168.1.100', reason: 'نشاط مشبوه', blockedAt: '2024-01-15 14:30', status: 'active', expiresAt: 'دائم' },
    { ip: '10.0.0.50', reason: 'تجاوز الحد المسموح', blockedAt: '2024-01-14 09:15', status: 'active', expiresAt: '2024-01-17 09:15' },
    { ip: '172.16.0.25', reason: 'محاولة اختراق', blockedAt: '2024-01-13 16:45', status: 'expired', expiresAt: '2024-01-14 16:45' }
  ]);

  const [newIP, setNewIP] = useState('');
  const [blockReason, setBlockReason] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إعدادات الأمان وحماية IP</h2>
          <p className="text-gray-600">حماية الويدجت من الاستخدام المفرط والأنشطة المشبوهة</p>
        </div>
        <Badge variant={settings.ipBlocking ? "default" : "secondary"} className="px-3 py-1">
          <Shield className="h-3 w-3 mr-1" />
          {settings.ipBlocking ? "الحماية مفعلة" : "الحماية معطلة"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              الإعدادات الأساسية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="font-medium">تفعيل نظام حظر IP</Label>
                <p className="text-sm text-gray-600">حماية من العناوين المشبوهة</p>
              </div>
              <Switch 
                checked={settings.ipBlocking}
                onCheckedChange={(checked) => setSettings({...settings, ipBlocking: checked})}
              />
            </div>

            <div className="space-y-2">
              <Label>الحد الأقصى للنقرات في الساعة</Label>
              <Input 
                type="number" 
                value={settings.maxClicksPerHour}
                onChange={(e) => setSettings({...settings, maxClicksPerHour: parseInt(e.target.value)})}
                className="text-right"
              />
              <p className="text-xs text-gray-500">العدد الأقصى المسموح من النقرات للمستخدم الواحد في الساعة</p>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="font-medium">الحظر التلقائي</Label>
                <p className="text-sm text-gray-600">حظر تلقائي عند تجاوز الحد</p>
              </div>
              <Switch 
                checked={settings.autoBlock}
                onCheckedChange={(checked) => setSettings({...settings, autoBlock: checked})}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="font-medium">مراقبة النشاط المشبوه</Label>
                <p className="text-sm text-gray-600">كشف الأنماط غير الطبيعية</p>
              </div>
              <Switch 
                checked={settings.suspiciousActivity}
                onCheckedChange={(checked) => setSettings({...settings, suspiciousActivity: checked})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              إضافة IP محظور
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>عنوان IP</Label>
              <Input 
                placeholder="192.168.1.1" 
                value={newIP}
                onChange={(e) => setNewIP(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>سبب الحظر</Label>
              <Textarea 
                placeholder="اذكر سبب حظر هذا العنوان..."
                className="text-right"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>
            
            <Button className="w-full">
              <Ban className="h-4 w-4 mr-2" />
              حظر العنوان
            </Button>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                تأكد من صحة عنوان IP قبل الحظر. يمكن أن يؤثر الحظر الخاطئ على المستخدمين الشرعيين.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-600" />
            العناوين المحظورة ({blockedIPs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">عنوان IP</TableHead>
                <TableHead className="text-right">السبب</TableHead>
                <TableHead className="text-right">تاريخ الحظر</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">انتهاء الصلاحية</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blockedIPs.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono">{item.ip}</TableCell>
                  <TableCell>{item.reason}</TableCell>
                  <TableCell>{item.blockedAt}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'active' ? 'destructive' : 'secondary'}>
                      {item.status === 'active' ? (
                        <>
                          <Ban className="h-3 w-3 mr-1" />
                          محظور
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          منتهي
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.expiresAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {item.status === 'active' && (
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">تصدير القائمة</Button>
        <Button>حفظ الإعدادات</Button>
      </div>
    </div>
  );
};

export default SecuritySettings;
