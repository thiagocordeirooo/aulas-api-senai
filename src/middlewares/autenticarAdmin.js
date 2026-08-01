import { timingSafeEqual } from "node:crypto";

function segredosIguais(recebido, esperado) {
  const recebidoBuffer = Buffer.from(recebido || "");
  const esperadoBuffer = Buffer.from(esperado);

  return (
    recebidoBuffer.length === esperadoBuffer.length &&
    timingSafeEqual(recebidoBuffer, esperadoBuffer)
  );
}

export default function autenticarAdmin(req, resp, next) {
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    return resp.status(500).json({ mensagem: "Configuração administrativa indisponível." });
  }

  if (!segredosIguais(req.headers["x-admin-secret"], adminSecret)) {
    return resp.status(401).json({ mensagem: "Credencial administrativa inválida." });
  }

  return next();
}
