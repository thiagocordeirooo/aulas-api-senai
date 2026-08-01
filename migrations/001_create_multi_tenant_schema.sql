-- API multi-aluno: schema inicial para PostgreSQL/Supabase.
-- Aplique esta migration antes de iniciar as rotas /v1.

create extension if not exists pgcrypto;

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  nome varchar(120) not null,
  api_key_prefix varchar(16) not null unique,
  api_key_hash char(64) not null unique,
  status varchar(16) not null default 'ativo'
    check (status in ('ativo', 'revogado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.usuarios (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  nome varchar(150) not null,
  email varchar(254) not null,
  senha_hash varchar(255) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, email)
);

create table public.documentos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  usuario_id uuid references public.usuarios(id) on delete cascade,
  resource varchar(63) not null
    check (resource ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  dados jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index documentos_tenant_resource_created_at_idx
  on public.documentos (tenant_id, resource, created_at desc);
create index documentos_tenant_id_idx on public.documentos (tenant_id, id);
create index documentos_usuario_id_idx on public.documentos (usuario_id, id);
create index usuarios_tenant_id_idx on public.usuarios (tenant_id, id);

create or replace function public.atualizar_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tenants_atualizar_updated_at
before update on public.tenants
for each row execute function public.atualizar_updated_at();

create trigger usuarios_atualizar_updated_at
before update on public.usuarios
for each row execute function public.atualizar_updated_at();

create trigger documentos_atualizar_updated_at
before update on public.documentos
for each row execute function public.atualizar_updated_at();

-- A API define app.tenant_id por transação antes de consultar recursos do aluno.
-- O papel de administração/migration não deve receber essa variável.
alter table public.usuarios enable row level security;
alter table public.documentos enable row level security;

create policy usuarios_isolados_por_tenant on public.usuarios
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid)
  with check (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

create policy documentos_isolados_por_tenant on public.documentos
  using (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid)
  with check (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
