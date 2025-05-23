
export type ArrivalStatus = 'arriving' | 'delayed' | 'unknown' | 'broken';

export interface FerryArrivalData {
  location: string;
  nextEstimated: string | null;
  healthStatus: string;
  currentWaitTime: number | null;
  crowdLevel: string | null;
  updatedAt: string;
}
