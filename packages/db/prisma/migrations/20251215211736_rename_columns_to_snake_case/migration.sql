/*
  Warnings:

  - You are about to drop the column `createdAt` on the `article` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `article` table. All the data in the column will be lost.
  - You are about to drop the column `isFeatured` on the `article` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `article` table. All the data in the column will be lost.
  - You are about to drop the column `vimeoId` on the `article` table. All the data in the column will be lost.
  - The primary key for the `article_tag_link` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `articleId` on the `article_tag_link` table. All the data in the column will be lost.
  - You are about to drop the column `tagName` on the `article_tag_link` table. All the data in the column will be lost.
  - You are about to drop the column `attendancePrice` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `deregisterDeadline` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `registerEnd` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `registerStart` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `attendanceId` on the `attendance_pool` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `attendance_pool` table. All the data in the column will be lost.
  - You are about to drop the column `mergeDelayHours` on the `attendance_pool` table. All the data in the column will be lost.
  - You are about to drop the column `taskId` on the `attendance_pool` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `attendance_pool` table. All the data in the column will be lost.
  - You are about to drop the column `yearCriteria` on the `attendance_pool` table. All the data in the column will be lost.
  - You are about to drop the column `attendanceId` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `attendancePoolId` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `attendedAt` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `earliestReservationAt` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `paymentChargeDeadline` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `paymentChargedAt` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `paymentDeadline` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `paymentLink` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `paymentRefundedAt` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `paymentRefundedById` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `paymentReservedAt` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `userGrade` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `audit_log` table. All the data in the column will be lost.
  - You are about to drop the column `rowData` on the `audit_log` table. All the data in the column will be lost.
  - You are about to drop the column `rowId` on the `audit_log` table. All the data in the column will be lost.
  - You are about to drop the column `tableName` on the `audit_log` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `audit_log` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `audit_log` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `deregister_reason` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `deregister_reason` table. All the data in the column will be lost.
  - You are about to drop the column `registeredAt` on the `deregister_reason` table. All the data in the column will be lost.
  - You are about to drop the column `userGrade` on the `deregister_reason` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `deregister_reason` table. All the data in the column will be lost.
  - You are about to drop the column `attendanceId` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `locationAddress` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `locationLink` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `locationTitle` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `markForMissedAttendance` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `metadataImportId` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `shortDescription` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `event` table. All the data in the column will be lost.
  - The primary key for the `event_company` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `companyId` on the `event_company` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `event_company` table. All the data in the column will be lost.
  - The primary key for the `event_hosting_group` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `eventId` on the `event_hosting_group` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `event_hosting_group` table. All the data in the column will be lost.
  - The primary key for the `feedback_answer_option_link` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `feedbackQuestionAnswerId` on the `feedback_answer_option_link` table. All the data in the column will be lost.
  - You are about to drop the column `feedbackQuestionOptionId` on the `feedback_answer_option_link` table. All the data in the column will be lost.
  - You are about to drop the column `answerDeadline` on the `feedback_form` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `feedback_form` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `feedback_form` table. All the data in the column will be lost.
  - You are about to drop the column `publicResultsToken` on the `feedback_form` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `feedback_form` table. All the data in the column will be lost.
  - You are about to drop the column `attendeeId` on the `feedback_form_answer` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `feedback_form_answer` table. All the data in the column will be lost.
  - You are about to drop the column `feedbackFormId` on the `feedback_form_answer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `feedback_form_answer` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `feedback_question` table. All the data in the column will be lost.
  - You are about to drop the column `feedbackFormId` on the `feedback_question` table. All the data in the column will be lost.
  - You are about to drop the column `showInPublicResults` on the `feedback_question` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `feedback_question` table. All the data in the column will be lost.
  - You are about to drop the column `formAnswerId` on the `feedback_question_answer` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `feedback_question_answer` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `feedback_question_option` table. All the data in the column will be lost.
  - You are about to drop the column `contactUrl` on the `group` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `group` table. All the data in the column will be lost.
  - You are about to drop the column `deactivatedAt` on the `group` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `group` table. All the data in the column will be lost.
  - You are about to drop the column `memberVisibility` on the `group` table. All the data in the column will be lost.
  - You are about to drop the column `recruitmentMethod` on the `group` table. All the data in the column will be lost.
  - You are about to drop the column `shortDescription` on the `group` table. All the data in the column will be lost.
  - You are about to drop the column `showLeaderAsContact` on the `group` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceGroupId` on the `group` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `group_membership` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `group_membership` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `group_membership` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `group_membership` table. All the data in the column will be lost.
  - The primary key for the `group_membership_role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `membershipId` on the `group_membership_role` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `group_membership_role` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `group_role` table. All the data in the column will be lost.
  - You are about to drop the column `applicationEmail` on the `job_listing` table. All the data in the column will be lost.
  - You are about to drop the column `applicationLink` on the `job_listing` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `job_listing` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `job_listing` table. All the data in the column will be lost.
  - You are about to drop the column `rollingAdmission` on the `job_listing` table. All the data in the column will be lost.
  - You are about to drop the column `shortDescription` on the `job_listing` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `job_listing` table. All the data in the column will be lost.
  - The primary key for the `job_listing_location` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `job_listing_location` table. All the data in the column will be lost.
  - You are about to drop the column `jobListingId` on the `job_listing_location` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `mark` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `mark` table. All the data in the column will be lost.
  - The primary key for the `mark_group` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `groupId` on the `mark_group` table. All the data in the column will be lost.
  - You are about to drop the column `markId` on the `mark_group` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `membership` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `notification_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `groupMessages` on the `notification_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `markRulesUpdates` on the `notification_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `newArticles` on the `notification_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `registrationByAdministrator` on the `notification_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `registrationStart` on the `notification_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `standardNotifications` on the `notification_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `notification_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `notification_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `offline` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `offline` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `offline` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `offline` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `offline` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ow_user` table. All the data in the column will be lost.
  - You are about to drop the column `dietaryRestrictions` on the `ow_user` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `ow_user` table. All the data in the column will be lost.
  - You are about to drop the column `notificationPermissionsId` on the `ow_user` table. All the data in the column will be lost.
  - You are about to drop the column `ntnuUsername` on the `ow_user` table. All the data in the column will be lost.
  - You are about to drop the column `privacyPermissionsId` on the `ow_user` table. All the data in the column will be lost.
  - You are about to drop the column `profileSlug` on the `ow_user` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ow_user` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceUserId` on the `ow_user` table. All the data in the column will be lost.
  - The primary key for the `personal_mark` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `personal_mark` table. All the data in the column will be lost.
  - You are about to drop the column `givenById` on the `personal_mark` table. All the data in the column will be lost.
  - You are about to drop the column `markId` on the `personal_mark` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `personal_mark` table. All the data in the column will be lost.
  - You are about to drop the column `addressVisible` on the `privacy_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `attendanceVisible` on the `privacy_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `privacy_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `emailVisible` on the `privacy_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `phoneVisible` on the `privacy_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `profileVisible` on the `privacy_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `privacy_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `privacy_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `usernameVisible` on the `privacy_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `recurring_task` table. All the data in the column will be lost.
  - You are about to drop the column `lastRunAt` on the `recurring_task` table. All the data in the column will be lost.
  - You are about to drop the column `nextRunAt` on the `recurring_task` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `processedAt` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `recurringTaskId` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledAt` on the `task` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[attendance_id,user_id]` on the table `attendee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[public_results_token]` on the table `feedback_form` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[event_id]` on the table `feedback_form` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[attendee_id]` on the table `feedback_form_answer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[question_id,name]` on the table `feedback_question_option` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workspace_group_id]` on the table `group` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[group_id,name]` on the table `group_role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `notification_permissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `ow_user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workspace_user_id]` on the table `ow_user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[privacy_permissions_id]` on the table `ow_user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[notification_permissions_id]` on the table `ow_user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `privacy_permissions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `image_url` to the `article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `article_id` to the `article_tag_link` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tag_name` to the `article_tag_link` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deregister_deadline` to the `attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `register_end` to the `attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `register_start` to the `attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attendance_id` to the `attendance_pool` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year_criteria` to the `attendance_pool` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attendance_id` to the `attendee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attendance_pool_id` to the `attendee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `earliest_reservation_at` to the `attendee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `attendee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `row_data` to the `audit_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `table_name` to the `audit_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transaction_id` to the `audit_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event_id` to the `deregister_reason` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registered_at` to the `deregister_reason` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `deregister_reason` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `event_company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event_id` to the `event_company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event_id` to the `event_hosting_group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `group_id` to the `event_hosting_group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feedback_question_answer_id` to the `feedback_answer_option_link` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feedback_question_option_id` to the `feedback_answer_option_link` table without a default value. This is not possible if the table is not empty.
  - Added the required column `answer_deadline` to the `feedback_form` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event_id` to the `feedback_form` table without a default value. This is not possible if the table is not empty.
  - The required column `public_results_token` was added to the `feedback_form` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `attendee_id` to the `feedback_form_answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feedback_form_id` to the `feedback_form_answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feedback_form_id` to the `feedback_question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `form_answer_id` to the `feedback_question_answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question_id` to the `feedback_question_answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question_id` to the `feedback_question_option` table without a default value. This is not possible if the table is not empty.
  - Added the required column `group_id` to the `group_membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `group_membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membership_id` to the `group_membership_role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `group_membership_role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `group_id` to the `group_role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `job_listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rolling_admission` to the `job_listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `job_listing_id` to the `job_listing_location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `group_id` to the `mark_group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mark_id` to the `mark_group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `notification_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `published_at` to the `offline` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `ow_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mark_id` to the `personal_mark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `personal_mark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `privacy_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `next_run_at` to the `recurring_task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduled_at` to the `task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "article_tag_link" DROP CONSTRAINT "article_tag_link_articleId_fkey";

-- DropForeignKey
ALTER TABLE "article_tag_link" DROP CONSTRAINT "article_tag_link_tagName_fkey";

-- DropForeignKey
ALTER TABLE "attendance_pool" DROP CONSTRAINT "attendance_pool_attendanceId_fkey";

-- DropForeignKey
ALTER TABLE "attendance_pool" DROP CONSTRAINT "attendance_pool_taskId_fkey";

-- DropForeignKey
ALTER TABLE "attendee" DROP CONSTRAINT "attendee_attendanceId_fkey";

-- DropForeignKey
ALTER TABLE "attendee" DROP CONSTRAINT "attendee_attendancePoolId_fkey";

-- DropForeignKey
ALTER TABLE "attendee" DROP CONSTRAINT "attendee_paymentRefundedById_fkey";

-- DropForeignKey
ALTER TABLE "attendee" DROP CONSTRAINT "attendee_userId_fkey";

-- DropForeignKey
ALTER TABLE "audit_log" DROP CONSTRAINT "audit_log_userId_fkey";

-- DropForeignKey
ALTER TABLE "deregister_reason" DROP CONSTRAINT "deregister_reason_eventId_fkey";

-- DropForeignKey
ALTER TABLE "deregister_reason" DROP CONSTRAINT "deregister_reason_userId_fkey";

-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_attendanceId_fkey";

-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_parent_fkey";

-- DropForeignKey
ALTER TABLE "event_company" DROP CONSTRAINT "event_company_companyId_fkey";

-- DropForeignKey
ALTER TABLE "event_company" DROP CONSTRAINT "event_company_eventId_fkey";

-- DropForeignKey
ALTER TABLE "event_hosting_group" DROP CONSTRAINT "event_hosting_group_eventId_fkey";

-- DropForeignKey
ALTER TABLE "event_hosting_group" DROP CONSTRAINT "event_hosting_group_groupId_fkey";

-- DropForeignKey
ALTER TABLE "feedback_answer_option_link" DROP CONSTRAINT "feedback_answer_option_link_feedbackQuestionAnswerId_fkey";

-- DropForeignKey
ALTER TABLE "feedback_answer_option_link" DROP CONSTRAINT "feedback_answer_option_link_feedbackQuestionOptionId_fkey";

-- DropForeignKey
ALTER TABLE "feedback_form" DROP CONSTRAINT "feedback_form_eventId_fkey";

-- DropForeignKey
ALTER TABLE "feedback_form_answer" DROP CONSTRAINT "feedback_form_answer_attendeeId_fkey";

-- DropForeignKey
ALTER TABLE "feedback_form_answer" DROP CONSTRAINT "feedback_form_answer_feedbackFormId_fkey";

-- DropForeignKey
ALTER TABLE "feedback_question" DROP CONSTRAINT "feedback_question_feedbackFormId_fkey";

-- DropForeignKey
ALTER TABLE "feedback_question_answer" DROP CONSTRAINT "feedback_question_answer_formAnswerId_fkey";

-- DropForeignKey
ALTER TABLE "feedback_question_answer" DROP CONSTRAINT "feedback_question_answer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "feedback_question_option" DROP CONSTRAINT "feedback_question_option_questionId_fkey";

-- DropForeignKey
ALTER TABLE "group_membership" DROP CONSTRAINT "group_membership_groupId_fkey";

-- DropForeignKey
ALTER TABLE "group_membership" DROP CONSTRAINT "group_membership_userId_fkey";

-- DropForeignKey
ALTER TABLE "group_membership_role" DROP CONSTRAINT "group_membership_role_membershipId_fkey";

-- DropForeignKey
ALTER TABLE "group_membership_role" DROP CONSTRAINT "group_membership_role_roleId_fkey";

-- DropForeignKey
ALTER TABLE "group_role" DROP CONSTRAINT "group_role_groupId_fkey";

-- DropForeignKey
ALTER TABLE "job_listing" DROP CONSTRAINT "job_listing_companyId_fkey";

-- DropForeignKey
ALTER TABLE "job_listing_location" DROP CONSTRAINT "job_listing_location_jobListingId_fkey";

-- DropForeignKey
ALTER TABLE "mark_group" DROP CONSTRAINT "mark_group_groupId_fkey";

-- DropForeignKey
ALTER TABLE "mark_group" DROP CONSTRAINT "mark_group_markId_fkey";

-- DropForeignKey
ALTER TABLE "membership" DROP CONSTRAINT "membership_userId_fkey";

-- DropForeignKey
ALTER TABLE "notification_permissions" DROP CONSTRAINT "notification_permissions_userId_fkey";

-- DropForeignKey
ALTER TABLE "personal_mark" DROP CONSTRAINT "personal_mark_givenById_fkey";

-- DropForeignKey
ALTER TABLE "personal_mark" DROP CONSTRAINT "personal_mark_markId_fkey";

-- DropForeignKey
ALTER TABLE "personal_mark" DROP CONSTRAINT "personal_mark_userId_fkey";

-- DropForeignKey
ALTER TABLE "privacy_permissions" DROP CONSTRAINT "privacy_permissions_userId_fkey";

-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_recurringTaskId_fkey";

-- DropIndex
DROP INDEX "attendee_attendanceId_userId_key";

-- DropIndex
DROP INDEX "feedback_form_eventId_key";

-- DropIndex
DROP INDEX "feedback_form_publicResultsToken_key";

-- DropIndex
DROP INDEX "feedback_form_answer_attendeeId_key";

-- DropIndex
DROP INDEX "feedback_question_option_questionId_name_key";

-- DropIndex
DROP INDEX "group_workspaceGroupId_key";

-- DropIndex
DROP INDEX "group_role_groupId_name_key";

-- DropIndex
DROP INDEX "notification_permissions_userId_key";

-- DropIndex
DROP INDEX "ow_user_notificationPermissionsId_key";

-- DropIndex
DROP INDEX "ow_user_privacyPermissionsId_key";

-- DropIndex
DROP INDEX "ow_user_profileSlug_key";

-- DropIndex
DROP INDEX "ow_user_workspaceUserId_key";

-- DropIndex
DROP INDEX "privacy_permissions_userId_key";

-- DropIndex
DROP INDEX "recurring_task_nextRunAt_idx";

-- DropIndex
DROP INDEX "idx_job_scheduled_at_status";

-- AlterTable
ALTER TABLE "article" DROP COLUMN "createdAt",
DROP COLUMN "imageUrl",
DROP COLUMN "isFeatured",
DROP COLUMN "updatedAt",
DROP COLUMN "vimeoId",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "image_url" TEXT NOT NULL,
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "vimeo_id" TEXT;

-- AlterTable
ALTER TABLE "article_tag_link" DROP CONSTRAINT "article_tag_link_pkey",
DROP COLUMN "articleId",
DROP COLUMN "tagName",
ADD COLUMN     "article_id" TEXT NOT NULL,
ADD COLUMN     "tag_name" TEXT NOT NULL,
ADD CONSTRAINT "article_tag_link_pkey" PRIMARY KEY ("article_id", "tag_name");

-- AlterTable
ALTER TABLE "attendance" DROP COLUMN "attendancePrice",
DROP COLUMN "createdAt",
DROP COLUMN "deregisterDeadline",
DROP COLUMN "registerEnd",
DROP COLUMN "registerStart",
DROP COLUMN "updatedAt",
ADD COLUMN     "attendance_price" INTEGER,
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deregister_deadline" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "register_end" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "register_start" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "attendance_pool" DROP COLUMN "attendanceId",
DROP COLUMN "createdAt",
DROP COLUMN "mergeDelayHours",
DROP COLUMN "taskId",
DROP COLUMN "updatedAt",
DROP COLUMN "yearCriteria",
ADD COLUMN     "attendance_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "merge_delay_hours" INTEGER,
ADD COLUMN     "task_id" TEXT,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "year_criteria" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "attendee" DROP COLUMN "attendanceId",
DROP COLUMN "attendancePoolId",
DROP COLUMN "attendedAt",
DROP COLUMN "createdAt",
DROP COLUMN "earliestReservationAt",
DROP COLUMN "paymentChargeDeadline",
DROP COLUMN "paymentChargedAt",
DROP COLUMN "paymentDeadline",
DROP COLUMN "paymentId",
DROP COLUMN "paymentLink",
DROP COLUMN "paymentRefundedAt",
DROP COLUMN "paymentRefundedById",
DROP COLUMN "paymentReservedAt",
DROP COLUMN "updatedAt",
DROP COLUMN "userGrade",
DROP COLUMN "userId",
ADD COLUMN     "attendance_id" TEXT NOT NULL,
ADD COLUMN     "attendance_pool_id" TEXT NOT NULL,
ADD COLUMN     "attended_at" TIMESTAMPTZ(3),
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "earliest_reservation_at" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "payment_charge_deadline" TIMESTAMP(3),
ADD COLUMN     "payment_charged_at" TIMESTAMP(3),
ADD COLUMN     "payment_deadline" TIMESTAMP(3),
ADD COLUMN     "payment_id" TEXT,
ADD COLUMN     "payment_link" TEXT,
ADD COLUMN     "payment_refunded_at" TIMESTAMP(3),
ADD COLUMN     "payment_refunded_by_id" TEXT,
ADD COLUMN     "payment_reserved_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_grade" INTEGER,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "audit_log" DROP COLUMN "createdAt",
DROP COLUMN "rowData",
DROP COLUMN "rowId",
DROP COLUMN "tableName",
DROP COLUMN "transactionId",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "row_data" JSONB NOT NULL,
ADD COLUMN     "row_id" TEXT,
ADD COLUMN     "table_name" TEXT NOT NULL,
ADD COLUMN     "transaction_id" BIGINT NOT NULL,
ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "company" DROP COLUMN "createdAt",
DROP COLUMN "imageUrl",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "deregister_reason" DROP COLUMN "createdAt",
DROP COLUMN "eventId",
DROP COLUMN "registeredAt",
DROP COLUMN "userGrade",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "event_id" TEXT NOT NULL,
ADD COLUMN     "registered_at" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "user_grade" INTEGER,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "event" DROP COLUMN "attendanceId",
DROP COLUMN "createdAt",
DROP COLUMN "imageUrl",
DROP COLUMN "locationAddress",
DROP COLUMN "locationLink",
DROP COLUMN "locationTitle",
DROP COLUMN "markForMissedAttendance",
DROP COLUMN "metadataImportId",
DROP COLUMN "parentId",
DROP COLUMN "shortDescription",
DROP COLUMN "updatedAt",
ADD COLUMN     "attendance_id" TEXT,
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "location_address" TEXT,
ADD COLUMN     "location_link" TEXT,
ADD COLUMN     "location_title" TEXT,
ADD COLUMN     "mark_for_missed_attendance" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "metadata_import_id" INTEGER,
ADD COLUMN     "parent_id" TEXT,
ADD COLUMN     "short_description" TEXT,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "event_company" DROP CONSTRAINT "event_company_pkey",
DROP COLUMN "companyId",
DROP COLUMN "eventId",
ADD COLUMN     "company_id" TEXT NOT NULL,
ADD COLUMN     "event_id" TEXT NOT NULL,
ADD CONSTRAINT "event_company_pkey" PRIMARY KEY ("event_id", "company_id");

-- AlterTable
ALTER TABLE "event_hosting_group" DROP CONSTRAINT "event_hosting_group_pkey",
DROP COLUMN "eventId",
DROP COLUMN "groupId",
ADD COLUMN     "event_id" TEXT NOT NULL,
ADD COLUMN     "group_id" TEXT NOT NULL,
ADD CONSTRAINT "event_hosting_group_pkey" PRIMARY KEY ("group_id", "event_id");

-- AlterTable
ALTER TABLE "feedback_answer_option_link" DROP CONSTRAINT "feedback_answer_option_link_pkey",
DROP COLUMN "feedbackQuestionAnswerId",
DROP COLUMN "feedbackQuestionOptionId",
ADD COLUMN     "feedback_question_answer_id" TEXT NOT NULL,
ADD COLUMN     "feedback_question_option_id" TEXT NOT NULL,
ADD CONSTRAINT "feedback_answer_option_link_pkey" PRIMARY KEY ("feedback_question_option_id", "feedback_question_answer_id");

-- AlterTable
ALTER TABLE "feedback_form" DROP COLUMN "answerDeadline",
DROP COLUMN "createdAt",
DROP COLUMN "eventId",
DROP COLUMN "publicResultsToken",
DROP COLUMN "updatedAt",
ADD COLUMN     "answer_deadline" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "event_id" TEXT NOT NULL,
ADD COLUMN     "public_results_token" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "feedback_form_answer" DROP COLUMN "attendeeId",
DROP COLUMN "createdAt",
DROP COLUMN "feedbackFormId",
DROP COLUMN "updatedAt",
ADD COLUMN     "attendee_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "feedback_form_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "feedback_question" DROP COLUMN "createdAt",
DROP COLUMN "feedbackFormId",
DROP COLUMN "showInPublicResults",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "feedback_form_id" TEXT NOT NULL,
ADD COLUMN     "show_in_public_results" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "feedback_question_answer" DROP COLUMN "formAnswerId",
DROP COLUMN "questionId",
ADD COLUMN     "form_answer_id" TEXT NOT NULL,
ADD COLUMN     "question_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "feedback_question_option" DROP COLUMN "questionId",
ADD COLUMN     "question_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "group" DROP COLUMN "contactUrl",
DROP COLUMN "createdAt",
DROP COLUMN "deactivatedAt",
DROP COLUMN "imageUrl",
DROP COLUMN "memberVisibility",
DROP COLUMN "recruitmentMethod",
DROP COLUMN "shortDescription",
DROP COLUMN "showLeaderAsContact",
DROP COLUMN "workspaceGroupId",
ADD COLUMN     "contact_url" TEXT,
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deactivated_at" TIMESTAMP(3),
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "member_visibility" "group_member_visibility" NOT NULL DEFAULT 'ALL_MEMBERS',
ADD COLUMN     "recruitment_method" "GroupRecruitmentMethod" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "short_description" TEXT,
ADD COLUMN     "show_leader_as_contact" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "workspace_group_id" TEXT;

-- AlterTable
ALTER TABLE "group_membership" DROP COLUMN "createdAt",
DROP COLUMN "groupId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "group_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "group_membership_role" DROP CONSTRAINT "group_membership_role_pkey",
DROP COLUMN "membershipId",
DROP COLUMN "roleId",
ADD COLUMN     "membership_id" TEXT NOT NULL,
ADD COLUMN     "role_id" TEXT NOT NULL,
ADD CONSTRAINT "group_membership_role_pkey" PRIMARY KEY ("membership_id", "role_id");

-- AlterTable
ALTER TABLE "group_role" DROP COLUMN "groupId",
ADD COLUMN     "group_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "job_listing" DROP COLUMN "applicationEmail",
DROP COLUMN "applicationLink",
DROP COLUMN "companyId",
DROP COLUMN "createdAt",
DROP COLUMN "rollingAdmission",
DROP COLUMN "shortDescription",
DROP COLUMN "updatedAt",
ADD COLUMN     "application_email" TEXT,
ADD COLUMN     "application_link" TEXT,
ADD COLUMN     "company_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "rolling_admission" BOOLEAN NOT NULL,
ADD COLUMN     "short_description" TEXT,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "job_listing_location" DROP CONSTRAINT "job_listing_location_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "jobListingId",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "job_listing_id" TEXT NOT NULL,
ADD CONSTRAINT "job_listing_location_pkey" PRIMARY KEY ("name", "job_listing_id");

-- AlterTable
ALTER TABLE "mark" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "mark_group" DROP CONSTRAINT "mark_group_pkey",
DROP COLUMN "groupId",
DROP COLUMN "markId",
ADD COLUMN     "group_id" TEXT NOT NULL,
ADD COLUMN     "mark_id" TEXT NOT NULL,
ADD CONSTRAINT "mark_group_pkey" PRIMARY KEY ("mark_id", "group_id");

-- AlterTable
ALTER TABLE "membership" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "notification_permissions" DROP COLUMN "createdAt",
DROP COLUMN "groupMessages",
DROP COLUMN "markRulesUpdates",
DROP COLUMN "newArticles",
DROP COLUMN "registrationByAdministrator",
DROP COLUMN "registrationStart",
DROP COLUMN "standardNotifications",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "group_messages" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mark_rules_updates" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "new_articles" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "registration_by_administrator" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "registration_start" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "standard_notifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "offline" DROP COLUMN "createdAt",
DROP COLUMN "fileUrl",
DROP COLUMN "imageUrl",
DROP COLUMN "publishedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "file_url" TEXT,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "published_at" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ow_user" DROP COLUMN "createdAt",
DROP COLUMN "dietaryRestrictions",
DROP COLUMN "imageUrl",
DROP COLUMN "notificationPermissionsId",
DROP COLUMN "ntnuUsername",
DROP COLUMN "privacyPermissionsId",
DROP COLUMN "profileSlug",
DROP COLUMN "updatedAt",
DROP COLUMN "workspaceUserId",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dietary_restrictions" TEXT,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "notification_permissions_id" TEXT,
ADD COLUMN     "ntnu_username" TEXT,
ADD COLUMN     "privacy_permissions_id" TEXT,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "username" TEXT NOT NULL,
ADD COLUMN     "workspace_user_id" TEXT;

-- AlterTable
ALTER TABLE "personal_mark" DROP CONSTRAINT "personal_mark_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "givenById",
DROP COLUMN "markId",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "given_by_id" TEXT,
ADD COLUMN     "mark_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD CONSTRAINT "personal_mark_pkey" PRIMARY KEY ("mark_id", "user_id");

-- AlterTable
ALTER TABLE "privacy_permissions" DROP COLUMN "addressVisible",
DROP COLUMN "attendanceVisible",
DROP COLUMN "createdAt",
DROP COLUMN "emailVisible",
DROP COLUMN "phoneVisible",
DROP COLUMN "profileVisible",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
DROP COLUMN "usernameVisible",
ADD COLUMN     "address_visible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "attendance_visible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email_visible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone_visible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profile_visible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD COLUMN     "username_visible" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "recurring_task" DROP COLUMN "createdAt",
DROP COLUMN "lastRunAt",
DROP COLUMN "nextRunAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "last_run_at" TIMESTAMPTZ(3),
ADD COLUMN     "next_run_at" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "task" DROP COLUMN "createdAt",
DROP COLUMN "processedAt",
DROP COLUMN "recurringTaskId",
DROP COLUMN "scheduledAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "processed_at" TIMESTAMPTZ(3),
ADD COLUMN     "recurring_task_id" TEXT,
ADD COLUMN     "scheduled_at" TIMESTAMPTZ(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "attendee_attendance_id_user_id_key" ON "attendee"("attendance_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_form_public_results_token_key" ON "feedback_form"("public_results_token");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_form_event_id_key" ON "feedback_form"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_form_answer_attendee_id_key" ON "feedback_form_answer"("attendee_id");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_question_option_question_id_name_key" ON "feedback_question_option"("question_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "group_workspace_group_id_key" ON "group"("workspace_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_role_group_id_name_key" ON "group_role"("group_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "notification_permissions_user_id_key" ON "notification_permissions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ow_user_username_key" ON "ow_user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ow_user_workspace_user_id_key" ON "ow_user"("workspace_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ow_user_privacy_permissions_id_key" ON "ow_user"("privacy_permissions_id");

-- CreateIndex
CREATE UNIQUE INDEX "ow_user_notification_permissions_id_key" ON "ow_user"("notification_permissions_id");

-- CreateIndex
CREATE UNIQUE INDEX "privacy_permissions_user_id_key" ON "privacy_permissions"("user_id");

-- CreateIndex
CREATE INDEX "recurring_task_next_run_at_idx" ON "recurring_task"("next_run_at");

-- CreateIndex
CREATE INDEX "idx_job_scheduled_at_status" ON "task"("scheduled_at", "status");

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_membership" ADD CONSTRAINT "group_membership_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_membership" ADD CONSTRAINT "group_membership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_membership_role" ADD CONSTRAINT "group_membership_role_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "group_membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_membership_role" ADD CONSTRAINT "group_membership_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "group_role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_role" ADD CONSTRAINT "group_role_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_pool" ADD CONSTRAINT "attendance_pool_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_pool" ADD CONSTRAINT "attendance_pool_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendee" ADD CONSTRAINT "attendee_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendee" ADD CONSTRAINT "attendee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendee" ADD CONSTRAINT "attendee_attendance_pool_id_fkey" FOREIGN KEY ("attendance_pool_id") REFERENCES "attendance_pool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendee" ADD CONSTRAINT "attendee_payment_refunded_by_id_fkey" FOREIGN KEY ("payment_refunded_by_id") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_parent_fkey" FOREIGN KEY ("parent_id") REFERENCES "event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_company" ADD CONSTRAINT "event_company_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_company" ADD CONSTRAINT "event_company_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark_group" ADD CONSTRAINT "mark_group_mark_id_fkey" FOREIGN KEY ("mark_id") REFERENCES "mark"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark_group" ADD CONSTRAINT "mark_group_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_mark" ADD CONSTRAINT "personal_mark_mark_id_fkey" FOREIGN KEY ("mark_id") REFERENCES "mark"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_mark" ADD CONSTRAINT "personal_mark_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_mark" ADD CONSTRAINT "personal_mark_given_by_id_fkey" FOREIGN KEY ("given_by_id") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "privacy_permissions" ADD CONSTRAINT "privacy_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_permissions" ADD CONSTRAINT "notification_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_hosting_group" ADD CONSTRAINT "event_hosting_group_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_hosting_group" ADD CONSTRAINT "event_hosting_group_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_listing" ADD CONSTRAINT "job_listing_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_listing_location" ADD CONSTRAINT "job_listing_location_job_listing_id_fkey" FOREIGN KEY ("job_listing_id") REFERENCES "job_listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tag_link" ADD CONSTRAINT "article_tag_link_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tag_link" ADD CONSTRAINT "article_tag_link_tag_name_fkey" FOREIGN KEY ("tag_name") REFERENCES "article_tag"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_recurring_task_id_fkey" FOREIGN KEY ("recurring_task_id") REFERENCES "recurring_task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_form" ADD CONSTRAINT "feedback_form_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_question" ADD CONSTRAINT "feedback_question_feedback_form_id_fkey" FOREIGN KEY ("feedback_form_id") REFERENCES "feedback_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_question_option" ADD CONSTRAINT "feedback_question_option_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "feedback_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_question_answer" ADD CONSTRAINT "feedback_question_answer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "feedback_question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_question_answer" ADD CONSTRAINT "feedback_question_answer_form_answer_id_fkey" FOREIGN KEY ("form_answer_id") REFERENCES "feedback_form_answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_answer_option_link" ADD CONSTRAINT "feedback_answer_option_link_feedback_question_option_id_fkey" FOREIGN KEY ("feedback_question_option_id") REFERENCES "feedback_question_option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_answer_option_link" ADD CONSTRAINT "feedback_answer_option_link_feedback_question_answer_id_fkey" FOREIGN KEY ("feedback_question_answer_id") REFERENCES "feedback_question_answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_form_answer" ADD CONSTRAINT "feedback_form_answer_feedback_form_id_fkey" FOREIGN KEY ("feedback_form_id") REFERENCES "feedback_form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_form_answer" ADD CONSTRAINT "feedback_form_answer_attendee_id_fkey" FOREIGN KEY ("attendee_id") REFERENCES "attendee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deregister_reason" ADD CONSTRAINT "deregister_reason_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deregister_reason" ADD CONSTRAINT "deregister_reason_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
