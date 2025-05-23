
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Ship, Users, Hourglass, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { OperationalStatus } from '@/types/ferry';
import { Button } from '@/components/ui/button';

const FerryArrivals: React.FC = () => {
  const [statuses, setStatuses] = useState<OperationalStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

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
      setRefreshing(true);
      const { data, error } = await supabase
        .from('operational_status')
        .select('*');
      
      if (error) throw error;
      setStatuses((data || []) as OperationalStatus[]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching status:', error);
      setLoading(false);
    } finally {
      setRefreshing(false);
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

  const getCrowdLevelIcon = (level: string | null | undefined) => {
    if (!level) return null;
    
    switch (level) {
      case 'low':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'medium':
        return <Users className="h-4 w-4 text-yellow-500" />;
      case 'high':
        return <Users className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getCrowdLevelText = (level: string | null | undefined): string => {
    switch (level) {
      case 'low':
        return 'Light queue (< 5 min)';
      case 'medium':
        return 'Moderate queue (5-15 min)';
      case 'high':
        return 'Heavy queue (> 15 min)';
      default:
        return 'Queue status unknown';
    }
  };

  const handleRefresh = () => {
    fetchStatus();
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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Ferry Arrival Times
          </CardTitle>
          <p className="text-sm text-gray-600">
            Real-time estimated arrival information
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="h-8"
        >
          {refreshing ? 'Updating...' : 'Refresh Now'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {statuses.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p>No ferry status information available</p>
          </div>
        ) : statuses.map((status) => {
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
                  <div className="flex flex-col">
                    <p className="text-lg font-bold text-blue-600">
                      {status.current_wait_time ? `${status.current_wait_time} min wait` : 'No wait time data'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {getCrowdLevelIcon(status.crowd_level)}
                      <span className="text-xs text-gray-600">
                        {getCrowdLevelText(status.crowd_level)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {status.next_estimated && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        arrivalStatus === 'arriving' ? 'bg-green-500' : 
                        arrivalStatus === 'delayed' ? 'bg-yellow-500' : 
                        'bg-blue-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, Math.max(5, calculateTimeProgressBar(status.next_estimated)))}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Expected at: {new Date(status.next_estimated).toLocaleTimeString()}
                  </p>
                </div>
              )}
              
              {status.crowd_level && (
                <div className="border-t pt-2 mt-1">
                  <h4 className="text-sm font-medium mb-1">Queue Information:</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={
                      status.crowd_level === 'low' ? 'bg-green-100 text-green-800' :
                      status.crowd_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {status.crowd_level} crowd level
                    </Badge>
                    
                    {status.crowd_level === 'high' && (
                      <Badge variant="outline" className="text-gray-800 border-gray-300">
                        Consider alternative routes
                      </Badge>
                    )}
                    
                    {status.health_status === 'operational' && status.crowd_level !== 'high' && (
                      <Badge variant="outline" className="text-green-800 border-green-300">
                        Good time to travel
                      </Badge>
                    )}
                  </div>
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

// Helper function to calculate progress bar percentage for arrival
const calculateTimeProgressBar = (estimatedTime: string): number => {
  const now = new Date();
  const estimated = new Date(estimatedTime);
  const diffMs = estimated.getTime() - now.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  
  // If arriving in less than 30 minutes, show progress relative to 30 min
  if (diffMinutes <= 30) {
    return ((30 - diffMinutes) / 30) * 100;
  }
  return 0; // Just starting the progress for longer times
};

export default FerryArrivals;
