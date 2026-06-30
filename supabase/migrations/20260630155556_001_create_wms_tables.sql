/*
# Create WMS Database Tables

This migration creates the core tables for the Warehouse Management System (WMS)
Controle de Stages application. The system manages stages (warehouse areas),
carriers (transport companies), and pallets (stored items).

1. New Tables
   - `stages`: Warehouse areas with configurable streets and positions
     - id (uuid, primary key)
     - name (text, unique, not null)
     - streets (integer, not null)
     - positions (integer, not null)
     - created_at (timestamptz)
   
   - `carriers`: Transport companies
     - id (uuid, primary key)
     - name (text, unique, not null)
     - active (boolean, default true)
     - created_at (timestamptz)
   
   - `pallets`: Stored items in warehouse positions
     - id (uuid, primary key)
     - stage_id (uuid, foreign key to stages)
     - carrier_id (uuid, foreign key to carriers)
     - street (integer, not null)
     - position (integer, not null)
     - tro (text, not null) - Tracking Reference Number
     - shipment (text) - Optional shipment identifier
     - created_at (timestamptz)
     - updated_at (timestamptz)

2. Security
   - Enable RLS on all tables
   - Allow anon + authenticated full CRUD access (single-tenant, no auth required)
   - Data is intentionally shared/public within the warehouse operation

3. Constraints
   - Unique constraint on pallets: (stage_id, street, position) - prevents duplicate pallets
   - Foreign key constraints with CASCADE delete on stage/carrier deletion
*/

-- Stages table
CREATE TABLE IF NOT EXISTS stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  streets integer NOT NULL CHECK (streets > 0),
  positions integer NOT NULL CHECK (positions > 0),
  created_at timestamptz DEFAULT now()
);

-- Carriers table
CREATE TABLE IF NOT EXISTS carriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Pallets table
CREATE TABLE IF NOT EXISTS pallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id uuid NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  carrier_id uuid NOT NULL REFERENCES carriers(id) ON DELETE RESTRICT,
  street integer NOT NULL CHECK (street > 0),
  position integer NOT NULL CHECK (position > 0),
  tro text NOT NULL,
  shipment text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_stage_position UNIQUE (stage_id, street, position)
);

-- Enable RLS on all tables
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pallets ENABLE ROW LEVEL SECURITY;

-- Stages policies (anon + authenticated for single-tenant app)
DROP POLICY IF EXISTS "anon_select_stages" ON stages;
CREATE POLICY "anon_select_stages" ON stages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_stages" ON stages;
CREATE POLICY "anon_insert_stages" ON stages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_stages" ON stages;
CREATE POLICY "anon_update_stages" ON stages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_stages" ON stages;
CREATE POLICY "anon_delete_stages" ON stages FOR DELETE
  TO anon, authenticated USING (true);

-- Carriers policies
DROP POLICY IF EXISTS "anon_select_carriers" ON carriers;
CREATE POLICY "anon_select_carriers" ON carriers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_carriers" ON carriers;
CREATE POLICY "anon_insert_carriers" ON carriers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_carriers" ON carriers;
CREATE POLICY "anon_update_carriers" ON carriers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_carriers" ON carriers;
CREATE POLICY "anon_delete_carriers" ON carriers FOR DELETE
  TO anon, authenticated USING (true);

-- Pallets policies
DROP POLICY IF EXISTS "anon_select_pallets" ON pallets;
CREATE POLICY "anon_select_pallets" ON pallets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_pallets" ON pallets;
CREATE POLICY "anon_insert_pallets" ON pallets FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_pallets" ON pallets;
CREATE POLICY "anon_update_pallets" ON pallets FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_pallets" ON pallets;
CREATE POLICY "anon_delete_pallets" ON pallets FOR DELETE
  TO anon, authenticated USING (true);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_pallets_stage_id ON pallets(stage_id);
CREATE INDEX IF NOT EXISTS idx_pallets_carrier_id ON pallets(carrier_id);
CREATE INDEX IF NOT EXISTS idx_pallets_tro ON pallets(tro);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_pallets_updated_at ON pallets;
CREATE TRIGGER update_pallets_updated_at
  BEFORE UPDATE ON pallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();