-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('TBA', 'PUBLIC', 'NO_LIMIT', 'ATTENDANCE');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('SOCIAL', 'ACADEMIC', 'COMPANY', 'BEDPRES');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('EVENT');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "RefundRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "OwUser" (
    "id" TEXT NOT NULL,
    "privacyPermissionsId" TEXT,
    "notificationPermissionsId" TEXT,

    CONSTRAINT "OwUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "phone" VARCHAR(69),
    "email" VARCHAR(69) NOT NULL,
    "website" VARCHAR(100) NOT NULL,
    "location" VARCHAR(100),
    "type" VARCHAR(100),
    "image" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Committee" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT 'kontakt@online.ntnu.no',
    "image" TEXT,

    CONSTRAINT "Committee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "registerStart" TIMESTAMP(3) NOT NULL,
    "deregisterDeadline" TIMESTAMP(3) NOT NULL,
    "registerEnd" TIMESTAMP(3) NOT NULL,
    "extras" JSONB,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendancePool" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "yearCriteria" JSONB,
    "capacity" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "AttendancePool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaitlistAttendee" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "attendanceId" TEXT,
    "userId" TEXT,
    "position" INTEGER,
    "isPunished" BOOLEAN,
    "registeredAt" TIMESTAMP(3),
    "studyYear" INTEGER NOT NULL,
    "attendancePoolId" TEXT,
    "name" TEXT NOT NULL,

    CONSTRAINT "WaitlistAttendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendee" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attendancePoolId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL,
    "extrasChoices" JSONB,
    "attended" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Attendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "status" "EventStatus" NOT NULL,
    "public" BOOLEAN NOT NULL,
    "description" TEXT,
    "subtitle" VARCHAR(255),
    "imageUrl" VARCHAR(255),
    "locationTitle" VARCHAR(255) NOT NULL,
    "locationAddress" VARCHAR(255),
    "locationLink" TEXT,
    "attendanceId" TEXT,
    "type" "EventType" NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCompany" (
    "eventId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "EventCompany_pkey" PRIMARY KEY ("eventId","companyId")
);

-- CreateTable
CREATE TABLE "Mark" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "category" VARCHAR(255) NOT NULL,
    "details" TEXT,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "Mark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalMark" (
    "markId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PersonalMark_pkey" PRIMARY KEY ("markId","userId")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "ProductType" NOT NULL,
    "objectId" TEXT,
    "amount" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isRefundable" BOOLEAN NOT NULL DEFAULT true,
    "refundRequiresApproval" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentProviderId" TEXT NOT NULL,
    "paymentProviderSessionId" TEXT NOT NULL,
    "paymentProviderOrderId" TEXT,
    "status" "PaymentStatus" NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPaymentProvider" (
    "productId" TEXT NOT NULL,
    "paymentProvider" "PaymentProvider" NOT NULL,
    "paymentProviderId" TEXT NOT NULL,

    CONSTRAINT "ProductPaymentProvider_pkey" PRIMARY KEY ("productId","paymentProviderId")
);

-- CreateTable
CREATE TABLE "RefundRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paymentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RefundRequestStatus" NOT NULL DEFAULT 'PENDING',
    "handledById" TEXT,

    CONSTRAINT "RefundRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivacyPermissions" (
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

    CONSTRAINT "PrivacyPermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPermissions" (
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

    CONSTRAINT "NotificationPermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCommittee" (
    "committeeId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "EventCommittee_pkey" PRIMARY KEY ("committeeId","eventId")
);

-- CreateTable
CREATE TABLE "JobListing" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "ingress" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "featured" BOOLEAN NOT NULL,
    "deadline" TIMESTAMP(3),
    "employment" VARCHAR(100) NOT NULL,
    "applicationLink" VARCHAR(200),
    "applicationEmail" VARCHAR(254),
    "deadlineAsap" BOOLEAN NOT NULL,

    CONSTRAINT "JobListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobListingLocation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,

    CONSTRAINT "JobListingLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobListingLocationLink" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobListingId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "JobListingLocationLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offline" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "published" TIMESTAMP(3) NOT NULL,
    "fileUrl" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "Offline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
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

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleTag" (
    "name" TEXT NOT NULL,

    CONSTRAINT "ArticleTag_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "ArticleTagLink" (
    "articleId" TEXT NOT NULL,
    "tagName" TEXT NOT NULL,

    CONSTRAINT "ArticleTagLink_pkey" PRIMARY KEY ("articleId","tagName")
);

-- CreateTable
CREATE TABLE "InterestGroup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "link" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "longDescription" TEXT NOT NULL DEFAULT '',
    "joinInfo" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "InterestGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OwUser_privacyPermissionsId_key" ON "OwUser"("privacyPermissionsId");

-- CreateIndex
CREATE UNIQUE INDEX "OwUser_notificationPermissionsId_key" ON "OwUser"("notificationPermissionsId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_email_key" ON "Company"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Attendee_attendanceId_userId_key" ON "Attendee"("attendanceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_objectId_key" ON "Product"("objectId");

-- CreateIndex
CREATE UNIQUE INDEX "RefundRequest_paymentId_key" ON "RefundRequest"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "PrivacyPermissions_userId_key" ON "PrivacyPermissions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPermissions_userId_key" ON "NotificationPermissions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JobListingLocation_name_key" ON "JobListingLocation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- AddForeignKey
ALTER TABLE "AttendancePool" ADD CONSTRAINT "AttendancePool_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitlistAttendee" ADD CONSTRAINT "WaitlistAttendee_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitlistAttendee" ADD CONSTRAINT "WaitlistAttendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "OwUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitlistAttendee" ADD CONSTRAINT "WaitlistAttendee_attendancePoolId_fkey" FOREIGN KEY ("attendancePoolId") REFERENCES "AttendancePool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "OwUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_attendancePoolId_fkey" FOREIGN KEY ("attendancePoolId") REFERENCES "AttendancePool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCompany" ADD CONSTRAINT "EventCompany_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCompany" ADD CONSTRAINT "EventCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalMark" ADD CONSTRAINT "PersonalMark_markId_fkey" FOREIGN KEY ("markId") REFERENCES "Mark"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalMark" ADD CONSTRAINT "PersonalMark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "OwUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "OwUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPaymentProvider" ADD CONSTRAINT "ProductPaymentProvider_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "OwUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "OwUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivacyPermissions" ADD CONSTRAINT "PrivacyPermissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "OwUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPermissions" ADD CONSTRAINT "NotificationPermissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "OwUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCommittee" ADD CONSTRAINT "EventCommittee_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCommittee" ADD CONSTRAINT "EventCommittee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobListing" ADD CONSTRAINT "JobListing_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobListingLocationLink" ADD CONSTRAINT "JobListingLocationLink_jobListingId_fkey" FOREIGN KEY ("jobListingId") REFERENCES "JobListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobListingLocationLink" ADD CONSTRAINT "JobListingLocationLink_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "JobListingLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleTagLink" ADD CONSTRAINT "ArticleTagLink_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleTagLink" ADD CONSTRAINT "ArticleTagLink_tagName_fkey" FOREIGN KEY ("tagName") REFERENCES "ArticleTag"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
