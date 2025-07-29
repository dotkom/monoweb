-- CreateEnum
CREATE TYPE "group_type" AS ENUM ('COMMITTEE', 'NODE_COMMITTEE', 'ASSOCIATED');

-- CreateEnum
CREATE TYPE "group_role_type" AS ENUM ('LEADER', 'PUNISHER', 'COSMETIC');

-- CreateEnum
CREATE TYPE "event_status" AS ENUM ('DRAFT', 'PUBLIC', 'DELETED');

-- CreateEnum
CREATE TYPE "event_type" AS ENUM ('SOCIAL', 'ACADEMIC', 'COMPANY', 'GENERAL_ASSEMBLY', 'INTERNAL', 'OTHER');

-- CreateEnum
CREATE TYPE "payment_provider" AS ENUM ('STRIPE');

-- CreateEnum
CREATE TYPE "product_type" AS ENUM ('EVENT');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('UNPAID', 'PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "refund_request_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "employment_type" AS ENUM ('PARTTIME', 'FULLTIME', 'SUMMER_INTERNSHIP', 'OTHER');

-- CreateEnum
CREATE TYPE "task_type" AS ENUM ('ATTEMPT_RESERVE_ATTENDEE', 'MERGE_POOLS');

-- CreateEnum
CREATE TYPE "task_status" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "feedback_question_type" AS ENUM ('TEXT', 'LONGTEXT', 'RATING', 'CHECKBOX', 'SELECT', 'MULTISELECT');

-- CreateTable
CREATE TABLE "ow_user" (
    "id" TEXT NOT NULL,
    "profileSlug" TEXT NOT NULL,
    "privacyPermissionsId" TEXT,
    "notificationPermissionsId" TEXT,

    CONSTRAINT "ow_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT NOT NULL,
    "location" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group" (
    "slug" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "about" TEXT NOT NULL,
    "imageUrl" TEXT,
    "email" TEXT,
    "contactUrl" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "group_type" NOT NULL,

    CONSTRAINT "group_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "group_membership" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "start" TIMESTAMPTZ(3) NOT NULL,
    "end" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_membership_role" (
    "membershipId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,

    CONSTRAINT "group_membership_role_pkey" PRIMARY KEY ("membershipId","groupId","roleName")
);

-- CreateTable
CREATE TABLE "group_role" (
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "group_role_type" NOT NULL DEFAULT 'COSMETIC',

    CONSTRAINT "group_role_pkey" PRIMARY KEY ("groupId","name")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" TEXT NOT NULL,
    "registerStart" TIMESTAMPTZ(3) NOT NULL,
    "registerEnd" TIMESTAMPTZ(3) NOT NULL,
    "deregisterDeadline" TIMESTAMPTZ(3) NOT NULL,
    "selections" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_pool" (
    "id" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mergeDelayHours" INTEGER,
    "yearCriteria" JSONB NOT NULL,
    "capacity" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "attendance_pool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendee" (
    "id" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userGrade" INTEGER,
    "attendancePoolId" TEXT NOT NULL,
    "selections" JSONB NOT NULL DEFAULT '[]',
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "reserved" BOOLEAN NOT NULL,
    "earliestReservationAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "attendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "start" TIMESTAMPTZ(3) NOT NULL,
    "end" TIMESTAMPTZ(3) NOT NULL,
    "status" "event_status" NOT NULL,
    "description" TEXT,
    "subtitle" TEXT,
    "imageUrl" TEXT,
    "locationTitle" TEXT NOT NULL,
    "locationAddress" TEXT,
    "locationLink" TEXT,
    "attendanceId" TEXT,
    "type" "event_type" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_company" (
    "eventId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "event_company_pkey" PRIMARY KEY ("eventId","companyId")
);

-- CreateTable
CREATE TABLE "mark" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "details" TEXT,
    "duration" INTEGER NOT NULL,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_mark" (
    "markId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "personal_mark_pkey" PRIMARY KEY ("markId","userId")
);

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "type" "product_type" NOT NULL,
    "objectId" TEXT,
    "amount" INTEGER NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),
    "isRefundable" BOOLEAN NOT NULL DEFAULT true,
    "refundRequiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentProviderId" TEXT NOT NULL,
    "paymentProviderSessionId" TEXT NOT NULL,
    "paymentProviderOrderId" TEXT,
    "status" "payment_status" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_payment_provider" (
    "productId" TEXT NOT NULL,
    "paymentProvider" "payment_provider" NOT NULL,
    "paymentProviderId" TEXT NOT NULL,

    CONSTRAINT "product_payment_provider_pkey" PRIMARY KEY ("productId","paymentProviderId")
);

