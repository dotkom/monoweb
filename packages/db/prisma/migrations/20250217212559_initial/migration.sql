-- CreateEnum
CREATE TYPE "event_status" AS ENUM ('TBA', 'PUBLIC', 'NO_LIMIT', 'ATTENDANCE');

-- CreateEnum
CREATE TYPE "event_type" AS ENUM ('SOCIAL', 'ACADEMIC', 'COMPANY', 'BEDPRES');

-- CreateEnum
CREATE TYPE "payment_provider" AS ENUM ('STRIPE');

-- CreateEnum
CREATE TYPE "product_type" AS ENUM ('EVENT');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('UNPAID', 'PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "refund_request_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "company_type" AS ENUM ('CONSULTING', 'RESEARCH', 'DEVELOPMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "employment_type" AS ENUM ('PARTTIME', 'FULLTIME', 'SUMMER_INTERNSHIP', 'OTHER');

-- CreateTable
CREATE TABLE "ow_user" (
    "id" TEXT NOT NULL,
    "privacyPermissionsId" TEXT,
    "notificationPermissionsId" TEXT,

    CONSTRAINT "ow_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "location" TEXT,
    "type" "company_type" NOT NULL,
    "image" TEXT,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "image" TEXT,

    CONSTRAINT "committee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "registerStart" TIMESTAMP(3) NOT NULL,
    "deregisterDeadline" TIMESTAMP(3) NOT NULL,
    "registerEnd" TIMESTAMP(3) NOT NULL,
    "questions" JSONB,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_pool" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "yearCriteria" JSONB NOT NULL,
    "capacity" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "attendance_pool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist_attendee" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "userId" TEXT,
    "position" INTEGER,
    "isPunished" BOOLEAN,
    "registeredAt" TIMESTAMP(3),
    "studyYear" INTEGER NOT NULL,
    "attendancePoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "waitlist_attendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendee" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attendancePoolId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL,
    "questionsChoices" JSONB,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "firstName" TEXT,
    "lastName" TEXT,

    CONSTRAINT "attendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "status" "event_status" NOT NULL,
    "public" BOOLEAN NOT NULL,
    "description" TEXT,
    "subtitle" TEXT,
    "imageUrl" TEXT,
    "locationTitle" TEXT NOT NULL,
    "locationAddress" TEXT,
    "locationLink" TEXT,
    "attendanceId" TEXT,
    "type" "event_type" NOT NULL,

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
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,
    "details" TEXT,
    "duration" INTEGER NOT NULL,

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "product_type" NOT NULL,
    "objectId" TEXT,
    "amount" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isRefundable" BOOLEAN NOT NULL DEFAULT true,
    "refundRequiresApproval" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentProviderId" TEXT NOT NULL,
    "paymentProviderSessionId" TEXT NOT NULL,
    "paymentProviderOrderId" TEXT,
    "status" "payment_status" NOT NULL,

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paymentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "refund_request_status" NOT NULL DEFAULT 'PENDING',
    "handledById" TEXT,

    CONSTRAINT "refund_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "privacy_permissions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
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
CREATE TABLE "event_committee" (
    "committeeId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "event_committee_pkey" PRIMARY KEY ("committeeId","eventId")
);

-- CreateTable
CREATE TABLE "job_listing" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "ingress" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "featured" BOOLEAN NOT NULL,
    "deadline" TIMESTAMP(3),
    "employment" "employment_type" NOT NULL,
    "applicationLink" TEXT,
    "applicationEmail" TEXT,
    "deadlineAsap" BOOLEAN NOT NULL,

    CONSTRAINT "job_listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_listing_location" (
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobListingId" TEXT NOT NULL,

    CONSTRAINT "job_listing_location_pkey" PRIMARY KEY ("name","jobListingId")
);

-- CreateTable
CREATE TABLE "offline" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "published" TIMESTAMP(3) NOT NULL,
    "fileUrl" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "offline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "photographer" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "link" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "longDescription" TEXT,
    "joinInfo" TEXT,

    CONSTRAINT "interest_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interest_group_member" (
    "interestGroupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "interest_group_member_pkey" PRIMARY KEY ("interestGroupId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ow_user_privacyPermissionsId_key" ON "ow_user"("privacyPermissionsId");

-- CreateIndex
CREATE UNIQUE INDEX "ow_user_notificationPermissionsId_key" ON "ow_user"("notificationPermissionsId");

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

-- AddForeignKey
ALTER TABLE "attendance_pool" ADD CONSTRAINT "attendance_pool_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist_attendee" ADD CONSTRAINT "waitlist_attendee_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist_attendee" ADD CONSTRAINT "waitlist_attendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist_attendee" ADD CONSTRAINT "waitlist_attendee_attendancePoolId_fkey" FOREIGN KEY ("attendancePoolId") REFERENCES "attendance_pool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "event_committee" ADD CONSTRAINT "event_committee_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "committee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_committee" ADD CONSTRAINT "event_committee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
