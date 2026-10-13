import type { DBHandle } from "@dotkomonline/db"

export async function withAuditContext(
  handle: DBHandle,
  options: { path: string; procedure: string; userId?: string | null }
) {
  if (options.userId) {
    // We use a PostgreSQL configuration parameter, isolated to the current transaction to tell which user is

    // performing a change. Additionally, we have a PostgreSQL trigger on most tables to insert entries into the
    // `audit_log` table upon change. This trigger reads the configuration parameter.
    //
    // See https://www.postgresql.org/docs/9.3/functions-admin.html for details
    //
    // The PostgreSQL trigger is found inside the migrations folder in /packages/db.
    await handle.$executeRaw`SELECT set_config('app.current_user_id', ${options.userId}, true)`
  }

  // Create an audit event that all subsequent audit log entries will be connected to.
  // `options.path` is used as a temporary name as we don't know the real name until after the procedure has finished.
  const auditTransaction = await handle.auditTransaction.create({
    data: { name: options.path, procedure: options.procedure },
  })
  await handle.$executeRaw`SELECT set_config('app.audit_transaction_id', ${auditTransaction.id}, true)`

  return {
    auditTransactionId: auditTransaction.id,
    async setName(name: string) {
      await handle.auditTransaction.update({
        where: { id: auditTransaction.id },
        data: { name },
      })
    },
  }
}
