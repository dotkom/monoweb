-- CreateIndex
CREATE INDEX "idx_attendance_pool_attendance_id" ON "attendance_pool"("attendance_id");

-- CreateIndex
CREATE INDEX "idx_event_hosting_group_event_id" ON "event_hosting_group"("event_id");

-- CreateIndex
CREATE INDEX "idx_membership_user_id" ON "membership"("user_id");
