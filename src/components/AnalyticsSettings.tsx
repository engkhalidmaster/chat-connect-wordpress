
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const AnalyticsSettings = () => {
  const [enableTracking, setEnableTracking] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">إعدادات Google Analytics</h2>
        <p className="text-gray-600">تتبع إحصائيات استخدام زر WhatsApp</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Switch
              checked={enableTracking}
              onCheckedChange={setEnableTracking}
              id="tracking-toggle"
            />
            <Label htmlFor="tracking-toggle">تفعيل تتبع الأحداث في Google Analytics</Label>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tracking-id">معرف التتبع</Label>
            <Input
              id="tracking-id"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="UA-XXXXXXXXX-X أو G-XXXXXXXXXX"
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              معرف Google Analytics الخاص بموقعك
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">الأحداث المتتبعة:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• widget_opened: عند فتح نافذة الدردشة</li>
              <li>• chat_started: عند بدء محادثة مع أحد أعضاء الفريق</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSettings;
