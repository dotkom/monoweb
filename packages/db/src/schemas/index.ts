import { z } from 'zod';
import { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput = Prisma.JsonValue | null | 'JsonNull' | 'DbNull' | Prisma.NullTypes.DbNull | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.NullTypes.DbNull;
  if (v === 'JsonNull') return Prisma.NullTypes.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.string(), z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema)),
  ])
);

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.any() }),
    z.record(z.string(), z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ])
);

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const MembershipScalarFieldEnumSchema = z.enum(['id','userId','type','specialization','start','end']);

export const RelationLoadStrategySchema = z.enum(['query','join']);

export const UserScalarFieldEnumSchema = z.enum(['id','profileSlug','name','email','imageUrl','biography','phone','gender','dietaryRestrictions','ntnuUsername','flags','workspaceUserId','createdAt','updatedAt','privacyPermissionsId','notificationPermissionsId']);

export const CompanyScalarFieldEnumSchema = z.enum(['id','name','slug','description','phone','email','website','location','imageUrl','createdAt','updatedAt']);

export const GroupScalarFieldEnumSchema = z.enum(['slug','abbreviation','name','shortDescription','description','imageUrl','email','contactUrl','showLeaderAsContact','createdAt','deactivatedAt','workspaceGroupId','memberVisibility','recruitmentMethod','type']);

export const GroupMembershipScalarFieldEnumSchema = z.enum(['id','start','end','createdAt','updatedAt','groupId','userId']);

export const GroupMembershipRoleScalarFieldEnumSchema = z.enum(['membershipId','roleId']);

export const GroupRoleScalarFieldEnumSchema = z.enum(['id','name','type','groupId']);

export const AttendanceScalarFieldEnumSchema = z.enum(['id','registerStart','registerEnd','deregisterDeadline','selections','createdAt','updatedAt','attendancePrice']);

export const AttendancePoolScalarFieldEnumSchema = z.enum(['id','title','mergeDelayHours','yearCriteria','capacity','createdAt','updatedAt','attendanceId','taskId']);

export const AttendeeScalarFieldEnumSchema = z.enum(['id','userGrade','selections','reserved','earliestReservationAt','attendedAt','createdAt','updatedAt','paymentDeadline','paymentLink','paymentId','paymentReservedAt','paymentChargeDeadline','paymentChargedAt','paymentRefundedAt','paymentCheckoutUrl','attendanceId','userId','attendancePoolId','paymentRefundedById']);

export const EventScalarFieldEnumSchema = z.enum(['id','title','start','end','status','description','shortDescription','imageUrl','locationTitle','locationAddress','locationLink','type','markForMissedAttendance','createdAt','updatedAt','attendanceId','parentId','metadataImportId']);

export const EventCompanyScalarFieldEnumSchema = z.enum(['eventId','companyId']);

export const MarkScalarFieldEnumSchema = z.enum(['id','title','details','duration','weight','type','createdAt','updatedAt']);

export const MarkGroupScalarFieldEnumSchema = z.enum(['markId','groupId']);

export const PersonalMarkScalarFieldEnumSchema = z.enum(['createdAt','markId','userId','givenById']);

export const PrivacyPermissionsScalarFieldEnumSchema = z.enum(['id','userId','profileVisible','usernameVisible','emailVisible','phoneVisible','addressVisible','attendanceVisible','createdAt','updatedAt']);

export const NotificationPermissionsScalarFieldEnumSchema = z.enum(['id','userId','applications','newArticles','standardNotifications','groupMessages','markRulesUpdates','receipts','registrationByAdministrator','registrationStart','createdAt','updatedAt']);

export const EventHostingGroupScalarFieldEnumSchema = z.enum(['groupId','eventId']);

export const JobListingScalarFieldEnumSchema = z.enum(['id','title','description','shortDescription','start','end','featured','hidden','deadline','employment','applicationLink','applicationEmail','rollingAdmission','createdAt','updatedAt','companyId']);

export const JobListingLocationScalarFieldEnumSchema = z.enum(['name','createdAt','jobListingId']);

export const OfflineScalarFieldEnumSchema = z.enum(['id','title','fileUrl','imageUrl','publishedAt','createdAt','updatedAt']);

