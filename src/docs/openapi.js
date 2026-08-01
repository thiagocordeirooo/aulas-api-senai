import swaggerJSDoc from "swagger-jsdoc";

const resourceParametro = {
  name: "resource",
  in: "path",
  required: true,
  schema: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
  description: "Nome da coleção em formato slug.",
};

const idParametro = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string", format: "uuid" },
};

const respostasErro = {
  "401": { description: "API key ausente, inválida ou revogada." },
  "400": { description: "Parâmetros ou payload inválidos." },
  "500": { description: "Erro interno." },
};

const documento = {
  type: "object",
  required: ["id", "dados", "createdAt", "updatedAt"],
  properties: {
    id: { type: "string", format: "uuid" },
    dados: { type: "object", additionalProperties: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

export default swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "API multi-aluno",
      version: "1.0.0",
      description: "CRUD genérico isolado por API key. Rotas administrativas não são públicas.",
    },
    servers: [{ url: "/" }],
    components: {
      securitySchemes: {
        ApiKeyAuth: { type: "apiKey", in: "header", name: "X-API-Key" },
      },
      schemas: { Documento: documento },
    },
    paths: {
      "/health": {
        get: { summary: "Verifica se a API está disponível", responses: { "200": { description: "API disponível" } } },
      },
      "/v1/{resource}": {
        get: {
          summary: "Lista documentos da resource",
          security: [{ ApiKeyAuth: [] }],
          parameters: [resourceParametro, { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } }, { name: "offset", in: "query", schema: { type: "integer", minimum: 0 } }],
          responses: {
            "200": {
              description: "Documentos do tenant",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      items: { type: "array", items: documento },
                      limit: { type: "integer" },
                      offset: { type: "integer" },
                    },
                  },
                },
              },
            },
            ...respostasErro,
          },
        },
        post: {
          summary: "Cria documento JSON livre",
          security: [{ ApiKeyAuth: [] }],
          parameters: [resourceParametro],
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", additionalProperties: true } } } },
          responses: { "201": { description: "Documento criado" }, ...respostasErro },
        },
      },
      "/v1/{resource}/{id}": {
        get: { summary: "Busca um documento", security: [{ ApiKeyAuth: [] }], parameters: [resourceParametro, idParametro], responses: { "200": { description: "Documento encontrado" }, "404": { description: "Documento não encontrado" }, ...respostasErro } },
        put: { summary: "Substitui os dados de um documento", security: [{ ApiKeyAuth: [] }], parameters: [resourceParametro, idParametro], requestBody: { required: true, content: { "application/json": { schema: { type: "object", additionalProperties: true } } } }, responses: { "200": { description: "Documento atualizado" }, "404": { description: "Documento não encontrado" }, ...respostasErro } },
        delete: { summary: "Remove um documento", security: [{ ApiKeyAuth: [] }], parameters: [resourceParametro, idParametro], responses: { "204": { description: "Documento removido" }, "404": { description: "Documento não encontrado" }, ...respostasErro } },
      },
    },
  },
  apis: [],
});
