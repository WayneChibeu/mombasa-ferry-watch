
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface QueueRecommendationsProps {
  crowdLevel: string | null | undefined;
  location: string;
}

const QueueRecommendations: React.FC<QueueRecommendationsProps> = ({ crowdLevel, location }) => {
  if (!crowdLevel) return null;
  
  return (
    <div className="mt-3 space-y-2">
      <h4 className="text-sm font-medium">Recommended Queue Lines:</h4>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-md border bg-gray-50 p-2 text-sm">
          <Badge className="bg-blue-100 text-blue-800">Families</Badge>
          <ArrowRight size={12} />
          <span>{location === 'likoni' ? 'Center' : 'North'} Gate {crowdLevel === 'high' ? '(20+ min)' : '(5-10 min)'}</span>
        </div>
        
        <div className="flex items-center gap-2 rounded-md border bg-gray-50 p-2 text-sm">
          <Badge className="bg-purple-100 text-purple-800">Elderly/PWD</Badge>
          <ArrowRight size={12} />
          <span>Priority Lane {crowdLevel === 'high' ? '(10 min)' : '(2-5 min)'}</span>
        </div>
        
        <div className="flex items-center gap-2 rounded-md border bg-gray-50 p-2 text-sm">
          <Badge className="bg-green-100 text-green-800">Commuters</Badge>
          <ArrowRight size={12} />
          <span>{location === 'likoni' ? 'South' : 'Express'} Gate {crowdLevel === 'high' ? '(25+ min)' : '(10-15 min)'}</span>
        </div>
        
        <div className="flex items-center gap-2 rounded-md border bg-gray-50 p-2 text-sm">
          <Badge className="bg-amber-100 text-amber-800">Vehicles</Badge>
          <ArrowRight size={12} />
          <span>Vehicle Ramp {crowdLevel === 'high' ? '(45+ min)' : '(20-30 min)'}</span>
        </div>
      </div>
    </div>
  );
};

export default QueueRecommendations;
