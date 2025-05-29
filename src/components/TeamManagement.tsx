
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: 'فريق المبيعات',
      phone: '+966501234567',
      department: 'المبيعات',
      isActive: true,
    }
  ]);
  
  const [newMember, setNewMember] = useState({
    name: '',
    phone: '',
    department: ''
  });

  const addMember = () => {
    if (newMember.name && newMember.phone) {
      setTeamMembers([...teamMembers, {
        id: Date.now(),
        ...newMember,
        isActive: true
      }]);
      setNewMember({ name: '', phone: '', department: '' });
    }
  };

  const deleteMember = (id: number) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">أعضاء الفريق</h2>
        <p className="text-gray-600">إدارة أرقام WhatsApp لفريق العمل</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إضافة عضو جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="member-name">الاسم:</Label>
              <Input
                id="member-name"
                value={newMember.name}
                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                placeholder="اسم العضو"
              />
            </div>
            <div>
              <Label htmlFor="member-phone">رقم WhatsApp:</Label>
              <Input
                id="member-phone"
                value={newMember.phone}
                onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                placeholder="+966501234567"
              />
            </div>
            <div>
              <Label htmlFor="member-department">القسم:</Label>
              <Input
                id="member-department"
                value={newMember.department}
                onChange={(e) => setNewMember({...newMember, department: e.target.value})}
                placeholder="القسم"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="member-status" defaultChecked />
            <Label htmlFor="member-status">متاح الآن</Label>
          </div>
          <Button onClick={addMember} className="mt-4 bg-red-600 hover:bg-red-700">
            حذف العضو
          </Button>
          <Button onClick={addMember} className="mt-4 mr-2 bg-blue-600 hover:bg-blue-700">
            إضافة عضو جديد
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الأعضاء</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{member.name}</span>
                    <Badge variant={member.isActive ? "default" : "secondary"}>
                      {member.isActive ? "متاح" : "غير متاح"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {member.phone} • {member.department}
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => deleteMember(member.id)}
                >
                  حذف
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamManagement;
