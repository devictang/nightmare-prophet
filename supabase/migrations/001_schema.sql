-- 夢魘先知 — Supabase Schema
-- Run this in Supabase SQL Editor to set up the database

-- ============================================
-- PROFILES (extends Supabase Auth users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '夢魘先知',
  player_class TEXT NOT NULL DEFAULT 'warrior' CHECK (player_class IN ('warrior','rogue','mage','ranger')),
  dream_layer INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- SAVE DATA (JSON blob for full game state)
-- ============================================
CREATE TABLE IF NOT EXISTS saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  save_data JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX idx_saves_user_id ON saves(user_id);

ALTER TABLE saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own save"
  ON saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own save"
  ON saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own save"
  ON saves FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- LEADERBOARD
-- ============================================
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  dream_layer INTEGER NOT NULL,
  player_level INTEGER NOT NULL,
  total_willpower INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leaderboard_layer ON leaderboard(dream_layer DESC);
CREATE INDEX idx_leaderboard_willpower ON leaderboard(total_willpower DESC);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read leaderboard"
  ON leaderboard FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own leaderboard entry"
  ON leaderboard FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- WILLPOWER CARDS (purchased cards per user)
-- ============================================
CREATE TABLE IF NOT EXISTS willpower_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  card_name TEXT NOT NULL,
  card_quality TEXT NOT NULL CHECK (card_quality IN ('common','rare','epic','legendary')),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_willpower_cards_user ON willpower_cards(user_id);

ALTER TABLE willpower_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own cards"
  ON willpower_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards"
  ON willpower_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- EQUIPMENT (persistent anchored equipment)
-- ============================================
CREATE TABLE IF NOT EXISTS anchored_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot TEXT NOT NULL CHECK (slot IN ('weapon','armor','accessory')),
  name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  presence INTEGER NOT NULL DEFAULT 5,
  base_atk INTEGER NOT NULL DEFAULT 0,
  base_def INTEGER NOT NULL DEFAULT 0,
  affixes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, slot)
);

ALTER TABLE anchored_equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own anchored equipment"
  ON anchored_equipment FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own anchored equipment"
  ON anchored_equipment FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own anchored equipment"
  ON anchored_equipment FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', '夢魘先知'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update updated_at on profile change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_saves_updated_at
  BEFORE UPDATE ON saves
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS Helper: is_own_profile
-- ============================================
CREATE OR REPLACE FUNCTION is_own_profile(profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = profile_id;
END;
$$ LANGUAGE plpgsql STABLE;
