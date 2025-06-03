
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Monitor, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AppearanceSettings = () => {
  const { toast } = useToast();
  const [widgetColor, setWidgetColor] = useState('#25D366');
  const [position, setPosition] = useState('bottom-right');
  const [customColor, setCustomColor] = useState('#25D366');

  const predefinedColors = [
    { color: '#25D366', name: 'WhatsApp الأخضر' },
    { color: '#0088CC', name: 'أزرق تلجرام' },
    { color: '#FF6B35', name: 'برتقالي دافئ' },
    { color: '#8B5CF6', name: 'بنفسجي عصري' },
    { color: '#EF4444', name: 'أحمر جذاب' },
    { color: '#10B981', name: 'أخضر طبيعي' },
    { color: '#F59E0B', name: 'أصفر ذهبي' },
    { color: '#6366F1', name: 'أزرق ملكي' }
  ];

  // تحميل الإعدادات المحفوظة
  useEffect(() => {
    const savedSettings = localStorage.getItem('wwp_appearance_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setWidgetColor(settings.widgetColor || '#25D366');
      setPosition(settings.position || 'bottom-right');
      setCustomColor(settings.widgetColor || '#25D366');
    }
  }, []);

  // حفظ الإعدادات عند التغيير
  const saveSettings = () => {
    const settings = {
      widgetColor,
      position
    };
    localStorage.setItem('wwp_appearance_settings', JSON.stringify(settings));
    
    toast({
      title: "تم حفظ إعدادات المظهر",
      description: "تم حفظ إعدادات المظهر بنجاح",
    });
  };

  const handleColorChange = (color: string) => {
    setWidgetColor(color);
    setCustomColor(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    setWidgetColor(color);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Palette className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إعدادات المظهر</h2>
          <p className="text-gray-600">تخصيص مظهر وموقع زر WhatsApp</p>
        </div>
      </div>

      {/* معاينة الويدجت */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            معاينة الويدجت
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gray-100 rounded-lg p-8 min-h-[300px]">
            <div className="text-center text-gray-500 mb-4">
              <Smartphone className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>معاينة موقع الزر على الشاشة</p>
            </div>
            
            {/* زر الويدجت */}
            <div 
              className={`fixed w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${
                position === 'bottom-right' ? 'bottom-4 right-4' :
                position === 'bottom-left' ? 'bottom-4 left-4' :
                position === 'top-right' ? 'top-4 right-4' :
                'top-4 left-4'
              }`}
              style={{ 
                backgroundColor: widgetColor,
                position: 'absolute'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* اختيار اللون */}
      <Card>
        <CardHeader>
          <CardTitle>لون الويدجت</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-sm"
              style={{ backgroundColor: widgetColor }}
            />
            <div className="text-sm text-gray-600">
              <p className="font-medium">اللون المختار</p>
              <p className="text-xs font-mono bg-gray-100 px-2 py-1 rounded mt-1">{widgetColor}</p>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">الألوان المقترحة</Label>
            <div className="grid grid-cols-4 gap-3">
              {predefinedColors.map((colorItem) => (
                <button
                  key={colorItem.color}
                  onClick={() => handleColorChange(colorItem.color)}
                  className={`group relative w-full h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                    widgetColor === colorItem.color 
                      ? 'border-gray-800 ring-2 ring-blue-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: colorItem.color }}
                  title={colorItem.name}
                >
                  {widgetColor === colorItem.color && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="custom-color" className="text-base font-medium">لون مخصص</Label>
            <div className="flex items-center gap-3">
              <input
                id="custom-color"
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                  placeholder="#25D366"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* موقع الويدجت */}
      <Card>
        <CardHeader>
          <CardTitle>موقع الويدجت</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="position-select" className="text-base font-medium">اختر موقع الزر على الشاشة</Label>
          <Select value={position} onValueChange={setPosition}>
            <SelectTrigger className="mt-3">
              <SelectValue placeholder="اختر الموقع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bottom-right">أسفل يمين (مُوصى به)</SelectItem>
              <SelectItem value="bottom-left">أسفل يسار</SelectItem>
              <SelectItem value="top-right">أعلى يمين</SelectItem>
              <SelectItem value="top-left">أعلى يسار</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-2">
            الموقع "أسفل يمين" هو الأكثر شيوعاً ويوفر تجربة مستخدم مألوفة
          </p>
        </CardContent>
      </Card>

      {/* أزرار الحفظ */}
      <div className="flex gap-3">
        <Button onClick={saveSettings} className="flex-1">
          حفظ إعدادات المظهر
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            setWidgetColor('#25D366');
            setPosition('bottom-right');
            setCustomColor('#25D366');
          }}
        >
          استعادة الافتراضي
        </Button>
      </div>
    </div>
  );
};

export default AppearanceSettings;
