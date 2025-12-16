-- 1. Membership
ALTER TABLE "membership" RENAME COLUMN "userId" TO "user_id";

-- 2. User (ow_user)
ALTER TABLE "ow_user" RENAME COLUMN "profileSlug" TO "username";
ALTER TABLE "ow_user" RENAME COLUMN "imageUrl" TO "image_url";
ALTER TABLE "ow_user" RENAME COLUMN "dietaryRestrictions" TO "dietary_restrictions";
ALTER TABLE "ow_user" RENAME COLUMN "ntnuUsername" TO "ntnu_username";
ALTER TABLE "ow_user" RENAME COLUMN "workspaceUserId" TO "workspace_user_id";
ALTER TABLE "ow_user" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "ow_user" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "ow_user" RENAME COLUMN "privacyPermissionsId" TO "privacy_permissions_id";
ALTER TABLE "ow_user" RENAME COLUMN "notificationPermissionsId" TO "notification_permissions_id";

-- 3. Company
ALTER TABLE "company" RENAME COLUMN "imageUrl" TO "image_url";
ALTER TABLE "company" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "company" RENAME COLUMN "updatedAt" TO "updated_at";

-- 4. Group
ALTER TABLE "group" RENAME COLUMN "shortDescription" TO "short_description";
ALTER TABLE "group" RENAME COLUMN "imageUrl" TO "image_url";
ALTER TABLE "group" RENAME COLUMN "contactUrl" TO "contact_url";
ALTER TABLE "group" RENAME COLUMN "showLeaderAsContact" TO "show_leader_as_contact";
ALTER TABLE "group" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "group" RENAME COLUMN "deactivatedAt" TO "deactivated_at";
ALTER TABLE "group" RENAME COLUMN "workspaceGroupId" TO "workspace_group_id";
ALTER TABLE "group" RENAME COLUMN "memberVisibility" TO "member_visibility";
ALTER TABLE "group" RENAME COLUMN "recruitmentMethod" TO "recruitment_method";

-- 5. GroupMembership
ALTER TABLE "group_membership" RENAME COLUMN "groupId" TO "group_id";
ALTER TABLE "group_membership" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "group_membership" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "group_membership" RENAME COLUMN "updatedAt" TO "updated_at";

-- 6. GroupMembershipRole
ALTER TABLE "group_membership_role" RENAME COLUMN "membershipId" TO "membership_id";
ALTER TABLE "group_membership_role" RENAME COLUMN "roleId" TO "role_id";

-- 7. GroupRole
ALTER TABLE "group_role" RENAME COLUMN "groupId" TO "group_id";

-- 8. Attendance
ALTER TABLE "attendance" RENAME COLUMN "registerStart" TO "register_start";
ALTER TABLE "attendance" RENAME COLUMN "registerEnd" TO "register_end";
ALTER TABLE "attendance" RENAME COLUMN "deregisterDeadline" TO "deregister_deadline";
ALTER TABLE "attendance" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "attendance" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "attendance" RENAME COLUMN "attendancePrice" TO "attendance_price";

-- 9. AttendancePool
ALTER TABLE "attendance_pool" RENAME COLUMN "mergeDelayHours" TO "merge_delay_hours";
ALTER TABLE "attendance_pool" RENAME COLUMN "yearCriteria" TO "year_criteria";
ALTER TABLE "attendance_pool" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "attendance_pool" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "attendance_pool" RENAME COLUMN "attendanceId" TO "attendance_id";
ALTER TABLE "attendance_pool" RENAME COLUMN "taskId" TO "task_id";

-- 10. Attendee
ALTER TABLE "attendee" RENAME COLUMN "attendanceId" TO "attendance_id";
ALTER TABLE "attendee" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "attendee" RENAME COLUMN "userGrade" TO "user_grade";
ALTER TABLE "attendee" RENAME COLUMN "attendancePoolId" TO "attendance_pool_id";
ALTER TABLE "attendee" RENAME COLUMN "earliestReservationAt" TO "earliest_reservation_at";
ALTER TABLE "attendee" RENAME COLUMN "attendedAt" TO "attended_at";
ALTER TABLE "attendee" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "attendee" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "attendee" RENAME COLUMN "paymentDeadline" TO "payment_deadline";
ALTER TABLE "attendee" RENAME COLUMN "paymentLink" TO "payment_link";
ALTER TABLE "attendee" RENAME COLUMN "paymentId" TO "payment_id";
ALTER TABLE "attendee" RENAME COLUMN "paymentReservedAt" TO "payment_reserved_at";
ALTER TABLE "attendee" RENAME COLUMN "paymentChargeDeadline" TO "payment_charge_deadline";
ALTER TABLE "attendee" RENAME COLUMN "paymentChargedAt" TO "payment_charged_at";
ALTER TABLE "attendee" RENAME COLUMN "paymentRefundedAt" TO "payment_refunded_at";
ALTER TABLE "attendee" RENAME COLUMN "paymentRefundedById" TO "payment_refunded_by_id";

