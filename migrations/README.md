# Migrations do Supabase

As migrations são aplicadas em ordem numérica e nunca devem ser editadas após
serem executadas em um ambiente compartilhado.

## Supabase CLI

Com o projeto Supabase vinculado e a CLI autenticada:

```bash
supabase db push
```

Para um banco local, execute `supabase start` antes. Copie as migrations para
`supabase/migrations` se o repositório passar a ser gerenciado diretamente pela
CLI do Supabase; enquanto isso, a pasta atual é a fonte versionada do SQL.

## SQL Editor

No painel do Supabase, abra **SQL Editor**, execute o conteúdo de cada arquivo
em ordem e registre a versão aplicada no controle de deploy da equipe.

Após aplicar `001_create_multi_tenant_schema.sql`, configure `DATABASE_URL` da
API com uma credencial de servidor. O backend deve definir `app.tenant_id` nas
transações de rotas de aluno para que as policies de RLS isolem os dados.

A migration `002_remove_api_key_prefix.sql` remove a coluna `api_key_prefix`
da tabela `tenants`. Aplique-a logo após a `001` em ambientes novos, ou
separadamente em ambientes já provisionados.
