import { z } from "zod";

import { getPool } from "../database/ConexaoPostgres.js";
import { gerarApiKey } from "../utils/apiKey.js";

const criarTenantSchema = z.object({
  nome: z.string().trim().min(2).max(120),
});

class TenantsController {
  async adicionar(req, resp) {
    const dados = criarTenantSchema.safeParse(req.body);

    if (!dados.success) {
      return resp.status(400).json({
        mensagem: "Dados do tenant inválidos.",
        erros: dados.error.issues.map(({ path, message }) => ({ campo: path.join("."), message })),
      });
    }

    try {
      const apiKey = gerarApiKey();

      const { rows } = await getPool().query(
        `insert into tenants (nome, api_key_hash)
         values ($1, $2)
         returning id, nome, status, created_at`,
        [dados.data.nome, apiKey]
      );

      return resp.status(201).json({
        tenant: rows[0],
        apiKey,
        mensagem: "Guarde a API key agora: ela não poderá ser consultada novamente.",
      });
    } catch (error) {
      console.error("Erro ao criar tenant:", error);
      return resp.status(500).json({ mensagem: "Não foi possível criar o tenant." });
    }
  }
}

export default TenantsController;
