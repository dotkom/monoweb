-- DropForeignKey
ALTER TABLE "article_tag_link" DROP CONSTRAINT "article_tag_link_article_id_fkey";

-- DropForeignKey
ALTER TABLE "deregister_reason" DROP CONSTRAINT "deregister_reason_event_id_fkey";

-- DropForeignKey
ALTER TABLE "deregister_reason" DROP CONSTRAINT "deregister_reason_user_id_fkey";

-- DropForeignKey
ALTER TABLE "event_company" DROP CONSTRAINT "event_company_event_id_fkey";

-- DropForeignKey
ALTER TABLE "event_hosting_group" DROP CONSTRAINT "event_hosting_group_event_id_fkey";

-- DropForeignKey
ALTER TABLE "feedback_answer_option_link" DROP CONSTRAINT "feedback_answer_option_link_feedback_question_option_id_fkey";

-- DropForeignKey
ALTER TABLE "feedback_form" DROP CONSTRAINT "feedback_form_event_id_fkey";

-- DropForeignKey
ALTER TABLE "feedback_form_answer" DROP CONSTRAINT "feedback_form_answer_feedback_form_id_fkey";

-- DropForeignKey
ALTER TABLE "feedback_question_answer" DROP CONSTRAINT "feedback_question_answer_question_id_fkey";

-- DropForeignKey
ALTER TABLE "job_listing_location" DROP CONSTRAINT "job_listing_location_job_listing_id_fkey";

-- DropForeignKey
ALTER TABLE "mark_group" DROP CONSTRAINT "mark_group_group_id_fkey";

-- DropForeignKey
ALTER TABLE "mark_group" DROP CONSTRAINT "mark_group_mark_id_fkey";

-- DropForeignKey
ALTER TABLE "notification_permissions" DROP CONSTRAINT "notification_permissions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "personal_mark" DROP CONSTRAINT "personal_mark_mark_id_fkey";

-- DropForeignKey
ALTER TABLE "personal_mark" DROP CONSTRAINT "personal_mark_user_id_fkey";

-- DropForeignKey
ALTER TABLE "privacy_permissions" DROP CONSTRAINT "privacy_permissions_user_id_fkey";

-- AlterTable
ALTER TABLE "deregister_reason" ALTER COLUMN "event_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "event_company" ADD CONSTRAINT "event_company_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark_group" ADD CONSTRAINT "mark_group_mark_id_fkey" FOREIGN KEY ("mark_id") REFERENCES "mark"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark_group" ADD CONSTRAINT "mark_group_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_mark" ADD CONSTRAINT "personal_mark_mark_id_fkey" FOREIGN KEY ("mark_id") REFERENCES "mark"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_mark" ADD CONSTRAINT "personal_mark_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "privacy_permissions" ADD CONSTRAINT "privacy_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_permissions" ADD CONSTRAINT "notification_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_hosting_group" ADD CONSTRAINT "event_hosting_group_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_listing_location" ADD CONSTRAINT "job_listing_location_job_listing_id_fkey" FOREIGN KEY ("job_listing_id") REFERENCES "job_listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tag_link" ADD CONSTRAINT "article_tag_link_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_form" ADD CONSTRAINT "feedback_form_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_question_answer" ADD CONSTRAINT "feedback_question_answer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "feedback_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_answer_option_link" ADD CONSTRAINT "feedback_answer_option_link_feedback_question_option_id_fkey" FOREIGN KEY ("feedback_question_option_id") REFERENCES "feedback_question_option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_form_answer" ADD CONSTRAINT "feedback_form_answer_feedback_form_id_fkey" FOREIGN KEY ("feedback_form_id") REFERENCES "feedback_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deregister_reason" ADD CONSTRAINT "deregister_reason_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deregister_reason" ADD CONSTRAINT "deregister_reason_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
