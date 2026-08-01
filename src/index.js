import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";

import UsuariosController from "./controllers/UsuariosController.js";
import AutenticacaoController from "./controllers/AutenticacaoController.js";
import ClientesController from "./controllers/ClientesController.js";
import autenticar from "./middlewares/autenticar.js";
import autenticarAdmin from "./middlewares/autenticarAdmin.js";
import TenantsController from "./controllers/TenantsController.js";
import DocumentosController from "./controllers/DocumentosController.js";
import validarApiKey from "./middlewares/validarApiKey.js";
import validarResource from "./middlewares/validarResource.js";
import { limiteAdmin, limiteLogin } from "./middlewares/rateLimits.js";
import openapi from "./docs/openapi.js";

const app = express();
app.use(express.json());
const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: corsOrigin === "*" ? "*" : corsOrigin.split(",").map((origem) => origem.trim()) }));

const _usuariosController = new UsuariosController();
const _autenticacaoController = new AutenticacaoController();
const _clientesController = new ClientesController();
const _tenantsController = new TenantsController();
const _documentosController = new DocumentosController();

// rotas públicas
app.get("/health", (_req, resp) => resp.status(200).json({ status: "ok" }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi, { explorer: true }));
app.post("/login", limiteLogin, _autenticacaoController.login);
app.post("/usuarios", _usuariosController.adicionar);

// Rota operacional; não deve ser exposta na documentação dos alunos.
app.post("/admin/tenants", limiteAdmin, autenticarAdmin, _tenantsController.adicionar);

// API genérica multi-aluno: a API key identifica e isola o tenant.
app.use("/v1", validarApiKey);
app.get("/v1/:resource", validarResource, _documentosController.listar);
app.post("/v1/:resource", validarResource, _documentosController.adicionar);
app.get("/v1/:resource/:id", validarResource, _documentosController.buscarPeloId);
app.put("/v1/:resource/:id", validarResource, _documentosController.atualizar);
app.delete("/v1/:resource/:id", validarResource, _documentosController.excluir);

// Middleware de verificação do token JWT para todas as rotas seguintes.
app.use(autenticar);

// rotas privadas
app.get("/usuarios", _usuariosController.listar);
app.put("/usuarios", _usuariosController.atualizar);
app.delete("/usuarios/:id", _usuariosController.excluir);

// nova rota para /me
app.get("/me", (req, resp) => {
  return resp.json({ user: req.user });
});

// rotas de clientes
app.get("/clientes", _clientesController.listar);
app.get("/clientes/:id", _clientesController.buscarPeloId);
app.post("/clientes", _clientesController.adicionar);

app.put("/clientes", _clientesController.atualizar);
app.delete("/clientes/:id", _clientesController.excluir);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API está rodando na porta ${port}`);
});
