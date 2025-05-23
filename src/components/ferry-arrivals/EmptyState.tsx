
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-6 text-gray-500">
      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
      <p>No ferry status information available</p>
    </div>
  );
};

export default EmptyState;
