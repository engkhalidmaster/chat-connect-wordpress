
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AppearanceSettings = () => {
  const [widgetColor, setWidgetColor] = useState('#25D366');
  const [position, setPosition] = useState('bottom-right');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">إعدادات المظهر</h2>
        <p className="text-gray-600">تخصيص مظهر زر WhatsApp</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>لون الويدجت</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-lg border-2 border-gray-300"
              style={{ backgroundColor: widgetColor }}
            />
            <div className="text-sm text-gray-600">
              اللون الأساسي للويدجت
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['#25D366', '#0088CC', '#FF6B35', '#8B5CF6'].map((color) => (
              <button
                key={color}
                onClick={() => setWidgetColor(color)}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 hover:scale-105 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>موقع الويدجت</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="position-select">اختر موقع الزر على الشاشة</Label>
          <Select value={position} onValueChange={setPosition}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="اختر الموقع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bottom-right">أسفل يمين</SelectItem>
              <SelectItem value="bottom-left">أسفل يسار</SelectItem>
              <SelectItem value="top-right">أعلى يمين</SelectItem>
              <SelectItem value="top-left">أعلى يسار</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppearanceSettings;
