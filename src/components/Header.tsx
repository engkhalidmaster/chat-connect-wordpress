
import React from 'react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Widget Pro</h1>
          <p className="text-sm text-gray-600 mt-1">
            نسخة أفضل مع Google Analytics. تأكد من إدخال معرف التتبع الصحيح وتفعيل النمودج.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            نسخة احتياطية
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            حفظ الإعدادات
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
