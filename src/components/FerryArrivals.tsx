
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { OperationalStatus } from '@/types/ferry';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";
import { getArrivalStatus } from './ferry-arrivals/utils/statusUtils';
import FerryStatusCard from './ferry-arrivals/FerryStatusCard';
import EmptyState from './ferry-arrivals/EmptyState';
import LoadingState from './ferry-arrivals/LoadingState';

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

  const handleRefresh = () => {
    fetchStatus();
  };

  if (loading) {
    return <LoadingState />;
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
          <EmptyState />
        ) : statuses.map((status) => {
          const arrivalStatus = getArrivalStatus(status.next_estimated, status.health_status || 'unknown', currentTime);
          
          return (
            <FerryStatusCard
              key={status.location}
              status={status}
              arrivalStatus={arrivalStatus}
              currentTime={currentTime}
            />
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
