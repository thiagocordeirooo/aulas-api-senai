import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("A variável de ambiente JWT_SECRET é obrigatória.");
}

export default function autenticar(req, resp, next) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return resp.status(401).json({ mensagem: "Token de autenticação não informado." });
  }

  const [tipo, token] = authorization.split(" ");
  if (tipo !== "Bearer" || !token) {
    return resp
      .status(401)
      .json({ mensagem: "Use o cabeçalho Authorization: Bearer <token>." });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return resp.status(401).json({ mensagem: "Token inválido ou expirado." });
  }
}