export const ArticleScalarFieldEnumSchema = z.enum(['id','slug','title','author','photographer','imageUrl','excerpt','content','isFeatured','vimeoId','createdAt','updatedAt']);

export const ArticleTagScalarFieldEnumSchema = z.enum(['name']);

export const ArticleTagLinkScalarFieldEnumSchema = z.enum(['articleId','tagName']);

export const TaskScalarFieldEnumSchema = z.enum(['id','type','status','payload','createdAt','scheduledAt','processedAt','recurringTaskId']);

export const RecurringTaskScalarFieldEnumSchema = z.enum(['id','type','payload','createdAt','schedule','lastRunAt','nextRunAt']);

export const FeedbackFormScalarFieldEnumSchema = z.enum(['id','publicResultsToken','createdAt','updatedAt','answerDeadline','eventId']);

export const FeedbackQuestionScalarFieldEnumSchema = z.enum(['id','label','required','showInPublicResults','type','order','createdAt','updatedAt','feedbackFormId']);

export const FeedbackQuestionOptionScalarFieldEnumSchema = z.enum(['id','name','questionId']);

export const FeedbackQuestionAnswerScalarFieldEnumSchema = z.enum(['id','value','questionId','formAnswerId']);

export const FeedbackQuestionAnswerOptionLinkScalarFieldEnumSchema = z.enum(['feedbackQuestionOptionId','feedbackQuestionAnswerId']);

export const FeedbackFormAnswerScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','feedbackFormId','attendeeId']);

export const AuditLogScalarFieldEnumSchema = z.enum(['id','tableName','rowId','createdAt','operation','rowData','transactionId','userId']);

