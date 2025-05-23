
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { OperationalStatus, WaitEstimate } from '@/types/ferry';

const FerryStatus: React.FC = () => {
  const [statuses, setStatuses] = useState<OperationalStatus[]>([]);
  const [waitEstimates, setWaitEstimates] = useState<WaitEstimate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    fetchWaitEstimates();
  }, []);

  const fetchStatus = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('operational_status')
        .select('*');
      
      if (error) throw error;
      setStatuses((data || []) as OperationalStatus[]);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const fetchWaitEstimates = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('wait_estimates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);
      
      if (error) throw error;
      setWaitEstimates((data || []) as WaitEstimate[]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wait estimates:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'delayed':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'broken':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800';
      case 'broken':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCrowdColor = (level: string): string => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading ferry status...</div>;
  }

  return (
    <div className="space-y-4">
      {statuses.map((status) => {
        const waitEstimate = waitEstimates.find(w => w.location === status.location);
        
        return (
          <Card key={status.location} className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium capitalize">
                {status.location} Ferry
              </CardTitle>
              {getStatusIcon(status.health_status)}
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={getStatusColor(status.health_status)}>
                  {status.health_status}
                </Badge>
                {status.crowd_level && (
                  <Badge className={getCrowdColor(status.crowd_level)}>
                    {status.crowd_level} crowd
                  </Badge>
                )}
              </div>
              
              {status.current_wait_time && (
                <p className="text-sm text-gray-600 mb-2">
                  Current wait: {status.current_wait_time} minutes
                </p>
              )}
              
              {waitEstimate && (
                <p className="text-sm text-gray-600 mb-2">
                  Estimated wait: {waitEstimate.estimated_wait_min}-{waitEstimate.estimated_wait_max} minutes
                </p>
              )}
              
              {status.next_estimated && (
                <p className="text-sm text-gray-600">
                  Next departure: {new Date(status.next_estimated).toLocaleTimeString()}
                </p>
              )}
              
              <p className="text-xs text-gray-400 mt-2">
                Updated: {new Date(status.updated_at).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default FerryStatus;
