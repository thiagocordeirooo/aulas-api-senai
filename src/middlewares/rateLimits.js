import { rateLimit } from "express-rate-limit";

function limiteDoAmbiente(nome, padrao) {
  const valor = Number.parseInt(process.env[nome], 10);
  return Number.isInteger(valor) && valor > 0 ? valor : padrao;
}

function criarLimitador(max) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: max,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { mensagem: "Muitas tentativas. Tente novamente mais tarde." },
  });
}

export const limiteLogin = criarLimitador(limiteDoAmbiente("LOGIN_RATE_LIMIT_MAX", 10));
export const limiteAdmin = criarLimitador(limiteDoAmbiente("ADMIN_RATE_LIMIT_MAX", 5));
