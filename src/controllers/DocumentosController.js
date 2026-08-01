import { z } from "zod";

import { executarNoTenant } from "../database/ConexaoPostgres.js";

const uuidSchema = z.string().uuid();
const payloadSchema = z.record(z.string(), z.unknown());
const camposInternos = new Set([
  "id",
  "tenant_id",
  "tenantId",
  "usuario_id",
  "usuarioId",
  "created_at",
  "createdAt",
  "updated_at",
  "updatedAt",
]);

function possuiCampoInterno(valor) {
  if (Array.isArray(valor)) {
    return valor.some(possuiCampoInterno);
  }

  if (!valor || typeof valor !== "object") {
    return false;
  }

  return Object.entries(valor).some(
    ([chave, conteudo]) => camposInternos.has(chave) || possuiCampoInterno(conteudo)
  );
}

function validarPayload(req, resp) {
  const resultado = payloadSchema.safeParse(req.body);

  if (!resultado.success || Array.isArray(req.body) || possuiCampoInterno(resultado.data)) {
    resp.status(400).json({
      mensagem: "Payload inválido ou contém campos internos não permitidos.",
    });
    return null;
  }

  return resultado.data;
}

function validarId(id, resp) {
  if (!uuidSchema.safeParse(id).success) {
    resp.status(400).json({ mensagem: "ID inválido." });
    return false;
  }

  return true;
}

function formatarDocumento(documento) {
  return {
    id: documento.id,
    dados: documento.dados,
    createdAt: documento.created_at,
    updatedAt: documento.updated_at,
  };
}

class DocumentosController {
  async listar(req, resp) {
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const offset = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0);

    try {
      const { rows } = await executarNoTenant(req.tenant.id, (cliente) =>
        cliente.query(
          `select id, dados, created_at, updated_at
           from documentos
           where tenant_id = $1 and resource = $2
           order by created_at desc
           limit $3 offset $4`,
          [req.tenant.id, req.params.resource, limit, offset]
        )
      );

      return resp.json({ items: rows.map(formatarDocumento), limit, offset });
    } catch (error) {
      console.error("Erro ao listar documentos:", error);
      return resp.status(500).json({ mensagem: "Não foi possível listar os documentos." });
    }
  }

  async adicionar(req, resp) {
    const payload = validarPayload(req, resp);
    if (!payload) return;

    try {
      const { rows } = await executarNoTenant(req.tenant.id, (cliente) =>
        cliente.query(
          `insert into documentos (tenant_id, resource, dados)
           values ($1, $2, $3)
           returning id, dados, created_at, updated_at`,
          [req.tenant.id, req.params.resource, payload]
        )
      );

      return resp.status(201).json({ item: formatarDocumento(rows[0]) });
    } catch (error) {
      console.error("Erro ao criar documento:", error);
      return resp.status(500).json({ mensagem: "Não foi possível criar o documento." });
    }
  }

  async buscarPeloId(req, resp) {
    if (!validarId(req.params.id, resp)) return;

    try {
      const { rows } = await executarNoTenant(req.tenant.id, (cliente) =>
        cliente.query(
          `select id, dados, created_at, updated_at
           from documentos
           where tenant_id = $1 and resource = $2 and id = $3`,
          [req.tenant.id, req.params.resource, req.params.id]
        )
      );

      if (!rows[0]) return resp.status(404).json({ mensagem: "Documento não encontrado." });
      return resp.json({ item: formatarDocumento(rows[0]) });
    } catch (error) {
      console.error("Erro ao buscar documento:", error);
      return resp.status(500).json({ mensagem: "Não foi possível buscar o documento." });
    }
  }

  async atualizar(req, resp) {
    if (!validarId(req.params.id, resp)) return;
    const payload = validarPayload(req, resp);
    if (!payload) return;

    try {
      const { rows } = await executarNoTenant(req.tenant.id, (cliente) =>
        cliente.query(
          `update documentos
           set dados = $4
           where tenant_id = $1 and resource = $2 and id = $3
           returning id, dados, created_at, updated_at`,
          [req.tenant.id, req.params.resource, req.params.id, payload]
        )
      );

      if (!rows[0]) return resp.status(404).json({ mensagem: "Documento não encontrado." });
      return resp.json({ item: formatarDocumento(rows[0]) });
    } catch (error) {
      console.error("Erro ao atualizar documento:", error);
      return resp.status(500).json({ mensagem: "Não foi possível atualizar o documento." });
    }
  }

  async excluir(req, resp) {
    if (!validarId(req.params.id, resp)) return;

    try {
      const { rowCount } = await executarNoTenant(req.tenant.id, (cliente) =>
        cliente.query(
          `delete from documentos
           where tenant_id = $1 and resource = $2 and id = $3`,
          [req.tenant.id, req.params.resource, req.params.id]
        )
      );

      if (rowCount === 0) return resp.status(404).json({ mensagem: "Documento não encontrado." });
      return resp.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir documento:", error);
      return resp.status(500).json({ mensagem: "Não foi possível excluir o documento." });
    }
  }
}

export default DocumentosController;
