import { z } from "zod";

import { getPool } from "../database/ConexaoPostgres.js";
import { calcularHashApiKey, gerarApiKey } from "../utils/apiKey.js";

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
      const pool = getPool();

      // Uma colisão de prefixo é improvável, mas é tratada para preservar a unicidade.
      for (let tentativa = 0; tentativa < 3; tentativa += 1) {
        const { chave, prefixo } = gerarApiKey();
        const hash = calcularHashApiKey(chave);

        try {
          const { rows } = await pool.query(
            `insert into tenants (nome, api_key_prefix, api_key_hash)
             values ($1, $2, $3)
             returning id, nome, api_key_prefix, status, created_at`,
            [dados.data.nome, prefixo, hash]
          );

          return resp.status(201).json({
            tenant: rows[0],
            apiKey: chave,
            mensagem: "Guarde a API key agora: ela não poderá ser consultada novamente.",
          });
        } catch (error) {
          if (error.code !== "23505" || tentativa === 2) {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error("Erro ao criar tenant:", error);
      return resp.status(500).json({ mensagem: "Não foi possível criar o tenant." });
    }
  }
}

export default TenantsController;
