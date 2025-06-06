
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
import { Users, User, Phone, Building, Trash2, Edit, Plus } from 'lucide-react';
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
  members: TeamMember[];
}

const TeamManagement = () => {
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: ''
  });
  
  const [newMember, setNewMember] = useState({
    name: '',
    phone: '',
    department: '',
    isActive: true
  });

  // تحميل البيانات من localStorage عند بدء التشغيل
  useEffect(() => {
    const savedTeams = localStorage.getItem('wwp_teams');
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    } else {
      // إنشاء فريق افتراضي
      const defaultTeam: Team = {
        id: 1,
        name: 'فريق خدمة العملاء',
        description: 'الفريق الأساسي لخدمة العملاء',
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
        members: []
      };
      setTeams([...teams, team]);
      setNewTeam({ name: '', description: '' });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة الفريق</h2>
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
                      placeholder="اسم الفريق"
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
                  <Button onClick={addTeam} className="w-full" disabled={!newTeam.name.trim()}>
                    إضافة الفريق
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
                  {team.name} ({team.members.length} أعضاء)
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
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>إضافة عضو جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
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
                        <TableCell>{member.department}</TableCell>
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
                                  onClick={() => setEditingMember(member)}
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
