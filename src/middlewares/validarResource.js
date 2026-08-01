const resourceRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default function validarResource(req, resp, next) {
  if (!resourceRegex.test(req.params.resource)) {
    return resp.status(400).json({
      mensagem: "Resource inválido. Use somente slug em minúsculas, números e hífens.",
    });
  }

  return next();
}