export const DeregisterReasonScalarFieldEnumSchema = z.enum(['id','createdAt','registeredAt','type','details','userGrade','userId','eventId']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const JsonNullValueInputSchema = z.enum(['JsonNull',]).transform((value) => (value === 'JsonNull' ? Prisma.JsonNull : value));

export const NullableJsonNullValueInputSchema = z.enum(['DbNull','JsonNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.DbNull : value);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const JsonNullValueFilterSchema = z.enum(['DbNull','JsonNull','AnyNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.DbNull : value === 'AnyNull' ? Prisma.AnyNull : value);

export const MembershipTypeSchema = z.enum(['BACHELOR_STUDENT','MASTER_STUDENT','PHD_STUDENT','KNIGHT','SOCIAL_MEMBER','OTHER']);

export type MembershipTypeType = `${z.infer<typeof MembershipTypeSchema>}`

export const MembershipSpecializationSchema = z.enum(['ARTIFICIAL_INTELLIGENCE','DATABASE_AND_SEARCH','INTERACTION_DESIGN','SOFTWARE_ENGINEERING','UNKNOWN']);

export type MembershipSpecializationType = `${z.infer<typeof MembershipSpecializationSchema>}`

export const GroupTypeSchema = z.enum(['COMMITTEE','NODE_COMMITTEE','ASSOCIATED','INTEREST_GROUP']);

export type GroupTypeType = `${z.infer<typeof GroupTypeSchema>}`

export const GroupMemberVisibilitySchema = z.enum(['ALL_MEMBERS','WITH_ROLES','LEADER','NONE']);

export type GroupMemberVisibilityType = `${z.infer<typeof GroupMemberVisibilitySchema>}`

export const GroupRecruitmentMethodSchema = z.enum(['NONE','SPRING_APPLICATION','AUTUMN_APPLICATION','GENERAL_ASSEMBLY','NOMINATION','OTHER']);

export type GroupRecruitmentMethodType = `${z.infer<typeof GroupRecruitmentMethodSchema>}`

export const GroupRoleTypeSchema = z.enum(['LEADER','PUNISHER','TREASURER','COSMETIC','DEPUTY_LEADER','TRUSTEE','EMAIL_ONLY']);

export type GroupRoleTypeType = `${z.infer<typeof GroupRoleTypeSchema>}`

export const EventStatusSchema = z.enum(['DRAFT','PUBLIC','DELETED']);

export type EventStatusType = `${z.infer<typeof EventStatusSchema>}`

export const EventTypeSchema = z.enum(['SOCIAL','ACADEMIC','COMPANY','GENERAL_ASSEMBLY','INTERNAL','OTHER','WELCOME']);

export type EventTypeType = `${z.infer<typeof EventTypeSchema>}`

export const MarkTypeSchema = z.enum(['MANUAL','LATE_ATTENDANCE','MISSED_ATTENDANCE','MISSING_FEEDBACK','MISSING_PAYMENT']);

export type MarkTypeType = `${z.infer<typeof MarkTypeSchema>}`

export const EmploymentTypeSchema = z.enum(['PARTTIME','FULLTIME','SUMMER_INTERNSHIP','OTHER']);

export type EmploymentTypeType = `${z.infer<typeof EmploymentTypeSchema>}`

export const TaskTypeSchema = z.enum(['RESERVE_ATTENDEE','CHARGE_ATTENDEE','MERGE_ATTENDANCE_POOLS','VERIFY_PAYMENT','VERIFY_FEEDBACK_ANSWERED','SEND_FEEDBACK_FORM_EMAILS','VERIFY_ATTENDEE_ATTENDED']);

export type TaskTypeType = `${z.infer<typeof TaskTypeSchema>}`

export const TaskStatusSchema = z.enum(['PENDING','RUNNING','COMPLETED','FAILED','CANCELED']);

export type TaskStatusType = `${z.infer<typeof TaskStatusSchema>}`

export const FeedbackQuestionTypeSchema = z.enum(['TEXT','LONGTEXT','RATING','CHECKBOX','SELECT','MULTISELECT']);

export type FeedbackQuestionTypeType = `${z.infer<typeof FeedbackQuestionTypeSchema>}`

export const DeregisterReasonTypeSchema = z.enum(['SCHOOL','WORK','ECONOMY','TIME','SICK','NO_FAMILIAR_FACES','OTHER']);

export type DeregisterReasonTypeType = `${z.infer<typeof DeregisterReasonTypeSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// MEMBERSHIP SCHEMA
/////////////////////////////////////////

export const MembershipSchema = z.object({
  type: MembershipTypeSchema,
  specialization: MembershipSpecializationSchema.nullable(),
  id: z.string().uuid(),
  userId: z.string(),
  start: z.coerce.date(),
  end: z.coerce.date(),
})

export type Membership = z.infer<typeof MembershipSchema>

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  /**
   * OpenID Connect Subject claim - for this reason there is no @default(uuid()) here.
   */
  id: z.string(),
  profileSlug: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  imageUrl: z.string().nullable(),
  biography: z.string().nullable(),
  phone: z.string().nullable(),
  gender: z.string().nullable(),
  dietaryRestrictions: z.string().nullable(),
  ntnuUsername: z.string().nullable(),
  flags: z.string().array(),
  /**
   * Used for identifying the user in Google Workspace (my.name@online.ntnu.no)
   */
  workspaceUserId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  privacyPermissionsId: z.string().nullable(),
  notificationPermissionsId: z.string().nullable(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// COMPANY SCHEMA
/////////////////////////////////////////

export const CompanySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string(),
  location: z.string().nullable(),
  imageUrl: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Company = z.infer<typeof CompanySchema>

/////////////////////////////////////////
// GROUP SCHEMA
/////////////////////////////////////////

export const GroupSchema = z.object({
  memberVisibility: GroupMemberVisibilitySchema,
  recruitmentMethod: GroupRecruitmentMethodSchema,
  type: GroupTypeSchema,
  slug: z.string(),
  abbreviation: z.string(),
  name: z.string().nullable(),
  shortDescription: z.string().nullable(),
  description: z.string(),
  imageUrl: z.string().nullable(),
  email: z.string().nullable(),
  contactUrl: z.string().nullable(),
  showLeaderAsContact: z.boolean(),
  createdAt: z.coerce.date(),
  deactivatedAt: z.coerce.date().nullable(),
  workspaceGroupId: z.string().nullable(),
})

export type Group = z.infer<typeof GroupSchema>

/////////////////////////////////////////
// GROUP MEMBERSHIP SCHEMA
/////////////////////////////////////////

export const GroupMembershipSchema = z.object({
  id: z.string().uuid(),
  start: z.coerce.date(),
  end: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  groupId: z.string(),
  userId: z.string(),
})

export type GroupMembership = z.infer<typeof GroupMembershipSchema>

/////////////////////////////////////////
// GROUP MEMBERSHIP ROLE SCHEMA
/////////////////////////////////////////

export const GroupMembershipRoleSchema = z.object({
  membershipId: z.string(),
  roleId: z.string(),
})

export type GroupMembershipRole = z.infer<typeof GroupMembershipRoleSchema>

/////////////////////////////////////////
// GROUP ROLE SCHEMA
/////////////////////////////////////////

export const GroupRoleSchema = z.object({
  type: GroupRoleTypeSchema,
  id: z.string().uuid(),
  name: z.string(),
  groupId: z.string(),
})

export type GroupRole = z.infer<typeof GroupRoleSchema>

/////////////////////////////////////////
// ATTENDANCE SCHEMA
/////////////////////////////////////////

export const AttendanceSchema = z.object({
  id: z.string().uuid(),
  registerStart: z.coerce.date(),
  registerEnd: z.coerce.date(),
  deregisterDeadline: z.coerce.date(),
  selections: JsonValueSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  /**
   * The price as a whole integer in NOK (value 100 means NOK100.00)
   */
  attendancePrice: z.number().int().nullable(),
})

export type Attendance = z.infer<typeof AttendanceSchema>

/////////////////////////////////////////
// ATTENDANCE POOL SCHEMA
/////////////////////////////////////////

export const AttendancePoolSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  mergeDelayHours: z.number().int().nullable(),
  yearCriteria: JsonValueSchema,
  capacity: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  attendanceId: z.string(),
  taskId: z.string().nullable(),
})

export type AttendancePool = z.infer<typeof AttendancePoolSchema>

/////////////////////////////////////////
// ATTENDEE SCHEMA
/////////////////////////////////////////

export const AttendeeSchema = z.object({
  id: z.string().uuid(),
  /**
   * To preserve the user's grade at the time of registration
   */
  userGrade: z.number().int().nullable(),
  /**
   * Which options the user has selected from the Attendance selections
   */
  selections: JsonValueSchema,
  reserved: z.boolean(),
  earliestReservationAt: z.coerce.date(),
  attendedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  paymentDeadline: z.coerce.date().nullable(),
  paymentLink: z.string().nullable(),
  paymentId: z.string().nullable(),
  paymentReservedAt: z.coerce.date().nullable(),
  paymentChargeDeadline: z.coerce.date().nullable(),
  paymentChargedAt: z.coerce.date().nullable(),
  paymentRefundedAt: z.coerce.date().nullable(),
  paymentCheckoutUrl: z.string().nullable(),
  attendanceId: z.string(),
  userId: z.string(),
  attendancePoolId: z.string(),
  paymentRefundedById: z.string().nullable(),
})

export type Attendee = z.infer<typeof AttendeeSchema>

/////////////////////////////////////////
// EVENT SCHEMA
/////////////////////////////////////////

export const EventSchema = z.object({
  status: EventStatusSchema,
  type: EventTypeSchema,
  id: z.string().uuid(),
  title: z.string(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  description: z.string(),
  shortDescription: z.string().nullable(),
  imageUrl: z.string().nullable(),
  locationTitle: z.string().nullable(),
  locationAddress: z.string().nullable(),
  locationLink: z.string().nullable(),
  markForMissedAttendance: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  attendanceId: z.string().nullable(),
  parentId: z.string().nullable(),
  /**
   * Historical metadata -- This is the id of the event in the previous version of OnlineWeb, if it was imported from
   * the previous version
   */
  metadataImportId: z.number().int().nullable(),
})

export type Event = z.infer<typeof EventSchema>

/////////////////////////////////////////
// EVENT COMPANY SCHEMA
/////////////////////////////////////////

export const EventCompanySchema = z.object({
  eventId: z.string(),
  companyId: z.string(),
})

export type EventCompany = z.infer<typeof EventCompanySchema>

/////////////////////////////////////////
// MARK SCHEMA
/////////////////////////////////////////

export const MarkSchema = z.object({
  type: MarkTypeSchema,
  id: z.string().uuid(),
  title: z.string(),
  details: z.string().nullable(),
  /**
   * Duration in days
   */
  duration: z.number().int(),
  weight: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Mark = z.infer<typeof MarkSchema>

/////////////////////////////////////////
// MARK GROUP SCHEMA
/////////////////////////////////////////

export const MarkGroupSchema = z.object({
  markId: z.string(),
  groupId: z.string(),
})

export type MarkGroup = z.infer<typeof MarkGroupSchema>

/////////////////////////////////////////
// PERSONAL MARK SCHEMA
/////////////////////////////////////////

export const PersonalMarkSchema = z.object({
  createdAt: z.coerce.date(),
  markId: z.string(),
  userId: z.string(),
  givenById: z.string().nullable(),
})

export type PersonalMark = z.infer<typeof PersonalMarkSchema>

/////////////////////////////////////////
// PRIVACY PERMISSIONS SCHEMA
/////////////////////////////////////////

export const PrivacyPermissionsSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  profileVisible: z.boolean(),
  usernameVisible: z.boolean(),
  emailVisible: z.boolean(),
  phoneVisible: z.boolean(),
  addressVisible: z.boolean(),
  attendanceVisible: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type PrivacyPermissions = z.infer<typeof PrivacyPermissionsSchema>

/////////////////////////////////////////
// NOTIFICATION PERMISSIONS SCHEMA
/////////////////////////////////////////

export const NotificationPermissionsSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  applications: z.boolean(),
  newArticles: z.boolean(),
  standardNotifications: z.boolean(),
  groupMessages: z.boolean(),
  markRulesUpdates: z.boolean(),
  receipts: z.boolean(),
  registrationByAdministrator: z.boolean(),
  registrationStart: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type NotificationPermissions = z.infer<typeof NotificationPermissionsSchema>

/////////////////////////////////////////
// EVENT HOSTING GROUP SCHEMA
/////////////////////////////////////////

export const EventHostingGroupSchema = z.object({
  groupId: z.string(),
  eventId: z.string(),
})

export type EventHostingGroup = z.infer<typeof EventHostingGroupSchema>

/////////////////////////////////////////
// JOB LISTING SCHEMA
/////////////////////////////////////////

export const JobListingSchema = z.object({
  employment: EmploymentTypeSchema,
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  shortDescription: z.string().nullable(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  featured: z.boolean(),
  hidden: z.boolean(),
  deadline: z.coerce.date().nullable(),
  applicationLink: z.string().nullable(),
  applicationEmail: z.string().nullable(),
  /**
   * Applications are reviewed as soon as they are submitted
   */
  rollingAdmission: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  companyId: z.string(),
})

export type JobListing = z.infer<typeof JobListingSchema>

/////////////////////////////////////////
// JOB LISTING LOCATION SCHEMA
/////////////////////////////////////////

export const JobListingLocationSchema = z.object({
  name: z.string(),
  createdAt: z.coerce.date(),
  jobListingId: z.string(),
})

export type JobListingLocation = z.infer<typeof JobListingLocationSchema>

/////////////////////////////////////////
// OFFLINE SCHEMA
/////////////////////////////////////////

export const OfflineSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  fileUrl: z.string().nullable(),
  imageUrl: z.string().nullable(),
  publishedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Offline = z.infer<typeof OfflineSchema>

/////////////////////////////////////////
// ARTICLE SCHEMA
/////////////////////////////////////////

export const ArticleSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  author: z.string(),
  photographer: z.string(),
  imageUrl: z.string(),
  excerpt: z.string(),
  content: z.string(),
  isFeatured: z.boolean(),
  vimeoId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Article = z.infer<typeof ArticleSchema>

/////////////////////////////////////////
// ARTICLE TAG SCHEMA
/////////////////////////////////////////

export const ArticleTagSchema = z.object({
  name: z.string(),
})

export type ArticleTag = z.infer<typeof ArticleTagSchema>

/////////////////////////////////////////
// ARTICLE TAG LINK SCHEMA
/////////////////////////////////////////

export const ArticleTagLinkSchema = z.object({
  articleId: z.string(),
  tagName: z.string(),
})

export type ArticleTagLink = z.infer<typeof ArticleTagLinkSchema>

/////////////////////////////////////////
// TASK SCHEMA
/////////////////////////////////////////

export const TaskSchema = z.object({
  type: TaskTypeSchema,
  status: TaskStatusSchema,
  id: z.string().uuid(),
  payload: JsonValueSchema,
  createdAt: z.coerce.date(),
  scheduledAt: z.coerce.date(),
  processedAt: z.coerce.date().nullable(),
  recurringTaskId: z.string().nullable(),
})

export type Task = z.infer<typeof TaskSchema>

/////////////////////////////////////////
// RECURRING TASK SCHEMA
/////////////////////////////////////////

export const RecurringTaskSchema = z.object({
  type: TaskTypeSchema,
  id: z.string().uuid(),
  payload: JsonValueSchema,
  createdAt: z.coerce.date(),
  schedule: z.string(),
  lastRunAt: z.coerce.date().nullable(),
  nextRunAt: z.coerce.date(),
})

export type RecurringTask = z.infer<typeof RecurringTaskSchema>

/////////////////////////////////////////
// FEEDBACK FORM SCHEMA
/////////////////////////////////////////

export const FeedbackFormSchema = z.object({
  id: z.string().uuid(),
  publicResultsToken: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  answerDeadline: z.coerce.date(),
  eventId: z.string(),
})

export type FeedbackForm = z.infer<typeof FeedbackFormSchema>

/////////////////////////////////////////
// FEEDBACK QUESTION SCHEMA
/////////////////////////////////////////

export const FeedbackQuestionSchema = z.object({
  type: FeedbackQuestionTypeSchema,
  id: z.string().uuid(),
  label: z.string(),
  required: z.boolean(),
  showInPublicResults: z.boolean(),
  order: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  feedbackFormId: z.string(),
})

export type FeedbackQuestion = z.infer<typeof FeedbackQuestionSchema>

/////////////////////////////////////////
// FEEDBACK QUESTION OPTION SCHEMA
/////////////////////////////////////////

export const FeedbackQuestionOptionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  questionId: z.string(),
})

export type FeedbackQuestionOption = z.infer<typeof FeedbackQuestionOptionSchema>

/////////////////////////////////////////
// FEEDBACK QUESTION ANSWER SCHEMA
/////////////////////////////////////////

export const FeedbackQuestionAnswerSchema = z.object({
  id: z.string().uuid(),
  value: JsonValueSchema.nullable(),
  questionId: z.string(),
  formAnswerId: z.string(),
})

export type FeedbackQuestionAnswer = z.infer<typeof FeedbackQuestionAnswerSchema>

/////////////////////////////////////////
// FEEDBACK QUESTION ANSWER OPTION LINK SCHEMA
/////////////////////////////////////////

export const FeedbackQuestionAnswerOptionLinkSchema = z.object({
  feedbackQuestionOptionId: z.string(),
  feedbackQuestionAnswerId: z.string(),
})

export type FeedbackQuestionAnswerOptionLink = z.infer<typeof FeedbackQuestionAnswerOptionLinkSchema>

/////////////////////////////////////////
// FEEDBACK FORM ANSWER SCHEMA
/////////////////////////////////////////

export const FeedbackFormAnswerSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  feedbackFormId: z.string(),
  attendeeId: z.string(),
})

export type FeedbackFormAnswer = z.infer<typeof FeedbackFormAnswerSchema>

/////////////////////////////////////////
// AUDIT LOG SCHEMA
/////////////////////////////////////////

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  tableName: z.string(),
  rowId: z.string().nullable(),
  createdAt: z.coerce.date(),
  operation: z.string(),
  rowData: JsonValueSchema,
  /**
   * Database transaction id
   */
  transactionId: z.bigint(),
  userId: z.string().nullable(),
})

export type AuditLog = z.infer<typeof AuditLogSchema>

/////////////////////////////////////////
// DEREGISTER REASON SCHEMA
/////////////////////////////////////////

export const DeregisterReasonSchema = z.object({
  type: DeregisterReasonTypeSchema,
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  registeredAt: z.coerce.date(),
  details: z.string().nullable(),
  userGrade: z.number().int().nullable(),
  userId: z.string(),
  eventId: z.string(),
})

export type DeregisterReason = z.infer<typeof DeregisterReasonSchema>
