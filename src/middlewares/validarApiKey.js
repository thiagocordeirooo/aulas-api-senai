import { calcularHashApiKey } from "../utils/apiKey.js";
import { getPool } from "../database/ConexaoPostgres.js";

function obterPrefixo(chave) {
  const resultado = /^((ak_[a-f0-9]{8}))_[A-Za-z0-9_-]+$/.exec(chave);
  return resultado?.[1] || null;
}

export default async function validarApiKey(req, resp, next) {
  const chave = req.headers["x-api-key"];

  if (typeof chave !== "string") {
    return resp.status(401).json({ mensagem: "O cabeçalho X-API-Key é obrigatório." });
  }

  const prefixo = obterPrefixo(chave);
  if (!prefixo) {
    return resp.status(401).json({ mensagem: "API key inválida." });
  }

  try {
    const { rows } = await getPool().query(
      `select id, nome, status
       from tenants
       where api_key_prefix = $1 and api_key_hash = $2 and status = 'ativo'`,
      [prefixo, calcularHashApiKey(chave)]
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
