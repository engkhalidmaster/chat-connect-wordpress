
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface TeamMember {
  name: string;
  conversations: number;
  responseTime: string;
  satisfaction: number;
}

interface TeamTabProps {
  teamPerformance: TeamMember[];
}

const TeamTab: React.FC<TeamTabProps> = ({ teamPerformance }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>أداء أعضاء الفريق</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamPerformance.map((member, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">{member.name}</h4>
                  <p className="text-sm text-gray-600">{member.conversations} محادثة</p>
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <p className="font-medium">{member.responseTime}</p>
                  <p className="text-gray-600">متوسط الرد</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{member.satisfaction}</span>
                    <span className="text-yellow-500">★</span>
                  </div>
                  <p className="text-gray-600">التقييم</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamTab;
