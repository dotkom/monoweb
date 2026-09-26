-- CreateIndex
CREATE INDEX "group_membership_group_id_idx" ON "group_membership"("group_id");

-- CreateIndex
CREATE INDEX "group_membership_user_id_idx" ON "group_membership"("user_id");

-- CreateIndex
CREATE INDEX "group_membership_role_role_id_idx" ON "group_membership_role"("role_id");

-- CreateIndex
CREATE INDEX "attendance_pool_task_id_idx" ON "attendance_pool"("task_id");

-- CreateIndex
CREATE INDEX "attendee_user_id_idx" ON "attendee"("user_id");

-- CreateIndex
CREATE INDEX "attendee_attendance_pool_id_idx" ON "attendee"("attendance_pool_id");

-- CreateIndex
CREATE INDEX "attendee_payment_refunded_by_id_idx" ON "attendee"("payment_refunded_by_id");

-- CreateIndex
CREATE INDEX "event_attendance_id_idx" ON "event"("attendance_id");

-- CreateIndex
CREATE INDEX "event_parent_id_idx" ON "event"("parent_id");

-- CreateIndex
CREATE INDEX "event_company_company_id_idx" ON "event_company"("company_id");

-- CreateIndex
CREATE INDEX "mark_group_group_id_idx" ON "mark_group"("group_id");

-- CreateIndex
CREATE INDEX "personal_mark_user_id_idx" ON "personal_mark"("user_id");

-- CreateIndex
CREATE INDEX "personal_mark_given_by_id_idx" ON "personal_mark"("given_by_id");

-- CreateIndex
CREATE INDEX "job_listing_company_id_idx" ON "job_listing"("company_id");

-- CreateIndex
CREATE INDEX "job_listing_location_job_listing_id_idx" ON "job_listing_location"("job_listing_id");

-- CreateIndex
CREATE INDEX "article_tag_link_tag_name_idx" ON "article_tag_link"("tag_name");

-- CreateIndex
CREATE INDEX "task_recurring_task_id_idx" ON "task"("recurring_task_id");

-- CreateIndex
CREATE INDEX "feedback_question_feedback_form_id_idx" ON "feedback_question"("feedback_form_id");

-- CreateIndex
CREATE INDEX "feedback_question_answer_question_id_idx" ON "feedback_question_answer"("question_id");

-- CreateIndex
CREATE INDEX "feedback_question_answer_form_answer_id_idx" ON "feedback_question_answer"("form_answer_id");

-- CreateIndex
CREATE INDEX "feedback_answer_option_link_feedback_question_answer_id_idx" ON "feedback_answer_option_link"("feedback_question_answer_id");

-- CreateIndex
CREATE INDEX "feedback_form_answer_feedback_form_id_idx" ON "feedback_form_answer"("feedback_form_id");

-- CreateIndex
CREATE INDEX "audit_log_user_id_idx" ON "audit_log"("user_id");

-- CreateIndex
CREATE INDEX "audit_log_audit_transaction_id_idx" ON "audit_log"("audit_transaction_id");

-- CreateIndex
CREATE INDEX "deregister_reason_user_id_idx" ON "deregister_reason"("user_id");

-- CreateIndex
CREATE INDEX "deregister_reason_event_id_idx" ON "deregister_reason"("event_id");

-- CreateIndex
CREATE INDEX "notification_actor_group_id_idx" ON "notification"("actor_group_id");

-- CreateIndex
CREATE INDEX "notification_created_by_id_idx" ON "notification"("created_by_id");

-- CreateIndex
CREATE INDEX "notification_last_updated_by_id_idx" ON "notification"("last_updated_by_id");

-- CreateIndex
CREATE INDEX "notification_task_id_idx" ON "notification"("task_id");

-- CreateIndex
CREATE INDEX "contestant_user_id_idx" ON "contestant"("user_id");

-- CreateIndex
CREATE INDEX "user_flag_link_user_id_idx" ON "user_flag_link"("user_id");

-- CreateIndex
CREATE INDEX "user_flag_link_user_flag_id_idx" ON "user_flag_link"("user_flag_id");