-- 11. Event
ALTER TABLE "event" RENAME COLUMN "shortDescription" TO "short_description";
ALTER TABLE "event" RENAME COLUMN "imageUrl" TO "image_url";
ALTER TABLE "event" RENAME COLUMN "locationTitle" TO "location_title";
ALTER TABLE "event" RENAME COLUMN "locationAddress" TO "location_address";
ALTER TABLE "event" RENAME COLUMN "locationLink" TO "location_link";
ALTER TABLE "event" RENAME COLUMN "attendanceId" TO "attendance_id";
ALTER TABLE "event" RENAME COLUMN "markForMissedAttendance" TO "mark_for_missed_attendance";
ALTER TABLE "event" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "event" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "event" RENAME COLUMN "parentId" TO "parent_id";
ALTER TABLE "event" RENAME COLUMN "metadataImportId" TO "metadata_import_id";

-- 12. EventCompany
ALTER TABLE "event_company" RENAME COLUMN "eventId" TO "event_id";
ALTER TABLE "event_company" RENAME COLUMN "companyId" TO "company_id";

-- 13. Mark
ALTER TABLE "mark" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "mark" RENAME COLUMN "updatedAt" TO "updated_at";

-- 14. MarkGroup
ALTER TABLE "mark_group" RENAME COLUMN "markId" TO "mark_id";
ALTER TABLE "mark_group" RENAME COLUMN "groupId" TO "group_id";

-- 15. PersonalMark
ALTER TABLE "personal_mark" RENAME COLUMN "markId" TO "mark_id";
ALTER TABLE "personal_mark" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "personal_mark" RENAME COLUMN "givenById" TO "given_by_id";
ALTER TABLE "personal_mark" RENAME COLUMN "createdAt" TO "created_at";

-- 16. PrivacyPermissions
ALTER TABLE "privacy_permissions" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "privacy_permissions" RENAME COLUMN "profileVisible" TO "profile_visible";
ALTER TABLE "privacy_permissions" RENAME COLUMN "usernameVisible" TO "username_visible";
ALTER TABLE "privacy_permissions" RENAME COLUMN "emailVisible" TO "email_visible";
ALTER TABLE "privacy_permissions" RENAME COLUMN "phoneVisible" TO "phone_visible";
ALTER TABLE "privacy_permissions" RENAME COLUMN "addressVisible" TO "address_visible";
ALTER TABLE "privacy_permissions" RENAME COLUMN "attendanceVisible" TO "attendance_visible";
ALTER TABLE "privacy_permissions" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "privacy_permissions" RENAME COLUMN "updatedAt" TO "updated_at";

-- 17. NotificationPermissions
ALTER TABLE "notification_permissions" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "notification_permissions" RENAME COLUMN "newArticles" TO "new_articles";
ALTER TABLE "notification_permissions" RENAME COLUMN "standardNotifications" TO "standard_notifications";
ALTER TABLE "notification_permissions" RENAME COLUMN "groupMessages" TO "group_messages";
ALTER TABLE "notification_permissions" RENAME COLUMN "markRulesUpdates" TO "mark_rules_updates";
ALTER TABLE "notification_permissions" RENAME COLUMN "registrationByAdministrator" TO "registration_by_administrator";
ALTER TABLE "notification_permissions" RENAME COLUMN "registrationStart" TO "registration_start";
ALTER TABLE "notification_permissions" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "notification_permissions" RENAME COLUMN "updatedAt" TO "updated_at";

-- 18. EventHostingGroup
ALTER TABLE "event_hosting_group" RENAME COLUMN "groupId" TO "group_id";
ALTER TABLE "event_hosting_group" RENAME COLUMN "eventId" TO "event_id";

