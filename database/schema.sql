
-- FerryGo Production Database Schema
-- Mombasa Ferry Alert System

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core reports table for SMS submissions
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL CHECK (LENGTH(phone) >= 9),
  message TEXT NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('likoni', 'mtongwe')),
  is_verified BOOLEAN DEFAULT FALSE,
  breakdown_detected BOOLEAN DEFAULT FALSE,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Operational status tracking
CREATE TABLE operational_status (
  location TEXT PRIMARY KEY CHECK (location IN ('likoni', 'mtongwe')),
  last_departure TIMESTAMPTZ,
  next_estimated TIMESTAMPTZ,
  health_status TEXT CHECK (health_status IN ('operational', 'delayed', 'broken')),
  current_wait_time INTEGER,
  crowd_level TEXT CHECK (crowd_level IN ('low', 'medium', 'high')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wait time estimates
CREATE TABLE wait_estimates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location TEXT NOT NULL CHECK (location IN ('likoni', 'mtongwe')),
  estimated_wait_min INTEGER NOT NULL,
  estimated_wait_max INTEGER NOT NULL,
  crowd_level TEXT CHECK (crowd_level IN ('low', 'medium', 'high')),
  report_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alternative routes
CREATE TABLE alternative_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  estimated_time INTEGER NOT NULL,
  cost INTEGER,
  active BOOLEAN DEFAULT TRUE
);

-- Initial data
INSERT INTO alternative_routes (name, description, estimated_time, cost) 
VALUES ('Dongo Kundu', 'Dongo Kundu Bridge route', 30, 150);

INSERT INTO operational_status (location, health_status, crowd_level) 
VALUES 
  ('likoni', 'operational', 'low'),
  ('mtongwe', 'operational', 'low');

-- Security policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE wait_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE alternative_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access" ON operational_status FOR SELECT USING (true);
CREATE POLICY "Public access" ON wait_estimates FOR SELECT USING (true);
CREATE POLICY "Public access" ON alternative_routes FOR SELECT USING (true);
CREATE POLICY "Public insert" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read" ON reports FOR SELECT USING (true);
