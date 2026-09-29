-- AlterTable
ALTER TABLE "audit_log" ADD COLUMN     "audit_transaction_id" TEXT;

-- CreateTable
CREATE TABLE "audit_transaction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "procedure" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_audit_transaction_id_fkey" FOREIGN KEY ("audit_transaction_id") REFERENCES "audit_transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update trigger
CREATE or REPLACE FUNCTION if_modified_func()
RETURNS TRIGGER AS $$
DECLARE
    row_id_value TEXT := NULL;
BEGIN
    BEGIN
        row_id_value := CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id::text
            WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.id::text, OLD.id::text)
            WHEN TG_OP = 'INSERT' THEN NEW.id::text
            ELSE NULL
        END;
    EXCEPTION
        WHEN undefined_column THEN
        BEGIN
            row_id_value:= CASE
                WHEN TG_OP = 'DELETE' THEN OLD.slug::text
                WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.slug::text, OLD.slug::text)
                WHEN TG_OP = 'INSERT' THEN NEW.slug::text
                ELSE NULL
            END;
    EXCEPTION
        WHEN undefined_column THEN
        BEGIN
            row_id_value := NULL;
            END;
        END;
    END;

    INSERT INTO audit_log(
        id,
        table_name,
        operation,
        row_id,
        user_id,
        created_at,
        row_data,
        transaction_id,
        audit_transaction_id
    )
    VALUES (
        gen_random_uuid(),
        TG_TABLE_NAME,
        TG_OP,
        row_id_value,
        NULLIF(NULLIF(current_setting('app.current_user_id', true),'SYSTEM'), '')::text,
        now(),
        (CASE
            WHEN TG_OP = 'DELETE' THEN jsonb_build_object('deleted',to_jsonb(OLD))
            WHEN TG_OP = 'INSERT' THEN jsonb_build_object('inserted',to_jsonb(NEW))
            WHEN TG_OP = 'UPDATE' THEN (
              COALESCE(
              (SELECT jsonb_object_agg(key,jsonb_build_object('old',old_val,'new',new_val))
              FROM (
                SELECT o.key, o.value AS old_val, n.value AS new_val
                FROM jsonb_each_text(to_jsonb(OLD)) AS o(key, value)
                JOIN jsonb_each_text(to_jsonb(NEW)) AS n(key, value) USING (key)
                WHERE o.value IS DISTINCT FROM n.value
              ) diffs),
              '{}' :: jsonb
            )
            )
            ELSE '{}' :: jsonb
        END),
        pg_current_xact_id()::text::bigint,
        NULLIF(NULLIF(current_setting('app.audit_transaction_id', true),''), '')
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;
