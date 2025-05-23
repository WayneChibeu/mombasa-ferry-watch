
export interface Report {
  id: string;
  phone: string;
  message: string;
  location: 'likoni' | 'mtongwe';
  is_verified: boolean;
  breakdown_detected: boolean;
  confidence_score?: number;
  processed_at?: string;
  created_at: string;
}

export interface OperationalStatus {
  location: 'likoni' | 'mtongwe';
  last_departure?: string;
  next_estimated?: string;
  health_status: 'operational' | 'delayed' | 'broken';
  current_wait_time?: number;
  crowd_level?: 'low' | 'medium' | 'high';
  updated_at: string;
}

export interface WaitEstimate {
  id: string;
  location: 'likoni' | 'mtongwe';
  estimated_wait_min: number;
  estimated_wait_max: number;
  crowd_level: 'low' | 'medium' | 'high';
  report_count: number;
  created_at: string;
}

export interface AlternativeRoute {
  id: string;
  name: string;
  description: string;
  estimated_time: number;
  cost?: number;
  active: boolean;
}

export interface SMSAlert {
  location: string;
  status: string;
  message: string;
  timestamp: string;
}
