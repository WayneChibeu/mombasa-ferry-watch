
export const calculateTimeUntilArrival = (estimatedTime: string | null, currentTime: Date): string => {
  if (!estimatedTime) return 'Unknown';
  
  const estimated = new Date(estimatedTime);
  const diffMs = estimated.getTime() - currentTime.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes <= 0) {
    return 'Arriving now';
  } else if (diffMinutes === 1) {
    return '1 minute';
  } else {
    return `${diffMinutes} minutes`;
  }
};

export const calculateProgressValue = (estimatedTime: string | null, currentTime: Date): number => {
  if (!estimatedTime) return 0;
  
  const diffMinutes = Math.floor((new Date(estimatedTime).getTime() - currentTime.getTime()) / 60000);
  return Math.max(5, Math.min(100, ((30 - diffMinutes) / 30) * 100));
};