-- CreateTable
CREATE TABLE "refund_request" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "refund_request_status" NOT NULL DEFAULT 'PENDING',
    "handledById" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "refund_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "privacy_permissions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "profileVisible" BOOLEAN NOT NULL DEFAULT true,
    "usernameVisible" BOOLEAN NOT NULL DEFAULT true,
    "emailVisible" BOOLEAN NOT NULL DEFAULT false,
    "phoneVisible" BOOLEAN NOT NULL DEFAULT false,
    "addressVisible" BOOLEAN NOT NULL DEFAULT false,
    "attendanceVisible" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "privacy_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_permissions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "applications" BOOLEAN NOT NULL DEFAULT true,
    "newArticles" BOOLEAN NOT NULL DEFAULT true,
    "standardNotifications" BOOLEAN NOT NULL DEFAULT true,
    "groupMessages" BOOLEAN NOT NULL DEFAULT true,
    "markRulesUpdates" BOOLEAN NOT NULL DEFAULT true,
    "receipts" BOOLEAN NOT NULL DEFAULT true,
    "registrationByAdministrator" BOOLEAN NOT NULL DEFAULT true,
    "registrationStart" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "notification_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_hosting_group" (
    "groupId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "event_hosting_group_pkey" PRIMARY KEY ("groupId","eventId")
);

-- CreateTable
CREATE TABLE "job_listing" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "start" TIMESTAMPTZ(3) NOT NULL,
    "end" TIMESTAMPTZ(3) NOT NULL,
    "featured" BOOLEAN NOT NULL,
    "hidden" BOOLEAN NOT NULL,
    "deadline" TIMESTAMPTZ(3),
    "employment" "employment_type" NOT NULL,
    "applicationLink" TEXT,
    "applicationEmail" TEXT,
    "deadlineAsap" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "job_listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_listing_location" (
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobListingId" TEXT NOT NULL,

    CONSTRAINT "job_listing_location_pkey" PRIMARY KEY ("name","jobListingId")
);

-- CreateTable
CREATE TABLE "offline" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT,
    "imageUrl" TEXT,
    "publishedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "offline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "photographer" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "vimeoId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_tag" (
    "name" TEXT NOT NULL,

    CONSTRAINT "article_tag_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "article_tag_link" (
    "articleId" TEXT NOT NULL,
    "tagName" TEXT NOT NULL,

    CONSTRAINT "article_tag_link_pkey" PRIMARY KEY ("articleId","tagName")
);

-- CreateTable
CREATE TABLE "interest_group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "link" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "longDescription" TEXT,
    "joinInfo" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "interest_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interest_group_member" (
    "interestGroupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "interest_group_member_pkey" PRIMARY KEY ("interestGroupId","userId")
);

-- CreateTable
CREATE TABLE "event_interest_group" (
    "eventId" TEXT NOT NULL,
    "interestGroupId" TEXT NOT NULL,

    CONSTRAINT "event_interest_group_pkey" PRIMARY KEY ("eventId","interestGroupId")
);

