
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, User, Phone, Building, Trash2, Edit } from 'lucide-react';

const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState([
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
    },
    {
      id: 3,
      name: 'خالد محمد',
      phone: '+966509876543',
      department: 'خدمة العملاء',
      isActive: false,
    }
  ]);
  
  const [newMember, setNewMember] = useState({
    name: '',
    phone: '',
    department: '',
    isActive: true
  });

  const addMember = () => {
    if (newMember.name && newMember.phone) {
      setTeamMembers([...teamMembers, {
        id: Date.now(),
        ...newMember
      }]);
      setNewMember({ name: '', phone: '', department: '', isActive: true });
    }
  };

  const deleteMember = (id: number) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
  };

  const toggleMemberStatus = (id: number) => {
    setTeamMembers(teamMembers.map(member => 
      member.id === id ? { ...member, isActive: !member.isActive } : member
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة الفريق</h2>
          <p className="text-gray-600">إدارة أرقام WhatsApp لفريق العمل</p>
        </div>
      </div>

      {/* إضافة عضو جديد */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            إضافة عضو جديد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="member-name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                الاسم
              </Label>
              <Input
                id="member-name"
                value={newMember.name}
                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                placeholder="اسم العضو"
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                رقم WhatsApp
              </Label>
              <Input
                id="member-phone"
                value={newMember.phone}
                onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                placeholder="+966501234567"
                className="text-left"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-department" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                القسم
              </Label>
              <Input
                id="member-department"
                value={newMember.department}
                onChange={(e) => setNewMember({...newMember, department: e.target.value})}
                placeholder="القسم"
                className="text-right"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <Switch 
              id="member-status" 
              checked={newMember.isActive}
              onCheckedChange={(checked) => setNewMember({...newMember, isActive: checked})}
            />
            <Label htmlFor="member-status" className="text-sm font-medium">
              متاح الآن
            </Label>
          </div>
          
          <Button 
            onClick={addMember} 
            className="w-full md:w-auto bg-green-600 hover:bg-green-700"
            disabled={!newMember.name || !newMember.phone}
          >
            إضافة عضو جديد
          </Button>
        </CardContent>
      </Card>

      {/* قائمة الأعضاء */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            قائمة الأعضاء ({teamMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>لا يوجد أعضاء في الفريق حالياً</p>
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
                  {teamMembers.map((member) => (
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
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
    </div>
  );
};

export default TeamManagement;
