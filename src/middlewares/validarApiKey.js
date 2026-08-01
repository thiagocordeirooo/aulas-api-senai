import { getPool } from "../database/ConexaoPostgres.js";

export default async function validarApiKey(req, resp, next) {
  const chave = req.headers["x-api-key"];

  if (typeof chave !== "string" || chave.trim() === "") {
    return resp.status(401).json({ mensagem: "O cabeçalho X-API-Key é obrigatório." });
  }

  try {
    const { rows } = await getPool().query(
      `select id, nome, status
       from tenants
       where api_key_hash = $1 and status = 'ativo'`,
      [chave.trim()]
    );

    if (rows.length === 0) {
      return resp.status(401).json({ mensagem: "API key inválida ou revogada." });
    }

    req.tenant = rows[0];
    return next();
  } catch (error) {
    console.error("Erro ao validar API key:", error);
    return resp.status(500).json({ mensagem: "Não foi possível validar a API key." });
  }
}
