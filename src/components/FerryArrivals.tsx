
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Ship, Users, Hourglass, AlertTriangle, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { OperationalStatus } from '@/types/ferry';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from "@/hooks/use-toast";

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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch ferry status information"
      });
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

  // Returns recommended queue line based on passenger type and crowd level
  const getRecommendedQueueLine = (crowdLevel: string | null | undefined, location: string): React.ReactNode => {
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
          const progressValue = status.next_estimated 
            ? Math.max(5, Math.min(100, 
                ((30 - Math.floor((new Date(status.next_estimated).getTime() - currentTime.getTime()) / 60000)) / 30) * 100
              )) 
            : 0;
          
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
              
              {getRecommendedQueueLine(status.crowd_level, status.location)}
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
