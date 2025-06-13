
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Users, User, Phone, Building, Trash2, Edit, Plus, Clock, Image, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkingHours {
  start: string;
  end: string;
}

interface TeamMember {
  id: number;
  name: string;
  phone: string;
  department: string;
  isActive: boolean;
  avatar?: string;
  workingHours: {
    monday: WorkingHours;
    tuesday: WorkingHours;
    wednesday: WorkingHours;
    thursday: WorkingHours;
    friday: WorkingHours;
    saturday: WorkingHours;
    sunday: WorkingHours;
  };
  workingDays: string[];
  autoReplyMessage: string;
  teamId: number;
}

interface Team {
  id: number;
  name: string;
  description: string;
  color: string;
  members: TeamMember[];
}

const TeamManagement = () => {
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });
  
  const [newMember, setNewMember] = useState({
    name: '',
    phone: '',
    department: '',
    isActive: true,
    avatar: '',
    workingHours: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
      saturday: { start: '09:00', end: '17:00' },
      sunday: { start: '09:00', end: '17:00' }
    },
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    autoReplyMessage: 'مرحباً! شكراً لتواصلك معنا. سأكون معك خلال دقائق.',
    teamId: 0
  });

  const daysInArabic = {
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
    sunday: 'الأحد'
  };

  // تحميل البيانات من localStorage عند بدء التشغيل
  useEffect(() => {
    const savedTeams = localStorage.getItem('wwp_teams');
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    } else {
      // إنشاء فرق افتراضية
      const defaultTeams: Team[] = [
        {
          id: 1,
          name: 'فريق خدمة العملاء',
          description: 'الفريق الأساسي لخدمة العملاء',
          color: '#22C55E',
          members: [
            {
              id: 1,
              name: 'محمد أحمد',
              phone: '+966501234567',
              department: 'المبيعات',
              isActive: true,
              avatar: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=150&h=150&fit=crop&crop=face',
              workingHours: {
                monday: { start: '09:00', end: '17:00' },
                tuesday: { start: '09:00', end: '17:00' },
                wednesday: { start: '09:00', end: '17:00' },
                thursday: { start: '09:00', end: '17:00' },
                friday: { start: '09:00', end: '17:00' },
                saturday: { start: '10:00', end: '14:00' },
                sunday: { start: '10:00', end: '14:00' }
              },
              workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
              autoReplyMessage: 'مرحباً! أنا محمد من فريق المبيعات. كيف يمكنني مساعدتك؟',
              teamId: 1
            },
            {
              id: 2,
              name: 'فاطمة علي',
              phone: '+966507654321',
              department: 'الدعم الفني',
              isActive: true,
              avatar: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop&crop=face',
              workingHours: {
                monday: { start: '10:00', end: '18:00' },
                tuesday: { start: '10:00', end: '18:00' },
                wednesday: { start: '10:00', end: '18:00' },
                thursday: { start: '10:00', end: '18:00' },
                friday: { start: '10:00', end: '18:00' },
                saturday: { start: '10:00', end: '14:00' },
                sunday: { start: '10:00', end: '14:00' }
              },
              workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
              autoReplyMessage: 'أهلاً وسهلاً! أنا فاطمة من الدعم الفني. سأساعدك في حل مشكلتك.',
              teamId: 1
            }
          ]
        },
        {
          id: 2,
          name: 'فريق الدعم التقني المتقدم',
          description: 'فريق متخصص في المشاكل التقنية المعقدة',
          color: '#8B5CF6',
          members: []
        }
      ];
      setTeams(defaultTeams);
      setSelectedTeam(1);
    }
  }, []);

  // حفظ البيانات في localStorage عند تغييرها
  useEffect(() => {
    if (teams.length > 0) {
      localStorage.setItem('wwp_teams', JSON.stringify(teams));
    }
  }, [teams]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "حجم الملف كبير",
        description: "يجب أن يكون حجم الصورة أقل من 2 ميجابايت",
        variant: "destructive"
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "نوع ملف غير صحيح",
        description: "يرجى اختيار صورة صالحة",
        variant: "destructive"
      });
      return;
    }

    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (isEditing && editingMember) {
        setEditingMember({ ...editingMember, avatar: result });
      } else {
        setNewMember({ ...newMember, avatar: result });
      }
      setUploadingAvatar(false);
      toast({
        title: "تم رفع الصورة",
        description: "تم رفع صورة العضو بنجاح",
      });
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = (isEditing = false) => {
    if (isEditing && editingMember) {
      setEditingMember({ ...editingMember, avatar: '' });
    } else {
      setNewMember({ ...newMember, avatar: '' });
    }
    toast({
      title: "تم حذف الصورة",
      description: "تم حذف صورة العضو",
    });
  };

  const addTeam = () => {
    if (newTeam.name.trim()) {
      const team: Team = {
        id: Date.now(),
        name: newTeam.name,
        description: newTeam.description,
        color: newTeam.color,
        members: []
      };
      setTeams([...teams, team]);
      setNewTeam({ name: '', description: '', color: '#3B82F6' });
      setIsAddTeamOpen(false);
      setSelectedTeam(team.id);
      
      toast({
        title: "تم إضافة الفريق",
        description: `تم إضافة فريق "${team.name}" بنجاح`,
      });
    }
  };

  const addMember = () => {
    if (newMember.name && newMember.phone && selectedTeam) {
      const member: TeamMember = {
        id: Date.now(),
        ...newMember,
        teamId: selectedTeam
      };
      
      setTeams(teams.map(team => 
        team.id === selectedTeam 
          ? { ...team, members: [...team.members, member] }
          : team
      ));
      
      setNewMember({
        name: '',
        phone: '',
        department: '',
        isActive: true,
        avatar: '',
        workingHours: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: { start: '09:00', end: '17:00' },
          sunday: { start: '09:00', end: '17:00' }
        },
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        autoReplyMessage: 'مرحباً! شكراً لتواصلك معنا. سأكون معك خلال دقائق.',
        teamId: selectedTeam
      });
      setIsAddMemberOpen(false);
      
      toast({
        title: "تم إضافة العضو",
        description: `تم إضافة "${member.name}" إلى الفريق بنجاح`,
      });
    }
  };

  const updateMember = () => {
    if (editingMember && selectedTeam) {
      setTeams(teams.map(team =>
        team.id === selectedTeam
          ? {
              ...team,
              members: team.members.map(member =>
                member.id === editingMember.id ? editingMember : member
              )
            }
          : team
      ));
      
      setEditingMember(null);
      
      toast({
        title: "تم تحديث العضو",
        description: `تم تحديث بيانات "${editingMember.name}" بنجاح`,
      });
    }
  };

  const deleteMember = (memberId: number) => {
    if (selectedTeam) {
      const member = getCurrentTeam()?.members.find(m => m.id === memberId);
      
      setTeams(teams.map(team =>
        team.id === selectedTeam
          ? { ...team, members: team.members.filter(m => m.id !== memberId) }
          : team
      ));
      
      toast({
        title: "تم حذف العضو",
        description: `تم حذف "${member?.name}" من الفريق`,
      });
    }
  };

  const toggleMemberStatus = (memberId: number) => {
    if (selectedTeam) {
      setTeams(teams.map(team =>
        team.id === selectedTeam
          ? {
              ...team,
              members: team.members.map(member =>
                member.id === memberId ? { ...member, isActive: !member.isActive } : member
              )
            }
          : team
      ));
    }
  };

  const getCurrentTeam = () => teams.find(team => team.id === selectedTeam);
  const currentMembers = getCurrentTeam()?.members || [];

  const WorkingHoursComponent = ({ member, isEditing, onUpdate }: any) => (
    <div className="space-y-4">
      <h4 className="font-medium">ساعات العمل الأسبوعية</h4>
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(daysInArabic).map(([day, arabicName]) => (
          <div key={day} className="flex items-center gap-4">
            <div className="w-20">
              <input
                type="checkbox"
                id={`${day}-${member.id}`}
                checked={member.workingDays.includes(day)}
                onChange={(e) => {
                  const updatedDays = e.target.checked
                    ? [...member.workingDays, day]
                    : member.workingDays.filter(d => d !== day);
                  onUpdate({ ...member, workingDays: updatedDays });
                }}
                className="ml-2"
              />
              <label htmlFor={`${day}-${member.id}`} className="text-sm">{arabicName}</label>
            </div>
            {member.workingDays.includes(day) && (
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={member.workingHours[day]?.start || '09:00'}
                  onChange={(e) => onUpdate({
                    ...member,
                    workingHours: {
                      ...member.workingHours,
                      [day]: { ...member.workingHours[day], start: e.target.value }
                    }
                  })}
                  className="w-24"
                />
                <span>إلى</span>
                <Input
                  type="time"
                  value={member.workingHours[day]?.end || '17:00'}
                  onChange={(e) => onUpdate({
                    ...member,
                    workingHours: {
                      ...member.workingHours,
                      [day]: { ...member.workingHours[day], end: e.target.value }
                    }
                  })}
                  className="w-24"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة الفريق المتقدمة</h2>
          <p className="text-gray-600">إدارة شاملة للفرق وأعضاء الفريق مع التخصيص الكامل</p>
        </div>
      </div>

      {/* إدارة الفرق */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              الفرق ({teams.length})
            </span>
            <Dialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة فريق جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>إضافة فريق جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="team-name">اسم الفريق</Label>
                    <Input
                      id="team-name"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                      placeholder="اسم الفريق"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team-description">وصف الفريق</Label>
                    <Textarea
                      id="team-description"
                      value={newTeam.description}
                      onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                      placeholder="وصف مختصر للفريق"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team-color">لون الفريق</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="team-color"
                        type="color"
                        value={newTeam.color}
                        onChange={(e) => setNewTeam({...newTeam, color: e.target.value})}
                        className="w-16 h-10 p-1 border-0"
                      />
                      <Input
                        value={newTeam.color}
                        onChange={(e) => setNewTeam({...newTeam, color: e.target.value})}
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <Button onClick={addTeam} className="w-full" disabled={!newTeam.name.trim()}>
                    إضافة الفريق
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedTeam === team.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTeam(team.id)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: team.color }}
                  ></div>
                  <h3 className="font-medium">{team.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">{team.description}</p>
                <div className="flex justify-between items-center">
                  <Badge variant="secondary">{team.members.length} عضو</Badge>
                  <Badge variant="outline" style={{ color: team.color, borderColor: team.color }}>
                    {selectedTeam === team.id ? 'محدد' : 'اختر'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* إدارة الأعضاء */}
      {selectedTeam && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                أعضاء {getCurrentTeam()?.name} ({currentMembers.length})
              </span>
              <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة عضو جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إضافة عضو جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* البيانات الأساسية */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="member-name">الاسم</Label>
                        <Input
                          id="member-name"
                          value={newMember.name}
                          onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                          placeholder="اسم العضو"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="member-phone">رقم WhatsApp</Label>
                        <Input
                          id="member-phone"
                          value={newMember.phone}
                          onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                          placeholder="+966501234567"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="member-department">القسم</Label>
                        <Input
                          id="member-department"
                          value={newMember.department}
                          onChange={(e) => setNewMember({...newMember, department: e.target.value})}
                          placeholder="القسم"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={newMember.isActive}
                          onCheckedChange={(checked) => setNewMember({...newMember, isActive: checked})}
                        />
                        <Label>متاح الآن</Label>
                      </div>
                    </div>

                    {/* صورة العضو */}
                    <div className="space-y-2">
                      <Label>صورة العضو</Label>
                      <div className="flex items-center gap-4">
                        {newMember.avatar ? (
                          <div className="relative">
                            <img 
                              src={newMember.avatar} 
                              alt="صورة العضو" 
                              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                              onClick={() => removeAvatar()}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="avatar-upload" className="cursor-pointer">
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
                              <Upload className="h-4 w-4" />
                              {uploadingAvatar ? 'جاري الرفع...' : 'رفع صورة'}
                            </div>
                          </Label>
                          <Input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e)}
                            className="hidden"
                            disabled={uploadingAvatar}
                          />
                          <p className="text-xs text-gray-500">
                            حجم أقصى: 2 ميجابايت<br />
                            أنواع مدعومة: JPG, PNG, GIF
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* رسالة الرد التلقائي */}
                    <div className="space-y-2">
                      <Label htmlFor="auto-reply">رسالة الرد التلقائي</Label>
                      <Textarea
                        id="auto-reply"
                        value={newMember.autoReplyMessage}
                        onChange={(e) => setNewMember({...newMember, autoReplyMessage: e.target.value})}
                        placeholder="مرحباً! شكراً لتواصلك معنا..."
                        rows={3}
                      />
                    </div>

                    {/* ساعات العمل */}
                    <WorkingHoursComponent 
                      member={newMember} 
                      isEditing={false} 
                      onUpdate={setNewMember} 
                    />

                    <Button onClick={addMember} className="w-full" disabled={!newMember.name || !newMember.phone}>
                      إضافة العضو
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>لا يوجد أعضاء في هذا الفريق حالياً</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentMembers.map((member) => (
                  <div key={member.id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {member.avatar ? (
                            <img 
                              src={member.avatar} 
                              alt={member.name} 
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            member.isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.department}</p>
                          <p className="text-xs text-gray-500 font-mono" dir="ltr">{member.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.isActive ? "default" : "secondary"}>
                          {member.isActive ? "متاح" : "غير متاح"}
                        </Badge>
                        <Switch
                          checked={member.isActive}
                          onCheckedChange={() => toggleMemberStatus(member.id)}
                        />
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              onClick={() => setEditingMember(member)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>تعديل بيانات العضو</DialogTitle>
                            </DialogHeader>
                            {editingMember && (
                              <div className="space-y-6">
                                {/* البيانات الأساسية */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>الاسم</Label>
                                    <Input
                                      value={editingMember.name}
                                      onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>رقم WhatsApp</Label>
                                    <Input
                                      value={editingMember.phone}
                                      onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
                                      dir="ltr"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>القسم</Label>
                                    <Input
                                      value={editingMember.department}
                                      onChange={(e) => setEditingMember({...editingMember, department: e.target.value})}
                                    />
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Switch 
                                      checked={editingMember.isActive}
                                      onCheckedChange={(checked) => setEditingMember({...editingMember, isActive: checked})}
                                    />
                                    <Label>متاح الآن</Label>
                                  </div>
                                </div>

                                {/* صورة العضو */}
                                <div className="space-y-2">
                                  <Label>صورة العضو</Label>
                                  <div className="flex items-center gap-4">
                                    {editingMember.avatar ? (
                                      <div className="relative">
                                        <img 
                                          src={editingMember.avatar} 
                                          alt="صورة العضو" 
                                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                        />
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                                          onClick={() => removeAvatar(true)}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="h-8 w-8 text-gray-400" />
                                      </div>
                                    )}
                                    <div className="flex flex-col gap-2">
                                      <Label htmlFor="avatar-upload-edit" className="cursor-pointer">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
                                          <Upload className="h-4 w-4" />
                                          {uploadingAvatar ? 'جاري الرفع...' : 'تحديث الصورة'}
                                        </div>
                                      </Label>
                                      <Input
                                        id="avatar-upload-edit"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, true)}
                                        className="hidden"
                                        disabled={uploadingAvatar}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* رسالة الرد التلقائي */}
                                <div className="space-y-2">
                                  <Label>رسالة الرد التلقائي</Label>
                                  <Textarea
                                    value={editingMember.autoReplyMessage}
                                    onChange={(e) => setEditingMember({...editingMember, autoReplyMessage: e.target.value})}
                                    rows={3}
                                  />
                                </div>

                                {/* ساعات العمل */}
                                <WorkingHoursComponent 
                                  member={editingMember} 
                                  isEditing={true} 
                                  onUpdate={setEditingMember} 
                                />

                                <Button onClick={updateMember} className="w-full">
                                  حفظ التغييرات
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="destructive" 
                          onClick={() => deleteMember(member.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* معلومات إضافية */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>أيام العمل: {member.workingDays.length} أيام</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>رد تلقائي: {member.autoReplyMessage ? 'مفعل' : 'غير مفعل'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamManagement;
