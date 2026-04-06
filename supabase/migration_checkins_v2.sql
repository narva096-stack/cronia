-- Migration: check_ins v2
-- Correr en Supabase > SQL Editor

alter table check_ins add column if not exists completed_main_action boolean;
alter table check_ins add column if not exists next_week_goal text;
