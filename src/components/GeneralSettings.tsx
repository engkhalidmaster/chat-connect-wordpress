
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const GeneralSettings = () => {
  const [showWidget, setShowWidget] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState('مرحباً! كيف يمكنني مساعدتك؟');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">الإعدادات العامة</h2>
        <p className="text-gray-600">إعدادات عامة لزر WhatsApp والرسائل</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Switch
              checked={showWidget}
              onCheckedChange={setShowWidget}
              id="widget-toggle"
            />
            <Label htmlFor="widget-toggle">إظهار ويدجت WhatsApp في الموقع</Label>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="welcome-message">الرسالة التي ستظهر عند فتح المحادثة</Label>
            <Textarea
              id="welcome-message"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="الرسالة التي ستظهر عند فتح نافذة الدردشة"
              className="mt-2"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettings;
