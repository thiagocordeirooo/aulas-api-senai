import pg from "pg";

const { Pool } = pg;

let pool;

function obterConfiguracao() {
  if (!process.env.DATABASE_URL) {
    throw new Error("A variável de ambiente DATABASE_URL é obrigatória.");
  }

  return {
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: false }
        : false,
  };
}

export function getPool() {
  if (!pool) {
    pool = new Pool(obterConfiguracao());
    pool.on("error", (error) => {
      console.error("Erro inesperado no pool PostgreSQL:", error);
    });
  }

  return pool;
}

export async function executarNoTenant(tenantId, operacao) {
  const cliente = await getPool().connect();

  try {
    await cliente.query("BEGIN");
    await cliente.query("SELECT set_config('app.tenant_id', $1, true)", [tenantId]);
    const resultado = await operacao(cliente);
    await cliente.query("COMMIT");
    return resultado;
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
}
