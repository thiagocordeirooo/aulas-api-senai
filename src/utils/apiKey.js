import { randomBytes } from "node:crypto";

/**
 * Gera uma API key aleatória de 32 bytes em formato hex (64 caracteres).
 * O valor gerado é armazenado diretamente no banco e entregue ao aluno;
 * não há prefixo nem hashing adicional.
 */
export function gerarApiKey() {
  return randomBytes(32).toString("hex");
}