-- 19. JobListing
ALTER TABLE "job_listing" RENAME COLUMN "companyId" TO "company_id";
ALTER TABLE "job_listing" RENAME COLUMN "shortDescription" TO "short_description";
ALTER TABLE "job_listing" RENAME COLUMN "applicationLink" TO "application_link";
ALTER TABLE "job_listing" RENAME COLUMN "applicationEmail" TO "application_email";
ALTER TABLE "job_listing" RENAME COLUMN "rollingAdmission" TO "rolling_admission";
ALTER TABLE "job_listing" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "job_listing" RENAME COLUMN "updatedAt" TO "updated_at";

-- 20. JobListingLocation
ALTER TABLE "job_listing_location" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "job_listing_location" RENAME COLUMN "jobListingId" TO "job_listing_id";

-- 21. Offline
ALTER TABLE "offline" RENAME COLUMN "fileUrl" TO "file_url";
ALTER TABLE "offline" RENAME COLUMN "imageUrl" TO "image_url";
ALTER TABLE "offline" RENAME COLUMN "publishedAt" TO "published_at";
ALTER TABLE "offline" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "offline" RENAME COLUMN "updatedAt" TO "updated_at";

-- 22. Article
ALTER TABLE "article" RENAME COLUMN "imageUrl" TO "image_url";
ALTER TABLE "article" RENAME COLUMN "isFeatured" TO "is_featured";
ALTER TABLE "article" RENAME COLUMN "vimeoId" TO "vimeo_id";
ALTER TABLE "article" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "article" RENAME COLUMN "updatedAt" TO "updated_at";

-- 23. ArticleTagLink
ALTER TABLE "article_tag_link" RENAME COLUMN "articleId" TO "article_id";
ALTER TABLE "article_tag_link" RENAME COLUMN "tagName" TO "tag_name";

-- 24. Task
ALTER TABLE "task" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "task" RENAME COLUMN "scheduledAt" TO "scheduled_at";
ALTER TABLE "task" RENAME COLUMN "processedAt" TO "processed_at";
ALTER TABLE "task" RENAME COLUMN "recurringTaskId" TO "recurring_task_id";

-- 25. RecurringTask
ALTER TABLE "recurring_task" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "recurring_task" RENAME COLUMN "lastRunAt" TO "last_run_at";
ALTER TABLE "recurring_task" RENAME COLUMN "nextRunAt" TO "next_run_at";

-- 26. FeedbackForm
ALTER TABLE "feedback_form" RENAME COLUMN "eventId" TO "event_id";
ALTER TABLE "feedback_form" RENAME COLUMN "publicResultsToken" TO "public_results_token";
ALTER TABLE "feedback_form" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "feedback_form" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "feedback_form" RENAME COLUMN "answerDeadline" TO "answer_deadline";

-- 27. FeedbackQuestion
ALTER TABLE "feedback_question" RENAME COLUMN "feedbackFormId" TO "feedback_form_id";
ALTER TABLE "feedback_question" RENAME COLUMN "showInPublicResults" TO "show_in_public_results";
ALTER TABLE "feedback_question" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "feedback_question" RENAME COLUMN "updatedAt" TO "updated_at";

-- 28. FeedbackQuestionOption
ALTER TABLE "feedback_question_option" RENAME COLUMN "questionId" TO "question_id";

-- 29. FeedbackQuestionAnswer
ALTER TABLE "feedback_question_answer" RENAME COLUMN "questionId" TO "question_id";
ALTER TABLE "feedback_question_answer" RENAME COLUMN "formAnswerId" TO "form_answer_id";

-- 30. FeedbackAnswerOptionLink (feedback_answer_option_link)
ALTER TABLE "feedback_answer_option_link" RENAME COLUMN "feedbackQuestionOptionId" TO "feedback_question_option_id";
ALTER TABLE "feedback_answer_option_link" RENAME COLUMN "feedbackQuestionAnswerId" TO "feedback_question_answer_id";

-- 31. FeedbackFormAnswer
ALTER TABLE "feedback_form_answer" RENAME COLUMN "feedbackFormId" TO "feedback_form_id";
ALTER TABLE "feedback_form_answer" RENAME COLUMN "attendeeId" TO "attendee_id";
ALTER TABLE "feedback_form_answer" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "feedback_form_answer" RENAME COLUMN "updatedAt" TO "updated_at";

-- 32. AuditLog
ALTER TABLE "audit_log" RENAME COLUMN "tableName" TO "table_name";
ALTER TABLE "audit_log" RENAME COLUMN "rowId" TO "row_id";
ALTER TABLE "audit_log" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "audit_log" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "audit_log" RENAME COLUMN "rowData" TO "row_data";
ALTER TABLE "audit_log" RENAME COLUMN "transactionId" TO "transaction_id";

