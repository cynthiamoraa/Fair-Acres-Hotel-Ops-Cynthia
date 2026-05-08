-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS manager (
  id INTEGER PRIMARY KEY DEFAULT 1,
  password TEXT NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  hotel_name TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  CONSTRAINT single_row CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  floor INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'occupied', 'maintenance'))
);

CREATE TABLE IF NOT EXISTS workers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pin TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  room_code TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('unassigned', 'pending', 'completed')),
  worker_id TEXT REFERENCES workers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  proof_image_url TEXT,
  proof_image_hash TEXT,
  issue_id INTEGER
);

CREATE TABLE IF NOT EXISTS issues (
  id SERIAL PRIMARY KEY,
  ticket_no TEXT UNIQUE NOT NULL,
  ticket_seq INTEGER NOT NULL,
  location TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  guest_name TEXT DEFAULT 'Anonymous',
  room_code TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default manager
INSERT INTO manager (id, password) VALUES (1, 'admin1234') ON CONFLICT (id) DO NOTHING;

-- Insert default settings
INSERT INTO settings (id, hotel_name, contact_email) VALUES (1, '', '') ON CONFLICT (id) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_worker ON tasks(worker_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_issues_ticket ON issues(ticket_no);
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
