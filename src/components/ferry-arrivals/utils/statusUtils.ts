
import type { ArrivalStatus } from '../types';

export const getArrivalStatus = (estimatedTime: string | null, healthStatus: string, currentTime: Date): ArrivalStatus => {
  if (healthStatus === 'broken') return 'broken';
  if (!estimatedTime) return 'unknown';
  
  const estimated = new Date(estimatedTime);
  const diffMinutes = Math.floor((estimated.getTime() - currentTime.getTime()) / (1000 * 60));
  
  if (diffMinutes <= 2) return 'arriving';
  if (diffMinutes > 15) return 'delayed';
  return 'unknown';
};

export const getStatusColor = (status: ArrivalStatus): string => {
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

export const getStatusLabel = (status: ArrivalStatus): string => {
  switch (status) {
    case 'arriving':
      return 'Arriving Soon';
    case 'delayed':
      return 'Delayed';
    case 'broken':
      return 'Out of Service';
    default:
      return 'Status Unknown';
  }
};
