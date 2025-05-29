
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const UsageStatistics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">إحصائيات الاستخدام (آخر 30 يوم)</h2>
        <p className="text-gray-600">بيانات شاملة عن أداء ويدجت WhatsApp</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">0%</div>
            <div className="text-sm text-orange-800">معدل التحويل</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">0</div>
            <div className="text-sm text-green-800">محادثة بدأت</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
            <div className="text-sm text-blue-800">فتح الويدجت</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إحصائيات مفصلة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <div className="text-lg mb-2">📊</div>
            <p>لا توجد بيانات كافية لعرض الإحصائيات</p>
            <p className="text-sm mt-1">ستظهر البيانات هنا بعد استخدام الويدجت</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageStatistics;
