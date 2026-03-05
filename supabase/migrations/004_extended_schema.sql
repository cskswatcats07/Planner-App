-- Migration 004 — Module Progress, Push Tokens, Wearables

CREATE TABLE IF NOT EXISTS module_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_slug  TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'not_started'
               CHECK (status IN ('not_started','in_progress','completed')),
  score        NUMERIC(5,2),
  completed_at TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, module_slug)
);

ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_module_progress" ON module_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS push_tokens (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token     TEXT NOT NULL,
  platform  TEXT NOT NULL CHECK (platform IN ('ios','android','web')),
  UNIQUE (user_id, token)
);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_push_tokens" ON push_tokens
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

