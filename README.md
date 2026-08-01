# API multi-aluno

API Express para armazenar documentos JSON por aluno. Cada aluno recebe uma API
key própria: ela identifica o tenant e impede que seus dados se misturem aos de
outra pessoa.

## Para o aluno: como usar

Com a API local em execução, a URL base é:

```text
http://localhost:3000
```

O professor fornece uma API key no momento do cadastro. Guarde-a como uma
senha: ela é mostrada somente uma vez e deve ser enviada em todas as chamadas
para `/v1`.

```http
X-API-Key: ak_12345678_sua-chave-fornecida-pelo-professor
```

Você pode consultar a interface interativa em [http://localhost:3000/docs](http://localhost:3000/docs).

### Collections (resources)

Uma *resource* é o nome da sua coleção. Ela não precisa ser criada antes do
primeiro `POST`; basta escolher um slug em minúsculas, com números e hífens.

Exemplos válidos: `tarefas`, `meus-filmes`, `produtos2026`.

Exemplos inválidos: `Meus Filmes`, `meus_filmes`, `meus/filmes`.

### Criar um documento

Envie um objeto JSON livre. A API cria um UUID e registra datas
automaticamente.

```bash
curl -X POST http://localhost:3000/v1/tarefas \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: SUA_API_KEY' \
  -d '{
    "titulo": "Estudar API",
    "concluida": false,
    "prioridade": 1
  }'
```

Resposta (`201 Created`):

```json
{
  "item": {
    "id": "b9191c1a-41d9-4a9a-b978-67e6e6e8e0f8",
    "dados": {
      "titulo": "Estudar API",
      "concluida": false,
      "prioridade": 1
    },
    "createdAt": "2026-08-01T15:00:00.000Z",
    "updatedAt": "2026-08-01T15:00:00.000Z"
  }
}
```

Não envie campos reservados pela API, mesmo dentro de objetos aninhados:
`id`, `tenantId`, `tenant_id`, `usuarioId`, `usuario_id`, `createdAt`,
`created_at`, `updatedAt` e `updated_at`.

### Listar documentos

```bash
curl 'http://localhost:3000/v1/tarefas?limit=20&offset=0' \
  -H 'X-API-Key: SUA_API_KEY'
```

`limit` é opcional (padrão 20, máximo 100) e `offset` permite paginar.

### Buscar um documento

```bash
curl http://localhost:3000/v1/tarefas/SEU_UUID \
  -H 'X-API-Key: SUA_API_KEY'
```

### Atualizar um documento

`PUT` substitui todo o objeto em `dados`. Envie novamente todos os campos que
devem continuar no documento.

```bash
curl -X PUT http://localhost:3000/v1/tarefas/SEU_UUID \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: SUA_API_KEY' \
  -d '{
    "titulo": "Estudar API e testar",
    "concluida": true,
    "prioridade": 1
  }'
```

### Remover um documento

```bash
curl -X DELETE http://localhost:3000/v1/tarefas/SEU_UUID \
  -H 'X-API-Key: SUA_API_KEY'
```

A remoção bem-sucedida retorna `204 No Content`.

### Erros comuns

| Status | Significado |
| --- | --- |
| `400` | Resource, UUID ou payload inválido. |
| `401` | `X-API-Key` ausente, inválida ou revogada. |
| `404` | O documento não existe nessa resource ou não pertence ao seu tenant. |
| `429` | Muitas tentativas em uma rota limitada; aguarde alguns minutos. |

## Para executar o projeto

O projeto requer Node.js 24 ou superior. O Node carrega `.env` nativamente;
não é necessário instalar `dotenv`.

```bash
npm install
cp .env.example .env
npm run dev
```

Configure no `.env` a conexão do Supabase (`DATABASE_URL` e
`DATABASE_SSL=true`), além de `ADMIN_SECRET` e `API_KEY_PEPPER`. Veja
[.env.example](.env.example) para todas as variáveis.

Scripts disponíveis:

| Comando | Uso |
| --- | --- |
| `npm start` | Inicia a API. |
| `npm run dev` | Inicia com recarga automática pelo `node --watch`. |
| `npm run debug` | Inicia em watch e expõe o inspector do Node na porta 9229. |

Antes de usar `/v1`, aplique a migration
[001_create_multi_tenant_schema.sql](migrations/001_create_multi_tenant_schema.sql)
no Supabase. As instruções estão em [migrations/README.md](migrations/README.md).

`GET /health` retorna o estado da API e pode ser usado no health check do deploy.

## Rotas administrativas e legadas

`POST /admin/tenants` é uma rota exclusiva do professor/admin e exige
`X-Admin-Secret`; ela cria o tenant e devolve a API key somente nessa resposta.
Ela não aparece no Swagger dos alunos.

As rotas antigas de usuários, clientes e JWT permanecem no projeto durante a
migração pedagógica. A API recomendada para os alunos nesta etapa é somente
`/v1/:resource` com `X-API-Key`.
