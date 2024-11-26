import cors from "cors";
import express from "express";
import UsuariosController from "./controllers/UsuariosController.js";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// Rotas de /usuarios
const _usuariosController = new UsuariosController();

app.get("/usuarios", _usuariosController.listar);
app.post("/usuarios", _usuariosController.adicionar);
app.put("/usuarios", _usuariosController.atualizar);
app.delete("/usuarios/:id", _usuariosController.excluir);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API está rodando na porta ${port}`);
});
