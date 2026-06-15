-- MigraTrack database schema
-- All data stored as JSONB for flexibility (same strategy as original Flutter app)

CREATE TABLE IF NOT EXISTS crises (
  id          text        PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data        jsonb       NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS treatment_schedules (
  id          text        PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data        jsonb       NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS treatment_logs (
  id          text        PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data        jsonb       NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_lists (
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  list_type   text        NOT NULL CHECK (list_type IN ('treatments','symptoms','triggers')),
  items       jsonb       NOT NULL DEFAULT '[]',
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, list_type)
);

-- RLS
ALTER TABLE crises             ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lists         ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own data only" ON crises              FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own data only" ON treatment_schedules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own data only" ON treatment_logs      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own data only" ON user_lists          FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS crises_user_updated ON crises(user_id, updated_at DESC);
