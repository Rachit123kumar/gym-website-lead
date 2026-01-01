-- Create leads table
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gym_name text not null,
  email text not null,
  phone text,
  website text,
  city text,
  state text,
  notes text,
  email_status text default 'not_sent', -- not_sent, sent, replied, bounced
  follow_up_count integer default 0,
  last_updated timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  unique(user_id, email),
  unique(user_id, phone),
  unique(user_id, website)
);

-- Create email threads table
create table if not exists public.email_threads (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  thread_data jsonb default '[]', -- array of {from, to, subject, body, timestamp, type}
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.leads enable row level security;
alter table public.email_threads enable row level security;

-- Leads RLS Policies
create policy "leads_select_own"
  on public.leads for select
  using (auth.uid() = user_id);

create policy "leads_insert_own"
  on public.leads for insert
  with check (auth.uid() = user_id);

create policy "leads_update_own"
  on public.leads for update
  using (auth.uid() = user_id);

create policy "leads_delete_own"
  on public.leads for delete
  using (auth.uid() = user_id);

-- Email threads RLS Policies
create policy "email_threads_select_own"
  on public.email_threads for select
  using (
    exists (
      select 1 from public.leads
      where leads.id = email_threads.lead_id
      and leads.user_id = auth.uid()
    )
  );

create policy "email_threads_insert_own"
  on public.email_threads for insert
  with check (
    exists (
      select 1 from public.leads
      where leads.id = email_threads.lead_id
      and leads.user_id = auth.uid()
    )
  );

create policy "email_threads_update_own"
  on public.email_threads for update
  using (
    exists (
      select 1 from public.leads
      where leads.id = email_threads.lead_id
      and leads.user_id = auth.uid()
    )
  );

create policy "email_threads_delete_own"
  on public.email_threads for delete
  using (
    exists (
      select 1 from public.leads
      where leads.id = email_threads.lead_id
      and leads.user_id = auth.uid()
    )
  );
