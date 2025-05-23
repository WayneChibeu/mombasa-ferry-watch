import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Ship } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { OperationalStatus } from '@/types/ferry';

const FerryArrivals: React.FC = () => {
  const [statuses, setStatuses] = useState<OperationalStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Update every 30 seconds
    
    // Update current time every second for real-time countdown
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const fetchStatus = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('operational_status')
        .select('*');
      
      if (error) throw error;
      setStatuses((data || []) as OperationalStatus[]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching status:', error);
      setLoading(false);
    }
  };

  const calculateTimeUntilArrival = (estimatedTime: string | null): string => {
    if (!estimatedTime) return 'Unknown';
    
    const estimated = new Date(estimatedTime);
    const now = currentTime;
    const diffMs = estimated.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes <= 0) {
      return 'Arriving now';
    } else if (diffMinutes === 1) {
      return '1 minute';
    } else {
      return `${diffMinutes} minutes`;
    }
  };

  const getArrivalStatus = (estimatedTime: string | null, healthStatus: string): 'arriving' | 'delayed' | 'unknown' | 'broken' => {
    if (healthStatus === 'broken') return 'broken';
    if (!estimatedTime) return 'unknown';
    
    const estimated = new Date(estimatedTime);
    const now = currentTime;
    const diffMinutes = Math.floor((estimated.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffMinutes <= 2) return 'arriving';
    if (diffMinutes > 15) return 'delayed';
    return 'unknown';
  };

  const getStatusColor = (status: 'arriving' | 'delayed' | 'unknown' | 'broken'): string => {
    switch (status) {
      case 'arriving':
        return 'bg-green-100 text-green-800';
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800';
      case 'broken':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center py-4">Loading ferry arrivals...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ship className="h-5 w-5" />
          Ferry Arrival Times
        </CardTitle>
        <p className="text-sm text-gray-600">
          Real-time estimated arrival information
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {statuses.map((status) => {
          const arrivalStatus = getArrivalStatus(status.next_estimated, status.health_status || 'unknown');
          const timeUntil = calculateTimeUntilArrival(status.next_estimated);
          
          return (
            <div key={status.location} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg capitalize">
                    MV {status.location}
                  </h3>
                  <Badge className={getStatusColor(arrivalStatus)}>
                    {arrivalStatus === 'arriving' ? 'Arriving Soon' :
                     arrivalStatus === 'delayed' ? 'Delayed' :
                     arrivalStatus === 'broken' ? 'Out of Service' : 'Status Unknown'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-right">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    {currentTime.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Estimated Arrival:</p>
                  <p className={`text-lg font-bold ${
                    arrivalStatus === 'arriving' ? 'text-green-600' : 
                    arrivalStatus === 'delayed' ? 'text-yellow-600' : 
                    arrivalStatus === 'broken' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {timeUntil}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Current Wait:</p>
                  <p className="text-lg font-bold text-blue-600">
                    {status.current_wait_time ? `${status.current_wait_time} min` : 'Unknown'}
                  </p>
                </div>
              </div>
              
              {status.next_estimated && (
                <div>
                  <p className="text-sm text-gray-500">
                    Expected at: {new Date(status.next_estimated).toLocaleTimeString()}
                  </p>
                </div>
              )}
              
              {status.crowd_level && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Queue Status: </span>
                  <Badge className={
                    status.crowd_level === 'low' ? 'bg-green-100 text-green-800' :
                    status.crowd_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {status.crowd_level} crowd
                  </Badge>
                </div>
              )}
            </div>
          );
        })}
        
        <div className="text-xs text-gray-400 text-center pt-2">
          Updates every 30 seconds • Last updated: {currentTime.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default FerryArrivals;
