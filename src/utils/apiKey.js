import { createHash, randomBytes } from "node:crypto";

export function gerarApiKey() {
  const prefixo = `ak_${randomBytes(4).toString("hex")}`;
  const segredo = randomBytes(32).toString("base64url");

  return {
    prefixo,
    chave: `${prefixo}_${segredo}`,
  };
}

export function calcularHashApiKey(chave) {
  const pepper = process.env.API_KEY_PEPPER;

  if (!pepper) {
    throw new Error("A variável de ambiente API_KEY_PEPPER é obrigatória.");
  }

  return createHash("sha256").update(`${pepper}:${chave}`).digest("hex");
}
