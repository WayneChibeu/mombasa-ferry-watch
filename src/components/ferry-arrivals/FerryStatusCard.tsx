
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Hourglass, Users } from 'lucide-react';
import type { OperationalStatus } from '@/types/ferry';
import type { ArrivalStatus } from './types';
import { getStatusColor, getStatusLabel } from './utils/statusUtils';
import { calculateTimeUntilArrival, calculateProgressValue } from './utils/timeUtils';
import QueueRecommendations from './QueueRecommendations';

interface FerryStatusCardProps {
  status: OperationalStatus;
  arrivalStatus: ArrivalStatus;
  currentTime: Date;
}

const FerryStatusCard: React.FC<FerryStatusCardProps> = ({ status, arrivalStatus, currentTime }) => {
  const timeUntil = calculateTimeUntilArrival(status.next_estimated, currentTime);
  const progressValue = calculateProgressValue(status.next_estimated, currentTime);
  
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg capitalize">
            MV {status.location}
          </h3>
          <Badge className={getStatusColor(arrivalStatus)}>
            {getStatusLabel(arrivalStatus)}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Hourglass className="h-4 w-4" /> Estimated Arrival:
          </p>
          <p className={`text-lg font-bold ${
            arrivalStatus === 'arriving' ? 'text-green-600' : 
            arrivalStatus === 'delayed' ? 'text-yellow-600' : 
            arrivalStatus === 'broken' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {timeUntil}
          </p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Users className="h-4 w-4" /> Current Queue:
          </p>
          <p className="text-lg font-bold text-blue-600">
            {status.current_wait_time ? `${status.current_wait_time} min wait` : 'No wait time data'}
          </p>
          <p className="text-xs text-gray-600">
            {status.crowd_level === 'low' ? 'Light crowds (< 5 min)' : 
            status.crowd_level === 'medium' ? 'Moderate crowds (5-15 min)' :
            status.crowd_level === 'high' ? 'Heavy crowds (> 15 min)' : 'Crowd status unknown'}
          </p>
        </div>
      </div>
      
      {status.next_estimated && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Now</span>
            <span>Expected: {new Date(status.next_estimated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
      )}
      
      <QueueRecommendations crowdLevel={status.crowd_level} location={status.location} />
    </div>
  );
};

export default FerryStatusCard;
