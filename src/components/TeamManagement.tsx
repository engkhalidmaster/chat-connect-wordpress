
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
import { Users, User, Phone, Building, Trash2, Edit, Plus, UserPlus, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: number;
  name: string;
  phone: string;
  department: string;
  isActive: boolean;
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
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    color: '#25D366'
  });
  
  const [newMember, setNewMember] = useState({
    name: '',
    phone: '',
    department: '',
    isActive: true
  });

  const teamColors = [
    '#25D366', '#0088CC', '#FF6B35', '#8B5CF6', 
    '#EF4444', '#10B981', '#F59E0B', '#6366F1'
  ];

  // تحميل البيانات من localStorage عند بدء التشغيل
  useEffect(() => {
    const savedTeams = localStorage.getItem('wwp_teams');
    if (savedTeams) {
      const parsedTeams = JSON.parse(savedTeams);
      setTeams(parsedTeams);
      if (parsedTeams.length > 0 && !selectedTeam) {
        setSelectedTeam(parsedTeams[0].id);
      }
    } else {
      // إنشاء فريق افتراضي
      const defaultTeam: Team = {
        id: 1,
        name: 'فريق خدمة العملاء الرئيسي',
        description: 'الفريق الأساسي لخدمة العملاء',
        color: '#25D366',
        members: [
          {
            id: 1,
            name: 'محمد أحمد',
            phone: '+966501234567',
            department: 'المبيعات',
            isActive: true,
          },
          {
            id: 2,
            name: 'فاطمة علي',
            phone: '+966507654321',
            department: 'الدعم الفني',
            isActive: true,
          }
        ]
      };
      setTeams([defaultTeam]);
      setSelectedTeam(1);
    }
  }, []);

  // حفظ البيانات في localStorage عند تغييرها
  useEffect(() => {
    if (teams.length > 0) {
      localStorage.setItem('wwp_teams', JSON.stringify(teams));
    }
  }, [teams]);

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
      setNewTeam({ name: '', description: '', color: '#25D366' });
      setIsAddTeamOpen(false);
      setSelectedTeam(team.id);
      
      toast({
        title: "تم إضافة الفريق بنجاح",
        description: `تم إضافة فريق "${team.name}" بنجاح`,
      });
    }
  };

  const updateTeam = () => {
    if (editingTeam) {
      setTeams(teams.map(team => 
        team.id === editingTeam.id ? editingTeam : team
      ));
      setEditingTeam(null);
      
      toast({
        title: "تم تحديث الفريق",
        description: `تم تحديث بيانات الفريق بنجاح`,
      });
    }
  };

  const deleteTeam = (teamId: number) => {
    if (teams.length > 1) {
      const updatedTeams = teams.filter(team => team.id !== teamId);
      setTeams(updatedTeams);
      
      if (selectedTeam === teamId) {
        setSelectedTeam(updatedTeams[0]?.id || null);
      }
      
      toast({
        title: "تم حذف الفريق",
        description: "تم حذف الفريق بنجاح",
      });
    } else {
      toast({
        title: "تعذر الحذف",
        description: "لا يمكن حذف آخر فريق",
        variant: "destructive",
      });
    }
  };

  const addMember = () => {
    if (newMember.name && newMember.phone && selectedTeam) {
      const member: TeamMember = {
        id: Date.now(),
        ...newMember
      };
      
      setTeams(teams.map(team => 
        team.id === selectedTeam 
          ? { ...team, members: [...team.members, member] }
          : team
      ));
      
      setNewMember({ name: '', phone: '', department: '', isActive: true });
      setIsAddMemberOpen(false);
      
      toast({
        title: "تم إضافة العضو بنجاح",
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
  const currentTeam = getCurrentTeam();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة الفرق والأعضاء</h2>
          <p className="text-gray-600">إدارة الفرق وأرقام WhatsApp لأعضاء الفريق</p>
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
            <div className="flex gap-2">
              {currentTeam && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => setEditingTeam(currentTeam)}>
                      <Settings className="h-4 w-4 mr-2" />
                      إعدادات الفريق
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>إعدادات الفريق</DialogTitle>
                    </DialogHeader>
                    {editingTeam && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>اسم الفريق</Label>
                          <Input
                            value={editingTeam.name}
                            onChange={(e) => setEditingTeam({...editingTeam, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>وصف الفريق</Label>
                          <Input
                            value={editingTeam.description}
                            onChange={(e) => setEditingTeam({...editingTeam, description: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>لون الفريق</Label>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded border-2 border-gray-300"
                              style={{ backgroundColor: editingTeam.color }}
                            />
                            <div className="grid grid-cols-4 gap-1">
                              {teamColors.map((color) => (
                                <button
                                  key={color}
                                  onClick={() => setEditingTeam({...editingTeam, color})}
                                  className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={updateTeam} className="flex-1">
                            حفظ التغييرات
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => deleteTeam(editingTeam.id)}
                            disabled={teams.length === 1}
                          >
                            حذف الفريق
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              )}
              <Dialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة فريق جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
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
                        placeholder="مثل: فريق المبيعات"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="team-description">وصف الفريق</Label>
                      <Input
                        id="team-description"
                        value={newTeam.description}
                        onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                        placeholder="وصف مختصر للفريق"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>لون الفريق</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded border-2 border-gray-300"
                          style={{ backgroundColor: newTeam.color }}
                        />
                        <div className="grid grid-cols-4 gap-1">
                          {teamColors.map((color) => (
                            <button
                              key={color}
                              onClick={() => setNewTeam({...newTeam, color})}
                              className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button onClick={addTeam} className="w-full" disabled={!newTeam.name.trim()}>
                      إضافة الفريق
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedTeam?.toString()} onValueChange={(value) => setSelectedTeam(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="اختر فريق" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id.toString()}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                    {team.name} ({team.members.length} أعضاء)
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* إدارة الأعضاء */}
      {selectedTeam && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: currentTeam?.color }}
                />
                أعضاء {getCurrentTeam()?.name} ({currentMembers.length})
              </span>
              <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    إضافة عضو جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>إضافة عضو جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="member-name">الاسم الكامل</Label>
                      <Input
                        id="member-name"
                        value={newMember.name}
                        onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                        placeholder="مثل: أحمد محمد"
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
                      <p className="text-xs text-gray-500">يجب أن يبدأ الرقم برمز الدولة مثل +966</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="member-department">القسم أو التخصص</Label>
                      <Input
                        id="member-department"
                        value={newMember.department}
                        onChange={(e) => setNewMember({...newMember, department: e.target.value})}
                        placeholder="مثل: المبيعات، الدعم الفني"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch 
                        checked={newMember.isActive}
                        onCheckedChange={(checked) => setNewMember({...newMember, isActive: checked})}
                      />
                      <Label>متاح للعملاء حالياً</Label>
                    </div>
                    <Button onClick={addMember} className="w-full" disabled={!newMember.name || !newMember.phone}>
                      إضافة العضو إلى الفريق
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentMembers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <UserPlus className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">لا يوجد أعضاء في هذا الفريق</h3>
                <p className="mb-4">ابدأ بإضافة أول عضو لهذا الفريق</p>
                <Button onClick={() => setIsAddMemberOpen(true)}>
                  إضافة عضو جديد
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الاسم</TableHead>
                      <TableHead className="text-right">رقم الهاتف</TableHead>
                      <TableHead className="text-right">القسم</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell className="text-left font-mono" dir="ltr">{member.phone}</TableCell>
                        <TableCell>{member.department || 'غير محدد'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={member.isActive}
                              onCheckedChange={() => toggleMemberStatus(member.id)}
                            />
                            <Badge variant={member.isActive ? "default" : "secondary"}>
                              {member.isActive ? "متاح" : "غير متاح"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setEditingMember({...member})}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>تعديل بيانات العضو</DialogTitle>
                                </DialogHeader>
                                {editingMember && (
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label>الاسم الكامل</Label>
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
                                      <Label>القسم أو التخصص</Label>
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
                                      <Label>متاح للعملاء حالياً</Label>
                                    </div>
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamManagement;
