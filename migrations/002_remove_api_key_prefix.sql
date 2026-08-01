-- Remove a coluna api_key_prefix da tabela tenants.
-- A partir desta migration a API key enviada pelo aluno é o próprio valor
-- armazenado em api_key_hash; não há prefixo nem hashing adicional.

alter table public.tenants
  drop column if exists api_key_prefix;
