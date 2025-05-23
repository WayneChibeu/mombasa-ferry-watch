
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const LoadingState: React.FC = () => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="text-center py-4">Loading ferry arrivals...</div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
