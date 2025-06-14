
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UninstallSettings: React.FC = () => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isUninstalling, setIsUninstalling] = useState(false);
  const { toast } = useToast();

  const handleUninstall = async () => {
    if (!confirmDelete) {
      toast({
        title: "تأكيد مطلوب",
        description: "يرجى تأكيد رغبتك في حذف الإضافة",
        variant: "destructive",
      });
      return;
    }

    setIsUninstalling(true);

    try {
      // إرسال طلب إلغاء التثبيت
      const response = await fetch('/wp-admin/admin-ajax.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          action: 'wwp_uninstall_plugin',
          nonce: (window as any).wwp_ajax?.nonce || '',
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "تم إلغاء التثبيت بنجاح",
          description: "تم حذف الإضافة وجميع بياناتها بنجاح",
        });
        
        // إعادة توجيه إلى صفحة الإضافات
        setTimeout(() => {
          window.location.href = '/wp-admin/plugins.php';
        }, 2000);
      } else {
        throw new Error(result.data || 'حدث خطأ أثناء إلغاء التثبيت');
      }
    } catch (error) {
      console.error('Uninstall error:', error);
      toast({
        title: "خطأ في إلغاء التثبيت",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setIsUninstalling(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            منطقة خطر - إلغاء تثبيت الإضافة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">تحذير مهم:</h3>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>سيتم حذف جميع إعدادات الإضافة نهائياً</li>
              <li>سيتم حذف جميع بيانات الفريق والإحصائيات</li>
              <li>سيتم حذف جميع الجداول من قاعدة البيانات</li>
              <li>سيتم حذف جميع الملفات المرفوعة</li>
              <li>لا يمكن التراجع عن هذا الإجراء!</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">نصائح قبل الحذف:</h3>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>تأكد من أخذ نسخة احتياطية من الإعدادات</li>
              <li>احفظ معرفات Google Analytics إذا كنت تحتاجها</li>
              <li>راجع إعدادات WooCommerce المرتبطة</li>
            </ul>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox 
              id="confirm-delete" 
              checked={confirmDelete}
              onCheckedChange={(checked) => setConfirmDelete(checked as boolean)}
            />
            <label 
              htmlFor="confirm-delete" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              أؤكد أنني أرغب في حذف الإضافة نهائياً مع جميع بياناتها
            </label>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full" 
                disabled={!confirmDelete || isUninstalling}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isUninstalling ? 'جاري الحذف...' : 'حذف الإضافة نهائياً'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-700">
                  تأكيد نهائي - حذف الإضافة
                </AlertDialogTitle>
                <AlertDialogDescription>
                  هذا الإجراء لا يمكن التراجع عنه. سيتم حذف:
                  <br />
                  • جميع الإعدادات والتخصيصات
                  <br />
                  • بيانات الفريق والإحصائيات
                  <br />
                  • جداول قاعدة البيانات
                  <br />
                  • الملفات المرفوعة
                  <br /><br />
                  هل أنت متأكد من المتابعة؟
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleUninstall}
                  className="bg-red-600 hover:bg-red-700"
                >
                  متابعة الحذف
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default UninstallSettings;
