import cors from "cors";
import express from "express";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// Rotas de /usuarios
const listaUsuarios = [];
app.get("/usuarios", (req, res) => {
  res.send(listaUsuarios);
});
app.post("/usuarios", (req, res) => {
  listaUsuarios.push(req.body);
  res.status(201).send(req.body);
});
app.put("/usuarios", (req, res) => {
  res.send("Chamou o PUT!");
});
app.delete("/usuarios", (req, res) => {
  res.send("Chamou o DELETE!");
});

// Rotas /clientes
// app.get('')

const port = 3000;
app.listen(port, () => {
  console.log(`API está rodando na porta ${port}`);
});
