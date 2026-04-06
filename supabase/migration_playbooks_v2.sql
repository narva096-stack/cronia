-- Migration: playbooks v2
-- Correr en Supabase > SQL Editor

alter table playbooks add column if not exists objective text;
alter table playbooks add column if not exists when_to_use text;
alter table playbooks add column if not exists is_active boolean not null default true;
