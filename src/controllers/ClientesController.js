import ConexaoMySql from "../database/ConexaoMySql.js";

class ClientesController {
  async adicionar(req, resp) {
    try {
      const novoCliente = req.body;
      const idUsuario = req.headers["x-usuario"];
      console.log("ID do usuário logado:", idUsuario);
      console.log("Dados do novo cliente:", novoCliente);
      if (!novoCliente.nome || !novoCliente.email) {
        resp.status(400).send("Os campos nome e email são obrigatórios.");
        return;
      }
      const conexaoDB = await new ConexaoMySql().getConexao();
      const comandoSql =
        "INSERT INTO clientes (id, idUsuario, nome, dataNascimento, celular, email, cidade, foto ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      const [resultado] = await conexaoDB.execute(comandoSql, [
        crypto.randomUUID(),
        idUsuario,
        novoCliente.nome,
        novoCliente.dataNascimento || null,
        novoCliente.celular || null,
        novoCliente.email,
        novoCliente.cidade || null,
        novoCliente.foto || null,
      ]);

      resp.send(resultado);
    } catch (error) {
      console.error(error);
      if (error.code === "ER_DUP_ENTRY") {
        resp.status(400).send("Email já cadastrado.");
        return;
      }
      resp.status(500).send(error.message || "Erro ao adicionar cliente.");
    }
  }

  async listar(req, resp) {
    try {
      const idUsuarioLogado = req.headers["x-usuario"];
      const conexaoDB = await new ConexaoMySql().getConexao();

      const comandoSql =
        "SELECT * FROM clientes WHERE idUsuario = ? AND nome LIKE ?";

      const filtro = req.query.filtro || "";
      const [resultado] = await conexaoDB.execute(comandoSql, [
        idUsuarioLogado,
        `%${filtro}%`,
      ]);
      resp.send(resultado);
    } catch (error) {
      console.error(error);
      resp.status(500).send(error);
    }
  }

  async buscarPeloId(req, resp) {
    try {
      const idUsuarioLogado = req.headers["x-usuario"];

      const conexaoDB = await new ConexaoMySql().getConexao();
      const comandoSql =
        "select * from clientes where id = ? and idUsuario = ?";

      const idCliente = req.params.id;
      const [resultado] = await conexaoDB.execute(comandoSql, [
        idCliente,
        idUsuarioLogado,
      ]);
      resp.send(resultado[0]);
    } catch (error) {
      console.error(error);
      resp.status(500).send(error.message);
    }
  }

  async atualizar(req, resp) {
    try {
      const clienteEditar = req.body;
      const idUsuarioLogado = req.headers["x-usuario"];
      if (!clienteEditar.id || !clienteEditar.nome || !clienteEditar.email) {
        resp.status(400).send("Os campos id, nome e email são obrigatórios.");
        return;
      }

      const conexaoDB = await new ConexaoMySql().getConexao();

      const comandoSql =
        "update clientes set nome = ?, dataNascimento = ?, celular = ?, email = ?, cidade = ?, foto = ? where id = ? and idUsuario = ?";

      const [resultado] = await conexaoDB.execute(comandoSql, [
        clienteEditar.nome,
        clienteEditar.dataNascimento || null,
        clienteEditar.celular || null,
        clienteEditar.email,
        clienteEditar.cidade || null,
        clienteEditar.foto || null,
        clienteEditar.id,
        idUsuarioLogado,
      ]);

      resp.send(resultado);
    } catch (error) {
      resp.status(500).send(error);
    }
  }

  async excluir(req, resp) {
    try {
      const idUsuario = req.headers["x-usuario"];
      const conexaoDB = await new ConexaoMySql().getConexao();

      const comandoSql = "DELETE FROM clientes WHERE id = ? AND idUsuario = ?";
      const [resultado] = await conexaoDB.execute(comandoSql, [
        req.params.id,
        idUsuario,
      ]);

      resp.send(resultado);
    } catch (error) {
      resp.status(500).send(error);
    }
  }
}

export default ClientesController;