-- CreateTable
CREATE TABLE "task" (
    "id" TEXT NOT NULL,
    "type" "task_type" NOT NULL,
    "status" "task_status" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledAt" TIMESTAMPTZ(3) NOT NULL,
    "processedAt" TIMESTAMPTZ(3),

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_form" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "publicResultsToken" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "feedback_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_question" (
    "id" TEXT NOT NULL,
    "feedbackFormId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "showInPublicResults" BOOLEAN NOT NULL DEFAULT true,
    "type" "feedback_question_type" NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "feedback_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_question_option" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "feedback_question_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_question_answer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "formAnswerId" TEXT NOT NULL,
    "value" JSONB,

    CONSTRAINT "feedback_question_answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_answer_option_link" (
    "feedbackQuestionOptionId" TEXT NOT NULL,
    "feedbackQuestionAnswerId" TEXT NOT NULL,

    CONSTRAINT "feedback_answer_option_link_pkey" PRIMARY KEY ("feedbackQuestionOptionId","feedbackQuestionAnswerId")
);

-- CreateTable
CREATE TABLE "feedback_form_answer" (
    "id" TEXT NOT NULL,
    "feedbackFormId" TEXT NOT NULL,
    "attendeeId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "feedback_form_answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ow_user_profileSlug_key" ON "ow_user"("profileSlug");

-- CreateIndex
CREATE UNIQUE INDEX "ow_user_privacyPermissionsId_key" ON "ow_user"("privacyPermissionsId");

-- CreateIndex
CREATE UNIQUE INDEX "ow_user_notificationPermissionsId_key" ON "ow_user"("notificationPermissionsId");

-- CreateIndex
CREATE UNIQUE INDEX "company_slug_key" ON "company"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "group_slug_key" ON "group"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "attendee_attendanceId_userId_key" ON "attendee"("attendanceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "product_objectId_key" ON "product"("objectId");

-- CreateIndex
CREATE UNIQUE INDEX "refund_request_paymentId_key" ON "refund_request"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "privacy_permissions_userId_key" ON "privacy_permissions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_permissions_userId_key" ON "notification_permissions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "article_slug_key" ON "article"("slug");

-- CreateIndex
CREATE INDEX "idx_job_scheduled_at_status" ON "task"("scheduledAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_form_eventId_key" ON "feedback_form"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_form_publicResultsToken_key" ON "feedback_form"("publicResultsToken");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_question_option_questionId_name_key" ON "feedback_question_option"("questionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_form_answer_attendeeId_key" ON "feedback_form_answer"("attendeeId");

-- AddForeignKey
ALTER TABLE "group_membership" ADD CONSTRAINT "group_membership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_membership" ADD CONSTRAINT "group_membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_membership_role" ADD CONSTRAINT "group_membership_role_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "group_membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_membership_role" ADD CONSTRAINT "group_membership_role_groupId_roleName_fkey" FOREIGN KEY ("groupId", "roleName") REFERENCES "group_role"("groupId", "name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_pool" ADD CONSTRAINT "attendance_pool_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendee" ADD CONSTRAINT "attendee_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendee" ADD CONSTRAINT "attendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendee" ADD CONSTRAINT "attendee_attendancePoolId_fkey" FOREIGN KEY ("attendancePoolId") REFERENCES "attendance_pool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_company" ADD CONSTRAINT "event_company_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_company" ADD CONSTRAINT "event_company_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_mark" ADD CONSTRAINT "personal_mark_markId_fkey" FOREIGN KEY ("markId") REFERENCES "mark"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_mark" ADD CONSTRAINT "personal_mark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_payment_provider" ADD CONSTRAINT "product_payment_provider_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_request" ADD CONSTRAINT "refund_request_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_request" ADD CONSTRAINT "refund_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_request" ADD CONSTRAINT "refund_request_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "privacy_permissions" ADD CONSTRAINT "privacy_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_permissions" ADD CONSTRAINT "notification_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_hosting_group" ADD CONSTRAINT "event_hosting_group_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_hosting_group" ADD CONSTRAINT "event_hosting_group_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_listing" ADD CONSTRAINT "job_listing_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_listing_location" ADD CONSTRAINT "job_listing_location_jobListingId_fkey" FOREIGN KEY ("jobListingId") REFERENCES "job_listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tag_link" ADD CONSTRAINT "article_tag_link_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tag_link" ADD CONSTRAINT "article_tag_link_tagName_fkey" FOREIGN KEY ("tagName") REFERENCES "article_tag"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_group_member" ADD CONSTRAINT "interest_group_member_interestGroupId_fkey" FOREIGN KEY ("interestGroupId") REFERENCES "interest_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_group_member" ADD CONSTRAINT "interest_group_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_interest_group" ADD CONSTRAINT "event_interest_group_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_interest_group" ADD CONSTRAINT "event_interest_group_interestGroupId_fkey" FOREIGN KEY ("interestGroupId") REFERENCES "interest_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_form" ADD CONSTRAINT "feedback_form_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_question" ADD CONSTRAINT "feedback_question_feedbackFormId_fkey" FOREIGN KEY ("feedbackFormId") REFERENCES "feedback_form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_question_option" ADD CONSTRAINT "feedback_question_option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "feedback_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_question_answer" ADD CONSTRAINT "feedback_question_answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "feedback_question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_question_answer" ADD CONSTRAINT "feedback_question_answer_formAnswerId_fkey" FOREIGN KEY ("formAnswerId") REFERENCES "feedback_form_answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_answer_option_link" ADD CONSTRAINT "feedback_answer_option_link_feedbackQuestionOptionId_fkey" FOREIGN KEY ("feedbackQuestionOptionId") REFERENCES "feedback_question_option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_answer_option_link" ADD CONSTRAINT "feedback_answer_option_link_feedbackQuestionAnswerId_fkey" FOREIGN KEY ("feedbackQuestionAnswerId") REFERENCES "feedback_question_answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_form_answer" ADD CONSTRAINT "feedback_form_answer_feedbackFormId_fkey" FOREIGN KEY ("feedbackFormId") REFERENCES "feedback_form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_form_answer" ADD CONSTRAINT "feedback_form_answer_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "attendee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

