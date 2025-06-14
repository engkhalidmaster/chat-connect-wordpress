
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Package, Truck, CheckCircle, AlertCircle } from 'lucide-react';

const WooCommerceIntegration = () => {
  const [settings, setSettings] = useState({
    enabled: true,
    orderConfirmation: true,
    processingUpdate: true,
    shippingUpdate: true,
    deliveryNotice: true,
    orderCancellation: false,
    refundNotification: false
  });

  const messageTemplates = {
    orderConfirmation: 'مرحباً {customer_name}! 🎉\nتم استلام طلبك رقم #{order_number} بنجاح\nإجمالي المبلغ: {total_amount}\nشكراً لثقتك بنا!',
    processingUpdate: 'عزيزي/عزيزتي {customer_name} 📦\nطلبك رقم #{order_number} قيد التجهيز\nسيتم شحنه خلال 24-48 ساعة',
    shippingUpdate: 'طلبك في الطريق! 🚚\nرقم الطلب: #{order_number}\nرقم التتبع: {tracking_number}\nالوصول المتوقع: {estimated_delivery}',
    deliveryNotice: 'تم تسليم طلبك بنجاح! ✅\nرقم الطلب: #{order_number}\nشكراً لاختيارك متجرنا، نتطلع لخدمتك مرة أخرى'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">تكامل WooCommerce المتقدم</h2>
          <p className="text-gray-600">إرسال رسائل WhatsApp تلقائية للعملاء في جميع مراحل الطلب</p>
        </div>
        <Badge variant={settings.enabled ? "default" : "secondary"} className="px-3 py-1">
          {settings.enabled ? "مفعل" : "معطل"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <CardTitle>الإعدادات الأساسية</CardTitle>
            </div>
            <Switch 
              checked={settings.enabled} 
              onCheckedChange={(checked) => setSettings({...settings, enabled: checked})}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">تأكيد الطلب</span>
              </div>
              <Switch 
                checked={settings.orderConfirmation}
                onCheckedChange={(checked) => setSettings({...settings, orderConfirmation: checked})}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">تحديث الشحن</span>
              </div>
              <Switch 
                checked={settings.shippingUpdate}
                onCheckedChange={(checked) => setSettings({...settings, shippingUpdate: checked})}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">إشعار التسليم</span>
              </div>
              <Switch 
                checked={settings.deliveryNotice}
                onCheckedChange={(checked) => setSettings({...settings, deliveryNotice: checked})}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">إلغاء الطلب</span>
              </div>
              <Switch 
                checked={settings.orderCancellation}
                onCheckedChange={(checked) => setSettings({...settings, orderCancellation: checked})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>قوالب الرسائل</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="order-confirmation" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="order-confirmation">تأكيد الطلب</TabsTrigger>
              <TabsTrigger value="processing">قيد التجهيز</TabsTrigger>
              <TabsTrigger value="shipping">الشحن</TabsTrigger>
              <TabsTrigger value="delivery">التسليم</TabsTrigger>
            </TabsList>
            
            <TabsContent value="order-confirmation" className="space-y-4">
              <Label>قالب رسالة تأكيد الطلب</Label>
              <Textarea 
                className="min-h-32 text-right" 
                defaultValue={messageTemplates.orderConfirmation}
                placeholder="اكتب قالب رسالة تأكيد الطلب..."
              />
            </TabsContent>
            
            <TabsContent value="processing" className="space-y-4">
              <Label>قالب رسالة التجهيز</Label>
              <Textarea 
                className="min-h-32 text-right" 
                defaultValue={messageTemplates.processingUpdate}
                placeholder="اكتب قالب رسالة التجهيز..."
              />
            </TabsContent>
            
            <TabsContent value="shipping" className="space-y-4">
              <Label>قالب رسالة الشحن</Label>
              <Textarea 
                className="min-h-32 text-right" 
                defaultValue={messageTemplates.shippingUpdate}
                placeholder="اكتب قالب رسالة الشحن..."
              />
            </TabsContent>
            
            <TabsContent value="delivery" className="space-y-4">
              <Label>قالب رسالة التسليم</Label>
              <Textarea 
                className="min-h-32 text-right" 
                defaultValue={messageTemplates.deliveryNotice}
                placeholder="اكتب قالب رسالة التسليم..."
              />
            </TabsContent>
          </Tabs>
          
          <Separator className="my-6" />
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">المتغيرات المتاحة:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
              <div><code>{'{customer_name}'}</code> - اسم العميل</div>
              <div><code>{'{order_number}'}</code> - رقم الطلب</div>
              <div><code>{'{total_amount}'}</code> - إجمالي المبلغ</div>
              <div><code>{'{order_date}'}</code> - تاريخ الطلب</div>
              <div><code>{'{tracking_number}'}</code> - رقم التتبع</div>
              <div><code>{'{estimated_delivery}'}</code> - موعد التسليم المتوقع</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">معاينة الرسائل</Button>
        <Button>حفظ الإعدادات</Button>
      </div>
    </div>
  );
};

export default WooCommerceIntegration;