-- 33. DeregisterReason
ALTER TABLE "deregister_reason" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "deregister_reason" RENAME COLUMN "registeredAt" TO "registered_at";
ALTER TABLE "deregister_reason" RENAME COLUMN "userGrade" TO "user_grade";
ALTER TABLE "deregister_reason" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "deregister_reason" RENAME COLUMN "eventId" TO "event_id";

-- 34. Rename constraints
ALTER TABLE "article_tag_link" RENAME CONSTRAINT "article_tag_link_articleId_fkey" TO "article_tag_link_article_id_fkey";
ALTER TABLE "article_tag_link" RENAME CONSTRAINT "article_tag_link_tagName_fkey" TO "article_tag_link_tag_name_fkey";
ALTER TABLE "attendance_pool" RENAME CONSTRAINT "attendance_pool_attendanceId_fkey" TO "attendance_pool_attendance_id_fkey";
ALTER TABLE "attendance_pool" RENAME CONSTRAINT "attendance_pool_taskId_fkey" TO "attendance_pool_task_id_fkey";
ALTER TABLE "attendee" RENAME CONSTRAINT "attendee_attendanceId_fkey" TO "attendee_attendance_id_fkey";
ALTER TABLE "attendee" RENAME CONSTRAINT "attendee_attendancePoolId_fkey" TO "attendee_attendance_pool_id_fkey";
ALTER TABLE "attendee" RENAME CONSTRAINT "attendee_paymentRefundedById_fkey" TO "attendee_payment_refunded_by_id_fkey";
ALTER TABLE "attendee" RENAME CONSTRAINT "attendee_userId_fkey" TO "attendee_user_id_fkey";
ALTER TABLE "audit_log" RENAME CONSTRAINT "audit_log_userId_fkey" TO "audit_log_user_id_fkey";
ALTER TABLE "deregister_reason" RENAME CONSTRAINT "deregister_reason_eventId_fkey" TO "deregister_reason_event_id_fkey";
ALTER TABLE "deregister_reason" RENAME CONSTRAINT "deregister_reason_userId_fkey" TO "deregister_reason_user_id_fkey";
ALTER TABLE "event" RENAME CONSTRAINT "event_attendanceId_fkey" TO "event_attendance_id_fkey";
ALTER TABLE "event_company" RENAME CONSTRAINT "event_company_companyId_fkey" TO "event_company_company_id_fkey";
ALTER TABLE "event_company" RENAME CONSTRAINT "event_company_eventId_fkey" TO "event_company_event_id_fkey";
ALTER TABLE "event_hosting_group" RENAME CONSTRAINT "event_hosting_group_eventId_fkey" TO "event_hosting_group_event_id_fkey";
ALTER TABLE "event_hosting_group" RENAME CONSTRAINT "event_hosting_group_groupId_fkey" TO "event_hosting_group_group_id_fkey";
ALTER TABLE "feedback_answer_option_link" RENAME CONSTRAINT "feedback_answer_option_link_feedbackQuestionAnswerId_fkey" TO "feedback_answer_option_link_feedback_question_answer_id_fkey";
ALTER TABLE "feedback_answer_option_link" RENAME CONSTRAINT "feedback_answer_option_link_feedbackQuestionOptionId_fkey" TO "feedback_answer_option_link_feedback_question_option_id_fkey";
ALTER TABLE "feedback_form" RENAME CONSTRAINT "feedback_form_eventId_fkey" TO "feedback_form_event_id_fkey";
ALTER TABLE "feedback_form_answer" RENAME CONSTRAINT "feedback_form_answer_attendeeId_fkey" TO "feedback_form_answer_attendee_id_fkey";
ALTER TABLE "feedback_form_answer" RENAME CONSTRAINT "feedback_form_answer_feedbackFormId_fkey" TO "feedback_form_answer_feedback_form_id_fkey";
ALTER TABLE "feedback_question" RENAME CONSTRAINT "feedback_question_feedbackFormId_fkey" TO "feedback_question_feedback_form_id_fkey";
ALTER TABLE "feedback_question_answer" RENAME CONSTRAINT "feedback_question_answer_formAnswerId_fkey" TO "feedback_question_answer_form_answer_id_fkey";
ALTER TABLE "feedback_question_answer" RENAME CONSTRAINT "feedback_question_answer_questionId_fkey" TO "feedback_question_answer_question_id_fkey";
ALTER TABLE "feedback_question_option" RENAME CONSTRAINT "feedback_question_option_questionId_fkey" TO "feedback_question_option_question_id_fkey";
ALTER TABLE "group_membership" RENAME CONSTRAINT "group_membership_groupId_fkey" TO "group_membership_group_id_fkey";
ALTER TABLE "group_membership" RENAME CONSTRAINT "group_membership_userId_fkey" TO "group_membership_user_id_fkey";
ALTER TABLE "group_membership_role" RENAME CONSTRAINT "group_membership_role_membershipId_fkey" TO "group_membership_role_membership_id_fkey";
ALTER TABLE "group_membership_role" RENAME CONSTRAINT "group_membership_role_roleId_fkey" TO "group_membership_role_role_id_fkey";
ALTER TABLE "group_role" RENAME CONSTRAINT "group_role_groupId_fkey" TO "group_role_group_id_fkey";
ALTER TABLE "job_listing" RENAME CONSTRAINT "job_listing_companyId_fkey" TO "job_listing_company_id_fkey";
ALTER TABLE "job_listing_location" RENAME CONSTRAINT "job_listing_location_jobListingId_fkey" TO "job_listing_location_job_listing_id_fkey";
ALTER TABLE "mark_group" RENAME CONSTRAINT "mark_group_groupId_fkey" TO "mark_group_group_id_fkey";
ALTER TABLE "mark_group" RENAME CONSTRAINT "mark_group_markId_fkey" TO "mark_group_mark_id_fkey";
ALTER TABLE "membership" RENAME CONSTRAINT "membership_userId_fkey" TO "membership_user_id_fkey";
ALTER TABLE "notification_permissions" RENAME CONSTRAINT "notification_permissions_userId_fkey" TO "notification_permissions_user_id_fkey";
ALTER TABLE "personal_mark" RENAME CONSTRAINT "personal_mark_givenById_fkey" TO "personal_mark_given_by_id_fkey";
ALTER TABLE "personal_mark" RENAME CONSTRAINT "personal_mark_markId_fkey" TO "personal_mark_mark_id_fkey";
ALTER TABLE "personal_mark" RENAME CONSTRAINT "personal_mark_userId_fkey" TO "personal_mark_user_id_fkey";
ALTER TABLE "privacy_permissions" RENAME CONSTRAINT "privacy_permissions_userId_fkey" TO "privacy_permissions_user_id_fkey";
ALTER TABLE "task" RENAME CONSTRAINT "task_recurringTaskId_fkey" TO "task_recurring_task_id_fkey";
ALTER INDEX "attendee_attendanceId_userId_key" RENAME TO "attendee_attendance_id_user_id_key";
ALTER INDEX "feedback_form_eventId_key" RENAME TO "feedback_form_event_id_key";
ALTER INDEX "feedback_form_publicResultsToken_key" RENAME TO "feedback_form_public_results_token_key";
ALTER INDEX "feedback_form_answer_attendeeId_key" RENAME TO "feedback_form_answer_attendee_id_key";
ALTER INDEX "feedback_question_option_questionId_name_key" RENAME TO "feedback_question_option_question_id_name_key";
ALTER INDEX "group_workspaceGroupId_key" RENAME TO "group_workspace_group_id_key";
ALTER INDEX "group_role_groupId_name_key" RENAME TO "group_role_group_id_name_key";
ALTER INDEX "notification_permissions_userId_key" RENAME TO "notification_permissions_user_id_key";
ALTER INDEX "ow_user_notificationPermissionsId_key" RENAME TO "ow_user_notification_permissions_id_key";
ALTER INDEX "ow_user_privacyPermissionsId_key" RENAME TO "ow_user_privacy_permissions_id_key";
ALTER INDEX "ow_user_profileSlug_key" RENAME TO "ow_user_username_key";
ALTER INDEX "ow_user_workspaceUserId_key" RENAME TO "ow_user_workspace_user_id_key";
ALTER INDEX "privacy_permissions_userId_key" RENAME TO "privacy_permissions_user_id_key";
ALTER INDEX "recurring_task_nextRunAt_idx" RENAME TO "recurring_task_next_run_at_idx";

-- 35. Update audit log trigger function
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
        transaction_id
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
        pg_current_xact_id()::text::bigint
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;
