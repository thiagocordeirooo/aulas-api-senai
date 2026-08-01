import cors from "cors";
import express from "express";

import UsuariosController from "./controllers/UsuariosController.js";
import AutenticacaoController from "./controllers/AutenticacaoController.js";
import ClientesController from "./controllers/ClientesController.js";
import autenticar from "./middlewares/autenticar.js";
import autenticarAdmin from "./middlewares/autenticarAdmin.js";
import TenantsController from "./controllers/TenantsController.js";
import DocumentosController from "./controllers/DocumentosController.js";
import validarApiKey from "./middlewares/validarApiKey.js";
import validarResource from "./middlewares/validarResource.js";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const _usuariosController = new UsuariosController();
const _autenticacaoController = new AutenticacaoController();
const _clientesController = new ClientesController();
const _tenantsController = new TenantsController();
const _documentosController = new DocumentosController();

// rotas públicas
app.post("/login", _autenticacaoController.login);
app.post("/usuarios", _usuariosController.adicionar);

// Rota operacional; não deve ser exposta na documentação dos alunos.
app.post("/admin/tenants", autenticarAdmin, _tenantsController.adicionar);

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
