-- CreateTable
CREATE TABLE "interest_group_comment" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "body" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "interest_group_id" TEXT NOT NULL,
    "parent_id" TEXT,

    CONSTRAINT "interest_group_comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interest_group_comment_author_id_idx" ON "interest_group_comment"("author_id");

-- CreateIndex
CREATE INDEX "interest_group_comment_interest_group_id_idx" ON "interest_group_comment"("interest_group_id");

-- CreateIndex
CREATE INDEX "interest_group_comment_parent_id_idx" ON "interest_group_comment"("parent_id");

-- AddForeignKey
ALTER TABLE "interest_group_comment" ADD CONSTRAINT "interest_group_comment_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "ow_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_group_comment" ADD CONSTRAINT "interest_group_comment_interest_group_id_fkey" FOREIGN KEY ("interest_group_id") REFERENCES "group"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_group_comment" ADD CONSTRAINT "interest_group_comment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "interest_group_comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add audit log triggers
CREATE TRIGGER interest_group_comment_audit
AFTER INSERT OR UPDATE OR DELETE ON interest_group_comment
FOR EACH ROW EXECUTE FUNCTION if_modified_func();
