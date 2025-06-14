
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, MousePointer, Phone } from 'lucide-react';

const ConversionTab: React.FC = () => {
  return (
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
  );
};

export default ConversionTab;
