# aulas-api-senai

## Autenticação JWT

O Node 24 carrega o arquivo `.env` nativamente pelos scripts do projeto; não é
necessário instalar `dotenv`. Crie-o a partir de `.env.example` e informe uma
chave longa, aleatória e mantida em segredo em `JWT_SECRET`.

```bash
cp .env.example .env
npm start
```

Use `npm run dev` para reiniciar automaticamente ao alterar arquivos e `npm run
debug` para o mesmo fluxo com o inspetor do Node disponível em
`ws://127.0.0.1:9229`.

## Preparação para API multi-aluno

A próxima versão usa PostgreSQL (Supabase). Configure `DATABASE_URL`,
`DATABASE_SSL`, `ADMIN_SECRET` e `API_KEY_PEPPER` no `.env`. As dependências de
Postgres, validação, bcrypt, rate limiting e Swagger já estão preparadas; as
rotas MySQL atuais permanecem temporariamente disponíveis durante a migração.

Faça login em `POST /login` enviando `email` e `senha`. A resposta contém o
usuário e um `token` JWT. Envie o token em todas as rotas privadas:

```http
Authorization: Bearer <token>
```

O token expira em uma hora por padrão. Configure `JWT_EXPIRES_IN` (por exemplo,
`8h`) para alterar esse período. As únicas rotas públicas são `POST /login` e
`POST /usuarios`.
