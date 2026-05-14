// @ts-nocheck
/**
 * Prisma Zod Generator - Single File (inlined)
 * Auto-generated. Do not edit.
 */

import * as z from 'zod/v4';
import type { Prisma } from '../prisma/client';
// File: TransactionIsolationLevel.schema.ts

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted', 'ReadCommitted', 'RepeatableRead', 'Serializable'])

export type TransactionIsolationLevel = z.infer<typeof TransactionIsolationLevelSchema>;

// File: CourseScalarFieldEnum.schema.ts

export const CourseScalarFieldEnumSchema = z.enum(['id', 'code', 'nameNo', 'nameEn', 'credits', 'studyLevel', 'gradeType', 'firstYearTaught', 'lastYearTaught', 'contentNo', 'contentEn', 'teachingMethodsNo', 'teachingMethodsEn', 'learningOutcomesNo', 'learningOutcomesEn', 'examTypeNo', 'examTypeEn', 'candidateCount', 'averageGrade', 'passRate', 'createdAt', 'updatedAt', 'taughtSemesters', 'teachingLanguages', 'campuses', 'facultyId', 'departmentId', 'latestYearCheckedForNtnuData'])

export type CourseScalarFieldEnum = z.infer<typeof CourseScalarFieldEnumSchema>;

// File: RelationLoadStrategy.schema.ts

export const RelationLoadStrategySchema = z.enum(['query', 'join'])

export type RelationLoadStrategy = z.infer<typeof RelationLoadStrategySchema>;

// File: GradeScalarFieldEnum.schema.ts

export const GradeScalarFieldEnumSchema = z.enum(['id', 'gradeACount', 'gradeBCount', 'gradeCCount', 'gradeDCount', 'gradeECount', 'gradeFCount', 'passedCount', 'failedCount', 'courseId', 'semester', 'year', 'createdAt', 'updatedAt'])

export type GradeScalarFieldEnum = z.infer<typeof GradeScalarFieldEnumSchema>;

// File: FacultyScalarFieldEnum.schema.ts

export const FacultyScalarFieldEnumSchema = z.enum(['id', 'nameNo', 'nameEn', 'code'])

export type FacultyScalarFieldEnum = z.infer<typeof FacultyScalarFieldEnumSchema>;

// File: DepartmentScalarFieldEnum.schema.ts

export const DepartmentScalarFieldEnumSchema = z.enum(['id', 'nameNo', 'nameEn', 'code', 'facultyId'])

export type DepartmentScalarFieldEnum = z.infer<typeof DepartmentScalarFieldEnumSchema>;

// File: SortOrder.schema.ts

export const SortOrderSchema = z.enum(['asc', 'desc'])

export type SortOrder = z.infer<typeof SortOrderSchema>;

// File: QueryMode.schema.ts

export const QueryModeSchema = z.enum(['default', 'insensitive'])

export type QueryMode = z.infer<typeof QueryModeSchema>;

// File: NullsOrder.schema.ts

export const NullsOrderSchema = z.enum(['first', 'last'])

export type NullsOrder = z.infer<typeof NullsOrderSchema>;

// File: StudyLevel.schema.ts

export const StudyLevelSchema = z.enum(['FOUNDATION', 'INTERMEDIATE', 'BACHELOR_ADVANCED', 'MASTER', 'PHD', 'CONTINUING_EDUCATION', 'UNKNOWN'])

export type StudyLevel = z.infer<typeof StudyLevelSchema>;

// File: GradeType.schema.ts

export const GradeTypeSchema = z.enum(['PASS_FAIL', 'LETTER'])

export type GradeType = z.infer<typeof GradeTypeSchema>;

// File: Semester.schema.ts

export const SemesterSchema = z.enum(['SPRING', 'SUMMER', 'AUTUMN'])

export type Semester = z.infer<typeof SemesterSchema>;

// File: TeachingLanguage.schema.ts

export const TeachingLanguageSchema = z.enum(['NORWEGIAN', 'ENGLISH'])

export type TeachingLanguage = z.infer<typeof TeachingLanguageSchema>;

// File: Campus.schema.ts

export const CampusSchema = z.enum(['TRONDHEIM', 'GJOVIK', 'ALESUND'])

export type Campus = z.infer<typeof CampusSchema>;

// File: CourseWhereInput.schema.ts
const __makeSchema_CourseWhereInput_schema = () => z.object({
  AND: z.union([CourseWhereInputObjectSchema, CourseWhereInputObjectSchema.array()]).optional(),
  get OR(){ return CourseWhereInputObjectSchema.array().optional(); },
  NOT: z.union([CourseWhereInputObjectSchema, CourseWhereInputObjectSchema.array()]).optional(),
  id: z.union([StringFilterObjectSchema, z.string()]).optional(),
  code: z.union([StringFilterObjectSchema, z.string()]).optional(),
  nameNo: z.union([StringFilterObjectSchema, z.string()]).optional(),
  nameEn: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  credits: z.union([FloatNullableFilterObjectSchema, z.number()]).optional().nullable(),
  studyLevel: z.union([EnumStudyLevelFilterObjectSchema, StudyLevelSchema]).optional(),
  gradeType: z.union([EnumGradeTypeFilterObjectSchema, GradeTypeSchema]).optional(),
  firstYearTaught: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  lastYearTaught: z.union([IntNullableFilterObjectSchema, z.number().int()]).optional().nullable(),
  contentNo: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  contentEn: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  teachingMethodsNo: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  teachingMethodsEn: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  learningOutcomesNo: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  learningOutcomesEn: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  examTypeNo: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  examTypeEn: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  candidateCount: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  averageGrade: z.union([FloatFilterObjectSchema, z.number()]).optional(),
  passRate: z.union([FloatFilterObjectSchema, z.number()]).optional(),
  createdAt: z.union([DateTimeFilterObjectSchema, z.coerce.date()]).optional(),
  updatedAt: z.union([DateTimeFilterObjectSchema, z.coerce.date()]).optional(),
  get taughtSemesters(){ return EnumSemesterNullableListFilterObjectSchema.optional(); },
  get teachingLanguages(){ return EnumTeachingLanguageNullableListFilterObjectSchema.optional(); },
  get campuses(){ return EnumCampusNullableListFilterObjectSchema.optional(); },
  facultyId: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  departmentId: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  latestYearCheckedForNtnuData: z.union([IntNullableFilterObjectSchema, z.number().int()]).optional().nullable(),
  get grades(){ return GradeListRelationFilterObjectSchema.optional(); },
  faculty: z.union([FacultyNullableScalarRelationFilterObjectSchema, FacultyWhereInputObjectSchema]).optional(),
  department: z.union([DepartmentNullableScalarRelationFilterObjectSchema, DepartmentWhereInputObjectSchema]).optional()
}).strict();
export const CourseWhereInputObjectSchema: z.ZodType<Prisma.CourseWhereInput> = z.lazy(__makeSchema_CourseWhereInput_schema) as unknown as z.ZodType<Prisma.CourseWhereInput>;
export const CourseWhereInputObjectZodSchema = z.lazy(__makeSchema_CourseWhereInput_schema);


// File: CourseOrderByWithRelationInput.schema.ts
const __makeSchema_CourseOrderByWithRelationInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  credits: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  studyLevel: SortOrderSchema.optional(),
  gradeType: SortOrderSchema.optional(),
  firstYearTaught: SortOrderSchema.optional(),
  lastYearTaught: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  contentNo: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  contentEn: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  teachingMethodsNo: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  teachingMethodsEn: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  learningOutcomesNo: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  learningOutcomesEn: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  examTypeNo: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  examTypeEn: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  candidateCount: SortOrderSchema.optional(),
  averageGrade: SortOrderSchema.optional(),
  passRate: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional(),
  taughtSemesters: SortOrderSchema.optional(),
  teachingLanguages: SortOrderSchema.optional(),
  campuses: SortOrderSchema.optional(),
  facultyId: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  departmentId: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  latestYearCheckedForNtnuData: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  get grades(){ return GradeOrderByRelationAggregateInputObjectSchema.optional(); },
  get faculty(){ return FacultyOrderByWithRelationInputObjectSchema.optional(); },
  get department(){ return DepartmentOrderByWithRelationInputObjectSchema.optional(); }
}).strict();
export const CourseOrderByWithRelationInputObjectSchema: z.ZodType<Prisma.CourseOrderByWithRelationInput> = z.lazy(__makeSchema_CourseOrderByWithRelationInput_schema) as unknown as z.ZodType<Prisma.CourseOrderByWithRelationInput>;
export const CourseOrderByWithRelationInputObjectZodSchema = z.lazy(__makeSchema_CourseOrderByWithRelationInput_schema);


// File: CourseWhereUniqueInput.schema.ts
const __makeSchema_CourseWhereUniqueInput_schema = () => z.object({
  id: z.string().optional(),
  code: z.string().optional()
}).strict();
export const CourseWhereUniqueInputObjectSchema: z.ZodType<Prisma.CourseWhereUniqueInput> = z.lazy(__makeSchema_CourseWhereUniqueInput_schema) as unknown as z.ZodType<Prisma.CourseWhereUniqueInput>;
export const CourseWhereUniqueInputObjectZodSchema = z.lazy(__makeSchema_CourseWhereUniqueInput_schema);


// File: CourseOrderByWithAggregationInput.schema.ts
const __makeSchema_CourseOrderByWithAggregationInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  credits: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  studyLevel: SortOrderSchema.optional(),
  gradeType: SortOrderSchema.optional(),
  firstYearTaught: SortOrderSchema.optional(),
  lastYearTaught: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  contentNo: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  contentEn: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  teachingMethodsNo: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  teachingMethodsEn: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  learningOutcomesNo: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  learningOutcomesEn: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  examTypeNo: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  examTypeEn: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  candidateCount: SortOrderSchema.optional(),
  averageGrade: SortOrderSchema.optional(),
  passRate: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional(),
  taughtSemesters: SortOrderSchema.optional(),
  teachingLanguages: SortOrderSchema.optional(),
  campuses: SortOrderSchema.optional(),
  facultyId: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  departmentId: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  latestYearCheckedForNtnuData: z.union([SortOrderSchema, SortOrderInputObjectSchema]).optional(),
  get _count(){ return CourseCountOrderByAggregateInputObjectSchema.optional(); },
  get _avg(){ return CourseAvgOrderByAggregateInputObjectSchema.optional(); },
  get _max(){ return CourseMaxOrderByAggregateInputObjectSchema.optional(); },
  get _min(){ return CourseMinOrderByAggregateInputObjectSchema.optional(); },
  get _sum(){ return CourseSumOrderByAggregateInputObjectSchema.optional(); }
}).strict();
export const CourseOrderByWithAggregationInputObjectSchema: z.ZodType<Prisma.CourseOrderByWithAggregationInput> = z.lazy(__makeSchema_CourseOrderByWithAggregationInput_schema) as unknown as z.ZodType<Prisma.CourseOrderByWithAggregationInput>;
export const CourseOrderByWithAggregationInputObjectZodSchema = z.lazy(__makeSchema_CourseOrderByWithAggregationInput_schema);


// File: CourseScalarWhereWithAggregatesInput.schema.ts
const __makeSchema_CourseScalarWhereWithAggregatesInput_schema = () => z.object({
  AND: z.union([CourseScalarWhereWithAggregatesInputObjectSchema, CourseScalarWhereWithAggregatesInputObjectSchema.array()]).optional(),
  get OR(){ return CourseScalarWhereWithAggregatesInputObjectSchema.array().optional(); },
  NOT: z.union([CourseScalarWhereWithAggregatesInputObjectSchema, CourseScalarWhereWithAggregatesInputObjectSchema.array()]).optional(),
  id: z.union([StringWithAggregatesFilterObjectSchema, z.string()]).optional(),
  code: z.union([StringWithAggregatesFilterObjectSchema, z.string()]).optional(),
  nameNo: z.union([StringWithAggregatesFilterObjectSchema, z.string()]).optional(),
  nameEn: z.union([StringNullableWithAggregatesFilterObjectSchema, z.string()]).optional().nullable(),
  credits: z.union([FloatNullableWithAggregatesFilterObjectSchema, z.number()]).optional().nullable(),
  studyLevel: z.union([EnumStudyLevelWithAggregatesFilterObjectSchema, StudyLevelSchema]).optional(),
  gradeType: z.union([EnumGradeTypeWithAggregatesFilterObjectSchema, GradeTypeSchema]).optional(),
  firstYearTaught: z.union([IntWithAggregatesFilterObjectSchema, z.number().int()]).optional(),
  lastYearTaught: z.union([IntNullableWithAggregatesFilterObjectSchema, z.number().int()]).optional().nullable(),
  contentNo: z.union([StringNullableWithAggregatesFilterObjectSchema, z.string()]).optional().nullable(),
  contentEn: z.union([StringNullableWithAggregatesFilterObjectSchema, z.string()]).optional().nullable(),
  teachingMethodsNo: z.union([StringNullableWithAggregatesFilterObjectSchema, z.string()]).optional().nullable(),
  teachingMethodsEn: z.union([StringNullableWithAggregatesFilterObjectSchema, z.string()]).optional().nullable(),
  learningOutcomesNo: z.union([StringNullableWithAggregatesFilterObjectSchema, z.string()]).optional().nullable(),
  learningOutcomesEn: z.union([StringNullableWithAggregatesFilterObjectSchema, z.string()]).optional().nullable(),
  examTypeNo: z.union([StringNullableWithAggregatesFilterObjectSchema, z.string()]).optional().nullable(),
  examTypeEn: z.union([StringNullableWithAggregatesFilterObjectSchema, z.string()]).optional().nullable(),
  candidateCount: z.union([IntWithAggregatesFilterObjectSchema, z.number().int()]).optional(),
  averageGrade: z.union([FloatWithAggregatesFilterObjectSchema, z.number()]).optional(),
  passRate: z.union([FloatWithAggregatesFilterObjectSchema, z.number()]).optional(),
  createdAt: z.union([DateTimeWithAggregatesFilterObjectSchema, z.coerce.date()]).optional(),
  updatedAt: z.union([DateTimeWithAggregatesFilterObjectSchema, z.coerce.date()]).optional(),
  get taughtSemesters(){ return EnumSemesterNullableListFilterObjectSchema.optional(); },
  get teachingLanguages(){ return EnumTeachingLanguageNullableListFilterObjectSchema.optional(); },
  get campuses(){ return EnumCampusNullableListFilterObjectSchema.optional(); },
  facultyId: z.union([StringNullableWithAggregatesFilterObjectSchema, z.string()]).optional().nullable(),
  departmentId: z.union([StringNullableWithAggregatesFilterObjectSchema, z.string()]).optional().nullable(),
  latestYearCheckedForNtnuData: z.union([IntNullableWithAggregatesFilterObjectSchema, z.number().int()]).optional().nullable()
}).strict();
export const CourseScalarWhereWithAggregatesInputObjectSchema: z.ZodType<Prisma.CourseScalarWhereWithAggregatesInput> = z.lazy(__makeSchema_CourseScalarWhereWithAggregatesInput_schema) as unknown as z.ZodType<Prisma.CourseScalarWhereWithAggregatesInput>;
export const CourseScalarWhereWithAggregatesInputObjectZodSchema = z.lazy(__makeSchema_CourseScalarWhereWithAggregatesInput_schema);


// File: GradeWhereInput.schema.ts
const __makeSchema_GradeWhereInput_schema = () => z.object({
  AND: z.union([GradeWhereInputObjectSchema, GradeWhereInputObjectSchema.array()]).optional(),
  get OR(){ return GradeWhereInputObjectSchema.array().optional(); },
  NOT: z.union([GradeWhereInputObjectSchema, GradeWhereInputObjectSchema.array()]).optional(),
  id: z.union([StringFilterObjectSchema, z.string()]).optional(),
  gradeACount: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  gradeBCount: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  gradeCCount: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  gradeDCount: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  gradeECount: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  gradeFCount: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  passedCount: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  failedCount: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  courseId: z.union([StringFilterObjectSchema, z.string()]).optional(),
  semester: z.union([EnumSemesterFilterObjectSchema, SemesterSchema]).optional(),
  year: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  createdAt: z.union([DateTimeFilterObjectSchema, z.coerce.date()]).optional(),
  updatedAt: z.union([DateTimeFilterObjectSchema, z.coerce.date()]).optional(),
  course: z.union([CourseScalarRelationFilterObjectSchema, CourseWhereInputObjectSchema]).optional()
}).strict();
export const GradeWhereInputObjectSchema: z.ZodType<Prisma.GradeWhereInput> = z.lazy(__makeSchema_GradeWhereInput_schema) as unknown as z.ZodType<Prisma.GradeWhereInput>;
export const GradeWhereInputObjectZodSchema = z.lazy(__makeSchema_GradeWhereInput_schema);


// File: GradeOrderByWithRelationInput.schema.ts
const __makeSchema_GradeOrderByWithRelationInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  gradeACount: SortOrderSchema.optional(),
  gradeBCount: SortOrderSchema.optional(),
  gradeCCount: SortOrderSchema.optional(),
  gradeDCount: SortOrderSchema.optional(),
  gradeECount: SortOrderSchema.optional(),
  gradeFCount: SortOrderSchema.optional(),
  passedCount: SortOrderSchema.optional(),
  failedCount: SortOrderSchema.optional(),
  courseId: SortOrderSchema.optional(),
  semester: SortOrderSchema.optional(),
  year: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional(),
  get course(){ return CourseOrderByWithRelationInputObjectSchema.optional(); }
}).strict();
export const GradeOrderByWithRelationInputObjectSchema: z.ZodType<Prisma.GradeOrderByWithRelationInput> = z.lazy(__makeSchema_GradeOrderByWithRelationInput_schema) as unknown as z.ZodType<Prisma.GradeOrderByWithRelationInput>;
export const GradeOrderByWithRelationInputObjectZodSchema = z.lazy(__makeSchema_GradeOrderByWithRelationInput_schema);


// File: GradeWhereUniqueInput.schema.ts
const __makeSchema_GradeWhereUniqueInput_schema = () => z.object({
  id: z.string().optional(),
  get courseId_semester_year(){ return GradeCourseIdSemesterYearCompoundUniqueInputObjectSchema.optional(); }
}).strict();
export const GradeWhereUniqueInputObjectSchema: z.ZodType<Prisma.GradeWhereUniqueInput> = z.lazy(__makeSchema_GradeWhereUniqueInput_schema) as unknown as z.ZodType<Prisma.GradeWhereUniqueInput>;
export const GradeWhereUniqueInputObjectZodSchema = z.lazy(__makeSchema_GradeWhereUniqueInput_schema);


// File: GradeOrderByWithAggregationInput.schema.ts
const __makeSchema_GradeOrderByWithAggregationInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  gradeACount: SortOrderSchema.optional(),
  gradeBCount: SortOrderSchema.optional(),
  gradeCCount: SortOrderSchema.optional(),
  gradeDCount: SortOrderSchema.optional(),
  gradeECount: SortOrderSchema.optional(),
  gradeFCount: SortOrderSchema.optional(),
  passedCount: SortOrderSchema.optional(),
  failedCount: SortOrderSchema.optional(),
  courseId: SortOrderSchema.optional(),
  semester: SortOrderSchema.optional(),
  year: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional(),
  get _count(){ return GradeCountOrderByAggregateInputObjectSchema.optional(); },
  get _avg(){ return GradeAvgOrderByAggregateInputObjectSchema.optional(); },
  get _max(){ return GradeMaxOrderByAggregateInputObjectSchema.optional(); },
  get _min(){ return GradeMinOrderByAggregateInputObjectSchema.optional(); },
  get _sum(){ return GradeSumOrderByAggregateInputObjectSchema.optional(); }
}).strict();
export const GradeOrderByWithAggregationInputObjectSchema: z.ZodType<Prisma.GradeOrderByWithAggregationInput> = z.lazy(__makeSchema_GradeOrderByWithAggregationInput_schema) as unknown as z.ZodType<Prisma.GradeOrderByWithAggregationInput>;
export const GradeOrderByWithAggregationInputObjectZodSchema = z.lazy(__makeSchema_GradeOrderByWithAggregationInput_schema);


// File: GradeScalarWhereWithAggregatesInput.schema.ts
const __makeSchema_GradeScalarWhereWithAggregatesInput_schema = () => z.object({
  AND: z.union([GradeScalarWhereWithAggregatesInputObjectSchema, GradeScalarWhereWithAggregatesInputObjectSchema.array()]).optional(),
  get OR(){ return GradeScalarWhereWithAggregatesInputObjectSchema.array().optional(); },
  NOT: z.union([GradeScalarWhereWithAggregatesInputObjectSchema, GradeScalarWhereWithAggregatesInputObjectSchema.array()]).optional(),
  id: z.union([StringWithAggregatesFilterObjectSchema, z.string()]).optional(),
  gradeACount: z.union([IntWithAggregatesFilterObjectSchema, z.number().int()]).optional(),
  gradeBCount: z.union([IntWithAggregatesFilterObjectSchema, z.number().int()]).optional(),
  gradeCCount: z.union([IntWithAggregatesFilterObjectSchema, z.number().int()]).optional(),
  gradeDCount: z.union([IntWithAggregatesFilterObjectSchema, z.number().int()]).optional(),
  gradeECount: z.union([IntWithAggregatesFilterObjectSchema, z.number().int()]).optional(),
  gradeFCount: z.union([IntWithAggregatesFilterObjectSchema, z.number().int()]).optional(),
  passedCount: z.union([IntWithAggregatesFilterObjectSchema, z.number().int()]).optional(),
  failedCount: z.union([IntWithAggregatesFilterObjectSchema, z.number().int()]).optional(),
  courseId: z.union([StringWithAggregatesFilterObjectSchema, z.string()]).optional(),
  semester: z.union([EnumSemesterWithAggregatesFilterObjectSchema, SemesterSchema]).optional(),
  year: z.union([IntWithAggregatesFilterObjectSchema, z.number().int()]).optional(),
  createdAt: z.union([DateTimeWithAggregatesFilterObjectSchema, z.coerce.date()]).optional(),
  updatedAt: z.union([DateTimeWithAggregatesFilterObjectSchema, z.coerce.date()]).optional()
}).strict();
export const GradeScalarWhereWithAggregatesInputObjectSchema: z.ZodType<Prisma.GradeScalarWhereWithAggregatesInput> = z.lazy(__makeSchema_GradeScalarWhereWithAggregatesInput_schema) as unknown as z.ZodType<Prisma.GradeScalarWhereWithAggregatesInput>;
export const GradeScalarWhereWithAggregatesInputObjectZodSchema = z.lazy(__makeSchema_GradeScalarWhereWithAggregatesInput_schema);


// File: FacultyWhereInput.schema.ts
const __makeSchema_FacultyWhereInput_schema = () => z.object({
  AND: z.union([FacultyWhereInputObjectSchema, FacultyWhereInputObjectSchema.array()]).optional(),
  get OR(){ return FacultyWhereInputObjectSchema.array().optional(); },
  NOT: z.union([FacultyWhereInputObjectSchema, FacultyWhereInputObjectSchema.array()]).optional(),
  id: z.union([StringFilterObjectSchema, z.string()]).optional(),
  nameNo: z.union([StringFilterObjectSchema, z.string()]).optional(),
  nameEn: z.union([StringFilterObjectSchema, z.string()]).optional(),
  code: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  get courses(){ return CourseListRelationFilterObjectSchema.optional(); },
  get departments(){ return DepartmentListRelationFilterObjectSchema.optional(); }
}).strict();
export const FacultyWhereInputObjectSchema: z.ZodType<Prisma.FacultyWhereInput> = z.lazy(__makeSchema_FacultyWhereInput_schema) as unknown as z.ZodType<Prisma.FacultyWhereInput>;
export const FacultyWhereInputObjectZodSchema = z.lazy(__makeSchema_FacultyWhereInput_schema);


// File: FacultyOrderByWithRelationInput.schema.ts
const __makeSchema_FacultyOrderByWithRelationInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  get courses(){ return CourseOrderByRelationAggregateInputObjectSchema.optional(); },
  get departments(){ return DepartmentOrderByRelationAggregateInputObjectSchema.optional(); }
}).strict();
export const FacultyOrderByWithRelationInputObjectSchema: z.ZodType<Prisma.FacultyOrderByWithRelationInput> = z.lazy(__makeSchema_FacultyOrderByWithRelationInput_schema) as unknown as z.ZodType<Prisma.FacultyOrderByWithRelationInput>;
export const FacultyOrderByWithRelationInputObjectZodSchema = z.lazy(__makeSchema_FacultyOrderByWithRelationInput_schema);


// File: FacultyWhereUniqueInput.schema.ts
const __makeSchema_FacultyWhereUniqueInput_schema = () => z.object({
  id: z.string().optional(),
  code: z.number().int().optional()
}).strict();
export const FacultyWhereUniqueInputObjectSchema: z.ZodType<Prisma.FacultyWhereUniqueInput> = z.lazy(__makeSchema_FacultyWhereUniqueInput_schema) as unknown as z.ZodType<Prisma.FacultyWhereUniqueInput>;
export const FacultyWhereUniqueInputObjectZodSchema = z.lazy(__makeSchema_FacultyWhereUniqueInput_schema);


// File: FacultyOrderByWithAggregationInput.schema.ts
const __makeSchema_FacultyOrderByWithAggregationInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  get _count(){ return FacultyCountOrderByAggregateInputObjectSchema.optional(); },
  get _avg(){ return FacultyAvgOrderByAggregateInputObjectSchema.optional(); },
  get _max(){ return FacultyMaxOrderByAggregateInputObjectSchema.optional(); },
  get _min(){ return FacultyMinOrderByAggregateInputObjectSchema.optional(); },
  get _sum(){ return FacultySumOrderByAggregateInputObjectSchema.optional(); }
}).strict();
export const FacultyOrderByWithAggregationInputObjectSchema: z.ZodType<Prisma.FacultyOrderByWithAggregationInput> = z.lazy(__makeSchema_FacultyOrderByWithAggregationInput_schema) as unknown as z.ZodType<Prisma.FacultyOrderByWithAggregationInput>;
export const FacultyOrderByWithAggregationInputObjectZodSchema = z.lazy(__makeSchema_FacultyOrderByWithAggregationInput_schema);


// File: FacultyScalarWhereWithAggregatesInput.schema.ts
const __makeSchema_FacultyScalarWhereWithAggregatesInput_schema = () => z.object({
  AND: z.union([FacultyScalarWhereWithAggregatesInputObjectSchema, FacultyScalarWhereWithAggregatesInputObjectSchema.array()]).optional(),
  get OR(){ return FacultyScalarWhereWithAggregatesInputObjectSchema.array().optional(); },
  NOT: z.union([FacultyScalarWhereWithAggregatesInputObjectSchema, FacultyScalarWhereWithAggregatesInputObjectSchema.array()]).optional(),
  id: z.union([StringWithAggregatesFilterObjectSchema, z.string()]).optional(),
  nameNo: z.union([StringWithAggregatesFilterObjectSchema, z.string()]).optional(),
  nameEn: z.union([StringWithAggregatesFilterObjectSchema, z.string()]).optional(),
  code: z.union([IntWithAggregatesFilterObjectSchema, z.number().int()]).optional()
}).strict();
export const FacultyScalarWhereWithAggregatesInputObjectSchema: z.ZodType<Prisma.FacultyScalarWhereWithAggregatesInput> = z.lazy(__makeSchema_FacultyScalarWhereWithAggregatesInput_schema) as unknown as z.ZodType<Prisma.FacultyScalarWhereWithAggregatesInput>;
export const FacultyScalarWhereWithAggregatesInputObjectZodSchema = z.lazy(__makeSchema_FacultyScalarWhereWithAggregatesInput_schema);


// File: DepartmentWhereInput.schema.ts
const __makeSchema_DepartmentWhereInput_schema = () => z.object({
  AND: z.union([DepartmentWhereInputObjectSchema, DepartmentWhereInputObjectSchema.array()]).optional(),
  get OR(){ return DepartmentWhereInputObjectSchema.array().optional(); },
  NOT: z.union([DepartmentWhereInputObjectSchema, DepartmentWhereInputObjectSchema.array()]).optional(),
  id: z.union([StringFilterObjectSchema, z.string()]).optional(),
  nameNo: z.union([StringFilterObjectSchema, z.string()]).optional(),
  nameEn: z.union([StringFilterObjectSchema, z.string()]).optional(),
  code: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  facultyId: z.union([StringFilterObjectSchema, z.string()]).optional(),
  get courses(){ return CourseListRelationFilterObjectSchema.optional(); },
  faculty: z.union([FacultyScalarRelationFilterObjectSchema, FacultyWhereInputObjectSchema]).optional()
}).strict();
export const DepartmentWhereInputObjectSchema: z.ZodType<Prisma.DepartmentWhereInput> = z.lazy(__makeSchema_DepartmentWhereInput_schema) as unknown as z.ZodType<Prisma.DepartmentWhereInput>;
export const DepartmentWhereInputObjectZodSchema = z.lazy(__makeSchema_DepartmentWhereInput_schema);


// File: DepartmentOrderByWithRelationInput.schema.ts
const __makeSchema_DepartmentOrderByWithRelationInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  facultyId: SortOrderSchema.optional(),
  get courses(){ return CourseOrderByRelationAggregateInputObjectSchema.optional(); },
  get faculty(){ return FacultyOrderByWithRelationInputObjectSchema.optional(); }
}).strict();
export const DepartmentOrderByWithRelationInputObjectSchema: z.ZodType<Prisma.DepartmentOrderByWithRelationInput> = z.lazy(__makeSchema_DepartmentOrderByWithRelationInput_schema) as unknown as z.ZodType<Prisma.DepartmentOrderByWithRelationInput>;
export const DepartmentOrderByWithRelationInputObjectZodSchema = z.lazy(__makeSchema_DepartmentOrderByWithRelationInput_schema);


// File: DepartmentWhereUniqueInput.schema.ts
const __makeSchema_DepartmentWhereUniqueInput_schema = () => z.object({
  id: z.string().optional(),
  code: z.number().int().optional()
}).strict();
export const DepartmentWhereUniqueInputObjectSchema: z.ZodType<Prisma.DepartmentWhereUniqueInput> = z.lazy(__makeSchema_DepartmentWhereUniqueInput_schema) as unknown as z.ZodType<Prisma.DepartmentWhereUniqueInput>;
export const DepartmentWhereUniqueInputObjectZodSchema = z.lazy(__makeSchema_DepartmentWhereUniqueInput_schema);


// File: DepartmentOrderByWithAggregationInput.schema.ts
const __makeSchema_DepartmentOrderByWithAggregationInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  facultyId: SortOrderSchema.optional(),
  get _count(){ return DepartmentCountOrderByAggregateInputObjectSchema.optional(); },
  get _avg(){ return DepartmentAvgOrderByAggregateInputObjectSchema.optional(); },
  get _max(){ return DepartmentMaxOrderByAggregateInputObjectSchema.optional(); },
  get _min(){ return DepartmentMinOrderByAggregateInputObjectSchema.optional(); },
  get _sum(){ return DepartmentSumOrderByAggregateInputObjectSchema.optional(); }
}).strict();
export const DepartmentOrderByWithAggregationInputObjectSchema: z.ZodType<Prisma.DepartmentOrderByWithAggregationInput> = z.lazy(__makeSchema_DepartmentOrderByWithAggregationInput_schema) as unknown as z.ZodType<Prisma.DepartmentOrderByWithAggregationInput>;
export const DepartmentOrderByWithAggregationInputObjectZodSchema = z.lazy(__makeSchema_DepartmentOrderByWithAggregationInput_schema);


// File: DepartmentScalarWhereWithAggregatesInput.schema.ts
const __makeSchema_DepartmentScalarWhereWithAggregatesInput_schema = () => z.object({
  AND: z.union([DepartmentScalarWhereWithAggregatesInputObjectSchema, DepartmentScalarWhereWithAggregatesInputObjectSchema.array()]).optional(),
  get OR(){ return DepartmentScalarWhereWithAggregatesInputObjectSchema.array().optional(); },
  NOT: z.union([DepartmentScalarWhereWithAggregatesInputObjectSchema, DepartmentScalarWhereWithAggregatesInputObjectSchema.array()]).optional(),
  id: z.union([StringWithAggregatesFilterObjectSchema, z.string()]).optional(),
  nameNo: z.union([StringWithAggregatesFilterObjectSchema, z.string()]).optional(),
  nameEn: z.union([StringWithAggregatesFilterObjectSchema, z.string()]).optional(),
  code: z.union([IntWithAggregatesFilterObjectSchema, z.number().int()]).optional(),
  facultyId: z.union([StringWithAggregatesFilterObjectSchema, z.string()]).optional()
}).strict();
export const DepartmentScalarWhereWithAggregatesInputObjectSchema: z.ZodType<Prisma.DepartmentScalarWhereWithAggregatesInput> = z.lazy(__makeSchema_DepartmentScalarWhereWithAggregatesInput_schema) as unknown as z.ZodType<Prisma.DepartmentScalarWhereWithAggregatesInput>;
export const DepartmentScalarWhereWithAggregatesInputObjectZodSchema = z.lazy(__makeSchema_DepartmentScalarWhereWithAggregatesInput_schema);


// File: CourseCreateInput.schema.ts
const __makeSchema_CourseCreateInput_schema = () => z.object({
  id: z.string().optional(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().optional().nullable(),
  credits: z.number().optional().nullable(),
  studyLevel: StudyLevelSchema,
  gradeType: GradeTypeSchema,
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int().optional().nullable(),
  contentNo: z.string().optional().nullable(),
  contentEn: z.string().optional().nullable(),
  teachingMethodsNo: z.string().optional().nullable(),
  teachingMethodsEn: z.string().optional().nullable(),
  learningOutcomesNo: z.string().optional().nullable(),
  learningOutcomesEn: z.string().optional().nullable(),
  examTypeNo: z.string().optional().nullable(),
  examTypeEn: z.string().optional().nullable(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.coerce.date().optional(),
  taughtSemesters: z.union([CourseCreatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseCreateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseCreatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable(),
  get grades(){ return GradeCreateNestedManyWithoutCourseInputObjectSchema.optional(); },
  get faculty(){ return FacultyCreateNestedOneWithoutCoursesInputObjectSchema.optional(); },
  get department(){ return DepartmentCreateNestedOneWithoutCoursesInputObjectSchema.optional(); }
}).strict();
export const CourseCreateInputObjectSchema: z.ZodType<Prisma.CourseCreateInput> = z.lazy(__makeSchema_CourseCreateInput_schema) as unknown as z.ZodType<Prisma.CourseCreateInput>;
export const CourseCreateInputObjectZodSchema = z.lazy(__makeSchema_CourseCreateInput_schema);


// File: CourseUncheckedCreateInput.schema.ts
const __makeSchema_CourseUncheckedCreateInput_schema = () => z.object({
  id: z.string().optional(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().optional().nullable(),
  credits: z.number().optional().nullable(),
  studyLevel: StudyLevelSchema,
  gradeType: GradeTypeSchema,
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int().optional().nullable(),
  contentNo: z.string().optional().nullable(),
  contentEn: z.string().optional().nullable(),
  teachingMethodsNo: z.string().optional().nullable(),
  teachingMethodsEn: z.string().optional().nullable(),
  learningOutcomesNo: z.string().optional().nullable(),
  learningOutcomesEn: z.string().optional().nullable(),
  examTypeNo: z.string().optional().nullable(),
  examTypeEn: z.string().optional().nullable(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.coerce.date().optional(),
  taughtSemesters: z.union([CourseCreatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseCreateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseCreatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  facultyId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable(),
  get grades(){ return GradeUncheckedCreateNestedManyWithoutCourseInputObjectSchema.optional(); }
}).strict();
export const CourseUncheckedCreateInputObjectSchema: z.ZodType<Prisma.CourseUncheckedCreateInput> = z.lazy(__makeSchema_CourseUncheckedCreateInput_schema) as unknown as z.ZodType<Prisma.CourseUncheckedCreateInput>;
export const CourseUncheckedCreateInputObjectZodSchema = z.lazy(__makeSchema_CourseUncheckedCreateInput_schema);


// File: CourseUpdateInput.schema.ts
const __makeSchema_CourseUpdateInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  credits: z.union([z.number(), NullableFloatFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, EnumStudyLevelFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeType: z.union([GradeTypeSchema, EnumGradeTypeFieldUpdateOperationsInputObjectSchema]).optional(),
  firstYearTaught: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  lastYearTaught: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  candidateCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  averageGrade: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  passRate: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  createdAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  updatedAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  taughtSemesters: z.union([CourseUpdatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseUpdateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseUpdatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  get grades(){ return GradeUpdateManyWithoutCourseNestedInputObjectSchema.optional(); },
  get faculty(){ return FacultyUpdateOneWithoutCoursesNestedInputObjectSchema.optional(); },
  get department(){ return DepartmentUpdateOneWithoutCoursesNestedInputObjectSchema.optional(); }
}).strict();
export const CourseUpdateInputObjectSchema: z.ZodType<Prisma.CourseUpdateInput> = z.lazy(__makeSchema_CourseUpdateInput_schema) as unknown as z.ZodType<Prisma.CourseUpdateInput>;
export const CourseUpdateInputObjectZodSchema = z.lazy(__makeSchema_CourseUpdateInput_schema);


// File: CourseUncheckedUpdateInput.schema.ts
const __makeSchema_CourseUncheckedUpdateInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  credits: z.union([z.number(), NullableFloatFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, EnumStudyLevelFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeType: z.union([GradeTypeSchema, EnumGradeTypeFieldUpdateOperationsInputObjectSchema]).optional(),
  firstYearTaught: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  lastYearTaught: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  candidateCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  averageGrade: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  passRate: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  createdAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  updatedAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  taughtSemesters: z.union([CourseUpdatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseUpdateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseUpdatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  facultyId: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  departmentId: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  get grades(){ return GradeUncheckedUpdateManyWithoutCourseNestedInputObjectSchema.optional(); }
}).strict();
export const CourseUncheckedUpdateInputObjectSchema: z.ZodType<Prisma.CourseUncheckedUpdateInput> = z.lazy(__makeSchema_CourseUncheckedUpdateInput_schema) as unknown as z.ZodType<Prisma.CourseUncheckedUpdateInput>;
export const CourseUncheckedUpdateInputObjectZodSchema = z.lazy(__makeSchema_CourseUncheckedUpdateInput_schema);


// File: CourseCreateManyInput.schema.ts
const __makeSchema_CourseCreateManyInput_schema = () => z.object({
  id: z.string().optional(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().optional().nullable(),
  credits: z.number().optional().nullable(),
  studyLevel: StudyLevelSchema,
  gradeType: GradeTypeSchema,
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int().optional().nullable(),
  contentNo: z.string().optional().nullable(),
  contentEn: z.string().optional().nullable(),
  teachingMethodsNo: z.string().optional().nullable(),
  teachingMethodsEn: z.string().optional().nullable(),
  learningOutcomesNo: z.string().optional().nullable(),
  learningOutcomesEn: z.string().optional().nullable(),
  examTypeNo: z.string().optional().nullable(),
  examTypeEn: z.string().optional().nullable(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  taughtSemesters: z.union([CourseCreatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseCreateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseCreatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  facultyId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable()
}).strict();
export const CourseCreateManyInputObjectSchema: z.ZodType<Prisma.CourseCreateManyInput> = z.lazy(__makeSchema_CourseCreateManyInput_schema) as unknown as z.ZodType<Prisma.CourseCreateManyInput>;
export const CourseCreateManyInputObjectZodSchema = z.lazy(__makeSchema_CourseCreateManyInput_schema);


// File: CourseUpdateManyMutationInput.schema.ts
const __makeSchema_CourseUpdateManyMutationInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  credits: z.union([z.number(), NullableFloatFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, EnumStudyLevelFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeType: z.union([GradeTypeSchema, EnumGradeTypeFieldUpdateOperationsInputObjectSchema]).optional(),
  firstYearTaught: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  lastYearTaught: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  candidateCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  averageGrade: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  passRate: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  createdAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  updatedAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  taughtSemesters: z.union([CourseUpdatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseUpdateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseUpdatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable()
}).strict();
export const CourseUpdateManyMutationInputObjectSchema: z.ZodType<Prisma.CourseUpdateManyMutationInput> = z.lazy(__makeSchema_CourseUpdateManyMutationInput_schema) as unknown as z.ZodType<Prisma.CourseUpdateManyMutationInput>;
export const CourseUpdateManyMutationInputObjectZodSchema = z.lazy(__makeSchema_CourseUpdateManyMutationInput_schema);


// File: CourseUncheckedUpdateManyInput.schema.ts
const __makeSchema_CourseUncheckedUpdateManyInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  credits: z.union([z.number(), NullableFloatFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, EnumStudyLevelFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeType: z.union([GradeTypeSchema, EnumGradeTypeFieldUpdateOperationsInputObjectSchema]).optional(),
  firstYearTaught: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  lastYearTaught: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  candidateCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  averageGrade: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  passRate: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  createdAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  updatedAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  taughtSemesters: z.union([CourseUpdatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseUpdateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseUpdatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  facultyId: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  departmentId: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable()
}).strict();
export const CourseUncheckedUpdateManyInputObjectSchema: z.ZodType<Prisma.CourseUncheckedUpdateManyInput> = z.lazy(__makeSchema_CourseUncheckedUpdateManyInput_schema) as unknown as z.ZodType<Prisma.CourseUncheckedUpdateManyInput>;
export const CourseUncheckedUpdateManyInputObjectZodSchema = z.lazy(__makeSchema_CourseUncheckedUpdateManyInput_schema);


// File: GradeCreateInput.schema.ts
const __makeSchema_GradeCreateInput_schema = () => z.object({
  id: z.string().optional(),
  gradeACount: z.number().int(),
  gradeBCount: z.number().int(),
  gradeCCount: z.number().int(),
  gradeDCount: z.number().int(),
  gradeECount: z.number().int(),
  gradeFCount: z.number().int(),
  passedCount: z.number().int(),
  failedCount: z.number().int(),
  semester: SemesterSchema,
  year: z.number().int(),
  createdAt: z.coerce.date().optional(),
  get course(){ return CourseCreateNestedOneWithoutGradesInputObjectSchema; }
}).strict();
export const GradeCreateInputObjectSchema: z.ZodType<Prisma.GradeCreateInput> = z.lazy(__makeSchema_GradeCreateInput_schema) as unknown as z.ZodType<Prisma.GradeCreateInput>;
export const GradeCreateInputObjectZodSchema = z.lazy(__makeSchema_GradeCreateInput_schema);


// File: GradeUncheckedCreateInput.schema.ts
const __makeSchema_GradeUncheckedCreateInput_schema = () => z.object({
  id: z.string().optional(),
  gradeACount: z.number().int(),
  gradeBCount: z.number().int(),
  gradeCCount: z.number().int(),
  gradeDCount: z.number().int(),
  gradeECount: z.number().int(),
  gradeFCount: z.number().int(),
  passedCount: z.number().int(),
  failedCount: z.number().int(),
  courseId: z.string(),
  semester: SemesterSchema,
  year: z.number().int(),
  createdAt: z.coerce.date().optional()
}).strict();
export const GradeUncheckedCreateInputObjectSchema: z.ZodType<Prisma.GradeUncheckedCreateInput> = z.lazy(__makeSchema_GradeUncheckedCreateInput_schema) as unknown as z.ZodType<Prisma.GradeUncheckedCreateInput>;
export const GradeUncheckedCreateInputObjectZodSchema = z.lazy(__makeSchema_GradeUncheckedCreateInput_schema);


// File: GradeUpdateInput.schema.ts
const __makeSchema_GradeUpdateInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeACount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeBCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeCCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeDCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeECount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeFCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  passedCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  failedCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  semester: z.union([SemesterSchema, EnumSemesterFieldUpdateOperationsInputObjectSchema]).optional(),
  year: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  createdAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  updatedAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  get course(){ return CourseUpdateOneRequiredWithoutGradesNestedInputObjectSchema.optional(); }
}).strict();
export const GradeUpdateInputObjectSchema: z.ZodType<Prisma.GradeUpdateInput> = z.lazy(__makeSchema_GradeUpdateInput_schema) as unknown as z.ZodType<Prisma.GradeUpdateInput>;
export const GradeUpdateInputObjectZodSchema = z.lazy(__makeSchema_GradeUpdateInput_schema);


// File: GradeUncheckedUpdateInput.schema.ts
const __makeSchema_GradeUncheckedUpdateInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeACount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeBCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeCCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeDCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeECount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeFCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  passedCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  failedCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  courseId: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  semester: z.union([SemesterSchema, EnumSemesterFieldUpdateOperationsInputObjectSchema]).optional(),
  year: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  createdAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  updatedAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional()
}).strict();
export const GradeUncheckedUpdateInputObjectSchema: z.ZodType<Prisma.GradeUncheckedUpdateInput> = z.lazy(__makeSchema_GradeUncheckedUpdateInput_schema) as unknown as z.ZodType<Prisma.GradeUncheckedUpdateInput>;
export const GradeUncheckedUpdateInputObjectZodSchema = z.lazy(__makeSchema_GradeUncheckedUpdateInput_schema);


// File: GradeCreateManyInput.schema.ts
const __makeSchema_GradeCreateManyInput_schema = () => z.object({
  id: z.string().optional(),
  gradeACount: z.number().int(),
  gradeBCount: z.number().int(),
  gradeCCount: z.number().int(),
  gradeDCount: z.number().int(),
  gradeECount: z.number().int(),
  gradeFCount: z.number().int(),
  passedCount: z.number().int(),
  failedCount: z.number().int(),
  courseId: z.string(),
  semester: SemesterSchema,
  year: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();
export const GradeCreateManyInputObjectSchema: z.ZodType<Prisma.GradeCreateManyInput> = z.lazy(__makeSchema_GradeCreateManyInput_schema) as unknown as z.ZodType<Prisma.GradeCreateManyInput>;
export const GradeCreateManyInputObjectZodSchema = z.lazy(__makeSchema_GradeCreateManyInput_schema);


// File: GradeUpdateManyMutationInput.schema.ts
const __makeSchema_GradeUpdateManyMutationInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeACount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeBCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeCCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeDCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeECount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeFCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  passedCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  failedCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  semester: z.union([SemesterSchema, EnumSemesterFieldUpdateOperationsInputObjectSchema]).optional(),
  year: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  createdAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  updatedAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional()
}).strict();
export const GradeUpdateManyMutationInputObjectSchema: z.ZodType<Prisma.GradeUpdateManyMutationInput> = z.lazy(__makeSchema_GradeUpdateManyMutationInput_schema) as unknown as z.ZodType<Prisma.GradeUpdateManyMutationInput>;
export const GradeUpdateManyMutationInputObjectZodSchema = z.lazy(__makeSchema_GradeUpdateManyMutationInput_schema);


// File: GradeUncheckedUpdateManyInput.schema.ts
const __makeSchema_GradeUncheckedUpdateManyInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeACount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeBCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeCCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeDCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeECount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeFCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  passedCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  failedCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  courseId: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  semester: z.union([SemesterSchema, EnumSemesterFieldUpdateOperationsInputObjectSchema]).optional(),
  year: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  createdAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  updatedAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional()
}).strict();
export const GradeUncheckedUpdateManyInputObjectSchema: z.ZodType<Prisma.GradeUncheckedUpdateManyInput> = z.lazy(__makeSchema_GradeUncheckedUpdateManyInput_schema) as unknown as z.ZodType<Prisma.GradeUncheckedUpdateManyInput>;
export const GradeUncheckedUpdateManyInputObjectZodSchema = z.lazy(__makeSchema_GradeUncheckedUpdateManyInput_schema);


// File: FacultyCreateInput.schema.ts
const __makeSchema_FacultyCreateInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  get courses(){ return CourseCreateNestedManyWithoutFacultyInputObjectSchema.optional(); },
  get departments(){ return DepartmentCreateNestedManyWithoutFacultyInputObjectSchema.optional(); }
}).strict();
export const FacultyCreateInputObjectSchema: z.ZodType<Prisma.FacultyCreateInput> = z.lazy(__makeSchema_FacultyCreateInput_schema) as unknown as z.ZodType<Prisma.FacultyCreateInput>;
export const FacultyCreateInputObjectZodSchema = z.lazy(__makeSchema_FacultyCreateInput_schema);


// File: FacultyUncheckedCreateInput.schema.ts
const __makeSchema_FacultyUncheckedCreateInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  get courses(){ return CourseUncheckedCreateNestedManyWithoutFacultyInputObjectSchema.optional(); },
  get departments(){ return DepartmentUncheckedCreateNestedManyWithoutFacultyInputObjectSchema.optional(); }
}).strict();
export const FacultyUncheckedCreateInputObjectSchema: z.ZodType<Prisma.FacultyUncheckedCreateInput> = z.lazy(__makeSchema_FacultyUncheckedCreateInput_schema) as unknown as z.ZodType<Prisma.FacultyUncheckedCreateInput>;
export const FacultyUncheckedCreateInputObjectZodSchema = z.lazy(__makeSchema_FacultyUncheckedCreateInput_schema);


// File: FacultyUpdateInput.schema.ts
const __makeSchema_FacultyUpdateInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  get courses(){ return CourseUpdateManyWithoutFacultyNestedInputObjectSchema.optional(); },
  get departments(){ return DepartmentUpdateManyWithoutFacultyNestedInputObjectSchema.optional(); }
}).strict();
export const FacultyUpdateInputObjectSchema: z.ZodType<Prisma.FacultyUpdateInput> = z.lazy(__makeSchema_FacultyUpdateInput_schema) as unknown as z.ZodType<Prisma.FacultyUpdateInput>;
export const FacultyUpdateInputObjectZodSchema = z.lazy(__makeSchema_FacultyUpdateInput_schema);


// File: FacultyUncheckedUpdateInput.schema.ts
const __makeSchema_FacultyUncheckedUpdateInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  get courses(){ return CourseUncheckedUpdateManyWithoutFacultyNestedInputObjectSchema.optional(); },
  get departments(){ return DepartmentUncheckedUpdateManyWithoutFacultyNestedInputObjectSchema.optional(); }
}).strict();
export const FacultyUncheckedUpdateInputObjectSchema: z.ZodType<Prisma.FacultyUncheckedUpdateInput> = z.lazy(__makeSchema_FacultyUncheckedUpdateInput_schema) as unknown as z.ZodType<Prisma.FacultyUncheckedUpdateInput>;
export const FacultyUncheckedUpdateInputObjectZodSchema = z.lazy(__makeSchema_FacultyUncheckedUpdateInput_schema);


// File: FacultyCreateManyInput.schema.ts
const __makeSchema_FacultyCreateManyInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int()
}).strict();
export const FacultyCreateManyInputObjectSchema: z.ZodType<Prisma.FacultyCreateManyInput> = z.lazy(__makeSchema_FacultyCreateManyInput_schema) as unknown as z.ZodType<Prisma.FacultyCreateManyInput>;
export const FacultyCreateManyInputObjectZodSchema = z.lazy(__makeSchema_FacultyCreateManyInput_schema);


// File: FacultyUpdateManyMutationInput.schema.ts
const __makeSchema_FacultyUpdateManyMutationInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional()
}).strict();
export const FacultyUpdateManyMutationInputObjectSchema: z.ZodType<Prisma.FacultyUpdateManyMutationInput> = z.lazy(__makeSchema_FacultyUpdateManyMutationInput_schema) as unknown as z.ZodType<Prisma.FacultyUpdateManyMutationInput>;
export const FacultyUpdateManyMutationInputObjectZodSchema = z.lazy(__makeSchema_FacultyUpdateManyMutationInput_schema);


// File: FacultyUncheckedUpdateManyInput.schema.ts
const __makeSchema_FacultyUncheckedUpdateManyInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional()
}).strict();
export const FacultyUncheckedUpdateManyInputObjectSchema: z.ZodType<Prisma.FacultyUncheckedUpdateManyInput> = z.lazy(__makeSchema_FacultyUncheckedUpdateManyInput_schema) as unknown as z.ZodType<Prisma.FacultyUncheckedUpdateManyInput>;
export const FacultyUncheckedUpdateManyInputObjectZodSchema = z.lazy(__makeSchema_FacultyUncheckedUpdateManyInput_schema);


// File: DepartmentCreateInput.schema.ts
const __makeSchema_DepartmentCreateInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  get courses(){ return CourseCreateNestedManyWithoutDepartmentInputObjectSchema.optional(); },
  get faculty(){ return FacultyCreateNestedOneWithoutDepartmentsInputObjectSchema; }
}).strict();
export const DepartmentCreateInputObjectSchema: z.ZodType<Prisma.DepartmentCreateInput> = z.lazy(__makeSchema_DepartmentCreateInput_schema) as unknown as z.ZodType<Prisma.DepartmentCreateInput>;
export const DepartmentCreateInputObjectZodSchema = z.lazy(__makeSchema_DepartmentCreateInput_schema);


// File: DepartmentUncheckedCreateInput.schema.ts
const __makeSchema_DepartmentUncheckedCreateInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  facultyId: z.string(),
  get courses(){ return CourseUncheckedCreateNestedManyWithoutDepartmentInputObjectSchema.optional(); }
}).strict();
export const DepartmentUncheckedCreateInputObjectSchema: z.ZodType<Prisma.DepartmentUncheckedCreateInput> = z.lazy(__makeSchema_DepartmentUncheckedCreateInput_schema) as unknown as z.ZodType<Prisma.DepartmentUncheckedCreateInput>;
export const DepartmentUncheckedCreateInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUncheckedCreateInput_schema);


// File: DepartmentUpdateInput.schema.ts
const __makeSchema_DepartmentUpdateInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  get courses(){ return CourseUpdateManyWithoutDepartmentNestedInputObjectSchema.optional(); },
  get faculty(){ return FacultyUpdateOneRequiredWithoutDepartmentsNestedInputObjectSchema.optional(); }
}).strict();
export const DepartmentUpdateInputObjectSchema: z.ZodType<Prisma.DepartmentUpdateInput> = z.lazy(__makeSchema_DepartmentUpdateInput_schema) as unknown as z.ZodType<Prisma.DepartmentUpdateInput>;
export const DepartmentUpdateInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUpdateInput_schema);


// File: DepartmentUncheckedUpdateInput.schema.ts
const __makeSchema_DepartmentUncheckedUpdateInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  facultyId: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  get courses(){ return CourseUncheckedUpdateManyWithoutDepartmentNestedInputObjectSchema.optional(); }
}).strict();
export const DepartmentUncheckedUpdateInputObjectSchema: z.ZodType<Prisma.DepartmentUncheckedUpdateInput> = z.lazy(__makeSchema_DepartmentUncheckedUpdateInput_schema) as unknown as z.ZodType<Prisma.DepartmentUncheckedUpdateInput>;
export const DepartmentUncheckedUpdateInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUncheckedUpdateInput_schema);


// File: DepartmentCreateManyInput.schema.ts
const __makeSchema_DepartmentCreateManyInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  facultyId: z.string()
}).strict();
export const DepartmentCreateManyInputObjectSchema: z.ZodType<Prisma.DepartmentCreateManyInput> = z.lazy(__makeSchema_DepartmentCreateManyInput_schema) as unknown as z.ZodType<Prisma.DepartmentCreateManyInput>;
export const DepartmentCreateManyInputObjectZodSchema = z.lazy(__makeSchema_DepartmentCreateManyInput_schema);


// File: DepartmentUpdateManyMutationInput.schema.ts
const __makeSchema_DepartmentUpdateManyMutationInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional()
}).strict();
export const DepartmentUpdateManyMutationInputObjectSchema: z.ZodType<Prisma.DepartmentUpdateManyMutationInput> = z.lazy(__makeSchema_DepartmentUpdateManyMutationInput_schema) as unknown as z.ZodType<Prisma.DepartmentUpdateManyMutationInput>;
export const DepartmentUpdateManyMutationInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUpdateManyMutationInput_schema);


// File: DepartmentUncheckedUpdateManyInput.schema.ts
const __makeSchema_DepartmentUncheckedUpdateManyInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  facultyId: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional()
}).strict();
export const DepartmentUncheckedUpdateManyInputObjectSchema: z.ZodType<Prisma.DepartmentUncheckedUpdateManyInput> = z.lazy(__makeSchema_DepartmentUncheckedUpdateManyInput_schema) as unknown as z.ZodType<Prisma.DepartmentUncheckedUpdateManyInput>;
export const DepartmentUncheckedUpdateManyInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUncheckedUpdateManyInput_schema);


// File: StringFilter.schema.ts
const __makeSchema_StringFilter_schema = () => z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: QueryModeSchema.optional(),
  not: z.union([z.string(), NestedStringFilterObjectSchema]).optional()
}).strict();
export const StringFilterObjectSchema: z.ZodType<Prisma.StringFilter> = z.lazy(__makeSchema_StringFilter_schema) as unknown as z.ZodType<Prisma.StringFilter>;
export const StringFilterObjectZodSchema = z.lazy(__makeSchema_StringFilter_schema);


// File: StringNullableFilter.schema.ts
const __makeSchema_StringNullableFilter_schema = () => z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: QueryModeSchema.optional(),
  not: z.union([z.string(), NestedStringNullableFilterObjectSchema]).optional().nullable()
}).strict();
export const StringNullableFilterObjectSchema: z.ZodType<Prisma.StringNullableFilter> = z.lazy(__makeSchema_StringNullableFilter_schema) as unknown as z.ZodType<Prisma.StringNullableFilter>;
export const StringNullableFilterObjectZodSchema = z.lazy(__makeSchema_StringNullableFilter_schema);


// File: FloatNullableFilter.schema.ts
const __makeSchema_FloatNullableFilter_schema = () => z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), NestedFloatNullableFilterObjectSchema]).optional().nullable()
}).strict();
export const FloatNullableFilterObjectSchema: z.ZodType<Prisma.FloatNullableFilter> = z.lazy(__makeSchema_FloatNullableFilter_schema) as unknown as z.ZodType<Prisma.FloatNullableFilter>;
export const FloatNullableFilterObjectZodSchema = z.lazy(__makeSchema_FloatNullableFilter_schema);


// File: EnumStudyLevelFilter.schema.ts
const __makeSchema_EnumStudyLevelFilter_schema = () => z.object({
  equals: StudyLevelSchema.optional(),
  in: StudyLevelSchema.array().optional(),
  notIn: StudyLevelSchema.array().optional(),
  not: z.union([StudyLevelSchema, NestedEnumStudyLevelFilterObjectSchema]).optional()
}).strict();
export const EnumStudyLevelFilterObjectSchema: z.ZodType<Prisma.EnumStudyLevelFilter> = z.lazy(__makeSchema_EnumStudyLevelFilter_schema) as unknown as z.ZodType<Prisma.EnumStudyLevelFilter>;
export const EnumStudyLevelFilterObjectZodSchema = z.lazy(__makeSchema_EnumStudyLevelFilter_schema);


// File: EnumGradeTypeFilter.schema.ts
const __makeSchema_EnumGradeTypeFilter_schema = () => z.object({
  equals: GradeTypeSchema.optional(),
  in: GradeTypeSchema.array().optional(),
  notIn: GradeTypeSchema.array().optional(),
  not: z.union([GradeTypeSchema, NestedEnumGradeTypeFilterObjectSchema]).optional()
}).strict();
export const EnumGradeTypeFilterObjectSchema: z.ZodType<Prisma.EnumGradeTypeFilter> = z.lazy(__makeSchema_EnumGradeTypeFilter_schema) as unknown as z.ZodType<Prisma.EnumGradeTypeFilter>;
export const EnumGradeTypeFilterObjectZodSchema = z.lazy(__makeSchema_EnumGradeTypeFilter_schema);


// File: IntFilter.schema.ts
const __makeSchema_IntFilter_schema = () => z.object({
  equals: z.number().int().optional(),
  in: z.number().int().array().optional(),
  notIn: z.number().int().array().optional(),
  lt: z.number().int().optional(),
  lte: z.number().int().optional(),
  gt: z.number().int().optional(),
  gte: z.number().int().optional(),
  not: z.union([z.number().int(), NestedIntFilterObjectSchema]).optional()
}).strict();
export const IntFilterObjectSchema: z.ZodType<Prisma.IntFilter> = z.lazy(__makeSchema_IntFilter_schema) as unknown as z.ZodType<Prisma.IntFilter>;
export const IntFilterObjectZodSchema = z.lazy(__makeSchema_IntFilter_schema);


// File: IntNullableFilter.schema.ts
const __makeSchema_IntNullableFilter_schema = () => z.object({
  equals: z.number().int().optional().nullable(),
  in: z.number().int().array().optional().nullable(),
  notIn: z.number().int().array().optional().nullable(),
  lt: z.number().int().optional(),
  lte: z.number().int().optional(),
  gt: z.number().int().optional(),
  gte: z.number().int().optional(),
  not: z.union([z.number().int(), NestedIntNullableFilterObjectSchema]).optional().nullable()
}).strict();
export const IntNullableFilterObjectSchema: z.ZodType<Prisma.IntNullableFilter> = z.lazy(__makeSchema_IntNullableFilter_schema) as unknown as z.ZodType<Prisma.IntNullableFilter>;
export const IntNullableFilterObjectZodSchema = z.lazy(__makeSchema_IntNullableFilter_schema);


// File: FloatFilter.schema.ts
const __makeSchema_FloatFilter_schema = () => z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), NestedFloatFilterObjectSchema]).optional()
}).strict();
export const FloatFilterObjectSchema: z.ZodType<Prisma.FloatFilter> = z.lazy(__makeSchema_FloatFilter_schema) as unknown as z.ZodType<Prisma.FloatFilter>;
export const FloatFilterObjectZodSchema = z.lazy(__makeSchema_FloatFilter_schema);


// File: DateTimeFilter.schema.ts
const __makeSchema_DateTimeFilter_schema = () => z.object({
  equals: z.date().optional(),
  in: z.union([z.date().array(), z.iso.datetime().array()]).optional(),
  notIn: z.union([z.date().array(), z.iso.datetime().array()]).optional(),
  lt: z.date().optional(),
  lte: z.date().optional(),
  gt: z.date().optional(),
  gte: z.date().optional(),
  not: z.union([z.date(), NestedDateTimeFilterObjectSchema]).optional()
}).strict();
export const DateTimeFilterObjectSchema: z.ZodType<Prisma.DateTimeFilter> = z.lazy(__makeSchema_DateTimeFilter_schema) as unknown as z.ZodType<Prisma.DateTimeFilter>;
export const DateTimeFilterObjectZodSchema = z.lazy(__makeSchema_DateTimeFilter_schema);


// File: EnumSemesterNullableListFilter.schema.ts
const __makeSchema_EnumSemesterNullableListFilter_schema = () => z.object({
  equals: SemesterSchema.array().optional().nullable(),
  has: SemesterSchema.optional().nullable(),
  hasEvery: SemesterSchema.array().optional(),
  hasSome: SemesterSchema.array().optional(),
  isEmpty: z.boolean().optional()
}).strict();
export const EnumSemesterNullableListFilterObjectSchema: z.ZodType<Prisma.EnumSemesterNullableListFilter> = z.lazy(__makeSchema_EnumSemesterNullableListFilter_schema) as unknown as z.ZodType<Prisma.EnumSemesterNullableListFilter>;
export const EnumSemesterNullableListFilterObjectZodSchema = z.lazy(__makeSchema_EnumSemesterNullableListFilter_schema);


// File: EnumTeachingLanguageNullableListFilter.schema.ts
const __makeSchema_EnumTeachingLanguageNullableListFilter_schema = () => z.object({
  equals: TeachingLanguageSchema.array().optional().nullable(),
  has: TeachingLanguageSchema.optional().nullable(),
  hasEvery: TeachingLanguageSchema.array().optional(),
  hasSome: TeachingLanguageSchema.array().optional(),
  isEmpty: z.boolean().optional()
}).strict();
export const EnumTeachingLanguageNullableListFilterObjectSchema: z.ZodType<Prisma.EnumTeachingLanguageNullableListFilter> = z.lazy(__makeSchema_EnumTeachingLanguageNullableListFilter_schema) as unknown as z.ZodType<Prisma.EnumTeachingLanguageNullableListFilter>;
export const EnumTeachingLanguageNullableListFilterObjectZodSchema = z.lazy(__makeSchema_EnumTeachingLanguageNullableListFilter_schema);


// File: EnumCampusNullableListFilter.schema.ts
const __makeSchema_EnumCampusNullableListFilter_schema = () => z.object({
  equals: CampusSchema.array().optional().nullable(),
  has: CampusSchema.optional().nullable(),
  hasEvery: CampusSchema.array().optional(),
  hasSome: CampusSchema.array().optional(),
  isEmpty: z.boolean().optional()
}).strict();
export const EnumCampusNullableListFilterObjectSchema: z.ZodType<Prisma.EnumCampusNullableListFilter> = z.lazy(__makeSchema_EnumCampusNullableListFilter_schema) as unknown as z.ZodType<Prisma.EnumCampusNullableListFilter>;
export const EnumCampusNullableListFilterObjectZodSchema = z.lazy(__makeSchema_EnumCampusNullableListFilter_schema);


// File: GradeListRelationFilter.schema.ts
const __makeSchema_GradeListRelationFilter_schema = () => z.object({
  get every(){ return GradeWhereInputObjectSchema.optional(); },
  get some(){ return GradeWhereInputObjectSchema.optional(); },
  get none(){ return GradeWhereInputObjectSchema.optional(); }
}).strict();
export const GradeListRelationFilterObjectSchema: z.ZodType<Prisma.GradeListRelationFilter> = z.lazy(__makeSchema_GradeListRelationFilter_schema) as unknown as z.ZodType<Prisma.GradeListRelationFilter>;
export const GradeListRelationFilterObjectZodSchema = z.lazy(__makeSchema_GradeListRelationFilter_schema);


// File: FacultyNullableScalarRelationFilter.schema.ts
const __makeSchema_FacultyNullableScalarRelationFilter_schema = () => z.object({
  is: FacultyWhereInputObjectSchema.optional().nullable(),
  isNot: FacultyWhereInputObjectSchema.optional().nullable()
}).strict();
export const FacultyNullableScalarRelationFilterObjectSchema: z.ZodType<Prisma.FacultyNullableScalarRelationFilter> = z.lazy(__makeSchema_FacultyNullableScalarRelationFilter_schema) as unknown as z.ZodType<Prisma.FacultyNullableScalarRelationFilter>;
export const FacultyNullableScalarRelationFilterObjectZodSchema = z.lazy(__makeSchema_FacultyNullableScalarRelationFilter_schema);


// File: DepartmentNullableScalarRelationFilter.schema.ts
const __makeSchema_DepartmentNullableScalarRelationFilter_schema = () => z.object({
  is: DepartmentWhereInputObjectSchema.optional().nullable(),
  isNot: DepartmentWhereInputObjectSchema.optional().nullable()
}).strict();
export const DepartmentNullableScalarRelationFilterObjectSchema: z.ZodType<Prisma.DepartmentNullableScalarRelationFilter> = z.lazy(__makeSchema_DepartmentNullableScalarRelationFilter_schema) as unknown as z.ZodType<Prisma.DepartmentNullableScalarRelationFilter>;
export const DepartmentNullableScalarRelationFilterObjectZodSchema = z.lazy(__makeSchema_DepartmentNullableScalarRelationFilter_schema);


// File: SortOrderInput.schema.ts
const __makeSchema_SortOrderInput_schema = () => z.object({
  sort: SortOrderSchema,
  nulls: NullsOrderSchema.optional()
}).strict();
export const SortOrderInputObjectSchema: z.ZodType<Prisma.SortOrderInput> = z.lazy(__makeSchema_SortOrderInput_schema) as unknown as z.ZodType<Prisma.SortOrderInput>;
export const SortOrderInputObjectZodSchema = z.lazy(__makeSchema_SortOrderInput_schema);


// File: GradeOrderByRelationAggregateInput.schema.ts
const __makeSchema_GradeOrderByRelationAggregateInput_schema = () => z.object({
  _count: SortOrderSchema.optional()
}).strict();
export const GradeOrderByRelationAggregateInputObjectSchema: z.ZodType<Prisma.GradeOrderByRelationAggregateInput> = z.lazy(__makeSchema_GradeOrderByRelationAggregateInput_schema) as unknown as z.ZodType<Prisma.GradeOrderByRelationAggregateInput>;
export const GradeOrderByRelationAggregateInputObjectZodSchema = z.lazy(__makeSchema_GradeOrderByRelationAggregateInput_schema);


// File: CourseCountOrderByAggregateInput.schema.ts
const __makeSchema_CourseCountOrderByAggregateInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  credits: SortOrderSchema.optional(),
  studyLevel: SortOrderSchema.optional(),
  gradeType: SortOrderSchema.optional(),
  firstYearTaught: SortOrderSchema.optional(),
  lastYearTaught: SortOrderSchema.optional(),
  contentNo: SortOrderSchema.optional(),
  contentEn: SortOrderSchema.optional(),
  teachingMethodsNo: SortOrderSchema.optional(),
  teachingMethodsEn: SortOrderSchema.optional(),
  learningOutcomesNo: SortOrderSchema.optional(),
  learningOutcomesEn: SortOrderSchema.optional(),
  examTypeNo: SortOrderSchema.optional(),
  examTypeEn: SortOrderSchema.optional(),
  candidateCount: SortOrderSchema.optional(),
  averageGrade: SortOrderSchema.optional(),
  passRate: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional(),
  taughtSemesters: SortOrderSchema.optional(),
  teachingLanguages: SortOrderSchema.optional(),
  campuses: SortOrderSchema.optional(),
  facultyId: SortOrderSchema.optional(),
  departmentId: SortOrderSchema.optional(),
  latestYearCheckedForNtnuData: SortOrderSchema.optional()
}).strict();
export const CourseCountOrderByAggregateInputObjectSchema: z.ZodType<Prisma.CourseCountOrderByAggregateInput> = z.lazy(__makeSchema_CourseCountOrderByAggregateInput_schema) as unknown as z.ZodType<Prisma.CourseCountOrderByAggregateInput>;
export const CourseCountOrderByAggregateInputObjectZodSchema = z.lazy(__makeSchema_CourseCountOrderByAggregateInput_schema);


// File: CourseAvgOrderByAggregateInput.schema.ts
const __makeSchema_CourseAvgOrderByAggregateInput_schema = () => z.object({
  credits: SortOrderSchema.optional(),
  firstYearTaught: SortOrderSchema.optional(),
  lastYearTaught: SortOrderSchema.optional(),
  candidateCount: SortOrderSchema.optional(),
  averageGrade: SortOrderSchema.optional(),
  passRate: SortOrderSchema.optional(),
  latestYearCheckedForNtnuData: SortOrderSchema.optional()
}).strict();
export const CourseAvgOrderByAggregateInputObjectSchema: z.ZodType<Prisma.CourseAvgOrderByAggregateInput> = z.lazy(__makeSchema_CourseAvgOrderByAggregateInput_schema) as unknown as z.ZodType<Prisma.CourseAvgOrderByAggregateInput>;
export const CourseAvgOrderByAggregateInputObjectZodSchema = z.lazy(__makeSchema_CourseAvgOrderByAggregateInput_schema);


// File: CourseMaxOrderByAggregateInput.schema.ts
const __makeSchema_CourseMaxOrderByAggregateInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  credits: SortOrderSchema.optional(),
  studyLevel: SortOrderSchema.optional(),
  gradeType: SortOrderSchema.optional(),
  firstYearTaught: SortOrderSchema.optional(),
  lastYearTaught: SortOrderSchema.optional(),
  contentNo: SortOrderSchema.optional(),
  contentEn: SortOrderSchema.optional(),
  teachingMethodsNo: SortOrderSchema.optional(),
  teachingMethodsEn: SortOrderSchema.optional(),
  learningOutcomesNo: SortOrderSchema.optional(),
  learningOutcomesEn: SortOrderSchema.optional(),
  examTypeNo: SortOrderSchema.optional(),
  examTypeEn: SortOrderSchema.optional(),
  candidateCount: SortOrderSchema.optional(),
  averageGrade: SortOrderSchema.optional(),
  passRate: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional(),
  facultyId: SortOrderSchema.optional(),
  departmentId: SortOrderSchema.optional(),
  latestYearCheckedForNtnuData: SortOrderSchema.optional()
}).strict();
export const CourseMaxOrderByAggregateInputObjectSchema: z.ZodType<Prisma.CourseMaxOrderByAggregateInput> = z.lazy(__makeSchema_CourseMaxOrderByAggregateInput_schema) as unknown as z.ZodType<Prisma.CourseMaxOrderByAggregateInput>;
export const CourseMaxOrderByAggregateInputObjectZodSchema = z.lazy(__makeSchema_CourseMaxOrderByAggregateInput_schema);


// File: CourseMinOrderByAggregateInput.schema.ts
const __makeSchema_CourseMinOrderByAggregateInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  credits: SortOrderSchema.optional(),
  studyLevel: SortOrderSchema.optional(),
  gradeType: SortOrderSchema.optional(),
  firstYearTaught: SortOrderSchema.optional(),
  lastYearTaught: SortOrderSchema.optional(),
  contentNo: SortOrderSchema.optional(),
  contentEn: SortOrderSchema.optional(),
  teachingMethodsNo: SortOrderSchema.optional(),
  teachingMethodsEn: SortOrderSchema.optional(),
  learningOutcomesNo: SortOrderSchema.optional(),
  learningOutcomesEn: SortOrderSchema.optional(),
  examTypeNo: SortOrderSchema.optional(),
  examTypeEn: SortOrderSchema.optional(),
  candidateCount: SortOrderSchema.optional(),
  averageGrade: SortOrderSchema.optional(),
  passRate: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional(),
  facultyId: SortOrderSchema.optional(),
  departmentId: SortOrderSchema.optional(),
  latestYearCheckedForNtnuData: SortOrderSchema.optional()
}).strict();
export const CourseMinOrderByAggregateInputObjectSchema: z.ZodType<Prisma.CourseMinOrderByAggregateInput> = z.lazy(__makeSchema_CourseMinOrderByAggregateInput_schema) as unknown as z.ZodType<Prisma.CourseMinOrderByAggregateInput>;
export const CourseMinOrderByAggregateInputObjectZodSchema = z.lazy(__makeSchema_CourseMinOrderByAggregateInput_schema);


// File: CourseSumOrderByAggregateInput.schema.ts
const __makeSchema_CourseSumOrderByAggregateInput_schema = () => z.object({
  credits: SortOrderSchema.optional(),
  firstYearTaught: SortOrderSchema.optional(),
  lastYearTaught: SortOrderSchema.optional(),
  candidateCount: SortOrderSchema.optional(),
  averageGrade: SortOrderSchema.optional(),
  passRate: SortOrderSchema.optional(),
  latestYearCheckedForNtnuData: SortOrderSchema.optional()
}).strict();
export const CourseSumOrderByAggregateInputObjectSchema: z.ZodType<Prisma.CourseSumOrderByAggregateInput> = z.lazy(__makeSchema_CourseSumOrderByAggregateInput_schema) as unknown as z.ZodType<Prisma.CourseSumOrderByAggregateInput>;
export const CourseSumOrderByAggregateInputObjectZodSchema = z.lazy(__makeSchema_CourseSumOrderByAggregateInput_schema);


// File: StringWithAggregatesFilter.schema.ts
const __makeSchema_StringWithAggregatesFilter_schema = () => z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: QueryModeSchema.optional(),
  not: z.union([z.string(), NestedStringWithAggregatesFilterObjectSchema]).optional(),
  get _count(){ return NestedIntFilterObjectSchema.optional(); },
  get _min(){ return NestedStringFilterObjectSchema.optional(); },
  get _max(){ return NestedStringFilterObjectSchema.optional(); }
}).strict();
export const StringWithAggregatesFilterObjectSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.lazy(__makeSchema_StringWithAggregatesFilter_schema) as unknown as z.ZodType<Prisma.StringWithAggregatesFilter>;
export const StringWithAggregatesFilterObjectZodSchema = z.lazy(__makeSchema_StringWithAggregatesFilter_schema);


// File: StringNullableWithAggregatesFilter.schema.ts
const __makeSchema_StringNullableWithAggregatesFilter_schema = () => z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: QueryModeSchema.optional(),
  not: z.union([z.string(), NestedStringNullableWithAggregatesFilterObjectSchema]).optional().nullable(),
  get _count(){ return NestedIntNullableFilterObjectSchema.optional(); },
  get _min(){ return NestedStringNullableFilterObjectSchema.optional(); },
  get _max(){ return NestedStringNullableFilterObjectSchema.optional(); }
}).strict();
export const StringNullableWithAggregatesFilterObjectSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.lazy(__makeSchema_StringNullableWithAggregatesFilter_schema) as unknown as z.ZodType<Prisma.StringNullableWithAggregatesFilter>;
export const StringNullableWithAggregatesFilterObjectZodSchema = z.lazy(__makeSchema_StringNullableWithAggregatesFilter_schema);


// File: FloatNullableWithAggregatesFilter.schema.ts
const __makeSchema_FloatNullableWithAggregatesFilter_schema = () => z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), NestedFloatNullableWithAggregatesFilterObjectSchema]).optional().nullable(),
  get _count(){ return NestedIntNullableFilterObjectSchema.optional(); },
  get _avg(){ return NestedFloatNullableFilterObjectSchema.optional(); },
  get _sum(){ return NestedFloatNullableFilterObjectSchema.optional(); },
  get _min(){ return NestedFloatNullableFilterObjectSchema.optional(); },
  get _max(){ return NestedFloatNullableFilterObjectSchema.optional(); }
}).strict();
export const FloatNullableWithAggregatesFilterObjectSchema: z.ZodType<Prisma.FloatNullableWithAggregatesFilter> = z.lazy(__makeSchema_FloatNullableWithAggregatesFilter_schema) as unknown as z.ZodType<Prisma.FloatNullableWithAggregatesFilter>;
export const FloatNullableWithAggregatesFilterObjectZodSchema = z.lazy(__makeSchema_FloatNullableWithAggregatesFilter_schema);


// File: EnumStudyLevelWithAggregatesFilter.schema.ts
const __makeSchema_EnumStudyLevelWithAggregatesFilter_schema = () => z.object({
  equals: StudyLevelSchema.optional(),
  in: StudyLevelSchema.array().optional(),
  notIn: StudyLevelSchema.array().optional(),
  not: z.union([StudyLevelSchema, NestedEnumStudyLevelWithAggregatesFilterObjectSchema]).optional(),
  get _count(){ return NestedIntFilterObjectSchema.optional(); },
  get _min(){ return NestedEnumStudyLevelFilterObjectSchema.optional(); },
  get _max(){ return NestedEnumStudyLevelFilterObjectSchema.optional(); }
}).strict();
export const EnumStudyLevelWithAggregatesFilterObjectSchema: z.ZodType<Prisma.EnumStudyLevelWithAggregatesFilter> = z.lazy(__makeSchema_EnumStudyLevelWithAggregatesFilter_schema) as unknown as z.ZodType<Prisma.EnumStudyLevelWithAggregatesFilter>;
export const EnumStudyLevelWithAggregatesFilterObjectZodSchema = z.lazy(__makeSchema_EnumStudyLevelWithAggregatesFilter_schema);


// File: EnumGradeTypeWithAggregatesFilter.schema.ts
const __makeSchema_EnumGradeTypeWithAggregatesFilter_schema = () => z.object({
  equals: GradeTypeSchema.optional(),
  in: GradeTypeSchema.array().optional(),
  notIn: GradeTypeSchema.array().optional(),
  not: z.union([GradeTypeSchema, NestedEnumGradeTypeWithAggregatesFilterObjectSchema]).optional(),
  get _count(){ return NestedIntFilterObjectSchema.optional(); },
  get _min(){ return NestedEnumGradeTypeFilterObjectSchema.optional(); },
  get _max(){ return NestedEnumGradeTypeFilterObjectSchema.optional(); }
}).strict();
export const EnumGradeTypeWithAggregatesFilterObjectSchema: z.ZodType<Prisma.EnumGradeTypeWithAggregatesFilter> = z.lazy(__makeSchema_EnumGradeTypeWithAggregatesFilter_schema) as unknown as z.ZodType<Prisma.EnumGradeTypeWithAggregatesFilter>;
export const EnumGradeTypeWithAggregatesFilterObjectZodSchema = z.lazy(__makeSchema_EnumGradeTypeWithAggregatesFilter_schema);


// File: IntWithAggregatesFilter.schema.ts
const __makeSchema_IntWithAggregatesFilter_schema = () => z.object({
  equals: z.number().int().optional(),
  in: z.number().int().array().optional(),
  notIn: z.number().int().array().optional(),
  lt: z.number().int().optional(),
  lte: z.number().int().optional(),
  gt: z.number().int().optional(),
  gte: z.number().int().optional(),
  not: z.union([z.number().int(), NestedIntWithAggregatesFilterObjectSchema]).optional(),
  get _count(){ return NestedIntFilterObjectSchema.optional(); },
  get _avg(){ return NestedFloatFilterObjectSchema.optional(); },
  get _sum(){ return NestedIntFilterObjectSchema.optional(); },
  get _min(){ return NestedIntFilterObjectSchema.optional(); },
  get _max(){ return NestedIntFilterObjectSchema.optional(); }
}).strict();
export const IntWithAggregatesFilterObjectSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.lazy(__makeSchema_IntWithAggregatesFilter_schema) as unknown as z.ZodType<Prisma.IntWithAggregatesFilter>;
export const IntWithAggregatesFilterObjectZodSchema = z.lazy(__makeSchema_IntWithAggregatesFilter_schema);


// File: IntNullableWithAggregatesFilter.schema.ts
const __makeSchema_IntNullableWithAggregatesFilter_schema = () => z.object({
  equals: z.number().int().optional().nullable(),
  in: z.number().int().array().optional().nullable(),
  notIn: z.number().int().array().optional().nullable(),
  lt: z.number().int().optional(),
  lte: z.number().int().optional(),
  gt: z.number().int().optional(),
  gte: z.number().int().optional(),
  not: z.union([z.number().int(), NestedIntNullableWithAggregatesFilterObjectSchema]).optional().nullable(),
  get _count(){ return NestedIntNullableFilterObjectSchema.optional(); },
  get _avg(){ return NestedFloatNullableFilterObjectSchema.optional(); },
  get _sum(){ return NestedIntNullableFilterObjectSchema.optional(); },
  get _min(){ return NestedIntNullableFilterObjectSchema.optional(); },
  get _max(){ return NestedIntNullableFilterObjectSchema.optional(); }
}).strict();
export const IntNullableWithAggregatesFilterObjectSchema: z.ZodType<Prisma.IntNullableWithAggregatesFilter> = z.lazy(__makeSchema_IntNullableWithAggregatesFilter_schema) as unknown as z.ZodType<Prisma.IntNullableWithAggregatesFilter>;
export const IntNullableWithAggregatesFilterObjectZodSchema = z.lazy(__makeSchema_IntNullableWithAggregatesFilter_schema);


// File: FloatWithAggregatesFilter.schema.ts
const __makeSchema_FloatWithAggregatesFilter_schema = () => z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), NestedFloatWithAggregatesFilterObjectSchema]).optional(),
  get _count(){ return NestedIntFilterObjectSchema.optional(); },
  get _avg(){ return NestedFloatFilterObjectSchema.optional(); },
  get _sum(){ return NestedFloatFilterObjectSchema.optional(); },
  get _min(){ return NestedFloatFilterObjectSchema.optional(); },
  get _max(){ return NestedFloatFilterObjectSchema.optional(); }
}).strict();
export const FloatWithAggregatesFilterObjectSchema: z.ZodType<Prisma.FloatWithAggregatesFilter> = z.lazy(__makeSchema_FloatWithAggregatesFilter_schema) as unknown as z.ZodType<Prisma.FloatWithAggregatesFilter>;
export const FloatWithAggregatesFilterObjectZodSchema = z.lazy(__makeSchema_FloatWithAggregatesFilter_schema);


// File: DateTimeWithAggregatesFilter.schema.ts
const __makeSchema_DateTimeWithAggregatesFilter_schema = () => z.object({
  equals: z.date().optional(),
  in: z.union([z.date().array(), z.iso.datetime().array()]).optional(),
  notIn: z.union([z.date().array(), z.iso.datetime().array()]).optional(),
  lt: z.date().optional(),
  lte: z.date().optional(),
  gt: z.date().optional(),
  gte: z.date().optional(),
  not: z.union([z.date(), NestedDateTimeWithAggregatesFilterObjectSchema]).optional(),
  get _count(){ return NestedIntFilterObjectSchema.optional(); },
  get _min(){ return NestedDateTimeFilterObjectSchema.optional(); },
  get _max(){ return NestedDateTimeFilterObjectSchema.optional(); }
}).strict();
export const DateTimeWithAggregatesFilterObjectSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.lazy(__makeSchema_DateTimeWithAggregatesFilter_schema) as unknown as z.ZodType<Prisma.DateTimeWithAggregatesFilter>;
export const DateTimeWithAggregatesFilterObjectZodSchema = z.lazy(__makeSchema_DateTimeWithAggregatesFilter_schema);


// File: EnumSemesterFilter.schema.ts
const __makeSchema_EnumSemesterFilter_schema = () => z.object({
  equals: SemesterSchema.optional(),
  in: SemesterSchema.array().optional(),
  notIn: SemesterSchema.array().optional(),
  not: z.union([SemesterSchema, NestedEnumSemesterFilterObjectSchema]).optional()
}).strict();
export const EnumSemesterFilterObjectSchema: z.ZodType<Prisma.EnumSemesterFilter> = z.lazy(__makeSchema_EnumSemesterFilter_schema) as unknown as z.ZodType<Prisma.EnumSemesterFilter>;
export const EnumSemesterFilterObjectZodSchema = z.lazy(__makeSchema_EnumSemesterFilter_schema);


// File: CourseScalarRelationFilter.schema.ts
const __makeSchema_CourseScalarRelationFilter_schema = () => z.object({
  get is(){ return CourseWhereInputObjectSchema.optional(); },
  get isNot(){ return CourseWhereInputObjectSchema.optional(); }
}).strict();
export const CourseScalarRelationFilterObjectSchema: z.ZodType<Prisma.CourseScalarRelationFilter> = z.lazy(__makeSchema_CourseScalarRelationFilter_schema) as unknown as z.ZodType<Prisma.CourseScalarRelationFilter>;
export const CourseScalarRelationFilterObjectZodSchema = z.lazy(__makeSchema_CourseScalarRelationFilter_schema);


// File: GradeCourseIdSemesterYearCompoundUniqueInput.schema.ts
const __makeSchema_GradeCourseIdSemesterYearCompoundUniqueInput_schema = () => z.object({
  courseId: z.string(),
  semester: SemesterSchema,
  year: z.number().int()
}).strict();
export const GradeCourseIdSemesterYearCompoundUniqueInputObjectSchema: z.ZodType<Prisma.GradeCourseIdSemesterYearCompoundUniqueInput> = z.lazy(__makeSchema_GradeCourseIdSemesterYearCompoundUniqueInput_schema) as unknown as z.ZodType<Prisma.GradeCourseIdSemesterYearCompoundUniqueInput>;
export const GradeCourseIdSemesterYearCompoundUniqueInputObjectZodSchema = z.lazy(__makeSchema_GradeCourseIdSemesterYearCompoundUniqueInput_schema);


// File: GradeCountOrderByAggregateInput.schema.ts
const __makeSchema_GradeCountOrderByAggregateInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  gradeACount: SortOrderSchema.optional(),
  gradeBCount: SortOrderSchema.optional(),
  gradeCCount: SortOrderSchema.optional(),
  gradeDCount: SortOrderSchema.optional(),
  gradeECount: SortOrderSchema.optional(),
  gradeFCount: SortOrderSchema.optional(),
  passedCount: SortOrderSchema.optional(),
  failedCount: SortOrderSchema.optional(),
  courseId: SortOrderSchema.optional(),
  semester: SortOrderSchema.optional(),
  year: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional()
}).strict();
export const GradeCountOrderByAggregateInputObjectSchema: z.ZodType<Prisma.GradeCountOrderByAggregateInput> = z.lazy(__makeSchema_GradeCountOrderByAggregateInput_schema) as unknown as z.ZodType<Prisma.GradeCountOrderByAggregateInput>;
export const GradeCountOrderByAggregateInputObjectZodSchema = z.lazy(__makeSchema_GradeCountOrderByAggregateInput_schema);


// File: GradeAvgOrderByAggregateInput.schema.ts
const __makeSchema_GradeAvgOrderByAggregateInput_schema = () => z.object({
  gradeACount: SortOrderSchema.optional(),
  gradeBCount: SortOrderSchema.optional(),
  gradeCCount: SortOrderSchema.optional(),
  gradeDCount: SortOrderSchema.optional(),
  gradeECount: SortOrderSchema.optional(),
  gradeFCount: SortOrderSchema.optional(),
  passedCount: SortOrderSchema.optional(),
  failedCount: SortOrderSchema.optional(),
  year: SortOrderSchema.optional()
}).strict();
export const GradeAvgOrderByAggregateInputObjectSchema: z.ZodType<Prisma.GradeAvgOrderByAggregateInput> = z.lazy(__makeSchema_GradeAvgOrderByAggregateInput_schema) as unknown as z.ZodType<Prisma.GradeAvgOrderByAggregateInput>;
export const GradeAvgOrderByAggregateInputObjectZodSchema = z.lazy(__makeSchema_GradeAvgOrderByAggregateInput_schema);


// File: GradeMaxOrderByAggregateInput.schema.ts
const __makeSchema_GradeMaxOrderByAggregateInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  gradeACount: SortOrderSchema.optional(),
  gradeBCount: SortOrderSchema.optional(),
  gradeCCount: SortOrderSchema.optional(),
  gradeDCount: SortOrderSchema.optional(),
  gradeECount: SortOrderSchema.optional(),
  gradeFCount: SortOrderSchema.optional(),
  passedCount: SortOrderSchema.optional(),
  failedCount: SortOrderSchema.optional(),
  courseId: SortOrderSchema.optional(),
  semester: SortOrderSchema.optional(),
  year: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional()
}).strict();
export const GradeMaxOrderByAggregateInputObjectSchema: z.ZodType<Prisma.GradeMaxOrderByAggregateInput> = z.lazy(__makeSchema_GradeMaxOrderByAggregateInput_schema) as unknown as z.ZodType<Prisma.GradeMaxOrderByAggregateInput>;
export const GradeMaxOrderByAggregateInputObjectZodSchema = z.lazy(__makeSchema_GradeMaxOrderByAggregateInput_schema);


// File: GradeMinOrderByAggregateInput.schema.ts
const __makeSchema_GradeMinOrderByAggregateInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  gradeACount: SortOrderSchema.optional(),
  gradeBCount: SortOrderSchema.optional(),
  gradeCCount: SortOrderSchema.optional(),
  gradeDCount: SortOrderSchema.optional(),
  gradeECount: SortOrderSchema.optional(),
  gradeFCount: SortOrderSchema.optional(),
  passedCount: SortOrderSchema.optional(),
  failedCount: SortOrderSchema.optional(),
  courseId: SortOrderSchema.optional(),
  semester: SortOrderSchema.optional(),
  year: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional()
}).strict();
export const GradeMinOrderByAggregateInputObjectSchema: z.ZodType<Prisma.GradeMinOrderByAggregateInput> = z.lazy(__makeSchema_GradeMinOrderByAggregateInput_schema) as unknown as z.ZodType<Prisma.GradeMinOrderByAggregateInput>;
export const GradeMinOrderByAggregateInputObjectZodSchema = z.lazy(__makeSchema_GradeMinOrderByAggregateInput_schema);


// File: GradeSumOrderByAggregateInput.schema.ts
const __makeSchema_GradeSumOrderByAggregateInput_schema = () => z.object({
  gradeACount: SortOrderSchema.optional(),
  gradeBCount: SortOrderSchema.optional(),
  gradeCCount: SortOrderSchema.optional(),
  gradeDCount: SortOrderSchema.optional(),
  gradeECount: SortOrderSchema.optional(),
  gradeFCount: SortOrderSchema.optional(),
  passedCount: SortOrderSchema.optional(),
  failedCount: SortOrderSchema.optional(),
  year: SortOrderSchema.optional()
}).strict();
export const GradeSumOrderByAggregateInputObjectSchema: z.ZodType<Prisma.GradeSumOrderByAggregateInput> = z.lazy(__makeSchema_GradeSumOrderByAggregateInput_schema) as unknown as z.ZodType<Prisma.GradeSumOrderByAggregateInput>;
export const GradeSumOrderByAggregateInputObjectZodSchema = z.lazy(__makeSchema_GradeSumOrderByAggregateInput_schema);


// File: EnumSemesterWithAggregatesFilter.schema.ts
const __makeSchema_EnumSemesterWithAggregatesFilter_schema = () => z.object({
  equals: SemesterSchema.optional(),
  in: SemesterSchema.array().optional(),
  notIn: SemesterSchema.array().optional(),
  not: z.union([SemesterSchema, NestedEnumSemesterWithAggregatesFilterObjectSchema]).optional(),
  get _count(){ return NestedIntFilterObjectSchema.optional(); },
  get _min(){ return NestedEnumSemesterFilterObjectSchema.optional(); },
  get _max(){ return NestedEnumSemesterFilterObjectSchema.optional(); }
}).strict();
export const EnumSemesterWithAggregatesFilterObjectSchema: z.ZodType<Prisma.EnumSemesterWithAggregatesFilter> = z.lazy(__makeSchema_EnumSemesterWithAggregatesFilter_schema) as unknown as z.ZodType<Prisma.EnumSemesterWithAggregatesFilter>;
export const EnumSemesterWithAggregatesFilterObjectZodSchema = z.lazy(__makeSchema_EnumSemesterWithAggregatesFilter_schema);


// File: CourseListRelationFilter.schema.ts
const __makeSchema_CourseListRelationFilter_schema = () => z.object({
  get every(){ return CourseWhereInputObjectSchema.optional(); },
  get some(){ return CourseWhereInputObjectSchema.optional(); },
  get none(){ return CourseWhereInputObjectSchema.optional(); }
}).strict();
export const CourseListRelationFilterObjectSchema: z.ZodType<Prisma.CourseListRelationFilter> = z.lazy(__makeSchema_CourseListRelationFilter_schema) as unknown as z.ZodType<Prisma.CourseListRelationFilter>;
export const CourseListRelationFilterObjectZodSchema = z.lazy(__makeSchema_CourseListRelationFilter_schema);


// File: DepartmentListRelationFilter.schema.ts
const __makeSchema_DepartmentListRelationFilter_schema = () => z.object({
  get every(){ return DepartmentWhereInputObjectSchema.optional(); },
  get some(){ return DepartmentWhereInputObjectSchema.optional(); },
  get none(){ return DepartmentWhereInputObjectSchema.optional(); }
}).strict();
export const DepartmentListRelationFilterObjectSchema: z.ZodType<Prisma.DepartmentListRelationFilter> = z.lazy(__makeSchema_DepartmentListRelationFilter_schema) as unknown as z.ZodType<Prisma.DepartmentListRelationFilter>;
export const DepartmentListRelationFilterObjectZodSchema = z.lazy(__makeSchema_DepartmentListRelationFilter_schema);


// File: CourseOrderByRelationAggregateInput.schema.ts
const __makeSchema_CourseOrderByRelationAggregateInput_schema = () => z.object({
  _count: SortOrderSchema.optional()
}).strict();
export const CourseOrderByRelationAggregateInputObjectSchema: z.ZodType<Prisma.CourseOrderByRelationAggregateInput> = z.lazy(__makeSchema_CourseOrderByRelationAggregateInput_schema) as unknown as z.ZodType<Prisma.CourseOrderByRelationAggregateInput>;
export const CourseOrderByRelationAggregateInputObjectZodSchema = z.lazy(__makeSchema_CourseOrderByRelationAggregateInput_schema);


// File: DepartmentOrderByRelationAggregateInput.schema.ts
const __makeSchema_DepartmentOrderByRelationAggregateInput_schema = () => z.object({
  _count: SortOrderSchema.optional()
}).strict();
export const DepartmentOrderByRelationAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentOrderByRelationAggregateInput> = z.lazy(__makeSchema_DepartmentOrderByRelationAggregateInput_schema) as unknown as z.ZodType<Prisma.DepartmentOrderByRelationAggregateInput>;
export const DepartmentOrderByRelationAggregateInputObjectZodSchema = z.lazy(__makeSchema_DepartmentOrderByRelationAggregateInput_schema);


// File: FacultyCountOrderByAggregateInput.schema.ts
const __makeSchema_FacultyCountOrderByAggregateInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  code: SortOrderSchema.optional()
}).strict();
export const FacultyCountOrderByAggregateInputObjectSchema: z.ZodType<Prisma.FacultyCountOrderByAggregateInput> = z.lazy(__makeSchema_FacultyCountOrderByAggregateInput_schema) as unknown as z.ZodType<Prisma.FacultyCountOrderByAggregateInput>;
export const FacultyCountOrderByAggregateInputObjectZodSchema = z.lazy(__makeSchema_FacultyCountOrderByAggregateInput_schema);


// File: FacultyAvgOrderByAggregateInput.schema.ts
const __makeSchema_FacultyAvgOrderByAggregateInput_schema = () => z.object({
  code: SortOrderSchema.optional()
}).strict();
export const FacultyAvgOrderByAggregateInputObjectSchema: z.ZodType<Prisma.FacultyAvgOrderByAggregateInput> = z.lazy(__makeSchema_FacultyAvgOrderByAggregateInput_schema) as unknown as z.ZodType<Prisma.FacultyAvgOrderByAggregateInput>;
export const FacultyAvgOrderByAggregateInputObjectZodSchema = z.lazy(__makeSchema_FacultyAvgOrderByAggregateInput_schema);


// File: FacultyMaxOrderByAggregateInput.schema.ts
const __makeSchema_FacultyMaxOrderByAggregateInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  code: SortOrderSchema.optional()
}).strict();
export const FacultyMaxOrderByAggregateInputObjectSchema: z.ZodType<Prisma.FacultyMaxOrderByAggregateInput> = z.lazy(__makeSchema_FacultyMaxOrderByAggregateInput_schema) as unknown as z.ZodType<Prisma.FacultyMaxOrderByAggregateInput>;
export const FacultyMaxOrderByAggregateInputObjectZodSchema = z.lazy(__makeSchema_FacultyMaxOrderByAggregateInput_schema);


// File: FacultyMinOrderByAggregateInput.schema.ts
const __makeSchema_FacultyMinOrderByAggregateInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  code: SortOrderSchema.optional()
}).strict();
export const FacultyMinOrderByAggregateInputObjectSchema: z.ZodType<Prisma.FacultyMinOrderByAggregateInput> = z.lazy(__makeSchema_FacultyMinOrderByAggregateInput_schema) as unknown as z.ZodType<Prisma.FacultyMinOrderByAggregateInput>;
export const FacultyMinOrderByAggregateInputObjectZodSchema = z.lazy(__makeSchema_FacultyMinOrderByAggregateInput_schema);


// File: FacultySumOrderByAggregateInput.schema.ts
const __makeSchema_FacultySumOrderByAggregateInput_schema = () => z.object({
  code: SortOrderSchema.optional()
}).strict();
export const FacultySumOrderByAggregateInputObjectSchema: z.ZodType<Prisma.FacultySumOrderByAggregateInput> = z.lazy(__makeSchema_FacultySumOrderByAggregateInput_schema) as unknown as z.ZodType<Prisma.FacultySumOrderByAggregateInput>;
export const FacultySumOrderByAggregateInputObjectZodSchema = z.lazy(__makeSchema_FacultySumOrderByAggregateInput_schema);


// File: FacultyScalarRelationFilter.schema.ts
const __makeSchema_FacultyScalarRelationFilter_schema = () => z.object({
  get is(){ return FacultyWhereInputObjectSchema.optional(); },
  get isNot(){ return FacultyWhereInputObjectSchema.optional(); }
}).strict();
export const FacultyScalarRelationFilterObjectSchema: z.ZodType<Prisma.FacultyScalarRelationFilter> = z.lazy(__makeSchema_FacultyScalarRelationFilter_schema) as unknown as z.ZodType<Prisma.FacultyScalarRelationFilter>;
export const FacultyScalarRelationFilterObjectZodSchema = z.lazy(__makeSchema_FacultyScalarRelationFilter_schema);


// File: DepartmentCountOrderByAggregateInput.schema.ts
const __makeSchema_DepartmentCountOrderByAggregateInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  facultyId: SortOrderSchema.optional()
}).strict();
export const DepartmentCountOrderByAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentCountOrderByAggregateInput> = z.lazy(__makeSchema_DepartmentCountOrderByAggregateInput_schema) as unknown as z.ZodType<Prisma.DepartmentCountOrderByAggregateInput>;
export const DepartmentCountOrderByAggregateInputObjectZodSchema = z.lazy(__makeSchema_DepartmentCountOrderByAggregateInput_schema);


// File: DepartmentAvgOrderByAggregateInput.schema.ts
const __makeSchema_DepartmentAvgOrderByAggregateInput_schema = () => z.object({
  code: SortOrderSchema.optional()
}).strict();
export const DepartmentAvgOrderByAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentAvgOrderByAggregateInput> = z.lazy(__makeSchema_DepartmentAvgOrderByAggregateInput_schema) as unknown as z.ZodType<Prisma.DepartmentAvgOrderByAggregateInput>;
export const DepartmentAvgOrderByAggregateInputObjectZodSchema = z.lazy(__makeSchema_DepartmentAvgOrderByAggregateInput_schema);


// File: DepartmentMaxOrderByAggregateInput.schema.ts
const __makeSchema_DepartmentMaxOrderByAggregateInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  facultyId: SortOrderSchema.optional()
}).strict();
export const DepartmentMaxOrderByAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentMaxOrderByAggregateInput> = z.lazy(__makeSchema_DepartmentMaxOrderByAggregateInput_schema) as unknown as z.ZodType<Prisma.DepartmentMaxOrderByAggregateInput>;
export const DepartmentMaxOrderByAggregateInputObjectZodSchema = z.lazy(__makeSchema_DepartmentMaxOrderByAggregateInput_schema);


// File: DepartmentMinOrderByAggregateInput.schema.ts
const __makeSchema_DepartmentMinOrderByAggregateInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  facultyId: SortOrderSchema.optional()
}).strict();
export const DepartmentMinOrderByAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentMinOrderByAggregateInput> = z.lazy(__makeSchema_DepartmentMinOrderByAggregateInput_schema) as unknown as z.ZodType<Prisma.DepartmentMinOrderByAggregateInput>;
export const DepartmentMinOrderByAggregateInputObjectZodSchema = z.lazy(__makeSchema_DepartmentMinOrderByAggregateInput_schema);


// File: DepartmentSumOrderByAggregateInput.schema.ts
const __makeSchema_DepartmentSumOrderByAggregateInput_schema = () => z.object({
  code: SortOrderSchema.optional()
}).strict();
export const DepartmentSumOrderByAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentSumOrderByAggregateInput> = z.lazy(__makeSchema_DepartmentSumOrderByAggregateInput_schema) as unknown as z.ZodType<Prisma.DepartmentSumOrderByAggregateInput>;
export const DepartmentSumOrderByAggregateInputObjectZodSchema = z.lazy(__makeSchema_DepartmentSumOrderByAggregateInput_schema);


// File: CourseCreatetaughtSemestersInput.schema.ts
const __makeSchema_CourseCreatetaughtSemestersInput_schema = () => z.object({
  set: SemesterSchema.array()
}).strict();
export const CourseCreatetaughtSemestersInputObjectSchema: z.ZodType<Prisma.CourseCreatetaughtSemestersInput> = z.lazy(__makeSchema_CourseCreatetaughtSemestersInput_schema) as unknown as z.ZodType<Prisma.CourseCreatetaughtSemestersInput>;
export const CourseCreatetaughtSemestersInputObjectZodSchema = z.lazy(__makeSchema_CourseCreatetaughtSemestersInput_schema);


// File: CourseCreateteachingLanguagesInput.schema.ts
const __makeSchema_CourseCreateteachingLanguagesInput_schema = () => z.object({
  set: TeachingLanguageSchema.array()
}).strict();
export const CourseCreateteachingLanguagesInputObjectSchema: z.ZodType<Prisma.CourseCreateteachingLanguagesInput> = z.lazy(__makeSchema_CourseCreateteachingLanguagesInput_schema) as unknown as z.ZodType<Prisma.CourseCreateteachingLanguagesInput>;
export const CourseCreateteachingLanguagesInputObjectZodSchema = z.lazy(__makeSchema_CourseCreateteachingLanguagesInput_schema);


// File: CourseCreatecampusesInput.schema.ts
const __makeSchema_CourseCreatecampusesInput_schema = () => z.object({
  set: CampusSchema.array()
}).strict();
export const CourseCreatecampusesInputObjectSchema: z.ZodType<Prisma.CourseCreatecampusesInput> = z.lazy(__makeSchema_CourseCreatecampusesInput_schema) as unknown as z.ZodType<Prisma.CourseCreatecampusesInput>;
export const CourseCreatecampusesInputObjectZodSchema = z.lazy(__makeSchema_CourseCreatecampusesInput_schema);


// File: GradeCreateNestedManyWithoutCourseInput.schema.ts
const __makeSchema_GradeCreateNestedManyWithoutCourseInput_schema = () => z.object({
  create: z.union([GradeCreateWithoutCourseInputObjectSchema, GradeCreateWithoutCourseInputObjectSchema.array(), GradeUncheckedCreateWithoutCourseInputObjectSchema, GradeUncheckedCreateWithoutCourseInputObjectSchema.array()]).optional(),
  connectOrCreate: z.union([GradeCreateOrConnectWithoutCourseInputObjectSchema, GradeCreateOrConnectWithoutCourseInputObjectSchema.array()]).optional(),
  get createMany(){ return GradeCreateManyCourseInputEnvelopeObjectSchema.optional(); },
  connect: z.union([GradeWhereUniqueInputObjectSchema, GradeWhereUniqueInputObjectSchema.array()]).optional()
}).strict();
export const GradeCreateNestedManyWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeCreateNestedManyWithoutCourseInput> = z.lazy(__makeSchema_GradeCreateNestedManyWithoutCourseInput_schema) as unknown as z.ZodType<Prisma.GradeCreateNestedManyWithoutCourseInput>;
export const GradeCreateNestedManyWithoutCourseInputObjectZodSchema = z.lazy(__makeSchema_GradeCreateNestedManyWithoutCourseInput_schema);


// File: FacultyCreateNestedOneWithoutCoursesInput.schema.ts
const __makeSchema_FacultyCreateNestedOneWithoutCoursesInput_schema = () => z.object({
  create: z.union([FacultyCreateWithoutCoursesInputObjectSchema, FacultyUncheckedCreateWithoutCoursesInputObjectSchema]).optional(),
  get connectOrCreate(){ return FacultyCreateOrConnectWithoutCoursesInputObjectSchema.optional(); },
  get connect(){ return FacultyWhereUniqueInputObjectSchema.optional(); }
}).strict();
export const FacultyCreateNestedOneWithoutCoursesInputObjectSchema: z.ZodType<Prisma.FacultyCreateNestedOneWithoutCoursesInput> = z.lazy(__makeSchema_FacultyCreateNestedOneWithoutCoursesInput_schema) as unknown as z.ZodType<Prisma.FacultyCreateNestedOneWithoutCoursesInput>;
export const FacultyCreateNestedOneWithoutCoursesInputObjectZodSchema = z.lazy(__makeSchema_FacultyCreateNestedOneWithoutCoursesInput_schema);


// File: DepartmentCreateNestedOneWithoutCoursesInput.schema.ts
const __makeSchema_DepartmentCreateNestedOneWithoutCoursesInput_schema = () => z.object({
  create: z.union([DepartmentCreateWithoutCoursesInputObjectSchema, DepartmentUncheckedCreateWithoutCoursesInputObjectSchema]).optional(),
  get connectOrCreate(){ return DepartmentCreateOrConnectWithoutCoursesInputObjectSchema.optional(); },
  get connect(){ return DepartmentWhereUniqueInputObjectSchema.optional(); }
}).strict();
export const DepartmentCreateNestedOneWithoutCoursesInputObjectSchema: z.ZodType<Prisma.DepartmentCreateNestedOneWithoutCoursesInput> = z.lazy(__makeSchema_DepartmentCreateNestedOneWithoutCoursesInput_schema) as unknown as z.ZodType<Prisma.DepartmentCreateNestedOneWithoutCoursesInput>;
export const DepartmentCreateNestedOneWithoutCoursesInputObjectZodSchema = z.lazy(__makeSchema_DepartmentCreateNestedOneWithoutCoursesInput_schema);


// File: GradeUncheckedCreateNestedManyWithoutCourseInput.schema.ts
const __makeSchema_GradeUncheckedCreateNestedManyWithoutCourseInput_schema = () => z.object({
  create: z.union([GradeCreateWithoutCourseInputObjectSchema, GradeCreateWithoutCourseInputObjectSchema.array(), GradeUncheckedCreateWithoutCourseInputObjectSchema, GradeUncheckedCreateWithoutCourseInputObjectSchema.array()]).optional(),
  connectOrCreate: z.union([GradeCreateOrConnectWithoutCourseInputObjectSchema, GradeCreateOrConnectWithoutCourseInputObjectSchema.array()]).optional(),
  get createMany(){ return GradeCreateManyCourseInputEnvelopeObjectSchema.optional(); },
  connect: z.union([GradeWhereUniqueInputObjectSchema, GradeWhereUniqueInputObjectSchema.array()]).optional()
}).strict();
export const GradeUncheckedCreateNestedManyWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeUncheckedCreateNestedManyWithoutCourseInput> = z.lazy(__makeSchema_GradeUncheckedCreateNestedManyWithoutCourseInput_schema) as unknown as z.ZodType<Prisma.GradeUncheckedCreateNestedManyWithoutCourseInput>;
export const GradeUncheckedCreateNestedManyWithoutCourseInputObjectZodSchema = z.lazy(__makeSchema_GradeUncheckedCreateNestedManyWithoutCourseInput_schema);


// File: StringFieldUpdateOperationsInput.schema.ts
const __makeSchema_StringFieldUpdateOperationsInput_schema = () => z.object({
  set: z.string().optional()
}).strict();
export const StringFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.lazy(__makeSchema_StringFieldUpdateOperationsInput_schema) as unknown as z.ZodType<Prisma.StringFieldUpdateOperationsInput>;
export const StringFieldUpdateOperationsInputObjectZodSchema = z.lazy(__makeSchema_StringFieldUpdateOperationsInput_schema);


// File: NullableStringFieldUpdateOperationsInput.schema.ts
const __makeSchema_NullableStringFieldUpdateOperationsInput_schema = () => z.object({
  set: z.string().optional()
}).strict();
export const NullableStringFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.lazy(__makeSchema_NullableStringFieldUpdateOperationsInput_schema) as unknown as z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput>;
export const NullableStringFieldUpdateOperationsInputObjectZodSchema = z.lazy(__makeSchema_NullableStringFieldUpdateOperationsInput_schema);


// File: NullableFloatFieldUpdateOperationsInput.schema.ts
const __makeSchema_NullableFloatFieldUpdateOperationsInput_schema = () => z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();
export const NullableFloatFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.NullableFloatFieldUpdateOperationsInput> = z.lazy(__makeSchema_NullableFloatFieldUpdateOperationsInput_schema) as unknown as z.ZodType<Prisma.NullableFloatFieldUpdateOperationsInput>;
export const NullableFloatFieldUpdateOperationsInputObjectZodSchema = z.lazy(__makeSchema_NullableFloatFieldUpdateOperationsInput_schema);


// File: EnumStudyLevelFieldUpdateOperationsInput.schema.ts
const __makeSchema_EnumStudyLevelFieldUpdateOperationsInput_schema = () => z.object({
  set: StudyLevelSchema.optional()
}).strict();
export const EnumStudyLevelFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.EnumStudyLevelFieldUpdateOperationsInput> = z.lazy(__makeSchema_EnumStudyLevelFieldUpdateOperationsInput_schema) as unknown as z.ZodType<Prisma.EnumStudyLevelFieldUpdateOperationsInput>;
export const EnumStudyLevelFieldUpdateOperationsInputObjectZodSchema = z.lazy(__makeSchema_EnumStudyLevelFieldUpdateOperationsInput_schema);


// File: EnumGradeTypeFieldUpdateOperationsInput.schema.ts
const __makeSchema_EnumGradeTypeFieldUpdateOperationsInput_schema = () => z.object({
  set: GradeTypeSchema.optional()
}).strict();
export const EnumGradeTypeFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.EnumGradeTypeFieldUpdateOperationsInput> = z.lazy(__makeSchema_EnumGradeTypeFieldUpdateOperationsInput_schema) as unknown as z.ZodType<Prisma.EnumGradeTypeFieldUpdateOperationsInput>;
export const EnumGradeTypeFieldUpdateOperationsInputObjectZodSchema = z.lazy(__makeSchema_EnumGradeTypeFieldUpdateOperationsInput_schema);


// File: IntFieldUpdateOperationsInput.schema.ts
const __makeSchema_IntFieldUpdateOperationsInput_schema = () => z.object({
  set: z.number().int().optional(),
  increment: z.number().int().optional(),
  decrement: z.number().int().optional(),
  multiply: z.number().int().optional(),
  divide: z.number().int().optional()
}).strict();
export const IntFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.lazy(__makeSchema_IntFieldUpdateOperationsInput_schema) as unknown as z.ZodType<Prisma.IntFieldUpdateOperationsInput>;
export const IntFieldUpdateOperationsInputObjectZodSchema = z.lazy(__makeSchema_IntFieldUpdateOperationsInput_schema);


// File: NullableIntFieldUpdateOperationsInput.schema.ts
const __makeSchema_NullableIntFieldUpdateOperationsInput_schema = () => z.object({
  set: z.number().int().optional(),
  increment: z.number().int().optional(),
  decrement: z.number().int().optional(),
  multiply: z.number().int().optional(),
  divide: z.number().int().optional()
}).strict();
export const NullableIntFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.NullableIntFieldUpdateOperationsInput> = z.lazy(__makeSchema_NullableIntFieldUpdateOperationsInput_schema) as unknown as z.ZodType<Prisma.NullableIntFieldUpdateOperationsInput>;
export const NullableIntFieldUpdateOperationsInputObjectZodSchema = z.lazy(__makeSchema_NullableIntFieldUpdateOperationsInput_schema);


// File: FloatFieldUpdateOperationsInput.schema.ts
const __makeSchema_FloatFieldUpdateOperationsInput_schema = () => z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();
export const FloatFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.FloatFieldUpdateOperationsInput> = z.lazy(__makeSchema_FloatFieldUpdateOperationsInput_schema) as unknown as z.ZodType<Prisma.FloatFieldUpdateOperationsInput>;
export const FloatFieldUpdateOperationsInputObjectZodSchema = z.lazy(__makeSchema_FloatFieldUpdateOperationsInput_schema);


// File: DateTimeFieldUpdateOperationsInput.schema.ts
const __makeSchema_DateTimeFieldUpdateOperationsInput_schema = () => z.object({
  set: z.coerce.date().optional()
}).strict();
export const DateTimeFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.lazy(__makeSchema_DateTimeFieldUpdateOperationsInput_schema) as unknown as z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput>;
export const DateTimeFieldUpdateOperationsInputObjectZodSchema = z.lazy(__makeSchema_DateTimeFieldUpdateOperationsInput_schema);


// File: CourseUpdatetaughtSemestersInput.schema.ts
const __makeSchema_CourseUpdatetaughtSemestersInput_schema = () => z.object({
  set: SemesterSchema.array().optional(),
  push: z.union([SemesterSchema, SemesterSchema.array()]).optional()
}).strict();
export const CourseUpdatetaughtSemestersInputObjectSchema: z.ZodType<Prisma.CourseUpdatetaughtSemestersInput> = z.lazy(__makeSchema_CourseUpdatetaughtSemestersInput_schema) as unknown as z.ZodType<Prisma.CourseUpdatetaughtSemestersInput>;
export const CourseUpdatetaughtSemestersInputObjectZodSchema = z.lazy(__makeSchema_CourseUpdatetaughtSemestersInput_schema);


// File: CourseUpdateteachingLanguagesInput.schema.ts
const __makeSchema_CourseUpdateteachingLanguagesInput_schema = () => z.object({
  set: TeachingLanguageSchema.array().optional(),
  push: z.union([TeachingLanguageSchema, TeachingLanguageSchema.array()]).optional()
}).strict();
export const CourseUpdateteachingLanguagesInputObjectSchema: z.ZodType<Prisma.CourseUpdateteachingLanguagesInput> = z.lazy(__makeSchema_CourseUpdateteachingLanguagesInput_schema) as unknown as z.ZodType<Prisma.CourseUpdateteachingLanguagesInput>;
export const CourseUpdateteachingLanguagesInputObjectZodSchema = z.lazy(__makeSchema_CourseUpdateteachingLanguagesInput_schema);


// File: CourseUpdatecampusesInput.schema.ts
const __makeSchema_CourseUpdatecampusesInput_schema = () => z.object({
  set: CampusSchema.array().optional(),
  push: z.union([CampusSchema, CampusSchema.array()]).optional()
}).strict();
export const CourseUpdatecampusesInputObjectSchema: z.ZodType<Prisma.CourseUpdatecampusesInput> = z.lazy(__makeSchema_CourseUpdatecampusesInput_schema) as unknown as z.ZodType<Prisma.CourseUpdatecampusesInput>;
export const CourseUpdatecampusesInputObjectZodSchema = z.lazy(__makeSchema_CourseUpdatecampusesInput_schema);


// File: GradeUpdateManyWithoutCourseNestedInput.schema.ts
const __makeSchema_GradeUpdateManyWithoutCourseNestedInput_schema = () => z.object({
  create: z.union([GradeCreateWithoutCourseInputObjectSchema, GradeCreateWithoutCourseInputObjectSchema.array(), GradeUncheckedCreateWithoutCourseInputObjectSchema, GradeUncheckedCreateWithoutCourseInputObjectSchema.array()]).optional(),
  connectOrCreate: z.union([GradeCreateOrConnectWithoutCourseInputObjectSchema, GradeCreateOrConnectWithoutCourseInputObjectSchema.array()]).optional(),
  upsert: z.union([GradeUpsertWithWhereUniqueWithoutCourseInputObjectSchema, GradeUpsertWithWhereUniqueWithoutCourseInputObjectSchema.array()]).optional(),
  get createMany(){ return GradeCreateManyCourseInputEnvelopeObjectSchema.optional(); },
  set: z.union([GradeWhereUniqueInputObjectSchema, GradeWhereUniqueInputObjectSchema.array()]).optional(),
  disconnect: z.union([GradeWhereUniqueInputObjectSchema, GradeWhereUniqueInputObjectSchema.array()]).optional(),
  delete: z.union([GradeWhereUniqueInputObjectSchema, GradeWhereUniqueInputObjectSchema.array()]).optional(),
  connect: z.union([GradeWhereUniqueInputObjectSchema, GradeWhereUniqueInputObjectSchema.array()]).optional(),
  update: z.union([GradeUpdateWithWhereUniqueWithoutCourseInputObjectSchema, GradeUpdateWithWhereUniqueWithoutCourseInputObjectSchema.array()]).optional(),
  updateMany: z.union([GradeUpdateManyWithWhereWithoutCourseInputObjectSchema, GradeUpdateManyWithWhereWithoutCourseInputObjectSchema.array()]).optional(),
  deleteMany: z.union([GradeScalarWhereInputObjectSchema, GradeScalarWhereInputObjectSchema.array()]).optional()
}).strict();
export const GradeUpdateManyWithoutCourseNestedInputObjectSchema: z.ZodType<Prisma.GradeUpdateManyWithoutCourseNestedInput> = z.lazy(__makeSchema_GradeUpdateManyWithoutCourseNestedInput_schema) as unknown as z.ZodType<Prisma.GradeUpdateManyWithoutCourseNestedInput>;
export const GradeUpdateManyWithoutCourseNestedInputObjectZodSchema = z.lazy(__makeSchema_GradeUpdateManyWithoutCourseNestedInput_schema);


// File: FacultyUpdateOneWithoutCoursesNestedInput.schema.ts
const __makeSchema_FacultyUpdateOneWithoutCoursesNestedInput_schema = () => z.object({
  create: z.union([FacultyCreateWithoutCoursesInputObjectSchema, FacultyUncheckedCreateWithoutCoursesInputObjectSchema]).optional(),
  get connectOrCreate(){ return FacultyCreateOrConnectWithoutCoursesInputObjectSchema.optional(); },
  get upsert(){ return FacultyUpsertWithoutCoursesInputObjectSchema.optional(); },
  disconnect: z.union([z.boolean(), FacultyWhereInputObjectSchema]).optional(),
  delete: z.union([z.boolean(), FacultyWhereInputObjectSchema]).optional(),
  get connect(){ return FacultyWhereUniqueInputObjectSchema.optional(); },
  update: z.union([FacultyUpdateToOneWithWhereWithoutCoursesInputObjectSchema, FacultyUpdateWithoutCoursesInputObjectSchema, FacultyUncheckedUpdateWithoutCoursesInputObjectSchema]).optional()
}).strict();
export const FacultyUpdateOneWithoutCoursesNestedInputObjectSchema: z.ZodType<Prisma.FacultyUpdateOneWithoutCoursesNestedInput> = z.lazy(__makeSchema_FacultyUpdateOneWithoutCoursesNestedInput_schema) as unknown as z.ZodType<Prisma.FacultyUpdateOneWithoutCoursesNestedInput>;
export const FacultyUpdateOneWithoutCoursesNestedInputObjectZodSchema = z.lazy(__makeSchema_FacultyUpdateOneWithoutCoursesNestedInput_schema);


// File: DepartmentUpdateOneWithoutCoursesNestedInput.schema.ts
const __makeSchema_DepartmentUpdateOneWithoutCoursesNestedInput_schema = () => z.object({
  create: z.union([DepartmentCreateWithoutCoursesInputObjectSchema, DepartmentUncheckedCreateWithoutCoursesInputObjectSchema]).optional(),
  get connectOrCreate(){ return DepartmentCreateOrConnectWithoutCoursesInputObjectSchema.optional(); },
  get upsert(){ return DepartmentUpsertWithoutCoursesInputObjectSchema.optional(); },
  disconnect: z.union([z.boolean(), DepartmentWhereInputObjectSchema]).optional(),
  delete: z.union([z.boolean(), DepartmentWhereInputObjectSchema]).optional(),
  get connect(){ return DepartmentWhereUniqueInputObjectSchema.optional(); },
  update: z.union([DepartmentUpdateToOneWithWhereWithoutCoursesInputObjectSchema, DepartmentUpdateWithoutCoursesInputObjectSchema, DepartmentUncheckedUpdateWithoutCoursesInputObjectSchema]).optional()
}).strict();
export const DepartmentUpdateOneWithoutCoursesNestedInputObjectSchema: z.ZodType<Prisma.DepartmentUpdateOneWithoutCoursesNestedInput> = z.lazy(__makeSchema_DepartmentUpdateOneWithoutCoursesNestedInput_schema) as unknown as z.ZodType<Prisma.DepartmentUpdateOneWithoutCoursesNestedInput>;
export const DepartmentUpdateOneWithoutCoursesNestedInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUpdateOneWithoutCoursesNestedInput_schema);


// File: GradeUncheckedUpdateManyWithoutCourseNestedInput.schema.ts
const __makeSchema_GradeUncheckedUpdateManyWithoutCourseNestedInput_schema = () => z.object({
  create: z.union([GradeCreateWithoutCourseInputObjectSchema, GradeCreateWithoutCourseInputObjectSchema.array(), GradeUncheckedCreateWithoutCourseInputObjectSchema, GradeUncheckedCreateWithoutCourseInputObjectSchema.array()]).optional(),
  connectOrCreate: z.union([GradeCreateOrConnectWithoutCourseInputObjectSchema, GradeCreateOrConnectWithoutCourseInputObjectSchema.array()]).optional(),
  upsert: z.union([GradeUpsertWithWhereUniqueWithoutCourseInputObjectSchema, GradeUpsertWithWhereUniqueWithoutCourseInputObjectSchema.array()]).optional(),
  get createMany(){ return GradeCreateManyCourseInputEnvelopeObjectSchema.optional(); },
  set: z.union([GradeWhereUniqueInputObjectSchema, GradeWhereUniqueInputObjectSchema.array()]).optional(),
  disconnect: z.union([GradeWhereUniqueInputObjectSchema, GradeWhereUniqueInputObjectSchema.array()]).optional(),
  delete: z.union([GradeWhereUniqueInputObjectSchema, GradeWhereUniqueInputObjectSchema.array()]).optional(),
  connect: z.union([GradeWhereUniqueInputObjectSchema, GradeWhereUniqueInputObjectSchema.array()]).optional(),
  update: z.union([GradeUpdateWithWhereUniqueWithoutCourseInputObjectSchema, GradeUpdateWithWhereUniqueWithoutCourseInputObjectSchema.array()]).optional(),
  updateMany: z.union([GradeUpdateManyWithWhereWithoutCourseInputObjectSchema, GradeUpdateManyWithWhereWithoutCourseInputObjectSchema.array()]).optional(),
  deleteMany: z.union([GradeScalarWhereInputObjectSchema, GradeScalarWhereInputObjectSchema.array()]).optional()
}).strict();
export const GradeUncheckedUpdateManyWithoutCourseNestedInputObjectSchema: z.ZodType<Prisma.GradeUncheckedUpdateManyWithoutCourseNestedInput> = z.lazy(__makeSchema_GradeUncheckedUpdateManyWithoutCourseNestedInput_schema) as unknown as z.ZodType<Prisma.GradeUncheckedUpdateManyWithoutCourseNestedInput>;
export const GradeUncheckedUpdateManyWithoutCourseNestedInputObjectZodSchema = z.lazy(__makeSchema_GradeUncheckedUpdateManyWithoutCourseNestedInput_schema);


// File: CourseCreateNestedOneWithoutGradesInput.schema.ts
const __makeSchema_CourseCreateNestedOneWithoutGradesInput_schema = () => z.object({
  create: z.union([CourseCreateWithoutGradesInputObjectSchema, CourseUncheckedCreateWithoutGradesInputObjectSchema]).optional(),
  get connectOrCreate(){ return CourseCreateOrConnectWithoutGradesInputObjectSchema.optional(); },
  get connect(){ return CourseWhereUniqueInputObjectSchema.optional(); }
}).strict();
export const CourseCreateNestedOneWithoutGradesInputObjectSchema: z.ZodType<Prisma.CourseCreateNestedOneWithoutGradesInput> = z.lazy(__makeSchema_CourseCreateNestedOneWithoutGradesInput_schema) as unknown as z.ZodType<Prisma.CourseCreateNestedOneWithoutGradesInput>;
export const CourseCreateNestedOneWithoutGradesInputObjectZodSchema = z.lazy(__makeSchema_CourseCreateNestedOneWithoutGradesInput_schema);


// File: EnumSemesterFieldUpdateOperationsInput.schema.ts
const __makeSchema_EnumSemesterFieldUpdateOperationsInput_schema = () => z.object({
  set: SemesterSchema.optional()
}).strict();
export const EnumSemesterFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.EnumSemesterFieldUpdateOperationsInput> = z.lazy(__makeSchema_EnumSemesterFieldUpdateOperationsInput_schema) as unknown as z.ZodType<Prisma.EnumSemesterFieldUpdateOperationsInput>;
export const EnumSemesterFieldUpdateOperationsInputObjectZodSchema = z.lazy(__makeSchema_EnumSemesterFieldUpdateOperationsInput_schema);


// File: CourseUpdateOneRequiredWithoutGradesNestedInput.schema.ts
const __makeSchema_CourseUpdateOneRequiredWithoutGradesNestedInput_schema = () => z.object({
  create: z.union([CourseCreateWithoutGradesInputObjectSchema, CourseUncheckedCreateWithoutGradesInputObjectSchema]).optional(),
  get connectOrCreate(){ return CourseCreateOrConnectWithoutGradesInputObjectSchema.optional(); },
  get upsert(){ return CourseUpsertWithoutGradesInputObjectSchema.optional(); },
  get connect(){ return CourseWhereUniqueInputObjectSchema.optional(); },
  update: z.union([CourseUpdateToOneWithWhereWithoutGradesInputObjectSchema, CourseUpdateWithoutGradesInputObjectSchema, CourseUncheckedUpdateWithoutGradesInputObjectSchema]).optional()
}).strict();
export const CourseUpdateOneRequiredWithoutGradesNestedInputObjectSchema: z.ZodType<Prisma.CourseUpdateOneRequiredWithoutGradesNestedInput> = z.lazy(__makeSchema_CourseUpdateOneRequiredWithoutGradesNestedInput_schema) as unknown as z.ZodType<Prisma.CourseUpdateOneRequiredWithoutGradesNestedInput>;
export const CourseUpdateOneRequiredWithoutGradesNestedInputObjectZodSchema = z.lazy(__makeSchema_CourseUpdateOneRequiredWithoutGradesNestedInput_schema);


// File: CourseCreateNestedManyWithoutFacultyInput.schema.ts
const __makeSchema_CourseCreateNestedManyWithoutFacultyInput_schema = () => z.object({
  create: z.union([CourseCreateWithoutFacultyInputObjectSchema, CourseCreateWithoutFacultyInputObjectSchema.array(), CourseUncheckedCreateWithoutFacultyInputObjectSchema, CourseUncheckedCreateWithoutFacultyInputObjectSchema.array()]).optional(),
  connectOrCreate: z.union([CourseCreateOrConnectWithoutFacultyInputObjectSchema, CourseCreateOrConnectWithoutFacultyInputObjectSchema.array()]).optional(),
  get createMany(){ return CourseCreateManyFacultyInputEnvelopeObjectSchema.optional(); },
  connect: z.union([CourseWhereUniqueInputObjectSchema, CourseWhereUniqueInputObjectSchema.array()]).optional()
}).strict();
export const CourseCreateNestedManyWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseCreateNestedManyWithoutFacultyInput> = z.lazy(__makeSchema_CourseCreateNestedManyWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.CourseCreateNestedManyWithoutFacultyInput>;
export const CourseCreateNestedManyWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_CourseCreateNestedManyWithoutFacultyInput_schema);


// File: DepartmentCreateNestedManyWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentCreateNestedManyWithoutFacultyInput_schema = () => z.object({
  create: z.union([DepartmentCreateWithoutFacultyInputObjectSchema, DepartmentCreateWithoutFacultyInputObjectSchema.array(), DepartmentUncheckedCreateWithoutFacultyInputObjectSchema, DepartmentUncheckedCreateWithoutFacultyInputObjectSchema.array()]).optional(),
  connectOrCreate: z.union([DepartmentCreateOrConnectWithoutFacultyInputObjectSchema, DepartmentCreateOrConnectWithoutFacultyInputObjectSchema.array()]).optional(),
  get createMany(){ return DepartmentCreateManyFacultyInputEnvelopeObjectSchema.optional(); },
  connect: z.union([DepartmentWhereUniqueInputObjectSchema, DepartmentWhereUniqueInputObjectSchema.array()]).optional()
}).strict();
export const DepartmentCreateNestedManyWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentCreateNestedManyWithoutFacultyInput> = z.lazy(__makeSchema_DepartmentCreateNestedManyWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.DepartmentCreateNestedManyWithoutFacultyInput>;
export const DepartmentCreateNestedManyWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_DepartmentCreateNestedManyWithoutFacultyInput_schema);


// File: CourseUncheckedCreateNestedManyWithoutFacultyInput.schema.ts
const __makeSchema_CourseUncheckedCreateNestedManyWithoutFacultyInput_schema = () => z.object({
  create: z.union([CourseCreateWithoutFacultyInputObjectSchema, CourseCreateWithoutFacultyInputObjectSchema.array(), CourseUncheckedCreateWithoutFacultyInputObjectSchema, CourseUncheckedCreateWithoutFacultyInputObjectSchema.array()]).optional(),
  connectOrCreate: z.union([CourseCreateOrConnectWithoutFacultyInputObjectSchema, CourseCreateOrConnectWithoutFacultyInputObjectSchema.array()]).optional(),
  get createMany(){ return CourseCreateManyFacultyInputEnvelopeObjectSchema.optional(); },
  connect: z.union([CourseWhereUniqueInputObjectSchema, CourseWhereUniqueInputObjectSchema.array()]).optional()
}).strict();
export const CourseUncheckedCreateNestedManyWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseUncheckedCreateNestedManyWithoutFacultyInput> = z.lazy(__makeSchema_CourseUncheckedCreateNestedManyWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.CourseUncheckedCreateNestedManyWithoutFacultyInput>;
export const CourseUncheckedCreateNestedManyWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_CourseUncheckedCreateNestedManyWithoutFacultyInput_schema);


// File: DepartmentUncheckedCreateNestedManyWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentUncheckedCreateNestedManyWithoutFacultyInput_schema = () => z.object({
  create: z.union([DepartmentCreateWithoutFacultyInputObjectSchema, DepartmentCreateWithoutFacultyInputObjectSchema.array(), DepartmentUncheckedCreateWithoutFacultyInputObjectSchema, DepartmentUncheckedCreateWithoutFacultyInputObjectSchema.array()]).optional(),
  connectOrCreate: z.union([DepartmentCreateOrConnectWithoutFacultyInputObjectSchema, DepartmentCreateOrConnectWithoutFacultyInputObjectSchema.array()]).optional(),
  get createMany(){ return DepartmentCreateManyFacultyInputEnvelopeObjectSchema.optional(); },
  connect: z.union([DepartmentWhereUniqueInputObjectSchema, DepartmentWhereUniqueInputObjectSchema.array()]).optional()
}).strict();
export const DepartmentUncheckedCreateNestedManyWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentUncheckedCreateNestedManyWithoutFacultyInput> = z.lazy(__makeSchema_DepartmentUncheckedCreateNestedManyWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.DepartmentUncheckedCreateNestedManyWithoutFacultyInput>;
export const DepartmentUncheckedCreateNestedManyWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUncheckedCreateNestedManyWithoutFacultyInput_schema);


// File: CourseUpdateManyWithoutFacultyNestedInput.schema.ts
const __makeSchema_CourseUpdateManyWithoutFacultyNestedInput_schema = () => z.object({
  create: z.union([CourseCreateWithoutFacultyInputObjectSchema, CourseCreateWithoutFacultyInputObjectSchema.array(), CourseUncheckedCreateWithoutFacultyInputObjectSchema, CourseUncheckedCreateWithoutFacultyInputObjectSchema.array()]).optional(),
  connectOrCreate: z.union([CourseCreateOrConnectWithoutFacultyInputObjectSchema, CourseCreateOrConnectWithoutFacultyInputObjectSchema.array()]).optional(),
  upsert: z.union([CourseUpsertWithWhereUniqueWithoutFacultyInputObjectSchema, CourseUpsertWithWhereUniqueWithoutFacultyInputObjectSchema.array()]).optional(),
  get createMany(){ return CourseCreateManyFacultyInputEnvelopeObjectSchema.optional(); },
  set: z.union([CourseWhereUniqueInputObjectSchema, CourseWhereUniqueInputObjectSchema.array()]).optional(),
  disconnect: z.union([CourseWhereUniqueInputObjectSchema, CourseWhereUniqueInputObjectSchema.array()]).optional(),
  delete: z.union([CourseWhereUniqueInputObjectSchema, CourseWhereUniqueInputObjectSchema.array()]).optional(),
  connect: z.union([CourseWhereUniqueInputObjectSchema, CourseWhereUniqueInputObjectSchema.array()]).optional(),
  update: z.union([CourseUpdateWithWhereUniqueWithoutFacultyInputObjectSchema, CourseUpdateWithWhereUniqueWithoutFacultyInputObjectSchema.array()]).optional(),
  updateMany: z.union([CourseUpdateManyWithWhereWithoutFacultyInputObjectSchema, CourseUpdateManyWithWhereWithoutFacultyInputObjectSchema.array()]).optional(),
  deleteMany: z.union([CourseScalarWhereInputObjectSchema, CourseScalarWhereInputObjectSchema.array()]).optional()
}).strict();
export const CourseUpdateManyWithoutFacultyNestedInputObjectSchema: z.ZodType<Prisma.CourseUpdateManyWithoutFacultyNestedInput> = z.lazy(__makeSchema_CourseUpdateManyWithoutFacultyNestedInput_schema) as unknown as z.ZodType<Prisma.CourseUpdateManyWithoutFacultyNestedInput>;
export const CourseUpdateManyWithoutFacultyNestedInputObjectZodSchema = z.lazy(__makeSchema_CourseUpdateManyWithoutFacultyNestedInput_schema);


// File: DepartmentUpdateManyWithoutFacultyNestedInput.schema.ts
const __makeSchema_DepartmentUpdateManyWithoutFacultyNestedInput_schema = () => z.object({
  create: z.union([DepartmentCreateWithoutFacultyInputObjectSchema, DepartmentCreateWithoutFacultyInputObjectSchema.array(), DepartmentUncheckedCreateWithoutFacultyInputObjectSchema, DepartmentUncheckedCreateWithoutFacultyInputObjectSchema.array()]).optional(),
  connectOrCreate: z.union([DepartmentCreateOrConnectWithoutFacultyInputObjectSchema, DepartmentCreateOrConnectWithoutFacultyInputObjectSchema.array()]).optional(),
  upsert: z.union([DepartmentUpsertWithWhereUniqueWithoutFacultyInputObjectSchema, DepartmentUpsertWithWhereUniqueWithoutFacultyInputObjectSchema.array()]).optional(),
  get createMany(){ return DepartmentCreateManyFacultyInputEnvelopeObjectSchema.optional(); },
  set: z.union([DepartmentWhereUniqueInputObjectSchema, DepartmentWhereUniqueInputObjectSchema.array()]).optional(),
  disconnect: z.union([DepartmentWhereUniqueInputObjectSchema, DepartmentWhereUniqueInputObjectSchema.array()]).optional(),
  delete: z.union([DepartmentWhereUniqueInputObjectSchema, DepartmentWhereUniqueInputObjectSchema.array()]).optional(),
  connect: z.union([DepartmentWhereUniqueInputObjectSchema, DepartmentWhereUniqueInputObjectSchema.array()]).optional(),
  update: z.union([DepartmentUpdateWithWhereUniqueWithoutFacultyInputObjectSchema, DepartmentUpdateWithWhereUniqueWithoutFacultyInputObjectSchema.array()]).optional(),
  updateMany: z.union([DepartmentUpdateManyWithWhereWithoutFacultyInputObjectSchema, DepartmentUpdateManyWithWhereWithoutFacultyInputObjectSchema.array()]).optional(),
  deleteMany: z.union([DepartmentScalarWhereInputObjectSchema, DepartmentScalarWhereInputObjectSchema.array()]).optional()
}).strict();
export const DepartmentUpdateManyWithoutFacultyNestedInputObjectSchema: z.ZodType<Prisma.DepartmentUpdateManyWithoutFacultyNestedInput> = z.lazy(__makeSchema_DepartmentUpdateManyWithoutFacultyNestedInput_schema) as unknown as z.ZodType<Prisma.DepartmentUpdateManyWithoutFacultyNestedInput>;
export const DepartmentUpdateManyWithoutFacultyNestedInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUpdateManyWithoutFacultyNestedInput_schema);


// File: CourseUncheckedUpdateManyWithoutFacultyNestedInput.schema.ts
const __makeSchema_CourseUncheckedUpdateManyWithoutFacultyNestedInput_schema = () => z.object({
  create: z.union([CourseCreateWithoutFacultyInputObjectSchema, CourseCreateWithoutFacultyInputObjectSchema.array(), CourseUncheckedCreateWithoutFacultyInputObjectSchema, CourseUncheckedCreateWithoutFacultyInputObjectSchema.array()]).optional(),
  connectOrCreate: z.union([CourseCreateOrConnectWithoutFacultyInputObjectSchema, CourseCreateOrConnectWithoutFacultyInputObjectSchema.array()]).optional(),
  upsert: z.union([CourseUpsertWithWhereUniqueWithoutFacultyInputObjectSchema, CourseUpsertWithWhereUniqueWithoutFacultyInputObjectSchema.array()]).optional(),
  get createMany(){ return CourseCreateManyFacultyInputEnvelopeObjectSchema.optional(); },
  set: z.union([CourseWhereUniqueInputObjectSchema, CourseWhereUniqueInputObjectSchema.array()]).optional(),
  disconnect: z.union([CourseWhereUniqueInputObjectSchema, CourseWhereUniqueInputObjectSchema.array()]).optional(),
  delete: z.union([CourseWhereUniqueInputObjectSchema, CourseWhereUniqueInputObjectSchema.array()]).optional(),
  connect: z.union([CourseWhereUniqueInputObjectSchema, CourseWhereUniqueInputObjectSchema.array()]).optional(),
  update: z.union([CourseUpdateWithWhereUniqueWithoutFacultyInputObjectSchema, CourseUpdateWithWhereUniqueWithoutFacultyInputObjectSchema.array()]).optional(),
  updateMany: z.union([CourseUpdateManyWithWhereWithoutFacultyInputObjectSchema, CourseUpdateManyWithWhereWithoutFacultyInputObjectSchema.array()]).optional(),
  deleteMany: z.union([CourseScalarWhereInputObjectSchema, CourseScalarWhereInputObjectSchema.array()]).optional()
}).strict();
export const CourseUncheckedUpdateManyWithoutFacultyNestedInputObjectSchema: z.ZodType<Prisma.CourseUncheckedUpdateManyWithoutFacultyNestedInput> = z.lazy(__makeSchema_CourseUncheckedUpdateManyWithoutFacultyNestedInput_schema) as unknown as z.ZodType<Prisma.CourseUncheckedUpdateManyWithoutFacultyNestedInput>;
export const CourseUncheckedUpdateManyWithoutFacultyNestedInputObjectZodSchema = z.lazy(__makeSchema_CourseUncheckedUpdateManyWithoutFacultyNestedInput_schema);


// File: DepartmentUncheckedUpdateManyWithoutFacultyNestedInput.schema.ts
const __makeSchema_DepartmentUncheckedUpdateManyWithoutFacultyNestedInput_schema = () => z.object({
  create: z.union([DepartmentCreateWithoutFacultyInputObjectSchema, DepartmentCreateWithoutFacultyInputObjectSchema.array(), DepartmentUncheckedCreateWithoutFacultyInputObjectSchema, DepartmentUncheckedCreateWithoutFacultyInputObjectSchema.array()]).optional(),
  connectOrCreate: z.union([DepartmentCreateOrConnectWithoutFacultyInputObjectSchema, DepartmentCreateOrConnectWithoutFacultyInputObjectSchema.array()]).optional(),
  upsert: z.union([DepartmentUpsertWithWhereUniqueWithoutFacultyInputObjectSchema, DepartmentUpsertWithWhereUniqueWithoutFacultyInputObjectSchema.array()]).optional(),
  get createMany(){ return DepartmentCreateManyFacultyInputEnvelopeObjectSchema.optional(); },
  set: z.union([DepartmentWhereUniqueInputObjectSchema, DepartmentWhereUniqueInputObjectSchema.array()]).optional(),
  disconnect: z.union([DepartmentWhereUniqueInputObjectSchema, DepartmentWhereUniqueInputObjectSchema.array()]).optional(),
  delete: z.union([DepartmentWhereUniqueInputObjectSchema, DepartmentWhereUniqueInputObjectSchema.array()]).optional(),
  connect: z.union([DepartmentWhereUniqueInputObjectSchema, DepartmentWhereUniqueInputObjectSchema.array()]).optional(),
  update: z.union([DepartmentUpdateWithWhereUniqueWithoutFacultyInputObjectSchema, DepartmentUpdateWithWhereUniqueWithoutFacultyInputObjectSchema.array()]).optional(),
  updateMany: z.union([DepartmentUpdateManyWithWhereWithoutFacultyInputObjectSchema, DepartmentUpdateManyWithWhereWithoutFacultyInputObjectSchema.array()]).optional(),
  deleteMany: z.union([DepartmentScalarWhereInputObjectSchema, DepartmentScalarWhereInputObjectSchema.array()]).optional()
}).strict();
export const DepartmentUncheckedUpdateManyWithoutFacultyNestedInputObjectSchema: z.ZodType<Prisma.DepartmentUncheckedUpdateManyWithoutFacultyNestedInput> = z.lazy(__makeSchema_DepartmentUncheckedUpdateManyWithoutFacultyNestedInput_schema) as unknown as z.ZodType<Prisma.DepartmentUncheckedUpdateManyWithoutFacultyNestedInput>;
export const DepartmentUncheckedUpdateManyWithoutFacultyNestedInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUncheckedUpdateManyWithoutFacultyNestedInput_schema);


// File: CourseCreateNestedManyWithoutDepartmentInput.schema.ts
const __makeSchema_CourseCreateNestedManyWithoutDepartmentInput_schema = () => z.object({
  create: z.union([CourseCreateWithoutDepartmentInputObjectSchema, CourseCreateWithoutDepartmentInputObjectSchema.array(), CourseUncheckedCreateWithoutDepartmentInputObjectSchema, CourseUncheckedCreateWithoutDepartmentInputObjectSchema.array()]).optional(),
  connectOrCreate: z.union([CourseCreateOrConnectWithoutDepartmentInputObjectSchema, CourseCreateOrConnectWithoutDepartmentInputObjectSchema.array()]).optional(),
  get createMany(){ return CourseCreateManyDepartmentInputEnvelopeObjectSchema.optional(); },
  connect: z.union([CourseWhereUniqueInputObjectSchema, CourseWhereUniqueInputObjectSchema.array()]).optional()
}).strict();
export const CourseCreateNestedManyWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseCreateNestedManyWithoutDepartmentInput> = z.lazy(__makeSchema_CourseCreateNestedManyWithoutDepartmentInput_schema) as unknown as z.ZodType<Prisma.CourseCreateNestedManyWithoutDepartmentInput>;
export const CourseCreateNestedManyWithoutDepartmentInputObjectZodSchema = z.lazy(__makeSchema_CourseCreateNestedManyWithoutDepartmentInput_schema);


// File: FacultyCreateNestedOneWithoutDepartmentsInput.schema.ts
const __makeSchema_FacultyCreateNestedOneWithoutDepartmentsInput_schema = () => z.object({
  create: z.union([FacultyCreateWithoutDepartmentsInputObjectSchema, FacultyUncheckedCreateWithoutDepartmentsInputObjectSchema]).optional(),
  get connectOrCreate(){ return FacultyCreateOrConnectWithoutDepartmentsInputObjectSchema.optional(); },
  get connect(){ return FacultyWhereUniqueInputObjectSchema.optional(); }
}).strict();
export const FacultyCreateNestedOneWithoutDepartmentsInputObjectSchema: z.ZodType<Prisma.FacultyCreateNestedOneWithoutDepartmentsInput> = z.lazy(__makeSchema_FacultyCreateNestedOneWithoutDepartmentsInput_schema) as unknown as z.ZodType<Prisma.FacultyCreateNestedOneWithoutDepartmentsInput>;
export const FacultyCreateNestedOneWithoutDepartmentsInputObjectZodSchema = z.lazy(__makeSchema_FacultyCreateNestedOneWithoutDepartmentsInput_schema);


// File: CourseUncheckedCreateNestedManyWithoutDepartmentInput.schema.ts
const __makeSchema_CourseUncheckedCreateNestedManyWithoutDepartmentInput_schema = () => z.object({
  create: z.union([CourseCreateWithoutDepartmentInputObjectSchema, CourseCreateWithoutDepartmentInputObjectSchema.array(), CourseUncheckedCreateWithoutDepartmentInputObjectSchema, CourseUncheckedCreateWithoutDepartmentInputObjectSchema.array()]).optional(),
  connectOrCreate: z.union([CourseCreateOrConnectWithoutDepartmentInputObjectSchema, CourseCreateOrConnectWithoutDepartmentInputObjectSchema.array()]).optional(),
  get createMany(){ return CourseCreateManyDepartmentInputEnvelopeObjectSchema.optional(); },
  connect: z.union([CourseWhereUniqueInputObjectSchema, CourseWhereUniqueInputObjectSchema.array()]).optional()
}).strict();
export const CourseUncheckedCreateNestedManyWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseUncheckedCreateNestedManyWithoutDepartmentInput> = z.lazy(__makeSchema_CourseUncheckedCreateNestedManyWithoutDepartmentInput_schema) as unknown as z.ZodType<Prisma.CourseUncheckedCreateNestedManyWithoutDepartmentInput>;
export const CourseUncheckedCreateNestedManyWithoutDepartmentInputObjectZodSchema = z.lazy(__makeSchema_CourseUncheckedCreateNestedManyWithoutDepartmentInput_schema);


// File: CourseUpdateManyWithoutDepartmentNestedInput.schema.ts
const __makeSchema_CourseUpdateManyWithoutDepartmentNestedInput_schema = () => z.object({
  create: z.union([CourseCreateWithoutDepartmentInputObjectSchema, CourseCreateWithoutDepartmentInputObjectSchema.array(), CourseUncheckedCreateWithoutDepartmentInputObjectSchema, CourseUncheckedCreateWithoutDepartmentInputObjectSchema.array()]).optional(),
  connectOrCreate: z.union([CourseCreateOrConnectWithoutDepartmentInputObjectSchema, CourseCreateOrConnectWithoutDepartmentInputObjectSchema.array()]).optional(),
  upsert: z.union([CourseUpsertWithWhereUniqueWithoutDepartmentInputObjectSchema, CourseUpsertWithWhereUniqueWithoutDepartmentInputObjectSchema.array()]).optional(),
  get createMany(){ return CourseCreateManyDepartmentInputEnvelopeObjectSchema.optional(); },
  set: z.union([CourseWhereUniqueInputObjectSchema, CourseWhereUniqueInputObjectSchema.array()]).optional(),
  disconnect: z.union([CourseWhereUniqueInputObjectSchema, CourseWhereUniqueInputObjectSchema.array()]).optional(),
  delete: z.union([CourseWhereUniqueInputObjectSchema, CourseWhereUniqueInputObjectSchema.array()]).optional(),
  connect: z.union([CourseWhereUniqueInputObjectSchema, CourseWhereUniqueInputObjectSchema.array()]).optional(),
  update: z.union([CourseUpdateWithWhereUniqueWithoutDepartmentInputObjectSchema, CourseUpdateWithWhereUniqueWithoutDepartmentInputObjectSchema.array()]).optional(),
  updateMany: z.union([CourseUpdateManyWithWhereWithoutDepartmentInputObjectSchema, CourseUpdateManyWithWhereWithoutDepartmentInputObjectSchema.array()]).optional(),
  deleteMany: z.union([CourseScalarWhereInputObjectSchema, CourseScalarWhereInputObjectSchema.array()]).optional()
}).strict();
export const CourseUpdateManyWithoutDepartmentNestedInputObjectSchema: z.ZodType<Prisma.CourseUpdateManyWithoutDepartmentNestedInput> = z.lazy(__makeSchema_CourseUpdateManyWithoutDepartmentNestedInput_schema) as unknown as z.ZodType<Prisma.CourseUpdateManyWithoutDepartmentNestedInput>;
export const CourseUpdateManyWithoutDepartmentNestedInputObjectZodSchema = z.lazy(__makeSchema_CourseUpdateManyWithoutDepartmentNestedInput_schema);


// File: FacultyUpdateOneRequiredWithoutDepartmentsNestedInput.schema.ts
const __makeSchema_FacultyUpdateOneRequiredWithoutDepartmentsNestedInput_schema = () => z.object({
  create: z.union([FacultyCreateWithoutDepartmentsInputObjectSchema, FacultyUncheckedCreateWithoutDepartmentsInputObjectSchema]).optional(),
  get connectOrCreate(){ return FacultyCreateOrConnectWithoutDepartmentsInputObjectSchema.optional(); },
  get upsert(){ return FacultyUpsertWithoutDepartmentsInputObjectSchema.optional(); },
  get connect(){ return FacultyWhereUniqueInputObjectSchema.optional(); },
  update: z.union([FacultyUpdateToOneWithWhereWithoutDepartmentsInputObjectSchema, FacultyUpdateWithoutDepartmentsInputObjectSchema, FacultyUncheckedUpdateWithoutDepartmentsInputObjectSchema]).optional()
}).strict();
export const FacultyUpdateOneRequiredWithoutDepartmentsNestedInputObjectSchema: z.ZodType<Prisma.FacultyUpdateOneRequiredWithoutDepartmentsNestedInput> = z.lazy(__makeSchema_FacultyUpdateOneRequiredWithoutDepartmentsNestedInput_schema) as unknown as z.ZodType<Prisma.FacultyUpdateOneRequiredWithoutDepartmentsNestedInput>;
export const FacultyUpdateOneRequiredWithoutDepartmentsNestedInputObjectZodSchema = z.lazy(__makeSchema_FacultyUpdateOneRequiredWithoutDepartmentsNestedInput_schema);


// File: CourseUncheckedUpdateManyWithoutDepartmentNestedInput.schema.ts
const __makeSchema_CourseUncheckedUpdateManyWithoutDepartmentNestedInput_schema = () => z.object({
  create: z.union([CourseCreateWithoutDepartmentInputObjectSchema, CourseCreateWithoutDepartmentInputObjectSchema.array(), CourseUncheckedCreateWithoutDepartmentInputObjectSchema, CourseUncheckedCreateWithoutDepartmentInputObjectSchema.array()]).optional(),
  connectOrCreate: z.union([CourseCreateOrConnectWithoutDepartmentInputObjectSchema, CourseCreateOrConnectWithoutDepartmentInputObjectSchema.array()]).optional(),
  upsert: z.union([CourseUpsertWithWhereUniqueWithoutDepartmentInputObjectSchema, CourseUpsertWithWhereUniqueWithoutDepartmentInputObjectSchema.array()]).optional(),
  get createMany(){ return CourseCreateManyDepartmentInputEnvelopeObjectSchema.optional(); },
  set: z.union([CourseWhereUniqueInputObjectSchema, CourseWhereUniqueInputObjectSchema.array()]).optional(),
  disconnect: z.union([CourseWhereUniqueInputObjectSchema, CourseWhereUniqueInputObjectSchema.array()]).optional(),
  delete: z.union([CourseWhereUniqueInputObjectSchema, CourseWhereUniqueInputObjectSchema.array()]).optional(),
  connect: z.union([CourseWhereUniqueInputObjectSchema, CourseWhereUniqueInputObjectSchema.array()]).optional(),
  update: z.union([CourseUpdateWithWhereUniqueWithoutDepartmentInputObjectSchema, CourseUpdateWithWhereUniqueWithoutDepartmentInputObjectSchema.array()]).optional(),
  updateMany: z.union([CourseUpdateManyWithWhereWithoutDepartmentInputObjectSchema, CourseUpdateManyWithWhereWithoutDepartmentInputObjectSchema.array()]).optional(),
  deleteMany: z.union([CourseScalarWhereInputObjectSchema, CourseScalarWhereInputObjectSchema.array()]).optional()
}).strict();
export const CourseUncheckedUpdateManyWithoutDepartmentNestedInputObjectSchema: z.ZodType<Prisma.CourseUncheckedUpdateManyWithoutDepartmentNestedInput> = z.lazy(__makeSchema_CourseUncheckedUpdateManyWithoutDepartmentNestedInput_schema) as unknown as z.ZodType<Prisma.CourseUncheckedUpdateManyWithoutDepartmentNestedInput>;
export const CourseUncheckedUpdateManyWithoutDepartmentNestedInputObjectZodSchema = z.lazy(__makeSchema_CourseUncheckedUpdateManyWithoutDepartmentNestedInput_schema);


// File: NestedStringFilter.schema.ts
const __makeSchema_NestedStringFilter_schema = () => z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([z.string(), NestedStringFilterObjectSchema]).optional()
}).strict();
export const NestedStringFilterObjectSchema: z.ZodType<Prisma.NestedStringFilter> = z.lazy(__makeSchema_NestedStringFilter_schema) as unknown as z.ZodType<Prisma.NestedStringFilter>;
export const NestedStringFilterObjectZodSchema = z.lazy(__makeSchema_NestedStringFilter_schema);


// File: NestedStringNullableFilter.schema.ts
const __makeSchema_NestedStringNullableFilter_schema = () => z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([z.string(), NestedStringNullableFilterObjectSchema]).optional().nullable()
}).strict();
export const NestedStringNullableFilterObjectSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.lazy(__makeSchema_NestedStringNullableFilter_schema) as unknown as z.ZodType<Prisma.NestedStringNullableFilter>;
export const NestedStringNullableFilterObjectZodSchema = z.lazy(__makeSchema_NestedStringNullableFilter_schema);


// File: NestedFloatNullableFilter.schema.ts
const __makeSchema_NestedFloatNullableFilter_schema = () => z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), NestedFloatNullableFilterObjectSchema]).optional().nullable()
}).strict();
export const NestedFloatNullableFilterObjectSchema: z.ZodType<Prisma.NestedFloatNullableFilter> = z.lazy(__makeSchema_NestedFloatNullableFilter_schema) as unknown as z.ZodType<Prisma.NestedFloatNullableFilter>;
export const NestedFloatNullableFilterObjectZodSchema = z.lazy(__makeSchema_NestedFloatNullableFilter_schema);


// File: NestedEnumStudyLevelFilter.schema.ts
const __makeSchema_NestedEnumStudyLevelFilter_schema = () => z.object({
  equals: StudyLevelSchema.optional(),
  in: StudyLevelSchema.array().optional(),
  notIn: StudyLevelSchema.array().optional(),
  not: z.union([StudyLevelSchema, NestedEnumStudyLevelFilterObjectSchema]).optional()
}).strict();
export const NestedEnumStudyLevelFilterObjectSchema: z.ZodType<Prisma.NestedEnumStudyLevelFilter> = z.lazy(__makeSchema_NestedEnumStudyLevelFilter_schema) as unknown as z.ZodType<Prisma.NestedEnumStudyLevelFilter>;
export const NestedEnumStudyLevelFilterObjectZodSchema = z.lazy(__makeSchema_NestedEnumStudyLevelFilter_schema);


// File: NestedEnumGradeTypeFilter.schema.ts
const __makeSchema_NestedEnumGradeTypeFilter_schema = () => z.object({
  equals: GradeTypeSchema.optional(),
  in: GradeTypeSchema.array().optional(),
  notIn: GradeTypeSchema.array().optional(),
  not: z.union([GradeTypeSchema, NestedEnumGradeTypeFilterObjectSchema]).optional()
}).strict();
export const NestedEnumGradeTypeFilterObjectSchema: z.ZodType<Prisma.NestedEnumGradeTypeFilter> = z.lazy(__makeSchema_NestedEnumGradeTypeFilter_schema) as unknown as z.ZodType<Prisma.NestedEnumGradeTypeFilter>;
export const NestedEnumGradeTypeFilterObjectZodSchema = z.lazy(__makeSchema_NestedEnumGradeTypeFilter_schema);


// File: NestedIntFilter.schema.ts
const __makeSchema_NestedIntFilter_schema = () => z.object({
  equals: z.number().int().optional(),
  in: z.number().int().array().optional(),
  notIn: z.number().int().array().optional(),
  lt: z.number().int().optional(),
  lte: z.number().int().optional(),
  gt: z.number().int().optional(),
  gte: z.number().int().optional(),
  not: z.union([z.number().int(), NestedIntFilterObjectSchema]).optional()
}).strict();
export const NestedIntFilterObjectSchema: z.ZodType<Prisma.NestedIntFilter> = z.lazy(__makeSchema_NestedIntFilter_schema) as unknown as z.ZodType<Prisma.NestedIntFilter>;
export const NestedIntFilterObjectZodSchema = z.lazy(__makeSchema_NestedIntFilter_schema);


// File: NestedIntNullableFilter.schema.ts
const __makeSchema_NestedIntNullableFilter_schema = () => z.object({
  equals: z.number().int().optional().nullable(),
  in: z.number().int().array().optional().nullable(),
  notIn: z.number().int().array().optional().nullable(),
  lt: z.number().int().optional(),
  lte: z.number().int().optional(),
  gt: z.number().int().optional(),
  gte: z.number().int().optional(),
  not: z.union([z.number().int(), NestedIntNullableFilterObjectSchema]).optional().nullable()
}).strict();
export const NestedIntNullableFilterObjectSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.lazy(__makeSchema_NestedIntNullableFilter_schema) as unknown as z.ZodType<Prisma.NestedIntNullableFilter>;
export const NestedIntNullableFilterObjectZodSchema = z.lazy(__makeSchema_NestedIntNullableFilter_schema);


// File: NestedFloatFilter.schema.ts
const __makeSchema_NestedFloatFilter_schema = () => z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), NestedFloatFilterObjectSchema]).optional()
}).strict();
export const NestedFloatFilterObjectSchema: z.ZodType<Prisma.NestedFloatFilter> = z.lazy(__makeSchema_NestedFloatFilter_schema) as unknown as z.ZodType<Prisma.NestedFloatFilter>;
export const NestedFloatFilterObjectZodSchema = z.lazy(__makeSchema_NestedFloatFilter_schema);


// File: NestedDateTimeFilter.schema.ts
const __makeSchema_NestedDateTimeFilter_schema = () => z.object({
  equals: z.date().optional(),
  in: z.union([z.date().array(), z.iso.datetime().array()]).optional(),
  notIn: z.union([z.date().array(), z.iso.datetime().array()]).optional(),
  lt: z.date().optional(),
  lte: z.date().optional(),
  gt: z.date().optional(),
  gte: z.date().optional(),
  not: z.union([z.date(), NestedDateTimeFilterObjectSchema]).optional()
}).strict();
export const NestedDateTimeFilterObjectSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.lazy(__makeSchema_NestedDateTimeFilter_schema) as unknown as z.ZodType<Prisma.NestedDateTimeFilter>;
export const NestedDateTimeFilterObjectZodSchema = z.lazy(__makeSchema_NestedDateTimeFilter_schema);


// File: NestedStringWithAggregatesFilter.schema.ts
const __makeSchema_NestedStringWithAggregatesFilter_schema = () => z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([z.string(), NestedStringWithAggregatesFilterObjectSchema]).optional(),
  get _count(){ return NestedIntFilterObjectSchema.optional(); },
  get _min(){ return NestedStringFilterObjectSchema.optional(); },
  get _max(){ return NestedStringFilterObjectSchema.optional(); }
}).strict();
export const NestedStringWithAggregatesFilterObjectSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.lazy(__makeSchema_NestedStringWithAggregatesFilter_schema) as unknown as z.ZodType<Prisma.NestedStringWithAggregatesFilter>;
export const NestedStringWithAggregatesFilterObjectZodSchema = z.lazy(__makeSchema_NestedStringWithAggregatesFilter_schema);


// File: NestedStringNullableWithAggregatesFilter.schema.ts
const __makeSchema_NestedStringNullableWithAggregatesFilter_schema = () => z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([z.string(), NestedStringNullableWithAggregatesFilterObjectSchema]).optional().nullable(),
  get _count(){ return NestedIntNullableFilterObjectSchema.optional(); },
  get _min(){ return NestedStringNullableFilterObjectSchema.optional(); },
  get _max(){ return NestedStringNullableFilterObjectSchema.optional(); }
}).strict();
export const NestedStringNullableWithAggregatesFilterObjectSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.lazy(__makeSchema_NestedStringNullableWithAggregatesFilter_schema) as unknown as z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter>;
export const NestedStringNullableWithAggregatesFilterObjectZodSchema = z.lazy(__makeSchema_NestedStringNullableWithAggregatesFilter_schema);


// File: NestedFloatNullableWithAggregatesFilter.schema.ts
const __makeSchema_NestedFloatNullableWithAggregatesFilter_schema = () => z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), NestedFloatNullableWithAggregatesFilterObjectSchema]).optional().nullable(),
  get _count(){ return NestedIntNullableFilterObjectSchema.optional(); },
  get _avg(){ return NestedFloatNullableFilterObjectSchema.optional(); },
  get _sum(){ return NestedFloatNullableFilterObjectSchema.optional(); },
  get _min(){ return NestedFloatNullableFilterObjectSchema.optional(); },
  get _max(){ return NestedFloatNullableFilterObjectSchema.optional(); }
}).strict();
export const NestedFloatNullableWithAggregatesFilterObjectSchema: z.ZodType<Prisma.NestedFloatNullableWithAggregatesFilter> = z.lazy(__makeSchema_NestedFloatNullableWithAggregatesFilter_schema) as unknown as z.ZodType<Prisma.NestedFloatNullableWithAggregatesFilter>;
export const NestedFloatNullableWithAggregatesFilterObjectZodSchema = z.lazy(__makeSchema_NestedFloatNullableWithAggregatesFilter_schema);


// File: NestedEnumStudyLevelWithAggregatesFilter.schema.ts
const __makeSchema_NestedEnumStudyLevelWithAggregatesFilter_schema = () => z.object({
  equals: StudyLevelSchema.optional(),
  in: StudyLevelSchema.array().optional(),
  notIn: StudyLevelSchema.array().optional(),
  not: z.union([StudyLevelSchema, NestedEnumStudyLevelWithAggregatesFilterObjectSchema]).optional(),
  get _count(){ return NestedIntFilterObjectSchema.optional(); },
  get _min(){ return NestedEnumStudyLevelFilterObjectSchema.optional(); },
  get _max(){ return NestedEnumStudyLevelFilterObjectSchema.optional(); }
}).strict();
export const NestedEnumStudyLevelWithAggregatesFilterObjectSchema: z.ZodType<Prisma.NestedEnumStudyLevelWithAggregatesFilter> = z.lazy(__makeSchema_NestedEnumStudyLevelWithAggregatesFilter_schema) as unknown as z.ZodType<Prisma.NestedEnumStudyLevelWithAggregatesFilter>;
export const NestedEnumStudyLevelWithAggregatesFilterObjectZodSchema = z.lazy(__makeSchema_NestedEnumStudyLevelWithAggregatesFilter_schema);


// File: NestedEnumGradeTypeWithAggregatesFilter.schema.ts
const __makeSchema_NestedEnumGradeTypeWithAggregatesFilter_schema = () => z.object({
  equals: GradeTypeSchema.optional(),
  in: GradeTypeSchema.array().optional(),
  notIn: GradeTypeSchema.array().optional(),
  not: z.union([GradeTypeSchema, NestedEnumGradeTypeWithAggregatesFilterObjectSchema]).optional(),
  get _count(){ return NestedIntFilterObjectSchema.optional(); },
  get _min(){ return NestedEnumGradeTypeFilterObjectSchema.optional(); },
  get _max(){ return NestedEnumGradeTypeFilterObjectSchema.optional(); }
}).strict();
export const NestedEnumGradeTypeWithAggregatesFilterObjectSchema: z.ZodType<Prisma.NestedEnumGradeTypeWithAggregatesFilter> = z.lazy(__makeSchema_NestedEnumGradeTypeWithAggregatesFilter_schema) as unknown as z.ZodType<Prisma.NestedEnumGradeTypeWithAggregatesFilter>;
export const NestedEnumGradeTypeWithAggregatesFilterObjectZodSchema = z.lazy(__makeSchema_NestedEnumGradeTypeWithAggregatesFilter_schema);


// File: NestedIntWithAggregatesFilter.schema.ts
const __makeSchema_NestedIntWithAggregatesFilter_schema = () => z.object({
  equals: z.number().int().optional(),
  in: z.number().int().array().optional(),
  notIn: z.number().int().array().optional(),
  lt: z.number().int().optional(),
  lte: z.number().int().optional(),
  gt: z.number().int().optional(),
  gte: z.number().int().optional(),
  not: z.union([z.number().int(), NestedIntWithAggregatesFilterObjectSchema]).optional(),
  get _count(){ return NestedIntFilterObjectSchema.optional(); },
  get _avg(){ return NestedFloatFilterObjectSchema.optional(); },
  get _sum(){ return NestedIntFilterObjectSchema.optional(); },
  get _min(){ return NestedIntFilterObjectSchema.optional(); },
  get _max(){ return NestedIntFilterObjectSchema.optional(); }
}).strict();
export const NestedIntWithAggregatesFilterObjectSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.lazy(__makeSchema_NestedIntWithAggregatesFilter_schema) as unknown as z.ZodType<Prisma.NestedIntWithAggregatesFilter>;
export const NestedIntWithAggregatesFilterObjectZodSchema = z.lazy(__makeSchema_NestedIntWithAggregatesFilter_schema);


// File: NestedIntNullableWithAggregatesFilter.schema.ts
const __makeSchema_NestedIntNullableWithAggregatesFilter_schema = () => z.object({
  equals: z.number().int().optional().nullable(),
  in: z.number().int().array().optional().nullable(),
  notIn: z.number().int().array().optional().nullable(),
  lt: z.number().int().optional(),
  lte: z.number().int().optional(),
  gt: z.number().int().optional(),
  gte: z.number().int().optional(),
  not: z.union([z.number().int(), NestedIntNullableWithAggregatesFilterObjectSchema]).optional().nullable(),
  get _count(){ return NestedIntNullableFilterObjectSchema.optional(); },
  get _avg(){ return NestedFloatNullableFilterObjectSchema.optional(); },
  get _sum(){ return NestedIntNullableFilterObjectSchema.optional(); },
  get _min(){ return NestedIntNullableFilterObjectSchema.optional(); },
  get _max(){ return NestedIntNullableFilterObjectSchema.optional(); }
}).strict();
export const NestedIntNullableWithAggregatesFilterObjectSchema: z.ZodType<Prisma.NestedIntNullableWithAggregatesFilter> = z.lazy(__makeSchema_NestedIntNullableWithAggregatesFilter_schema) as unknown as z.ZodType<Prisma.NestedIntNullableWithAggregatesFilter>;
export const NestedIntNullableWithAggregatesFilterObjectZodSchema = z.lazy(__makeSchema_NestedIntNullableWithAggregatesFilter_schema);


// File: NestedFloatWithAggregatesFilter.schema.ts
const __makeSchema_NestedFloatWithAggregatesFilter_schema = () => z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), NestedFloatWithAggregatesFilterObjectSchema]).optional(),
  get _count(){ return NestedIntFilterObjectSchema.optional(); },
  get _avg(){ return NestedFloatFilterObjectSchema.optional(); },
  get _sum(){ return NestedFloatFilterObjectSchema.optional(); },
  get _min(){ return NestedFloatFilterObjectSchema.optional(); },
  get _max(){ return NestedFloatFilterObjectSchema.optional(); }
}).strict();
export const NestedFloatWithAggregatesFilterObjectSchema: z.ZodType<Prisma.NestedFloatWithAggregatesFilter> = z.lazy(__makeSchema_NestedFloatWithAggregatesFilter_schema) as unknown as z.ZodType<Prisma.NestedFloatWithAggregatesFilter>;
export const NestedFloatWithAggregatesFilterObjectZodSchema = z.lazy(__makeSchema_NestedFloatWithAggregatesFilter_schema);


// File: NestedDateTimeWithAggregatesFilter.schema.ts
const __makeSchema_NestedDateTimeWithAggregatesFilter_schema = () => z.object({
  equals: z.date().optional(),
  in: z.union([z.date().array(), z.iso.datetime().array()]).optional(),
  notIn: z.union([z.date().array(), z.iso.datetime().array()]).optional(),
  lt: z.date().optional(),
  lte: z.date().optional(),
  gt: z.date().optional(),
  gte: z.date().optional(),
  not: z.union([z.date(), NestedDateTimeWithAggregatesFilterObjectSchema]).optional(),
  get _count(){ return NestedIntFilterObjectSchema.optional(); },
  get _min(){ return NestedDateTimeFilterObjectSchema.optional(); },
  get _max(){ return NestedDateTimeFilterObjectSchema.optional(); }
}).strict();
export const NestedDateTimeWithAggregatesFilterObjectSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.lazy(__makeSchema_NestedDateTimeWithAggregatesFilter_schema) as unknown as z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter>;
export const NestedDateTimeWithAggregatesFilterObjectZodSchema = z.lazy(__makeSchema_NestedDateTimeWithAggregatesFilter_schema);


// File: NestedEnumSemesterFilter.schema.ts
const __makeSchema_NestedEnumSemesterFilter_schema = () => z.object({
  equals: SemesterSchema.optional(),
  in: SemesterSchema.array().optional(),
  notIn: SemesterSchema.array().optional(),
  not: z.union([SemesterSchema, NestedEnumSemesterFilterObjectSchema]).optional()
}).strict();
export const NestedEnumSemesterFilterObjectSchema: z.ZodType<Prisma.NestedEnumSemesterFilter> = z.lazy(__makeSchema_NestedEnumSemesterFilter_schema) as unknown as z.ZodType<Prisma.NestedEnumSemesterFilter>;
export const NestedEnumSemesterFilterObjectZodSchema = z.lazy(__makeSchema_NestedEnumSemesterFilter_schema);


// File: NestedEnumSemesterWithAggregatesFilter.schema.ts
const __makeSchema_NestedEnumSemesterWithAggregatesFilter_schema = () => z.object({
  equals: SemesterSchema.optional(),
  in: SemesterSchema.array().optional(),
  notIn: SemesterSchema.array().optional(),
  not: z.union([SemesterSchema, NestedEnumSemesterWithAggregatesFilterObjectSchema]).optional(),
  get _count(){ return NestedIntFilterObjectSchema.optional(); },
  get _min(){ return NestedEnumSemesterFilterObjectSchema.optional(); },
  get _max(){ return NestedEnumSemesterFilterObjectSchema.optional(); }
}).strict();
export const NestedEnumSemesterWithAggregatesFilterObjectSchema: z.ZodType<Prisma.NestedEnumSemesterWithAggregatesFilter> = z.lazy(__makeSchema_NestedEnumSemesterWithAggregatesFilter_schema) as unknown as z.ZodType<Prisma.NestedEnumSemesterWithAggregatesFilter>;
export const NestedEnumSemesterWithAggregatesFilterObjectZodSchema = z.lazy(__makeSchema_NestedEnumSemesterWithAggregatesFilter_schema);


// File: GradeCreateWithoutCourseInput.schema.ts
const __makeSchema_GradeCreateWithoutCourseInput_schema = () => z.object({
  id: z.string().optional(),
  gradeACount: z.number().int(),
  gradeBCount: z.number().int(),
  gradeCCount: z.number().int(),
  gradeDCount: z.number().int(),
  gradeECount: z.number().int(),
  gradeFCount: z.number().int(),
  passedCount: z.number().int(),
  failedCount: z.number().int(),
  semester: SemesterSchema,
  year: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();
export const GradeCreateWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeCreateWithoutCourseInput> = z.lazy(__makeSchema_GradeCreateWithoutCourseInput_schema) as unknown as z.ZodType<Prisma.GradeCreateWithoutCourseInput>;
export const GradeCreateWithoutCourseInputObjectZodSchema = z.lazy(__makeSchema_GradeCreateWithoutCourseInput_schema);


// File: GradeUncheckedCreateWithoutCourseInput.schema.ts
const __makeSchema_GradeUncheckedCreateWithoutCourseInput_schema = () => z.object({
  id: z.string().optional(),
  gradeACount: z.number().int(),
  gradeBCount: z.number().int(),
  gradeCCount: z.number().int(),
  gradeDCount: z.number().int(),
  gradeECount: z.number().int(),
  gradeFCount: z.number().int(),
  passedCount: z.number().int(),
  failedCount: z.number().int(),
  semester: SemesterSchema,
  year: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();
export const GradeUncheckedCreateWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeUncheckedCreateWithoutCourseInput> = z.lazy(__makeSchema_GradeUncheckedCreateWithoutCourseInput_schema) as unknown as z.ZodType<Prisma.GradeUncheckedCreateWithoutCourseInput>;
export const GradeUncheckedCreateWithoutCourseInputObjectZodSchema = z.lazy(__makeSchema_GradeUncheckedCreateWithoutCourseInput_schema);


// File: GradeCreateOrConnectWithoutCourseInput.schema.ts
const __makeSchema_GradeCreateOrConnectWithoutCourseInput_schema = () => z.object({
  get where(){ return GradeWhereUniqueInputObjectSchema; },
  create: z.union([GradeCreateWithoutCourseInputObjectSchema, GradeUncheckedCreateWithoutCourseInputObjectSchema])
}).strict();
export const GradeCreateOrConnectWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeCreateOrConnectWithoutCourseInput> = z.lazy(__makeSchema_GradeCreateOrConnectWithoutCourseInput_schema) as unknown as z.ZodType<Prisma.GradeCreateOrConnectWithoutCourseInput>;
export const GradeCreateOrConnectWithoutCourseInputObjectZodSchema = z.lazy(__makeSchema_GradeCreateOrConnectWithoutCourseInput_schema);


// File: GradeCreateManyCourseInputEnvelope.schema.ts
const __makeSchema_GradeCreateManyCourseInputEnvelope_schema = () => z.object({
  data: z.union([GradeCreateManyCourseInputObjectSchema, GradeCreateManyCourseInputObjectSchema.array()]),
  skipDuplicates: z.boolean().optional()
}).strict();
export const GradeCreateManyCourseInputEnvelopeObjectSchema: z.ZodType<Prisma.GradeCreateManyCourseInputEnvelope> = z.lazy(__makeSchema_GradeCreateManyCourseInputEnvelope_schema) as unknown as z.ZodType<Prisma.GradeCreateManyCourseInputEnvelope>;
export const GradeCreateManyCourseInputEnvelopeObjectZodSchema = z.lazy(__makeSchema_GradeCreateManyCourseInputEnvelope_schema);


// File: FacultyCreateWithoutCoursesInput.schema.ts
const __makeSchema_FacultyCreateWithoutCoursesInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  get departments(){ return DepartmentCreateNestedManyWithoutFacultyInputObjectSchema.optional(); }
}).strict();
export const FacultyCreateWithoutCoursesInputObjectSchema: z.ZodType<Prisma.FacultyCreateWithoutCoursesInput> = z.lazy(__makeSchema_FacultyCreateWithoutCoursesInput_schema) as unknown as z.ZodType<Prisma.FacultyCreateWithoutCoursesInput>;
export const FacultyCreateWithoutCoursesInputObjectZodSchema = z.lazy(__makeSchema_FacultyCreateWithoutCoursesInput_schema);


// File: FacultyUncheckedCreateWithoutCoursesInput.schema.ts
const __makeSchema_FacultyUncheckedCreateWithoutCoursesInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  get departments(){ return DepartmentUncheckedCreateNestedManyWithoutFacultyInputObjectSchema.optional(); }
}).strict();
export const FacultyUncheckedCreateWithoutCoursesInputObjectSchema: z.ZodType<Prisma.FacultyUncheckedCreateWithoutCoursesInput> = z.lazy(__makeSchema_FacultyUncheckedCreateWithoutCoursesInput_schema) as unknown as z.ZodType<Prisma.FacultyUncheckedCreateWithoutCoursesInput>;
export const FacultyUncheckedCreateWithoutCoursesInputObjectZodSchema = z.lazy(__makeSchema_FacultyUncheckedCreateWithoutCoursesInput_schema);


// File: FacultyCreateOrConnectWithoutCoursesInput.schema.ts
const __makeSchema_FacultyCreateOrConnectWithoutCoursesInput_schema = () => z.object({
  get where(){ return FacultyWhereUniqueInputObjectSchema; },
  create: z.union([FacultyCreateWithoutCoursesInputObjectSchema, FacultyUncheckedCreateWithoutCoursesInputObjectSchema])
}).strict();
export const FacultyCreateOrConnectWithoutCoursesInputObjectSchema: z.ZodType<Prisma.FacultyCreateOrConnectWithoutCoursesInput> = z.lazy(__makeSchema_FacultyCreateOrConnectWithoutCoursesInput_schema) as unknown as z.ZodType<Prisma.FacultyCreateOrConnectWithoutCoursesInput>;
export const FacultyCreateOrConnectWithoutCoursesInputObjectZodSchema = z.lazy(__makeSchema_FacultyCreateOrConnectWithoutCoursesInput_schema);


// File: DepartmentCreateWithoutCoursesInput.schema.ts
const __makeSchema_DepartmentCreateWithoutCoursesInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  get faculty(){ return FacultyCreateNestedOneWithoutDepartmentsInputObjectSchema; }
}).strict();
export const DepartmentCreateWithoutCoursesInputObjectSchema: z.ZodType<Prisma.DepartmentCreateWithoutCoursesInput> = z.lazy(__makeSchema_DepartmentCreateWithoutCoursesInput_schema) as unknown as z.ZodType<Prisma.DepartmentCreateWithoutCoursesInput>;
export const DepartmentCreateWithoutCoursesInputObjectZodSchema = z.lazy(__makeSchema_DepartmentCreateWithoutCoursesInput_schema);


// File: DepartmentUncheckedCreateWithoutCoursesInput.schema.ts
const __makeSchema_DepartmentUncheckedCreateWithoutCoursesInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  facultyId: z.string()
}).strict();
export const DepartmentUncheckedCreateWithoutCoursesInputObjectSchema: z.ZodType<Prisma.DepartmentUncheckedCreateWithoutCoursesInput> = z.lazy(__makeSchema_DepartmentUncheckedCreateWithoutCoursesInput_schema) as unknown as z.ZodType<Prisma.DepartmentUncheckedCreateWithoutCoursesInput>;
export const DepartmentUncheckedCreateWithoutCoursesInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUncheckedCreateWithoutCoursesInput_schema);


// File: DepartmentCreateOrConnectWithoutCoursesInput.schema.ts
const __makeSchema_DepartmentCreateOrConnectWithoutCoursesInput_schema = () => z.object({
  get where(){ return DepartmentWhereUniqueInputObjectSchema; },
  create: z.union([DepartmentCreateWithoutCoursesInputObjectSchema, DepartmentUncheckedCreateWithoutCoursesInputObjectSchema])
}).strict();
export const DepartmentCreateOrConnectWithoutCoursesInputObjectSchema: z.ZodType<Prisma.DepartmentCreateOrConnectWithoutCoursesInput> = z.lazy(__makeSchema_DepartmentCreateOrConnectWithoutCoursesInput_schema) as unknown as z.ZodType<Prisma.DepartmentCreateOrConnectWithoutCoursesInput>;
export const DepartmentCreateOrConnectWithoutCoursesInputObjectZodSchema = z.lazy(__makeSchema_DepartmentCreateOrConnectWithoutCoursesInput_schema);


// File: GradeUpsertWithWhereUniqueWithoutCourseInput.schema.ts
const __makeSchema_GradeUpsertWithWhereUniqueWithoutCourseInput_schema = () => z.object({
  get where(){ return GradeWhereUniqueInputObjectSchema; },
  update: z.union([GradeUpdateWithoutCourseInputObjectSchema, GradeUncheckedUpdateWithoutCourseInputObjectSchema]),
  create: z.union([GradeCreateWithoutCourseInputObjectSchema, GradeUncheckedCreateWithoutCourseInputObjectSchema])
}).strict();
export const GradeUpsertWithWhereUniqueWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeUpsertWithWhereUniqueWithoutCourseInput> = z.lazy(__makeSchema_GradeUpsertWithWhereUniqueWithoutCourseInput_schema) as unknown as z.ZodType<Prisma.GradeUpsertWithWhereUniqueWithoutCourseInput>;
export const GradeUpsertWithWhereUniqueWithoutCourseInputObjectZodSchema = z.lazy(__makeSchema_GradeUpsertWithWhereUniqueWithoutCourseInput_schema);


// File: GradeUpdateWithWhereUniqueWithoutCourseInput.schema.ts
const __makeSchema_GradeUpdateWithWhereUniqueWithoutCourseInput_schema = () => z.object({
  get where(){ return GradeWhereUniqueInputObjectSchema; },
  data: z.union([GradeUpdateWithoutCourseInputObjectSchema, GradeUncheckedUpdateWithoutCourseInputObjectSchema])
}).strict();
export const GradeUpdateWithWhereUniqueWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeUpdateWithWhereUniqueWithoutCourseInput> = z.lazy(__makeSchema_GradeUpdateWithWhereUniqueWithoutCourseInput_schema) as unknown as z.ZodType<Prisma.GradeUpdateWithWhereUniqueWithoutCourseInput>;
export const GradeUpdateWithWhereUniqueWithoutCourseInputObjectZodSchema = z.lazy(__makeSchema_GradeUpdateWithWhereUniqueWithoutCourseInput_schema);


// File: GradeUpdateManyWithWhereWithoutCourseInput.schema.ts
const __makeSchema_GradeUpdateManyWithWhereWithoutCourseInput_schema = () => z.object({
  get where(){ return GradeScalarWhereInputObjectSchema; },
  data: z.union([GradeUpdateManyMutationInputObjectSchema, GradeUncheckedUpdateManyWithoutCourseInputObjectSchema])
}).strict();
export const GradeUpdateManyWithWhereWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeUpdateManyWithWhereWithoutCourseInput> = z.lazy(__makeSchema_GradeUpdateManyWithWhereWithoutCourseInput_schema) as unknown as z.ZodType<Prisma.GradeUpdateManyWithWhereWithoutCourseInput>;
export const GradeUpdateManyWithWhereWithoutCourseInputObjectZodSchema = z.lazy(__makeSchema_GradeUpdateManyWithWhereWithoutCourseInput_schema);


// File: GradeScalarWhereInput.schema.ts
const __makeSchema_GradeScalarWhereInput_schema = () => z.object({
  AND: z.union([GradeScalarWhereInputObjectSchema, GradeScalarWhereInputObjectSchema.array()]).optional(),
  get OR(){ return GradeScalarWhereInputObjectSchema.array().optional(); },
  NOT: z.union([GradeScalarWhereInputObjectSchema, GradeScalarWhereInputObjectSchema.array()]).optional(),
  id: z.union([StringFilterObjectSchema, z.string()]).optional(),
  gradeACount: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  gradeBCount: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  gradeCCount: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  gradeDCount: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  gradeECount: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  gradeFCount: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  passedCount: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  failedCount: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  courseId: z.union([StringFilterObjectSchema, z.string()]).optional(),
  semester: z.union([EnumSemesterFilterObjectSchema, SemesterSchema]).optional(),
  year: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  createdAt: z.union([DateTimeFilterObjectSchema, z.coerce.date()]).optional(),
  updatedAt: z.union([DateTimeFilterObjectSchema, z.coerce.date()]).optional()
}).strict();
export const GradeScalarWhereInputObjectSchema: z.ZodType<Prisma.GradeScalarWhereInput> = z.lazy(__makeSchema_GradeScalarWhereInput_schema) as unknown as z.ZodType<Prisma.GradeScalarWhereInput>;
export const GradeScalarWhereInputObjectZodSchema = z.lazy(__makeSchema_GradeScalarWhereInput_schema);


// File: FacultyUpsertWithoutCoursesInput.schema.ts
const __makeSchema_FacultyUpsertWithoutCoursesInput_schema = () => z.object({
  update: z.union([FacultyUpdateWithoutCoursesInputObjectSchema, FacultyUncheckedUpdateWithoutCoursesInputObjectSchema]),
  create: z.union([FacultyCreateWithoutCoursesInputObjectSchema, FacultyUncheckedCreateWithoutCoursesInputObjectSchema]),
  get where(){ return FacultyWhereInputObjectSchema.optional(); }
}).strict();
export const FacultyUpsertWithoutCoursesInputObjectSchema: z.ZodType<Prisma.FacultyUpsertWithoutCoursesInput> = z.lazy(__makeSchema_FacultyUpsertWithoutCoursesInput_schema) as unknown as z.ZodType<Prisma.FacultyUpsertWithoutCoursesInput>;
export const FacultyUpsertWithoutCoursesInputObjectZodSchema = z.lazy(__makeSchema_FacultyUpsertWithoutCoursesInput_schema);


// File: FacultyUpdateToOneWithWhereWithoutCoursesInput.schema.ts
const __makeSchema_FacultyUpdateToOneWithWhereWithoutCoursesInput_schema = () => z.object({
  get where(){ return FacultyWhereInputObjectSchema.optional(); },
  data: z.union([FacultyUpdateWithoutCoursesInputObjectSchema, FacultyUncheckedUpdateWithoutCoursesInputObjectSchema])
}).strict();
export const FacultyUpdateToOneWithWhereWithoutCoursesInputObjectSchema: z.ZodType<Prisma.FacultyUpdateToOneWithWhereWithoutCoursesInput> = z.lazy(__makeSchema_FacultyUpdateToOneWithWhereWithoutCoursesInput_schema) as unknown as z.ZodType<Prisma.FacultyUpdateToOneWithWhereWithoutCoursesInput>;
export const FacultyUpdateToOneWithWhereWithoutCoursesInputObjectZodSchema = z.lazy(__makeSchema_FacultyUpdateToOneWithWhereWithoutCoursesInput_schema);


// File: FacultyUpdateWithoutCoursesInput.schema.ts
const __makeSchema_FacultyUpdateWithoutCoursesInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  get departments(){ return DepartmentUpdateManyWithoutFacultyNestedInputObjectSchema.optional(); }
}).strict();
export const FacultyUpdateWithoutCoursesInputObjectSchema: z.ZodType<Prisma.FacultyUpdateWithoutCoursesInput> = z.lazy(__makeSchema_FacultyUpdateWithoutCoursesInput_schema) as unknown as z.ZodType<Prisma.FacultyUpdateWithoutCoursesInput>;
export const FacultyUpdateWithoutCoursesInputObjectZodSchema = z.lazy(__makeSchema_FacultyUpdateWithoutCoursesInput_schema);


// File: FacultyUncheckedUpdateWithoutCoursesInput.schema.ts
const __makeSchema_FacultyUncheckedUpdateWithoutCoursesInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  get departments(){ return DepartmentUncheckedUpdateManyWithoutFacultyNestedInputObjectSchema.optional(); }
}).strict();
export const FacultyUncheckedUpdateWithoutCoursesInputObjectSchema: z.ZodType<Prisma.FacultyUncheckedUpdateWithoutCoursesInput> = z.lazy(__makeSchema_FacultyUncheckedUpdateWithoutCoursesInput_schema) as unknown as z.ZodType<Prisma.FacultyUncheckedUpdateWithoutCoursesInput>;
export const FacultyUncheckedUpdateWithoutCoursesInputObjectZodSchema = z.lazy(__makeSchema_FacultyUncheckedUpdateWithoutCoursesInput_schema);


// File: DepartmentUpsertWithoutCoursesInput.schema.ts
const __makeSchema_DepartmentUpsertWithoutCoursesInput_schema = () => z.object({
  update: z.union([DepartmentUpdateWithoutCoursesInputObjectSchema, DepartmentUncheckedUpdateWithoutCoursesInputObjectSchema]),
  create: z.union([DepartmentCreateWithoutCoursesInputObjectSchema, DepartmentUncheckedCreateWithoutCoursesInputObjectSchema]),
  get where(){ return DepartmentWhereInputObjectSchema.optional(); }
}).strict();
export const DepartmentUpsertWithoutCoursesInputObjectSchema: z.ZodType<Prisma.DepartmentUpsertWithoutCoursesInput> = z.lazy(__makeSchema_DepartmentUpsertWithoutCoursesInput_schema) as unknown as z.ZodType<Prisma.DepartmentUpsertWithoutCoursesInput>;
export const DepartmentUpsertWithoutCoursesInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUpsertWithoutCoursesInput_schema);


// File: DepartmentUpdateToOneWithWhereWithoutCoursesInput.schema.ts
const __makeSchema_DepartmentUpdateToOneWithWhereWithoutCoursesInput_schema = () => z.object({
  get where(){ return DepartmentWhereInputObjectSchema.optional(); },
  data: z.union([DepartmentUpdateWithoutCoursesInputObjectSchema, DepartmentUncheckedUpdateWithoutCoursesInputObjectSchema])
}).strict();
export const DepartmentUpdateToOneWithWhereWithoutCoursesInputObjectSchema: z.ZodType<Prisma.DepartmentUpdateToOneWithWhereWithoutCoursesInput> = z.lazy(__makeSchema_DepartmentUpdateToOneWithWhereWithoutCoursesInput_schema) as unknown as z.ZodType<Prisma.DepartmentUpdateToOneWithWhereWithoutCoursesInput>;
export const DepartmentUpdateToOneWithWhereWithoutCoursesInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUpdateToOneWithWhereWithoutCoursesInput_schema);


// File: DepartmentUpdateWithoutCoursesInput.schema.ts
const __makeSchema_DepartmentUpdateWithoutCoursesInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  get faculty(){ return FacultyUpdateOneRequiredWithoutDepartmentsNestedInputObjectSchema.optional(); }
}).strict();
export const DepartmentUpdateWithoutCoursesInputObjectSchema: z.ZodType<Prisma.DepartmentUpdateWithoutCoursesInput> = z.lazy(__makeSchema_DepartmentUpdateWithoutCoursesInput_schema) as unknown as z.ZodType<Prisma.DepartmentUpdateWithoutCoursesInput>;
export const DepartmentUpdateWithoutCoursesInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUpdateWithoutCoursesInput_schema);


// File: DepartmentUncheckedUpdateWithoutCoursesInput.schema.ts
const __makeSchema_DepartmentUncheckedUpdateWithoutCoursesInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  facultyId: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional()
}).strict();
export const DepartmentUncheckedUpdateWithoutCoursesInputObjectSchema: z.ZodType<Prisma.DepartmentUncheckedUpdateWithoutCoursesInput> = z.lazy(__makeSchema_DepartmentUncheckedUpdateWithoutCoursesInput_schema) as unknown as z.ZodType<Prisma.DepartmentUncheckedUpdateWithoutCoursesInput>;
export const DepartmentUncheckedUpdateWithoutCoursesInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUncheckedUpdateWithoutCoursesInput_schema);


// File: CourseCreateWithoutGradesInput.schema.ts
const __makeSchema_CourseCreateWithoutGradesInput_schema = () => z.object({
  id: z.string().optional(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().optional().nullable(),
  credits: z.number().optional().nullable(),
  studyLevel: StudyLevelSchema,
  gradeType: GradeTypeSchema,
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int().optional().nullable(),
  contentNo: z.string().optional().nullable(),
  contentEn: z.string().optional().nullable(),
  teachingMethodsNo: z.string().optional().nullable(),
  teachingMethodsEn: z.string().optional().nullable(),
  learningOutcomesNo: z.string().optional().nullable(),
  learningOutcomesEn: z.string().optional().nullable(),
  examTypeNo: z.string().optional().nullable(),
  examTypeEn: z.string().optional().nullable(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  taughtSemesters: z.union([CourseCreatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseCreateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseCreatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable(),
  get faculty(){ return FacultyCreateNestedOneWithoutCoursesInputObjectSchema.optional(); },
  get department(){ return DepartmentCreateNestedOneWithoutCoursesInputObjectSchema.optional(); }
}).strict();
export const CourseCreateWithoutGradesInputObjectSchema: z.ZodType<Prisma.CourseCreateWithoutGradesInput> = z.lazy(__makeSchema_CourseCreateWithoutGradesInput_schema) as unknown as z.ZodType<Prisma.CourseCreateWithoutGradesInput>;
export const CourseCreateWithoutGradesInputObjectZodSchema = z.lazy(__makeSchema_CourseCreateWithoutGradesInput_schema);


// File: CourseUncheckedCreateWithoutGradesInput.schema.ts
const __makeSchema_CourseUncheckedCreateWithoutGradesInput_schema = () => z.object({
  id: z.string().optional(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().optional().nullable(),
  credits: z.number().optional().nullable(),
  studyLevel: StudyLevelSchema,
  gradeType: GradeTypeSchema,
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int().optional().nullable(),
  contentNo: z.string().optional().nullable(),
  contentEn: z.string().optional().nullable(),
  teachingMethodsNo: z.string().optional().nullable(),
  teachingMethodsEn: z.string().optional().nullable(),
  learningOutcomesNo: z.string().optional().nullable(),
  learningOutcomesEn: z.string().optional().nullable(),
  examTypeNo: z.string().optional().nullable(),
  examTypeEn: z.string().optional().nullable(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  taughtSemesters: z.union([CourseCreatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseCreateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseCreatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  facultyId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable()
}).strict();
export const CourseUncheckedCreateWithoutGradesInputObjectSchema: z.ZodType<Prisma.CourseUncheckedCreateWithoutGradesInput> = z.lazy(__makeSchema_CourseUncheckedCreateWithoutGradesInput_schema) as unknown as z.ZodType<Prisma.CourseUncheckedCreateWithoutGradesInput>;
export const CourseUncheckedCreateWithoutGradesInputObjectZodSchema = z.lazy(__makeSchema_CourseUncheckedCreateWithoutGradesInput_schema);


// File: CourseCreateOrConnectWithoutGradesInput.schema.ts
const __makeSchema_CourseCreateOrConnectWithoutGradesInput_schema = () => z.object({
  get where(){ return CourseWhereUniqueInputObjectSchema; },
  create: z.union([CourseCreateWithoutGradesInputObjectSchema, CourseUncheckedCreateWithoutGradesInputObjectSchema])
}).strict();
export const CourseCreateOrConnectWithoutGradesInputObjectSchema: z.ZodType<Prisma.CourseCreateOrConnectWithoutGradesInput> = z.lazy(__makeSchema_CourseCreateOrConnectWithoutGradesInput_schema) as unknown as z.ZodType<Prisma.CourseCreateOrConnectWithoutGradesInput>;
export const CourseCreateOrConnectWithoutGradesInputObjectZodSchema = z.lazy(__makeSchema_CourseCreateOrConnectWithoutGradesInput_schema);


// File: CourseUpsertWithoutGradesInput.schema.ts
const __makeSchema_CourseUpsertWithoutGradesInput_schema = () => z.object({
  update: z.union([CourseUpdateWithoutGradesInputObjectSchema, CourseUncheckedUpdateWithoutGradesInputObjectSchema]),
  create: z.union([CourseCreateWithoutGradesInputObjectSchema, CourseUncheckedCreateWithoutGradesInputObjectSchema]),
  get where(){ return CourseWhereInputObjectSchema.optional(); }
}).strict();
export const CourseUpsertWithoutGradesInputObjectSchema: z.ZodType<Prisma.CourseUpsertWithoutGradesInput> = z.lazy(__makeSchema_CourseUpsertWithoutGradesInput_schema) as unknown as z.ZodType<Prisma.CourseUpsertWithoutGradesInput>;
export const CourseUpsertWithoutGradesInputObjectZodSchema = z.lazy(__makeSchema_CourseUpsertWithoutGradesInput_schema);


// File: CourseUpdateToOneWithWhereWithoutGradesInput.schema.ts
const __makeSchema_CourseUpdateToOneWithWhereWithoutGradesInput_schema = () => z.object({
  get where(){ return CourseWhereInputObjectSchema.optional(); },
  data: z.union([CourseUpdateWithoutGradesInputObjectSchema, CourseUncheckedUpdateWithoutGradesInputObjectSchema])
}).strict();
export const CourseUpdateToOneWithWhereWithoutGradesInputObjectSchema: z.ZodType<Prisma.CourseUpdateToOneWithWhereWithoutGradesInput> = z.lazy(__makeSchema_CourseUpdateToOneWithWhereWithoutGradesInput_schema) as unknown as z.ZodType<Prisma.CourseUpdateToOneWithWhereWithoutGradesInput>;
export const CourseUpdateToOneWithWhereWithoutGradesInputObjectZodSchema = z.lazy(__makeSchema_CourseUpdateToOneWithWhereWithoutGradesInput_schema);


// File: CourseUpdateWithoutGradesInput.schema.ts
const __makeSchema_CourseUpdateWithoutGradesInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  credits: z.union([z.number(), NullableFloatFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, EnumStudyLevelFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeType: z.union([GradeTypeSchema, EnumGradeTypeFieldUpdateOperationsInputObjectSchema]).optional(),
  firstYearTaught: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  lastYearTaught: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  candidateCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  averageGrade: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  passRate: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  createdAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  updatedAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  taughtSemesters: z.union([CourseUpdatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseUpdateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseUpdatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  get faculty(){ return FacultyUpdateOneWithoutCoursesNestedInputObjectSchema.optional(); },
  get department(){ return DepartmentUpdateOneWithoutCoursesNestedInputObjectSchema.optional(); }
}).strict();
export const CourseUpdateWithoutGradesInputObjectSchema: z.ZodType<Prisma.CourseUpdateWithoutGradesInput> = z.lazy(__makeSchema_CourseUpdateWithoutGradesInput_schema) as unknown as z.ZodType<Prisma.CourseUpdateWithoutGradesInput>;
export const CourseUpdateWithoutGradesInputObjectZodSchema = z.lazy(__makeSchema_CourseUpdateWithoutGradesInput_schema);


// File: CourseUncheckedUpdateWithoutGradesInput.schema.ts
const __makeSchema_CourseUncheckedUpdateWithoutGradesInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  credits: z.union([z.number(), NullableFloatFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, EnumStudyLevelFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeType: z.union([GradeTypeSchema, EnumGradeTypeFieldUpdateOperationsInputObjectSchema]).optional(),
  firstYearTaught: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  lastYearTaught: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  candidateCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  averageGrade: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  passRate: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  createdAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  updatedAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  taughtSemesters: z.union([CourseUpdatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseUpdateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseUpdatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  facultyId: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  departmentId: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable()
}).strict();
export const CourseUncheckedUpdateWithoutGradesInputObjectSchema: z.ZodType<Prisma.CourseUncheckedUpdateWithoutGradesInput> = z.lazy(__makeSchema_CourseUncheckedUpdateWithoutGradesInput_schema) as unknown as z.ZodType<Prisma.CourseUncheckedUpdateWithoutGradesInput>;
export const CourseUncheckedUpdateWithoutGradesInputObjectZodSchema = z.lazy(__makeSchema_CourseUncheckedUpdateWithoutGradesInput_schema);


// File: CourseCreateWithoutFacultyInput.schema.ts
const __makeSchema_CourseCreateWithoutFacultyInput_schema = () => z.object({
  id: z.string().optional(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().optional().nullable(),
  credits: z.number().optional().nullable(),
  studyLevel: StudyLevelSchema,
  gradeType: GradeTypeSchema,
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int().optional().nullable(),
  contentNo: z.string().optional().nullable(),
  contentEn: z.string().optional().nullable(),
  teachingMethodsNo: z.string().optional().nullable(),
  teachingMethodsEn: z.string().optional().nullable(),
  learningOutcomesNo: z.string().optional().nullable(),
  learningOutcomesEn: z.string().optional().nullable(),
  examTypeNo: z.string().optional().nullable(),
  examTypeEn: z.string().optional().nullable(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  taughtSemesters: z.union([CourseCreatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseCreateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseCreatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable(),
  get grades(){ return GradeCreateNestedManyWithoutCourseInputObjectSchema.optional(); },
  get department(){ return DepartmentCreateNestedOneWithoutCoursesInputObjectSchema.optional(); }
}).strict();
export const CourseCreateWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseCreateWithoutFacultyInput> = z.lazy(__makeSchema_CourseCreateWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.CourseCreateWithoutFacultyInput>;
export const CourseCreateWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_CourseCreateWithoutFacultyInput_schema);


// File: CourseUncheckedCreateWithoutFacultyInput.schema.ts
const __makeSchema_CourseUncheckedCreateWithoutFacultyInput_schema = () => z.object({
  id: z.string().optional(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().optional().nullable(),
  credits: z.number().optional().nullable(),
  studyLevel: StudyLevelSchema,
  gradeType: GradeTypeSchema,
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int().optional().nullable(),
  contentNo: z.string().optional().nullable(),
  contentEn: z.string().optional().nullable(),
  teachingMethodsNo: z.string().optional().nullable(),
  teachingMethodsEn: z.string().optional().nullable(),
  learningOutcomesNo: z.string().optional().nullable(),
  learningOutcomesEn: z.string().optional().nullable(),
  examTypeNo: z.string().optional().nullable(),
  examTypeEn: z.string().optional().nullable(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  taughtSemesters: z.union([CourseCreatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseCreateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseCreatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  departmentId: z.string().optional().nullable(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable(),
  get grades(){ return GradeUncheckedCreateNestedManyWithoutCourseInputObjectSchema.optional(); }
}).strict();
export const CourseUncheckedCreateWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseUncheckedCreateWithoutFacultyInput> = z.lazy(__makeSchema_CourseUncheckedCreateWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.CourseUncheckedCreateWithoutFacultyInput>;
export const CourseUncheckedCreateWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_CourseUncheckedCreateWithoutFacultyInput_schema);


// File: CourseCreateOrConnectWithoutFacultyInput.schema.ts
const __makeSchema_CourseCreateOrConnectWithoutFacultyInput_schema = () => z.object({
  get where(){ return CourseWhereUniqueInputObjectSchema; },
  create: z.union([CourseCreateWithoutFacultyInputObjectSchema, CourseUncheckedCreateWithoutFacultyInputObjectSchema])
}).strict();
export const CourseCreateOrConnectWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseCreateOrConnectWithoutFacultyInput> = z.lazy(__makeSchema_CourseCreateOrConnectWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.CourseCreateOrConnectWithoutFacultyInput>;
export const CourseCreateOrConnectWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_CourseCreateOrConnectWithoutFacultyInput_schema);


// File: CourseCreateManyFacultyInputEnvelope.schema.ts
const __makeSchema_CourseCreateManyFacultyInputEnvelope_schema = () => z.object({
  data: z.union([CourseCreateManyFacultyInputObjectSchema, CourseCreateManyFacultyInputObjectSchema.array()]),
  skipDuplicates: z.boolean().optional()
}).strict();
export const CourseCreateManyFacultyInputEnvelopeObjectSchema: z.ZodType<Prisma.CourseCreateManyFacultyInputEnvelope> = z.lazy(__makeSchema_CourseCreateManyFacultyInputEnvelope_schema) as unknown as z.ZodType<Prisma.CourseCreateManyFacultyInputEnvelope>;
export const CourseCreateManyFacultyInputEnvelopeObjectZodSchema = z.lazy(__makeSchema_CourseCreateManyFacultyInputEnvelope_schema);


// File: DepartmentCreateWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentCreateWithoutFacultyInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  get courses(){ return CourseCreateNestedManyWithoutDepartmentInputObjectSchema.optional(); }
}).strict();
export const DepartmentCreateWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentCreateWithoutFacultyInput> = z.lazy(__makeSchema_DepartmentCreateWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.DepartmentCreateWithoutFacultyInput>;
export const DepartmentCreateWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_DepartmentCreateWithoutFacultyInput_schema);


// File: DepartmentUncheckedCreateWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentUncheckedCreateWithoutFacultyInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  get courses(){ return CourseUncheckedCreateNestedManyWithoutDepartmentInputObjectSchema.optional(); }
}).strict();
export const DepartmentUncheckedCreateWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentUncheckedCreateWithoutFacultyInput> = z.lazy(__makeSchema_DepartmentUncheckedCreateWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.DepartmentUncheckedCreateWithoutFacultyInput>;
export const DepartmentUncheckedCreateWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUncheckedCreateWithoutFacultyInput_schema);


// File: DepartmentCreateOrConnectWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentCreateOrConnectWithoutFacultyInput_schema = () => z.object({
  get where(){ return DepartmentWhereUniqueInputObjectSchema; },
  create: z.union([DepartmentCreateWithoutFacultyInputObjectSchema, DepartmentUncheckedCreateWithoutFacultyInputObjectSchema])
}).strict();
export const DepartmentCreateOrConnectWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentCreateOrConnectWithoutFacultyInput> = z.lazy(__makeSchema_DepartmentCreateOrConnectWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.DepartmentCreateOrConnectWithoutFacultyInput>;
export const DepartmentCreateOrConnectWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_DepartmentCreateOrConnectWithoutFacultyInput_schema);


// File: DepartmentCreateManyFacultyInputEnvelope.schema.ts
const __makeSchema_DepartmentCreateManyFacultyInputEnvelope_schema = () => z.object({
  data: z.union([DepartmentCreateManyFacultyInputObjectSchema, DepartmentCreateManyFacultyInputObjectSchema.array()]),
  skipDuplicates: z.boolean().optional()
}).strict();
export const DepartmentCreateManyFacultyInputEnvelopeObjectSchema: z.ZodType<Prisma.DepartmentCreateManyFacultyInputEnvelope> = z.lazy(__makeSchema_DepartmentCreateManyFacultyInputEnvelope_schema) as unknown as z.ZodType<Prisma.DepartmentCreateManyFacultyInputEnvelope>;
export const DepartmentCreateManyFacultyInputEnvelopeObjectZodSchema = z.lazy(__makeSchema_DepartmentCreateManyFacultyInputEnvelope_schema);


// File: CourseUpsertWithWhereUniqueWithoutFacultyInput.schema.ts
const __makeSchema_CourseUpsertWithWhereUniqueWithoutFacultyInput_schema = () => z.object({
  get where(){ return CourseWhereUniqueInputObjectSchema; },
  update: z.union([CourseUpdateWithoutFacultyInputObjectSchema, CourseUncheckedUpdateWithoutFacultyInputObjectSchema]),
  create: z.union([CourseCreateWithoutFacultyInputObjectSchema, CourseUncheckedCreateWithoutFacultyInputObjectSchema])
}).strict();
export const CourseUpsertWithWhereUniqueWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseUpsertWithWhereUniqueWithoutFacultyInput> = z.lazy(__makeSchema_CourseUpsertWithWhereUniqueWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.CourseUpsertWithWhereUniqueWithoutFacultyInput>;
export const CourseUpsertWithWhereUniqueWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_CourseUpsertWithWhereUniqueWithoutFacultyInput_schema);


// File: CourseUpdateWithWhereUniqueWithoutFacultyInput.schema.ts
const __makeSchema_CourseUpdateWithWhereUniqueWithoutFacultyInput_schema = () => z.object({
  get where(){ return CourseWhereUniqueInputObjectSchema; },
  data: z.union([CourseUpdateWithoutFacultyInputObjectSchema, CourseUncheckedUpdateWithoutFacultyInputObjectSchema])
}).strict();
export const CourseUpdateWithWhereUniqueWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseUpdateWithWhereUniqueWithoutFacultyInput> = z.lazy(__makeSchema_CourseUpdateWithWhereUniqueWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.CourseUpdateWithWhereUniqueWithoutFacultyInput>;
export const CourseUpdateWithWhereUniqueWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_CourseUpdateWithWhereUniqueWithoutFacultyInput_schema);


// File: CourseUpdateManyWithWhereWithoutFacultyInput.schema.ts
const __makeSchema_CourseUpdateManyWithWhereWithoutFacultyInput_schema = () => z.object({
  get where(){ return CourseScalarWhereInputObjectSchema; },
  data: z.union([CourseUpdateManyMutationInputObjectSchema, CourseUncheckedUpdateManyWithoutFacultyInputObjectSchema])
}).strict();
export const CourseUpdateManyWithWhereWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseUpdateManyWithWhereWithoutFacultyInput> = z.lazy(__makeSchema_CourseUpdateManyWithWhereWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.CourseUpdateManyWithWhereWithoutFacultyInput>;
export const CourseUpdateManyWithWhereWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_CourseUpdateManyWithWhereWithoutFacultyInput_schema);


// File: CourseScalarWhereInput.schema.ts
const __makeSchema_CourseScalarWhereInput_schema = () => z.object({
  AND: z.union([CourseScalarWhereInputObjectSchema, CourseScalarWhereInputObjectSchema.array()]).optional(),
  get OR(){ return CourseScalarWhereInputObjectSchema.array().optional(); },
  NOT: z.union([CourseScalarWhereInputObjectSchema, CourseScalarWhereInputObjectSchema.array()]).optional(),
  id: z.union([StringFilterObjectSchema, z.string()]).optional(),
  code: z.union([StringFilterObjectSchema, z.string()]).optional(),
  nameNo: z.union([StringFilterObjectSchema, z.string()]).optional(),
  nameEn: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  credits: z.union([FloatNullableFilterObjectSchema, z.number()]).optional().nullable(),
  studyLevel: z.union([EnumStudyLevelFilterObjectSchema, StudyLevelSchema]).optional(),
  gradeType: z.union([EnumGradeTypeFilterObjectSchema, GradeTypeSchema]).optional(),
  firstYearTaught: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  lastYearTaught: z.union([IntNullableFilterObjectSchema, z.number().int()]).optional().nullable(),
  contentNo: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  contentEn: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  teachingMethodsNo: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  teachingMethodsEn: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  learningOutcomesNo: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  learningOutcomesEn: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  examTypeNo: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  examTypeEn: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  candidateCount: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  averageGrade: z.union([FloatFilterObjectSchema, z.number()]).optional(),
  passRate: z.union([FloatFilterObjectSchema, z.number()]).optional(),
  createdAt: z.union([DateTimeFilterObjectSchema, z.coerce.date()]).optional(),
  updatedAt: z.union([DateTimeFilterObjectSchema, z.coerce.date()]).optional(),
  get taughtSemesters(){ return EnumSemesterNullableListFilterObjectSchema.optional(); },
  get teachingLanguages(){ return EnumTeachingLanguageNullableListFilterObjectSchema.optional(); },
  get campuses(){ return EnumCampusNullableListFilterObjectSchema.optional(); },
  facultyId: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  departmentId: z.union([StringNullableFilterObjectSchema, z.string()]).optional().nullable(),
  latestYearCheckedForNtnuData: z.union([IntNullableFilterObjectSchema, z.number().int()]).optional().nullable()
}).strict();
export const CourseScalarWhereInputObjectSchema: z.ZodType<Prisma.CourseScalarWhereInput> = z.lazy(__makeSchema_CourseScalarWhereInput_schema) as unknown as z.ZodType<Prisma.CourseScalarWhereInput>;
export const CourseScalarWhereInputObjectZodSchema = z.lazy(__makeSchema_CourseScalarWhereInput_schema);


// File: DepartmentUpsertWithWhereUniqueWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentUpsertWithWhereUniqueWithoutFacultyInput_schema = () => z.object({
  get where(){ return DepartmentWhereUniqueInputObjectSchema; },
  update: z.union([DepartmentUpdateWithoutFacultyInputObjectSchema, DepartmentUncheckedUpdateWithoutFacultyInputObjectSchema]),
  create: z.union([DepartmentCreateWithoutFacultyInputObjectSchema, DepartmentUncheckedCreateWithoutFacultyInputObjectSchema])
}).strict();
export const DepartmentUpsertWithWhereUniqueWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentUpsertWithWhereUniqueWithoutFacultyInput> = z.lazy(__makeSchema_DepartmentUpsertWithWhereUniqueWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.DepartmentUpsertWithWhereUniqueWithoutFacultyInput>;
export const DepartmentUpsertWithWhereUniqueWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUpsertWithWhereUniqueWithoutFacultyInput_schema);


// File: DepartmentUpdateWithWhereUniqueWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentUpdateWithWhereUniqueWithoutFacultyInput_schema = () => z.object({
  get where(){ return DepartmentWhereUniqueInputObjectSchema; },
  data: z.union([DepartmentUpdateWithoutFacultyInputObjectSchema, DepartmentUncheckedUpdateWithoutFacultyInputObjectSchema])
}).strict();
export const DepartmentUpdateWithWhereUniqueWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentUpdateWithWhereUniqueWithoutFacultyInput> = z.lazy(__makeSchema_DepartmentUpdateWithWhereUniqueWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.DepartmentUpdateWithWhereUniqueWithoutFacultyInput>;
export const DepartmentUpdateWithWhereUniqueWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUpdateWithWhereUniqueWithoutFacultyInput_schema);


// File: DepartmentUpdateManyWithWhereWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentUpdateManyWithWhereWithoutFacultyInput_schema = () => z.object({
  get where(){ return DepartmentScalarWhereInputObjectSchema; },
  data: z.union([DepartmentUpdateManyMutationInputObjectSchema, DepartmentUncheckedUpdateManyWithoutFacultyInputObjectSchema])
}).strict();
export const DepartmentUpdateManyWithWhereWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentUpdateManyWithWhereWithoutFacultyInput> = z.lazy(__makeSchema_DepartmentUpdateManyWithWhereWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.DepartmentUpdateManyWithWhereWithoutFacultyInput>;
export const DepartmentUpdateManyWithWhereWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUpdateManyWithWhereWithoutFacultyInput_schema);


// File: DepartmentScalarWhereInput.schema.ts
const __makeSchema_DepartmentScalarWhereInput_schema = () => z.object({
  AND: z.union([DepartmentScalarWhereInputObjectSchema, DepartmentScalarWhereInputObjectSchema.array()]).optional(),
  get OR(){ return DepartmentScalarWhereInputObjectSchema.array().optional(); },
  NOT: z.union([DepartmentScalarWhereInputObjectSchema, DepartmentScalarWhereInputObjectSchema.array()]).optional(),
  id: z.union([StringFilterObjectSchema, z.string()]).optional(),
  nameNo: z.union([StringFilterObjectSchema, z.string()]).optional(),
  nameEn: z.union([StringFilterObjectSchema, z.string()]).optional(),
  code: z.union([IntFilterObjectSchema, z.number().int()]).optional(),
  facultyId: z.union([StringFilterObjectSchema, z.string()]).optional()
}).strict();
export const DepartmentScalarWhereInputObjectSchema: z.ZodType<Prisma.DepartmentScalarWhereInput> = z.lazy(__makeSchema_DepartmentScalarWhereInput_schema) as unknown as z.ZodType<Prisma.DepartmentScalarWhereInput>;
export const DepartmentScalarWhereInputObjectZodSchema = z.lazy(__makeSchema_DepartmentScalarWhereInput_schema);


// File: CourseCreateWithoutDepartmentInput.schema.ts
const __makeSchema_CourseCreateWithoutDepartmentInput_schema = () => z.object({
  id: z.string().optional(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().optional().nullable(),
  credits: z.number().optional().nullable(),
  studyLevel: StudyLevelSchema,
  gradeType: GradeTypeSchema,
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int().optional().nullable(),
  contentNo: z.string().optional().nullable(),
  contentEn: z.string().optional().nullable(),
  teachingMethodsNo: z.string().optional().nullable(),
  teachingMethodsEn: z.string().optional().nullable(),
  learningOutcomesNo: z.string().optional().nullable(),
  learningOutcomesEn: z.string().optional().nullable(),
  examTypeNo: z.string().optional().nullable(),
  examTypeEn: z.string().optional().nullable(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  taughtSemesters: z.union([CourseCreatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseCreateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseCreatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable(),
  get grades(){ return GradeCreateNestedManyWithoutCourseInputObjectSchema.optional(); },
  get faculty(){ return FacultyCreateNestedOneWithoutCoursesInputObjectSchema.optional(); }
}).strict();
export const CourseCreateWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseCreateWithoutDepartmentInput> = z.lazy(__makeSchema_CourseCreateWithoutDepartmentInput_schema) as unknown as z.ZodType<Prisma.CourseCreateWithoutDepartmentInput>;
export const CourseCreateWithoutDepartmentInputObjectZodSchema = z.lazy(__makeSchema_CourseCreateWithoutDepartmentInput_schema);


// File: CourseUncheckedCreateWithoutDepartmentInput.schema.ts
const __makeSchema_CourseUncheckedCreateWithoutDepartmentInput_schema = () => z.object({
  id: z.string().optional(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().optional().nullable(),
  credits: z.number().optional().nullable(),
  studyLevel: StudyLevelSchema,
  gradeType: GradeTypeSchema,
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int().optional().nullable(),
  contentNo: z.string().optional().nullable(),
  contentEn: z.string().optional().nullable(),
  teachingMethodsNo: z.string().optional().nullable(),
  teachingMethodsEn: z.string().optional().nullable(),
  learningOutcomesNo: z.string().optional().nullable(),
  learningOutcomesEn: z.string().optional().nullable(),
  examTypeNo: z.string().optional().nullable(),
  examTypeEn: z.string().optional().nullable(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  taughtSemesters: z.union([CourseCreatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseCreateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseCreatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  facultyId: z.string().optional().nullable(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable(),
  get grades(){ return GradeUncheckedCreateNestedManyWithoutCourseInputObjectSchema.optional(); }
}).strict();
export const CourseUncheckedCreateWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseUncheckedCreateWithoutDepartmentInput> = z.lazy(__makeSchema_CourseUncheckedCreateWithoutDepartmentInput_schema) as unknown as z.ZodType<Prisma.CourseUncheckedCreateWithoutDepartmentInput>;
export const CourseUncheckedCreateWithoutDepartmentInputObjectZodSchema = z.lazy(__makeSchema_CourseUncheckedCreateWithoutDepartmentInput_schema);


// File: CourseCreateOrConnectWithoutDepartmentInput.schema.ts
const __makeSchema_CourseCreateOrConnectWithoutDepartmentInput_schema = () => z.object({
  get where(){ return CourseWhereUniqueInputObjectSchema; },
  create: z.union([CourseCreateWithoutDepartmentInputObjectSchema, CourseUncheckedCreateWithoutDepartmentInputObjectSchema])
}).strict();
export const CourseCreateOrConnectWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseCreateOrConnectWithoutDepartmentInput> = z.lazy(__makeSchema_CourseCreateOrConnectWithoutDepartmentInput_schema) as unknown as z.ZodType<Prisma.CourseCreateOrConnectWithoutDepartmentInput>;
export const CourseCreateOrConnectWithoutDepartmentInputObjectZodSchema = z.lazy(__makeSchema_CourseCreateOrConnectWithoutDepartmentInput_schema);


// File: CourseCreateManyDepartmentInputEnvelope.schema.ts
const __makeSchema_CourseCreateManyDepartmentInputEnvelope_schema = () => z.object({
  data: z.union([CourseCreateManyDepartmentInputObjectSchema, CourseCreateManyDepartmentInputObjectSchema.array()]),
  skipDuplicates: z.boolean().optional()
}).strict();
export const CourseCreateManyDepartmentInputEnvelopeObjectSchema: z.ZodType<Prisma.CourseCreateManyDepartmentInputEnvelope> = z.lazy(__makeSchema_CourseCreateManyDepartmentInputEnvelope_schema) as unknown as z.ZodType<Prisma.CourseCreateManyDepartmentInputEnvelope>;
export const CourseCreateManyDepartmentInputEnvelopeObjectZodSchema = z.lazy(__makeSchema_CourseCreateManyDepartmentInputEnvelope_schema);


// File: FacultyCreateWithoutDepartmentsInput.schema.ts
const __makeSchema_FacultyCreateWithoutDepartmentsInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  get courses(){ return CourseCreateNestedManyWithoutFacultyInputObjectSchema.optional(); }
}).strict();
export const FacultyCreateWithoutDepartmentsInputObjectSchema: z.ZodType<Prisma.FacultyCreateWithoutDepartmentsInput> = z.lazy(__makeSchema_FacultyCreateWithoutDepartmentsInput_schema) as unknown as z.ZodType<Prisma.FacultyCreateWithoutDepartmentsInput>;
export const FacultyCreateWithoutDepartmentsInputObjectZodSchema = z.lazy(__makeSchema_FacultyCreateWithoutDepartmentsInput_schema);


// File: FacultyUncheckedCreateWithoutDepartmentsInput.schema.ts
const __makeSchema_FacultyUncheckedCreateWithoutDepartmentsInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  get courses(){ return CourseUncheckedCreateNestedManyWithoutFacultyInputObjectSchema.optional(); }
}).strict();
export const FacultyUncheckedCreateWithoutDepartmentsInputObjectSchema: z.ZodType<Prisma.FacultyUncheckedCreateWithoutDepartmentsInput> = z.lazy(__makeSchema_FacultyUncheckedCreateWithoutDepartmentsInput_schema) as unknown as z.ZodType<Prisma.FacultyUncheckedCreateWithoutDepartmentsInput>;
export const FacultyUncheckedCreateWithoutDepartmentsInputObjectZodSchema = z.lazy(__makeSchema_FacultyUncheckedCreateWithoutDepartmentsInput_schema);


// File: FacultyCreateOrConnectWithoutDepartmentsInput.schema.ts
const __makeSchema_FacultyCreateOrConnectWithoutDepartmentsInput_schema = () => z.object({
  get where(){ return FacultyWhereUniqueInputObjectSchema; },
  create: z.union([FacultyCreateWithoutDepartmentsInputObjectSchema, FacultyUncheckedCreateWithoutDepartmentsInputObjectSchema])
}).strict();
export const FacultyCreateOrConnectWithoutDepartmentsInputObjectSchema: z.ZodType<Prisma.FacultyCreateOrConnectWithoutDepartmentsInput> = z.lazy(__makeSchema_FacultyCreateOrConnectWithoutDepartmentsInput_schema) as unknown as z.ZodType<Prisma.FacultyCreateOrConnectWithoutDepartmentsInput>;
export const FacultyCreateOrConnectWithoutDepartmentsInputObjectZodSchema = z.lazy(__makeSchema_FacultyCreateOrConnectWithoutDepartmentsInput_schema);


// File: CourseUpsertWithWhereUniqueWithoutDepartmentInput.schema.ts
const __makeSchema_CourseUpsertWithWhereUniqueWithoutDepartmentInput_schema = () => z.object({
  get where(){ return CourseWhereUniqueInputObjectSchema; },
  update: z.union([CourseUpdateWithoutDepartmentInputObjectSchema, CourseUncheckedUpdateWithoutDepartmentInputObjectSchema]),
  create: z.union([CourseCreateWithoutDepartmentInputObjectSchema, CourseUncheckedCreateWithoutDepartmentInputObjectSchema])
}).strict();
export const CourseUpsertWithWhereUniqueWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseUpsertWithWhereUniqueWithoutDepartmentInput> = z.lazy(__makeSchema_CourseUpsertWithWhereUniqueWithoutDepartmentInput_schema) as unknown as z.ZodType<Prisma.CourseUpsertWithWhereUniqueWithoutDepartmentInput>;
export const CourseUpsertWithWhereUniqueWithoutDepartmentInputObjectZodSchema = z.lazy(__makeSchema_CourseUpsertWithWhereUniqueWithoutDepartmentInput_schema);


// File: CourseUpdateWithWhereUniqueWithoutDepartmentInput.schema.ts
const __makeSchema_CourseUpdateWithWhereUniqueWithoutDepartmentInput_schema = () => z.object({
  get where(){ return CourseWhereUniqueInputObjectSchema; },
  data: z.union([CourseUpdateWithoutDepartmentInputObjectSchema, CourseUncheckedUpdateWithoutDepartmentInputObjectSchema])
}).strict();
export const CourseUpdateWithWhereUniqueWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseUpdateWithWhereUniqueWithoutDepartmentInput> = z.lazy(__makeSchema_CourseUpdateWithWhereUniqueWithoutDepartmentInput_schema) as unknown as z.ZodType<Prisma.CourseUpdateWithWhereUniqueWithoutDepartmentInput>;
export const CourseUpdateWithWhereUniqueWithoutDepartmentInputObjectZodSchema = z.lazy(__makeSchema_CourseUpdateWithWhereUniqueWithoutDepartmentInput_schema);


// File: CourseUpdateManyWithWhereWithoutDepartmentInput.schema.ts
const __makeSchema_CourseUpdateManyWithWhereWithoutDepartmentInput_schema = () => z.object({
  get where(){ return CourseScalarWhereInputObjectSchema; },
  data: z.union([CourseUpdateManyMutationInputObjectSchema, CourseUncheckedUpdateManyWithoutDepartmentInputObjectSchema])
}).strict();
export const CourseUpdateManyWithWhereWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseUpdateManyWithWhereWithoutDepartmentInput> = z.lazy(__makeSchema_CourseUpdateManyWithWhereWithoutDepartmentInput_schema) as unknown as z.ZodType<Prisma.CourseUpdateManyWithWhereWithoutDepartmentInput>;
export const CourseUpdateManyWithWhereWithoutDepartmentInputObjectZodSchema = z.lazy(__makeSchema_CourseUpdateManyWithWhereWithoutDepartmentInput_schema);


// File: FacultyUpsertWithoutDepartmentsInput.schema.ts
const __makeSchema_FacultyUpsertWithoutDepartmentsInput_schema = () => z.object({
  update: z.union([FacultyUpdateWithoutDepartmentsInputObjectSchema, FacultyUncheckedUpdateWithoutDepartmentsInputObjectSchema]),
  create: z.union([FacultyCreateWithoutDepartmentsInputObjectSchema, FacultyUncheckedCreateWithoutDepartmentsInputObjectSchema]),
  get where(){ return FacultyWhereInputObjectSchema.optional(); }
}).strict();
export const FacultyUpsertWithoutDepartmentsInputObjectSchema: z.ZodType<Prisma.FacultyUpsertWithoutDepartmentsInput> = z.lazy(__makeSchema_FacultyUpsertWithoutDepartmentsInput_schema) as unknown as z.ZodType<Prisma.FacultyUpsertWithoutDepartmentsInput>;
export const FacultyUpsertWithoutDepartmentsInputObjectZodSchema = z.lazy(__makeSchema_FacultyUpsertWithoutDepartmentsInput_schema);


// File: FacultyUpdateToOneWithWhereWithoutDepartmentsInput.schema.ts
const __makeSchema_FacultyUpdateToOneWithWhereWithoutDepartmentsInput_schema = () => z.object({
  get where(){ return FacultyWhereInputObjectSchema.optional(); },
  data: z.union([FacultyUpdateWithoutDepartmentsInputObjectSchema, FacultyUncheckedUpdateWithoutDepartmentsInputObjectSchema])
}).strict();
export const FacultyUpdateToOneWithWhereWithoutDepartmentsInputObjectSchema: z.ZodType<Prisma.FacultyUpdateToOneWithWhereWithoutDepartmentsInput> = z.lazy(__makeSchema_FacultyUpdateToOneWithWhereWithoutDepartmentsInput_schema) as unknown as z.ZodType<Prisma.FacultyUpdateToOneWithWhereWithoutDepartmentsInput>;
export const FacultyUpdateToOneWithWhereWithoutDepartmentsInputObjectZodSchema = z.lazy(__makeSchema_FacultyUpdateToOneWithWhereWithoutDepartmentsInput_schema);


// File: FacultyUpdateWithoutDepartmentsInput.schema.ts
const __makeSchema_FacultyUpdateWithoutDepartmentsInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  get courses(){ return CourseUpdateManyWithoutFacultyNestedInputObjectSchema.optional(); }
}).strict();
export const FacultyUpdateWithoutDepartmentsInputObjectSchema: z.ZodType<Prisma.FacultyUpdateWithoutDepartmentsInput> = z.lazy(__makeSchema_FacultyUpdateWithoutDepartmentsInput_schema) as unknown as z.ZodType<Prisma.FacultyUpdateWithoutDepartmentsInput>;
export const FacultyUpdateWithoutDepartmentsInputObjectZodSchema = z.lazy(__makeSchema_FacultyUpdateWithoutDepartmentsInput_schema);


// File: FacultyUncheckedUpdateWithoutDepartmentsInput.schema.ts
const __makeSchema_FacultyUncheckedUpdateWithoutDepartmentsInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  get courses(){ return CourseUncheckedUpdateManyWithoutFacultyNestedInputObjectSchema.optional(); }
}).strict();
export const FacultyUncheckedUpdateWithoutDepartmentsInputObjectSchema: z.ZodType<Prisma.FacultyUncheckedUpdateWithoutDepartmentsInput> = z.lazy(__makeSchema_FacultyUncheckedUpdateWithoutDepartmentsInput_schema) as unknown as z.ZodType<Prisma.FacultyUncheckedUpdateWithoutDepartmentsInput>;
export const FacultyUncheckedUpdateWithoutDepartmentsInputObjectZodSchema = z.lazy(__makeSchema_FacultyUncheckedUpdateWithoutDepartmentsInput_schema);


// File: GradeCreateManyCourseInput.schema.ts
const __makeSchema_GradeCreateManyCourseInput_schema = () => z.object({
  id: z.string().optional(),
  gradeACount: z.number().int(),
  gradeBCount: z.number().int(),
  gradeCCount: z.number().int(),
  gradeDCount: z.number().int(),
  gradeECount: z.number().int(),
  gradeFCount: z.number().int(),
  passedCount: z.number().int(),
  failedCount: z.number().int(),
  semester: SemesterSchema,
  year: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();
export const GradeCreateManyCourseInputObjectSchema: z.ZodType<Prisma.GradeCreateManyCourseInput> = z.lazy(__makeSchema_GradeCreateManyCourseInput_schema) as unknown as z.ZodType<Prisma.GradeCreateManyCourseInput>;
export const GradeCreateManyCourseInputObjectZodSchema = z.lazy(__makeSchema_GradeCreateManyCourseInput_schema);


// File: GradeUpdateWithoutCourseInput.schema.ts
const __makeSchema_GradeUpdateWithoutCourseInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeACount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeBCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeCCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeDCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeECount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeFCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  passedCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  failedCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  semester: z.union([SemesterSchema, EnumSemesterFieldUpdateOperationsInputObjectSchema]).optional(),
  year: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  createdAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  updatedAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional()
}).strict();
export const GradeUpdateWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeUpdateWithoutCourseInput> = z.lazy(__makeSchema_GradeUpdateWithoutCourseInput_schema) as unknown as z.ZodType<Prisma.GradeUpdateWithoutCourseInput>;
export const GradeUpdateWithoutCourseInputObjectZodSchema = z.lazy(__makeSchema_GradeUpdateWithoutCourseInput_schema);


// File: GradeUncheckedUpdateWithoutCourseInput.schema.ts
const __makeSchema_GradeUncheckedUpdateWithoutCourseInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeACount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeBCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeCCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeDCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeECount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeFCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  passedCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  failedCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  semester: z.union([SemesterSchema, EnumSemesterFieldUpdateOperationsInputObjectSchema]).optional(),
  year: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  createdAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  updatedAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional()
}).strict();
export const GradeUncheckedUpdateWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeUncheckedUpdateWithoutCourseInput> = z.lazy(__makeSchema_GradeUncheckedUpdateWithoutCourseInput_schema) as unknown as z.ZodType<Prisma.GradeUncheckedUpdateWithoutCourseInput>;
export const GradeUncheckedUpdateWithoutCourseInputObjectZodSchema = z.lazy(__makeSchema_GradeUncheckedUpdateWithoutCourseInput_schema);


// File: GradeUncheckedUpdateManyWithoutCourseInput.schema.ts
const __makeSchema_GradeUncheckedUpdateManyWithoutCourseInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeACount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeBCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeCCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeDCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeECount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeFCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  passedCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  failedCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  semester: z.union([SemesterSchema, EnumSemesterFieldUpdateOperationsInputObjectSchema]).optional(),
  year: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  createdAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  updatedAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional()
}).strict();
export const GradeUncheckedUpdateManyWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeUncheckedUpdateManyWithoutCourseInput> = z.lazy(__makeSchema_GradeUncheckedUpdateManyWithoutCourseInput_schema) as unknown as z.ZodType<Prisma.GradeUncheckedUpdateManyWithoutCourseInput>;
export const GradeUncheckedUpdateManyWithoutCourseInputObjectZodSchema = z.lazy(__makeSchema_GradeUncheckedUpdateManyWithoutCourseInput_schema);


// File: CourseCreateManyFacultyInput.schema.ts
const __makeSchema_CourseCreateManyFacultyInput_schema = () => z.object({
  id: z.string().optional(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().optional().nullable(),
  credits: z.number().optional().nullable(),
  studyLevel: StudyLevelSchema,
  gradeType: GradeTypeSchema,
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int().optional().nullable(),
  contentNo: z.string().optional().nullable(),
  contentEn: z.string().optional().nullable(),
  teachingMethodsNo: z.string().optional().nullable(),
  teachingMethodsEn: z.string().optional().nullable(),
  learningOutcomesNo: z.string().optional().nullable(),
  learningOutcomesEn: z.string().optional().nullable(),
  examTypeNo: z.string().optional().nullable(),
  examTypeEn: z.string().optional().nullable(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  taughtSemesters: z.union([CourseCreatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseCreateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseCreatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  departmentId: z.string().optional().nullable(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable()
}).strict();
export const CourseCreateManyFacultyInputObjectSchema: z.ZodType<Prisma.CourseCreateManyFacultyInput> = z.lazy(__makeSchema_CourseCreateManyFacultyInput_schema) as unknown as z.ZodType<Prisma.CourseCreateManyFacultyInput>;
export const CourseCreateManyFacultyInputObjectZodSchema = z.lazy(__makeSchema_CourseCreateManyFacultyInput_schema);


// File: DepartmentCreateManyFacultyInput.schema.ts
const __makeSchema_DepartmentCreateManyFacultyInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int()
}).strict();
export const DepartmentCreateManyFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentCreateManyFacultyInput> = z.lazy(__makeSchema_DepartmentCreateManyFacultyInput_schema) as unknown as z.ZodType<Prisma.DepartmentCreateManyFacultyInput>;
export const DepartmentCreateManyFacultyInputObjectZodSchema = z.lazy(__makeSchema_DepartmentCreateManyFacultyInput_schema);


// File: CourseUpdateWithoutFacultyInput.schema.ts
const __makeSchema_CourseUpdateWithoutFacultyInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  credits: z.union([z.number(), NullableFloatFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, EnumStudyLevelFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeType: z.union([GradeTypeSchema, EnumGradeTypeFieldUpdateOperationsInputObjectSchema]).optional(),
  firstYearTaught: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  lastYearTaught: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  candidateCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  averageGrade: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  passRate: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  createdAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  updatedAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  taughtSemesters: z.union([CourseUpdatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseUpdateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseUpdatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  get grades(){ return GradeUpdateManyWithoutCourseNestedInputObjectSchema.optional(); },
  get department(){ return DepartmentUpdateOneWithoutCoursesNestedInputObjectSchema.optional(); }
}).strict();
export const CourseUpdateWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseUpdateWithoutFacultyInput> = z.lazy(__makeSchema_CourseUpdateWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.CourseUpdateWithoutFacultyInput>;
export const CourseUpdateWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_CourseUpdateWithoutFacultyInput_schema);


// File: CourseUncheckedUpdateWithoutFacultyInput.schema.ts
const __makeSchema_CourseUncheckedUpdateWithoutFacultyInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  credits: z.union([z.number(), NullableFloatFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, EnumStudyLevelFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeType: z.union([GradeTypeSchema, EnumGradeTypeFieldUpdateOperationsInputObjectSchema]).optional(),
  firstYearTaught: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  lastYearTaught: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  candidateCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  averageGrade: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  passRate: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  createdAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  updatedAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  taughtSemesters: z.union([CourseUpdatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseUpdateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseUpdatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  departmentId: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  get grades(){ return GradeUncheckedUpdateManyWithoutCourseNestedInputObjectSchema.optional(); }
}).strict();
export const CourseUncheckedUpdateWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseUncheckedUpdateWithoutFacultyInput> = z.lazy(__makeSchema_CourseUncheckedUpdateWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.CourseUncheckedUpdateWithoutFacultyInput>;
export const CourseUncheckedUpdateWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_CourseUncheckedUpdateWithoutFacultyInput_schema);


// File: CourseUncheckedUpdateManyWithoutFacultyInput.schema.ts
const __makeSchema_CourseUncheckedUpdateManyWithoutFacultyInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  credits: z.union([z.number(), NullableFloatFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, EnumStudyLevelFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeType: z.union([GradeTypeSchema, EnumGradeTypeFieldUpdateOperationsInputObjectSchema]).optional(),
  firstYearTaught: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  lastYearTaught: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  candidateCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  averageGrade: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  passRate: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  createdAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  updatedAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  taughtSemesters: z.union([CourseUpdatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseUpdateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseUpdatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  departmentId: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable()
}).strict();
export const CourseUncheckedUpdateManyWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseUncheckedUpdateManyWithoutFacultyInput> = z.lazy(__makeSchema_CourseUncheckedUpdateManyWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.CourseUncheckedUpdateManyWithoutFacultyInput>;
export const CourseUncheckedUpdateManyWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_CourseUncheckedUpdateManyWithoutFacultyInput_schema);


// File: DepartmentUpdateWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentUpdateWithoutFacultyInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  get courses(){ return CourseUpdateManyWithoutDepartmentNestedInputObjectSchema.optional(); }
}).strict();
export const DepartmentUpdateWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentUpdateWithoutFacultyInput> = z.lazy(__makeSchema_DepartmentUpdateWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.DepartmentUpdateWithoutFacultyInput>;
export const DepartmentUpdateWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUpdateWithoutFacultyInput_schema);


// File: DepartmentUncheckedUpdateWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentUncheckedUpdateWithoutFacultyInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  get courses(){ return CourseUncheckedUpdateManyWithoutDepartmentNestedInputObjectSchema.optional(); }
}).strict();
export const DepartmentUncheckedUpdateWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentUncheckedUpdateWithoutFacultyInput> = z.lazy(__makeSchema_DepartmentUncheckedUpdateWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.DepartmentUncheckedUpdateWithoutFacultyInput>;
export const DepartmentUncheckedUpdateWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUncheckedUpdateWithoutFacultyInput_schema);


// File: DepartmentUncheckedUpdateManyWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentUncheckedUpdateManyWithoutFacultyInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional()
}).strict();
export const DepartmentUncheckedUpdateManyWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentUncheckedUpdateManyWithoutFacultyInput> = z.lazy(__makeSchema_DepartmentUncheckedUpdateManyWithoutFacultyInput_schema) as unknown as z.ZodType<Prisma.DepartmentUncheckedUpdateManyWithoutFacultyInput>;
export const DepartmentUncheckedUpdateManyWithoutFacultyInputObjectZodSchema = z.lazy(__makeSchema_DepartmentUncheckedUpdateManyWithoutFacultyInput_schema);


// File: CourseCreateManyDepartmentInput.schema.ts
const __makeSchema_CourseCreateManyDepartmentInput_schema = () => z.object({
  id: z.string().optional(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().optional().nullable(),
  credits: z.number().optional().nullable(),
  studyLevel: StudyLevelSchema,
  gradeType: GradeTypeSchema,
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int().optional().nullable(),
  contentNo: z.string().optional().nullable(),
  contentEn: z.string().optional().nullable(),
  teachingMethodsNo: z.string().optional().nullable(),
  teachingMethodsEn: z.string().optional().nullable(),
  learningOutcomesNo: z.string().optional().nullable(),
  learningOutcomesEn: z.string().optional().nullable(),
  examTypeNo: z.string().optional().nullable(),
  examTypeEn: z.string().optional().nullable(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  taughtSemesters: z.union([CourseCreatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseCreateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseCreatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  facultyId: z.string().optional().nullable(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable()
}).strict();
export const CourseCreateManyDepartmentInputObjectSchema: z.ZodType<Prisma.CourseCreateManyDepartmentInput> = z.lazy(__makeSchema_CourseCreateManyDepartmentInput_schema) as unknown as z.ZodType<Prisma.CourseCreateManyDepartmentInput>;
export const CourseCreateManyDepartmentInputObjectZodSchema = z.lazy(__makeSchema_CourseCreateManyDepartmentInput_schema);


// File: CourseUpdateWithoutDepartmentInput.schema.ts
const __makeSchema_CourseUpdateWithoutDepartmentInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  credits: z.union([z.number(), NullableFloatFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, EnumStudyLevelFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeType: z.union([GradeTypeSchema, EnumGradeTypeFieldUpdateOperationsInputObjectSchema]).optional(),
  firstYearTaught: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  lastYearTaught: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  candidateCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  averageGrade: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  passRate: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  createdAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  updatedAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  taughtSemesters: z.union([CourseUpdatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseUpdateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseUpdatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  get grades(){ return GradeUpdateManyWithoutCourseNestedInputObjectSchema.optional(); },
  get faculty(){ return FacultyUpdateOneWithoutCoursesNestedInputObjectSchema.optional(); }
}).strict();
export const CourseUpdateWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseUpdateWithoutDepartmentInput> = z.lazy(__makeSchema_CourseUpdateWithoutDepartmentInput_schema) as unknown as z.ZodType<Prisma.CourseUpdateWithoutDepartmentInput>;
export const CourseUpdateWithoutDepartmentInputObjectZodSchema = z.lazy(__makeSchema_CourseUpdateWithoutDepartmentInput_schema);


// File: CourseUncheckedUpdateWithoutDepartmentInput.schema.ts
const __makeSchema_CourseUncheckedUpdateWithoutDepartmentInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  credits: z.union([z.number(), NullableFloatFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, EnumStudyLevelFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeType: z.union([GradeTypeSchema, EnumGradeTypeFieldUpdateOperationsInputObjectSchema]).optional(),
  firstYearTaught: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  lastYearTaught: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  candidateCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  averageGrade: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  passRate: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  createdAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  updatedAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  taughtSemesters: z.union([CourseUpdatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseUpdateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseUpdatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  facultyId: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  get grades(){ return GradeUncheckedUpdateManyWithoutCourseNestedInputObjectSchema.optional(); }
}).strict();
export const CourseUncheckedUpdateWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseUncheckedUpdateWithoutDepartmentInput> = z.lazy(__makeSchema_CourseUncheckedUpdateWithoutDepartmentInput_schema) as unknown as z.ZodType<Prisma.CourseUncheckedUpdateWithoutDepartmentInput>;
export const CourseUncheckedUpdateWithoutDepartmentInputObjectZodSchema = z.lazy(__makeSchema_CourseUncheckedUpdateWithoutDepartmentInput_schema);


// File: CourseUncheckedUpdateManyWithoutDepartmentInput.schema.ts
const __makeSchema_CourseUncheckedUpdateManyWithoutDepartmentInput_schema = () => z.object({
  id: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  code: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameNo: z.union([z.string(), StringFieldUpdateOperationsInputObjectSchema]).optional(),
  nameEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  credits: z.union([z.number(), NullableFloatFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, EnumStudyLevelFieldUpdateOperationsInputObjectSchema]).optional(),
  gradeType: z.union([GradeTypeSchema, EnumGradeTypeFieldUpdateOperationsInputObjectSchema]).optional(),
  firstYearTaught: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  lastYearTaught: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  contentEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeNo: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  examTypeEn: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  candidateCount: z.union([z.number().int(), IntFieldUpdateOperationsInputObjectSchema]).optional(),
  averageGrade: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  passRate: z.union([z.number(), FloatFieldUpdateOperationsInputObjectSchema]).optional(),
  createdAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  updatedAt: z.union([z.coerce.date(), DateTimeFieldUpdateOperationsInputObjectSchema]).optional(),
  taughtSemesters: z.union([CourseUpdatetaughtSemestersInputObjectSchema, SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([CourseUpdateteachingLanguagesInputObjectSchema, TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([CourseUpdatecampusesInputObjectSchema, CampusSchema.array()]).optional(),
  facultyId: z.union([z.string(), NullableStringFieldUpdateOperationsInputObjectSchema]).optional().nullable(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), NullableIntFieldUpdateOperationsInputObjectSchema]).optional().nullable()
}).strict();
export const CourseUncheckedUpdateManyWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseUncheckedUpdateManyWithoutDepartmentInput> = z.lazy(__makeSchema_CourseUncheckedUpdateManyWithoutDepartmentInput_schema) as unknown as z.ZodType<Prisma.CourseUncheckedUpdateManyWithoutDepartmentInput>;
export const CourseUncheckedUpdateManyWithoutDepartmentInputObjectZodSchema = z.lazy(__makeSchema_CourseUncheckedUpdateManyWithoutDepartmentInput_schema);


// File: CourseCountAggregateInput.schema.ts
const __makeSchema_CourseCountAggregateInput_schema = () => z.object({
  id: z.literal(true).optional(),
  code: z.literal(true).optional(),
  nameNo: z.literal(true).optional(),
  nameEn: z.literal(true).optional(),
  credits: z.literal(true).optional(),
  studyLevel: z.literal(true).optional(),
  gradeType: z.literal(true).optional(),
  firstYearTaught: z.literal(true).optional(),
  lastYearTaught: z.literal(true).optional(),
  contentNo: z.literal(true).optional(),
  contentEn: z.literal(true).optional(),
  teachingMethodsNo: z.literal(true).optional(),
  teachingMethodsEn: z.literal(true).optional(),
  learningOutcomesNo: z.literal(true).optional(),
  learningOutcomesEn: z.literal(true).optional(),
  examTypeNo: z.literal(true).optional(),
  examTypeEn: z.literal(true).optional(),
  candidateCount: z.literal(true).optional(),
  averageGrade: z.literal(true).optional(),
  passRate: z.literal(true).optional(),
  createdAt: z.literal(true).optional(),
  updatedAt: z.literal(true).optional(),
  taughtSemesters: z.literal(true).optional(),
  teachingLanguages: z.literal(true).optional(),
  campuses: z.literal(true).optional(),
  facultyId: z.literal(true).optional(),
  departmentId: z.literal(true).optional(),
  latestYearCheckedForNtnuData: z.literal(true).optional(),
  _all: z.literal(true).optional()
}).strict();
export const CourseCountAggregateInputObjectSchema: z.ZodType<Prisma.CourseCountAggregateInputType> = z.lazy(__makeSchema_CourseCountAggregateInput_schema) as unknown as z.ZodType<Prisma.CourseCountAggregateInputType>;
export const CourseCountAggregateInputObjectZodSchema = z.lazy(__makeSchema_CourseCountAggregateInput_schema);


// File: CourseAvgAggregateInput.schema.ts
const __makeSchema_CourseAvgAggregateInput_schema = () => z.object({
  credits: z.literal(true).optional(),
  firstYearTaught: z.literal(true).optional(),
  lastYearTaught: z.literal(true).optional(),
  candidateCount: z.literal(true).optional(),
  averageGrade: z.literal(true).optional(),
  passRate: z.literal(true).optional(),
  latestYearCheckedForNtnuData: z.literal(true).optional()
}).strict();
export const CourseAvgAggregateInputObjectSchema: z.ZodType<Prisma.CourseAvgAggregateInputType> = z.lazy(__makeSchema_CourseAvgAggregateInput_schema) as unknown as z.ZodType<Prisma.CourseAvgAggregateInputType>;
export const CourseAvgAggregateInputObjectZodSchema = z.lazy(__makeSchema_CourseAvgAggregateInput_schema);


// File: CourseSumAggregateInput.schema.ts
const __makeSchema_CourseSumAggregateInput_schema = () => z.object({
  credits: z.literal(true).optional(),
  firstYearTaught: z.literal(true).optional(),
  lastYearTaught: z.literal(true).optional(),
  candidateCount: z.literal(true).optional(),
  averageGrade: z.literal(true).optional(),
  passRate: z.literal(true).optional(),
  latestYearCheckedForNtnuData: z.literal(true).optional()
}).strict();
export const CourseSumAggregateInputObjectSchema: z.ZodType<Prisma.CourseSumAggregateInputType> = z.lazy(__makeSchema_CourseSumAggregateInput_schema) as unknown as z.ZodType<Prisma.CourseSumAggregateInputType>;
export const CourseSumAggregateInputObjectZodSchema = z.lazy(__makeSchema_CourseSumAggregateInput_schema);


// File: CourseMinAggregateInput.schema.ts
const __makeSchema_CourseMinAggregateInput_schema = () => z.object({
  id: z.literal(true).optional(),
  code: z.literal(true).optional(),
  nameNo: z.literal(true).optional(),
  nameEn: z.literal(true).optional(),
  credits: z.literal(true).optional(),
  studyLevel: z.literal(true).optional(),
  gradeType: z.literal(true).optional(),
  firstYearTaught: z.literal(true).optional(),
  lastYearTaught: z.literal(true).optional(),
  contentNo: z.literal(true).optional(),
  contentEn: z.literal(true).optional(),
  teachingMethodsNo: z.literal(true).optional(),
  teachingMethodsEn: z.literal(true).optional(),
  learningOutcomesNo: z.literal(true).optional(),
  learningOutcomesEn: z.literal(true).optional(),
  examTypeNo: z.literal(true).optional(),
  examTypeEn: z.literal(true).optional(),
  candidateCount: z.literal(true).optional(),
  averageGrade: z.literal(true).optional(),
  passRate: z.literal(true).optional(),
  createdAt: z.literal(true).optional(),
  updatedAt: z.literal(true).optional(),
  facultyId: z.literal(true).optional(),
  departmentId: z.literal(true).optional(),
  latestYearCheckedForNtnuData: z.literal(true).optional()
}).strict();
export const CourseMinAggregateInputObjectSchema: z.ZodType<Prisma.CourseMinAggregateInputType> = z.lazy(__makeSchema_CourseMinAggregateInput_schema) as unknown as z.ZodType<Prisma.CourseMinAggregateInputType>;
export const CourseMinAggregateInputObjectZodSchema = z.lazy(__makeSchema_CourseMinAggregateInput_schema);


// File: CourseMaxAggregateInput.schema.ts
const __makeSchema_CourseMaxAggregateInput_schema = () => z.object({
  id: z.literal(true).optional(),
  code: z.literal(true).optional(),
  nameNo: z.literal(true).optional(),
  nameEn: z.literal(true).optional(),
  credits: z.literal(true).optional(),
  studyLevel: z.literal(true).optional(),
  gradeType: z.literal(true).optional(),
  firstYearTaught: z.literal(true).optional(),
  lastYearTaught: z.literal(true).optional(),
  contentNo: z.literal(true).optional(),
  contentEn: z.literal(true).optional(),
  teachingMethodsNo: z.literal(true).optional(),
  teachingMethodsEn: z.literal(true).optional(),
  learningOutcomesNo: z.literal(true).optional(),
  learningOutcomesEn: z.literal(true).optional(),
  examTypeNo: z.literal(true).optional(),
  examTypeEn: z.literal(true).optional(),
  candidateCount: z.literal(true).optional(),
  averageGrade: z.literal(true).optional(),
  passRate: z.literal(true).optional(),
  createdAt: z.literal(true).optional(),
  updatedAt: z.literal(true).optional(),
  facultyId: z.literal(true).optional(),
  departmentId: z.literal(true).optional(),
  latestYearCheckedForNtnuData: z.literal(true).optional()
}).strict();
export const CourseMaxAggregateInputObjectSchema: z.ZodType<Prisma.CourseMaxAggregateInputType> = z.lazy(__makeSchema_CourseMaxAggregateInput_schema) as unknown as z.ZodType<Prisma.CourseMaxAggregateInputType>;
export const CourseMaxAggregateInputObjectZodSchema = z.lazy(__makeSchema_CourseMaxAggregateInput_schema);


// File: GradeCountAggregateInput.schema.ts
const __makeSchema_GradeCountAggregateInput_schema = () => z.object({
  id: z.literal(true).optional(),
  gradeACount: z.literal(true).optional(),
  gradeBCount: z.literal(true).optional(),
  gradeCCount: z.literal(true).optional(),
  gradeDCount: z.literal(true).optional(),
  gradeECount: z.literal(true).optional(),
  gradeFCount: z.literal(true).optional(),
  passedCount: z.literal(true).optional(),
  failedCount: z.literal(true).optional(),
  courseId: z.literal(true).optional(),
  semester: z.literal(true).optional(),
  year: z.literal(true).optional(),
  createdAt: z.literal(true).optional(),
  updatedAt: z.literal(true).optional(),
  _all: z.literal(true).optional()
}).strict();
export const GradeCountAggregateInputObjectSchema: z.ZodType<Prisma.GradeCountAggregateInputType> = z.lazy(__makeSchema_GradeCountAggregateInput_schema) as unknown as z.ZodType<Prisma.GradeCountAggregateInputType>;
export const GradeCountAggregateInputObjectZodSchema = z.lazy(__makeSchema_GradeCountAggregateInput_schema);


// File: GradeAvgAggregateInput.schema.ts
const __makeSchema_GradeAvgAggregateInput_schema = () => z.object({
  gradeACount: z.literal(true).optional(),
  gradeBCount: z.literal(true).optional(),
  gradeCCount: z.literal(true).optional(),
  gradeDCount: z.literal(true).optional(),
  gradeECount: z.literal(true).optional(),
  gradeFCount: z.literal(true).optional(),
  passedCount: z.literal(true).optional(),
  failedCount: z.literal(true).optional(),
  year: z.literal(true).optional()
}).strict();
export const GradeAvgAggregateInputObjectSchema: z.ZodType<Prisma.GradeAvgAggregateInputType> = z.lazy(__makeSchema_GradeAvgAggregateInput_schema) as unknown as z.ZodType<Prisma.GradeAvgAggregateInputType>;
export const GradeAvgAggregateInputObjectZodSchema = z.lazy(__makeSchema_GradeAvgAggregateInput_schema);


// File: GradeSumAggregateInput.schema.ts
const __makeSchema_GradeSumAggregateInput_schema = () => z.object({
  gradeACount: z.literal(true).optional(),
  gradeBCount: z.literal(true).optional(),
  gradeCCount: z.literal(true).optional(),
  gradeDCount: z.literal(true).optional(),
  gradeECount: z.literal(true).optional(),
  gradeFCount: z.literal(true).optional(),
  passedCount: z.literal(true).optional(),
  failedCount: z.literal(true).optional(),
  year: z.literal(true).optional()
}).strict();
export const GradeSumAggregateInputObjectSchema: z.ZodType<Prisma.GradeSumAggregateInputType> = z.lazy(__makeSchema_GradeSumAggregateInput_schema) as unknown as z.ZodType<Prisma.GradeSumAggregateInputType>;
export const GradeSumAggregateInputObjectZodSchema = z.lazy(__makeSchema_GradeSumAggregateInput_schema);


// File: GradeMinAggregateInput.schema.ts
const __makeSchema_GradeMinAggregateInput_schema = () => z.object({
  id: z.literal(true).optional(),
  gradeACount: z.literal(true).optional(),
  gradeBCount: z.literal(true).optional(),
  gradeCCount: z.literal(true).optional(),
  gradeDCount: z.literal(true).optional(),
  gradeECount: z.literal(true).optional(),
  gradeFCount: z.literal(true).optional(),
  passedCount: z.literal(true).optional(),
  failedCount: z.literal(true).optional(),
  courseId: z.literal(true).optional(),
  semester: z.literal(true).optional(),
  year: z.literal(true).optional(),
  createdAt: z.literal(true).optional(),
  updatedAt: z.literal(true).optional()
}).strict();
export const GradeMinAggregateInputObjectSchema: z.ZodType<Prisma.GradeMinAggregateInputType> = z.lazy(__makeSchema_GradeMinAggregateInput_schema) as unknown as z.ZodType<Prisma.GradeMinAggregateInputType>;
export const GradeMinAggregateInputObjectZodSchema = z.lazy(__makeSchema_GradeMinAggregateInput_schema);


// File: GradeMaxAggregateInput.schema.ts
const __makeSchema_GradeMaxAggregateInput_schema = () => z.object({
  id: z.literal(true).optional(),
  gradeACount: z.literal(true).optional(),
  gradeBCount: z.literal(true).optional(),
  gradeCCount: z.literal(true).optional(),
  gradeDCount: z.literal(true).optional(),
  gradeECount: z.literal(true).optional(),
  gradeFCount: z.literal(true).optional(),
  passedCount: z.literal(true).optional(),
  failedCount: z.literal(true).optional(),
  courseId: z.literal(true).optional(),
  semester: z.literal(true).optional(),
  year: z.literal(true).optional(),
  createdAt: z.literal(true).optional(),
  updatedAt: z.literal(true).optional()
}).strict();
export const GradeMaxAggregateInputObjectSchema: z.ZodType<Prisma.GradeMaxAggregateInputType> = z.lazy(__makeSchema_GradeMaxAggregateInput_schema) as unknown as z.ZodType<Prisma.GradeMaxAggregateInputType>;
export const GradeMaxAggregateInputObjectZodSchema = z.lazy(__makeSchema_GradeMaxAggregateInput_schema);


// File: FacultyCountAggregateInput.schema.ts
const __makeSchema_FacultyCountAggregateInput_schema = () => z.object({
  id: z.literal(true).optional(),
  nameNo: z.literal(true).optional(),
  nameEn: z.literal(true).optional(),
  code: z.literal(true).optional(),
  _all: z.literal(true).optional()
}).strict();
export const FacultyCountAggregateInputObjectSchema: z.ZodType<Prisma.FacultyCountAggregateInputType> = z.lazy(__makeSchema_FacultyCountAggregateInput_schema) as unknown as z.ZodType<Prisma.FacultyCountAggregateInputType>;
export const FacultyCountAggregateInputObjectZodSchema = z.lazy(__makeSchema_FacultyCountAggregateInput_schema);


// File: FacultyAvgAggregateInput.schema.ts
const __makeSchema_FacultyAvgAggregateInput_schema = () => z.object({
  code: z.literal(true).optional()
}).strict();
export const FacultyAvgAggregateInputObjectSchema: z.ZodType<Prisma.FacultyAvgAggregateInputType> = z.lazy(__makeSchema_FacultyAvgAggregateInput_schema) as unknown as z.ZodType<Prisma.FacultyAvgAggregateInputType>;
export const FacultyAvgAggregateInputObjectZodSchema = z.lazy(__makeSchema_FacultyAvgAggregateInput_schema);


// File: FacultySumAggregateInput.schema.ts
const __makeSchema_FacultySumAggregateInput_schema = () => z.object({
  code: z.literal(true).optional()
}).strict();
export const FacultySumAggregateInputObjectSchema: z.ZodType<Prisma.FacultySumAggregateInputType> = z.lazy(__makeSchema_FacultySumAggregateInput_schema) as unknown as z.ZodType<Prisma.FacultySumAggregateInputType>;
export const FacultySumAggregateInputObjectZodSchema = z.lazy(__makeSchema_FacultySumAggregateInput_schema);


// File: FacultyMinAggregateInput.schema.ts
const __makeSchema_FacultyMinAggregateInput_schema = () => z.object({
  id: z.literal(true).optional(),
  nameNo: z.literal(true).optional(),
  nameEn: z.literal(true).optional(),
  code: z.literal(true).optional()
}).strict();
export const FacultyMinAggregateInputObjectSchema: z.ZodType<Prisma.FacultyMinAggregateInputType> = z.lazy(__makeSchema_FacultyMinAggregateInput_schema) as unknown as z.ZodType<Prisma.FacultyMinAggregateInputType>;
export const FacultyMinAggregateInputObjectZodSchema = z.lazy(__makeSchema_FacultyMinAggregateInput_schema);


// File: FacultyMaxAggregateInput.schema.ts
const __makeSchema_FacultyMaxAggregateInput_schema = () => z.object({
  id: z.literal(true).optional(),
  nameNo: z.literal(true).optional(),
  nameEn: z.literal(true).optional(),
  code: z.literal(true).optional()
}).strict();
export const FacultyMaxAggregateInputObjectSchema: z.ZodType<Prisma.FacultyMaxAggregateInputType> = z.lazy(__makeSchema_FacultyMaxAggregateInput_schema) as unknown as z.ZodType<Prisma.FacultyMaxAggregateInputType>;
export const FacultyMaxAggregateInputObjectZodSchema = z.lazy(__makeSchema_FacultyMaxAggregateInput_schema);


// File: DepartmentCountAggregateInput.schema.ts
const __makeSchema_DepartmentCountAggregateInput_schema = () => z.object({
  id: z.literal(true).optional(),
  nameNo: z.literal(true).optional(),
  nameEn: z.literal(true).optional(),
  code: z.literal(true).optional(),
  facultyId: z.literal(true).optional(),
  _all: z.literal(true).optional()
}).strict();
export const DepartmentCountAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentCountAggregateInputType> = z.lazy(__makeSchema_DepartmentCountAggregateInput_schema) as unknown as z.ZodType<Prisma.DepartmentCountAggregateInputType>;
export const DepartmentCountAggregateInputObjectZodSchema = z.lazy(__makeSchema_DepartmentCountAggregateInput_schema);


// File: DepartmentAvgAggregateInput.schema.ts
const __makeSchema_DepartmentAvgAggregateInput_schema = () => z.object({
  code: z.literal(true).optional()
}).strict();
export const DepartmentAvgAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentAvgAggregateInputType> = z.lazy(__makeSchema_DepartmentAvgAggregateInput_schema) as unknown as z.ZodType<Prisma.DepartmentAvgAggregateInputType>;
export const DepartmentAvgAggregateInputObjectZodSchema = z.lazy(__makeSchema_DepartmentAvgAggregateInput_schema);


// File: DepartmentSumAggregateInput.schema.ts
const __makeSchema_DepartmentSumAggregateInput_schema = () => z.object({
  code: z.literal(true).optional()
}).strict();
export const DepartmentSumAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentSumAggregateInputType> = z.lazy(__makeSchema_DepartmentSumAggregateInput_schema) as unknown as z.ZodType<Prisma.DepartmentSumAggregateInputType>;
export const DepartmentSumAggregateInputObjectZodSchema = z.lazy(__makeSchema_DepartmentSumAggregateInput_schema);


// File: DepartmentMinAggregateInput.schema.ts
const __makeSchema_DepartmentMinAggregateInput_schema = () => z.object({
  id: z.literal(true).optional(),
  nameNo: z.literal(true).optional(),
  nameEn: z.literal(true).optional(),
  code: z.literal(true).optional(),
  facultyId: z.literal(true).optional()
}).strict();
export const DepartmentMinAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentMinAggregateInputType> = z.lazy(__makeSchema_DepartmentMinAggregateInput_schema) as unknown as z.ZodType<Prisma.DepartmentMinAggregateInputType>;
export const DepartmentMinAggregateInputObjectZodSchema = z.lazy(__makeSchema_DepartmentMinAggregateInput_schema);


// File: DepartmentMaxAggregateInput.schema.ts
const __makeSchema_DepartmentMaxAggregateInput_schema = () => z.object({
  id: z.literal(true).optional(),
  nameNo: z.literal(true).optional(),
  nameEn: z.literal(true).optional(),
  code: z.literal(true).optional(),
  facultyId: z.literal(true).optional()
}).strict();
export const DepartmentMaxAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentMaxAggregateInputType> = z.lazy(__makeSchema_DepartmentMaxAggregateInput_schema) as unknown as z.ZodType<Prisma.DepartmentMaxAggregateInputType>;
export const DepartmentMaxAggregateInputObjectZodSchema = z.lazy(__makeSchema_DepartmentMaxAggregateInput_schema);


// File: CourseCountOutputTypeSelect.schema.ts
const __makeSchema_CourseCountOutputTypeSelect_schema = () => z.object({
  grades: z.union([z.boolean(), CourseCountOutputTypeCountGradesArgsObjectSchema]).optional()
}).strict();
export const CourseCountOutputTypeSelectObjectSchema: z.ZodType<Prisma.CourseCountOutputTypeSelect> = z.lazy(__makeSchema_CourseCountOutputTypeSelect_schema) as unknown as z.ZodType<Prisma.CourseCountOutputTypeSelect>;
export const CourseCountOutputTypeSelectObjectZodSchema = z.lazy(__makeSchema_CourseCountOutputTypeSelect_schema);


// File: FacultyCountOutputTypeSelect.schema.ts
const __makeSchema_FacultyCountOutputTypeSelect_schema = () => z.object({
  courses: z.union([z.boolean(), FacultyCountOutputTypeCountCoursesArgsObjectSchema]).optional(),
  departments: z.union([z.boolean(), FacultyCountOutputTypeCountDepartmentsArgsObjectSchema]).optional()
}).strict();
export const FacultyCountOutputTypeSelectObjectSchema: z.ZodType<Prisma.FacultyCountOutputTypeSelect> = z.lazy(__makeSchema_FacultyCountOutputTypeSelect_schema) as unknown as z.ZodType<Prisma.FacultyCountOutputTypeSelect>;
export const FacultyCountOutputTypeSelectObjectZodSchema = z.lazy(__makeSchema_FacultyCountOutputTypeSelect_schema);


// File: DepartmentCountOutputTypeSelect.schema.ts
const __makeSchema_DepartmentCountOutputTypeSelect_schema = () => z.object({
  courses: z.union([z.boolean(), DepartmentCountOutputTypeCountCoursesArgsObjectSchema]).optional()
}).strict();
export const DepartmentCountOutputTypeSelectObjectSchema: z.ZodType<Prisma.DepartmentCountOutputTypeSelect> = z.lazy(__makeSchema_DepartmentCountOutputTypeSelect_schema) as unknown as z.ZodType<Prisma.DepartmentCountOutputTypeSelect>;
export const DepartmentCountOutputTypeSelectObjectZodSchema = z.lazy(__makeSchema_DepartmentCountOutputTypeSelect_schema);


// File: CourseCountOutputTypeArgs.schema.ts
const __makeSchema_CourseCountOutputTypeArgs_schema = () => z.object({
  get select(){ return CourseCountOutputTypeSelectObjectSchema.optional(); }
}).strict();
export const CourseCountOutputTypeArgsObjectSchema = z.lazy(__makeSchema_CourseCountOutputTypeArgs_schema);
export const CourseCountOutputTypeArgsObjectZodSchema = z.lazy(__makeSchema_CourseCountOutputTypeArgs_schema);


// File: CourseCountOutputTypeCountGradesArgs.schema.ts
const __makeSchema_CourseCountOutputTypeCountGradesArgs_schema = () => z.object({
  get where(){ return GradeWhereInputObjectSchema.optional(); }
}).strict();
export const CourseCountOutputTypeCountGradesArgsObjectSchema = z.lazy(__makeSchema_CourseCountOutputTypeCountGradesArgs_schema);
export const CourseCountOutputTypeCountGradesArgsObjectZodSchema = z.lazy(__makeSchema_CourseCountOutputTypeCountGradesArgs_schema);


// File: FacultyCountOutputTypeArgs.schema.ts
const __makeSchema_FacultyCountOutputTypeArgs_schema = () => z.object({
  get select(){ return FacultyCountOutputTypeSelectObjectSchema.optional(); }
}).strict();
export const FacultyCountOutputTypeArgsObjectSchema = z.lazy(__makeSchema_FacultyCountOutputTypeArgs_schema);
export const FacultyCountOutputTypeArgsObjectZodSchema = z.lazy(__makeSchema_FacultyCountOutputTypeArgs_schema);


// File: FacultyCountOutputTypeCountCoursesArgs.schema.ts
const __makeSchema_FacultyCountOutputTypeCountCoursesArgs_schema = () => z.object({
  get where(){ return CourseWhereInputObjectSchema.optional(); }
}).strict();
export const FacultyCountOutputTypeCountCoursesArgsObjectSchema = z.lazy(__makeSchema_FacultyCountOutputTypeCountCoursesArgs_schema);
export const FacultyCountOutputTypeCountCoursesArgsObjectZodSchema = z.lazy(__makeSchema_FacultyCountOutputTypeCountCoursesArgs_schema);


// File: FacultyCountOutputTypeCountDepartmentsArgs.schema.ts
const __makeSchema_FacultyCountOutputTypeCountDepartmentsArgs_schema = () => z.object({
  get where(){ return DepartmentWhereInputObjectSchema.optional(); }
}).strict();
export const FacultyCountOutputTypeCountDepartmentsArgsObjectSchema = z.lazy(__makeSchema_FacultyCountOutputTypeCountDepartmentsArgs_schema);
export const FacultyCountOutputTypeCountDepartmentsArgsObjectZodSchema = z.lazy(__makeSchema_FacultyCountOutputTypeCountDepartmentsArgs_schema);


// File: DepartmentCountOutputTypeArgs.schema.ts
const __makeSchema_DepartmentCountOutputTypeArgs_schema = () => z.object({
  get select(){ return DepartmentCountOutputTypeSelectObjectSchema.optional(); }
}).strict();
export const DepartmentCountOutputTypeArgsObjectSchema = z.lazy(__makeSchema_DepartmentCountOutputTypeArgs_schema);
export const DepartmentCountOutputTypeArgsObjectZodSchema = z.lazy(__makeSchema_DepartmentCountOutputTypeArgs_schema);


// File: DepartmentCountOutputTypeCountCoursesArgs.schema.ts
const __makeSchema_DepartmentCountOutputTypeCountCoursesArgs_schema = () => z.object({
  get where(){ return CourseWhereInputObjectSchema.optional(); }
}).strict();
export const DepartmentCountOutputTypeCountCoursesArgsObjectSchema = z.lazy(__makeSchema_DepartmentCountOutputTypeCountCoursesArgs_schema);
export const DepartmentCountOutputTypeCountCoursesArgsObjectZodSchema = z.lazy(__makeSchema_DepartmentCountOutputTypeCountCoursesArgs_schema);


// File: CourseSelect.schema.ts
const __makeSchema_CourseSelect_schema = () => z.object({
  id: z.boolean().optional(),
  code: z.boolean().optional(),
  nameNo: z.boolean().optional(),
  nameEn: z.boolean().optional(),
  credits: z.boolean().optional(),
  studyLevel: z.boolean().optional(),
  gradeType: z.boolean().optional(),
  firstYearTaught: z.boolean().optional(),
  lastYearTaught: z.boolean().optional(),
  contentNo: z.boolean().optional(),
  contentEn: z.boolean().optional(),
  teachingMethodsNo: z.boolean().optional(),
  teachingMethodsEn: z.boolean().optional(),
  learningOutcomesNo: z.boolean().optional(),
  learningOutcomesEn: z.boolean().optional(),
  examTypeNo: z.boolean().optional(),
  examTypeEn: z.boolean().optional(),
  candidateCount: z.boolean().optional(),
  averageGrade: z.boolean().optional(),
  passRate: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  taughtSemesters: z.boolean().optional(),
  teachingLanguages: z.boolean().optional(),
  campuses: z.boolean().optional(),
  grades: z.union([z.boolean(), GradeFindManySchema]).optional(),
  facultyId: z.boolean().optional(),
  faculty: z.union([z.boolean(), FacultyArgsObjectSchema]).optional(),
  departmentId: z.boolean().optional(),
  department: z.union([z.boolean(), DepartmentArgsObjectSchema]).optional(),
  latestYearCheckedForNtnuData: z.boolean().optional(),
  _count: z.union([z.boolean(), CourseCountOutputTypeArgsObjectSchema]).optional()
}).strict();
export const CourseSelectObjectSchema: z.ZodType<Prisma.CourseSelect> = z.lazy(__makeSchema_CourseSelect_schema) as unknown as z.ZodType<Prisma.CourseSelect>;
export const CourseSelectObjectZodSchema = z.lazy(__makeSchema_CourseSelect_schema);


// File: GradeSelect.schema.ts
const __makeSchema_GradeSelect_schema = () => z.object({
  id: z.boolean().optional(),
  gradeACount: z.boolean().optional(),
  gradeBCount: z.boolean().optional(),
  gradeCCount: z.boolean().optional(),
  gradeDCount: z.boolean().optional(),
  gradeECount: z.boolean().optional(),
  gradeFCount: z.boolean().optional(),
  passedCount: z.boolean().optional(),
  failedCount: z.boolean().optional(),
  courseId: z.boolean().optional(),
  course: z.union([z.boolean(), CourseArgsObjectSchema]).optional(),
  semester: z.boolean().optional(),
  year: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional()
}).strict();
export const GradeSelectObjectSchema: z.ZodType<Prisma.GradeSelect> = z.lazy(__makeSchema_GradeSelect_schema) as unknown as z.ZodType<Prisma.GradeSelect>;
export const GradeSelectObjectZodSchema = z.lazy(__makeSchema_GradeSelect_schema);


// File: FacultySelect.schema.ts
const __makeSchema_FacultySelect_schema = () => z.object({
  id: z.boolean().optional(),
  nameNo: z.boolean().optional(),
  nameEn: z.boolean().optional(),
  code: z.boolean().optional(),
  courses: z.union([z.boolean(), CourseFindManySchema]).optional(),
  departments: z.union([z.boolean(), DepartmentFindManySchema]).optional(),
  _count: z.union([z.boolean(), FacultyCountOutputTypeArgsObjectSchema]).optional()
}).strict();
export const FacultySelectObjectSchema: z.ZodType<Prisma.FacultySelect> = z.lazy(__makeSchema_FacultySelect_schema) as unknown as z.ZodType<Prisma.FacultySelect>;
export const FacultySelectObjectZodSchema = z.lazy(__makeSchema_FacultySelect_schema);


// File: DepartmentSelect.schema.ts
const __makeSchema_DepartmentSelect_schema = () => z.object({
  id: z.boolean().optional(),
  nameNo: z.boolean().optional(),
  nameEn: z.boolean().optional(),
  code: z.boolean().optional(),
  courses: z.union([z.boolean(), CourseFindManySchema]).optional(),
  facultyId: z.boolean().optional(),
  faculty: z.union([z.boolean(), FacultyArgsObjectSchema]).optional(),
  _count: z.union([z.boolean(), DepartmentCountOutputTypeArgsObjectSchema]).optional()
}).strict();
export const DepartmentSelectObjectSchema: z.ZodType<Prisma.DepartmentSelect> = z.lazy(__makeSchema_DepartmentSelect_schema) as unknown as z.ZodType<Prisma.DepartmentSelect>;
export const DepartmentSelectObjectZodSchema = z.lazy(__makeSchema_DepartmentSelect_schema);


// File: CourseArgs.schema.ts
const __makeSchema_CourseArgs_schema = () => z.object({
  get select(){ return CourseSelectObjectSchema.optional(); },
  get include(){ return CourseIncludeObjectSchema.optional(); }
}).strict();
export const CourseArgsObjectSchema = z.lazy(__makeSchema_CourseArgs_schema);
export const CourseArgsObjectZodSchema = z.lazy(__makeSchema_CourseArgs_schema);


// File: GradeArgs.schema.ts
const __makeSchema_GradeArgs_schema = () => z.object({
  get select(){ return GradeSelectObjectSchema.optional(); },
  get include(){ return GradeIncludeObjectSchema.optional(); }
}).strict();
export const GradeArgsObjectSchema = z.lazy(__makeSchema_GradeArgs_schema);
export const GradeArgsObjectZodSchema = z.lazy(__makeSchema_GradeArgs_schema);


// File: FacultyArgs.schema.ts
const __makeSchema_FacultyArgs_schema = () => z.object({
  get select(){ return FacultySelectObjectSchema.optional(); },
  get include(){ return FacultyIncludeObjectSchema.optional(); }
}).strict();
export const FacultyArgsObjectSchema = z.lazy(__makeSchema_FacultyArgs_schema);
export const FacultyArgsObjectZodSchema = z.lazy(__makeSchema_FacultyArgs_schema);


// File: DepartmentArgs.schema.ts
const __makeSchema_DepartmentArgs_schema = () => z.object({
  get select(){ return DepartmentSelectObjectSchema.optional(); },
  get include(){ return DepartmentIncludeObjectSchema.optional(); }
}).strict();
export const DepartmentArgsObjectSchema = z.lazy(__makeSchema_DepartmentArgs_schema);
export const DepartmentArgsObjectZodSchema = z.lazy(__makeSchema_DepartmentArgs_schema);


// File: CourseInclude.schema.ts
const __makeSchema_CourseInclude_schema = () => z.object({
  grades: z.union([z.boolean(), GradeFindManySchema]).optional(),
  faculty: z.union([z.boolean(), FacultyArgsObjectSchema]).optional(),
  department: z.union([z.boolean(), DepartmentArgsObjectSchema]).optional(),
  _count: z.union([z.boolean(), CourseCountOutputTypeArgsObjectSchema]).optional()
}).strict();
export const CourseIncludeObjectSchema: z.ZodType<Prisma.CourseInclude> = z.lazy(__makeSchema_CourseInclude_schema) as unknown as z.ZodType<Prisma.CourseInclude>;
export const CourseIncludeObjectZodSchema = z.lazy(__makeSchema_CourseInclude_schema);


// File: GradeInclude.schema.ts
const __makeSchema_GradeInclude_schema = () => z.object({
  course: z.union([z.boolean(), CourseArgsObjectSchema]).optional()
}).strict();
export const GradeIncludeObjectSchema: z.ZodType<Prisma.GradeInclude> = z.lazy(__makeSchema_GradeInclude_schema) as unknown as z.ZodType<Prisma.GradeInclude>;
export const GradeIncludeObjectZodSchema = z.lazy(__makeSchema_GradeInclude_schema);


// File: FacultyInclude.schema.ts
const __makeSchema_FacultyInclude_schema = () => z.object({
  courses: z.union([z.boolean(), CourseFindManySchema]).optional(),
  departments: z.union([z.boolean(), DepartmentFindManySchema]).optional(),
  _count: z.union([z.boolean(), FacultyCountOutputTypeArgsObjectSchema]).optional()
}).strict();
export const FacultyIncludeObjectSchema: z.ZodType<Prisma.FacultyInclude> = z.lazy(__makeSchema_FacultyInclude_schema) as unknown as z.ZodType<Prisma.FacultyInclude>;
export const FacultyIncludeObjectZodSchema = z.lazy(__makeSchema_FacultyInclude_schema);


// File: DepartmentInclude.schema.ts
const __makeSchema_DepartmentInclude_schema = () => z.object({
  courses: z.union([z.boolean(), CourseFindManySchema]).optional(),
  faculty: z.union([z.boolean(), FacultyArgsObjectSchema]).optional(),
  _count: z.union([z.boolean(), DepartmentCountOutputTypeArgsObjectSchema]).optional()
}).strict();
export const DepartmentIncludeObjectSchema: z.ZodType<Prisma.DepartmentInclude> = z.lazy(__makeSchema_DepartmentInclude_schema) as unknown as z.ZodType<Prisma.DepartmentInclude>;
export const DepartmentIncludeObjectZodSchema = z.lazy(__makeSchema_DepartmentInclude_schema);


// File: findUniqueCourse.schema.ts

export const CourseFindUniqueSchema: z.ZodType<Prisma.CourseFindUniqueArgs> = z.object({ get select(){ return CourseSelectObjectSchema.optional(); }, get include(){ return CourseIncludeObjectSchema.optional(); }, where: CourseWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.CourseFindUniqueArgs>;

export const CourseFindUniqueZodSchema = z.object({ get select(){ return CourseSelectObjectSchema.optional(); }, get include(){ return CourseIncludeObjectSchema.optional(); }, where: CourseWhereUniqueInputObjectSchema }).strict();

// File: findUniqueOrThrowCourse.schema.ts

export const CourseFindUniqueOrThrowSchema: z.ZodType<Prisma.CourseFindUniqueOrThrowArgs> = z.object({ get select(){ return CourseSelectObjectSchema.optional(); }, get include(){ return CourseIncludeObjectSchema.optional(); }, where: CourseWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.CourseFindUniqueOrThrowArgs>;

export const CourseFindUniqueOrThrowZodSchema = z.object({ get select(){ return CourseSelectObjectSchema.optional(); }, get include(){ return CourseIncludeObjectSchema.optional(); }, where: CourseWhereUniqueInputObjectSchema }).strict();

// File: findFirstCourse.schema.ts

// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const CourseFindFirstSelectSchema__findFirstCourse_schema: z.ZodType<Prisma.CourseSelect> = z.object({
    id: z.boolean().optional(),
    code: z.boolean().optional(),
    nameNo: z.boolean().optional(),
    nameEn: z.boolean().optional(),
    credits: z.boolean().optional(),
    studyLevel: z.boolean().optional(),
    gradeType: z.boolean().optional(),
    firstYearTaught: z.boolean().optional(),
    lastYearTaught: z.boolean().optional(),
    contentNo: z.boolean().optional(),
    contentEn: z.boolean().optional(),
    teachingMethodsNo: z.boolean().optional(),
    teachingMethodsEn: z.boolean().optional(),
    learningOutcomesNo: z.boolean().optional(),
    learningOutcomesEn: z.boolean().optional(),
    examTypeNo: z.boolean().optional(),
    examTypeEn: z.boolean().optional(),
    candidateCount: z.boolean().optional(),
    averageGrade: z.boolean().optional(),
    passRate: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    taughtSemesters: z.boolean().optional(),
    teachingLanguages: z.boolean().optional(),
    campuses: z.boolean().optional(),
    grades: z.boolean().optional(),
    facultyId: z.boolean().optional(),
    faculty: z.boolean().optional(),
    departmentId: z.boolean().optional(),
    department: z.boolean().optional(),
    latestYearCheckedForNtnuData: z.boolean().optional(),
    _count: z.boolean().optional()
  }).strict() as unknown as z.ZodType<Prisma.CourseSelect>;

export const CourseFindFirstSelectZodSchema__findFirstCourse_schema = z.object({
    id: z.boolean().optional(),
    code: z.boolean().optional(),
    nameNo: z.boolean().optional(),
    nameEn: z.boolean().optional(),
    credits: z.boolean().optional(),
    studyLevel: z.boolean().optional(),
    gradeType: z.boolean().optional(),
    firstYearTaught: z.boolean().optional(),
    lastYearTaught: z.boolean().optional(),
    contentNo: z.boolean().optional(),
    contentEn: z.boolean().optional(),
    teachingMethodsNo: z.boolean().optional(),
    teachingMethodsEn: z.boolean().optional(),
    learningOutcomesNo: z.boolean().optional(),
    learningOutcomesEn: z.boolean().optional(),
    examTypeNo: z.boolean().optional(),
    examTypeEn: z.boolean().optional(),
    candidateCount: z.boolean().optional(),
    averageGrade: z.boolean().optional(),
    passRate: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    taughtSemesters: z.boolean().optional(),
    teachingLanguages: z.boolean().optional(),
    campuses: z.boolean().optional(),
    grades: z.boolean().optional(),
    facultyId: z.boolean().optional(),
    faculty: z.boolean().optional(),
    departmentId: z.boolean().optional(),
    department: z.boolean().optional(),
    latestYearCheckedForNtnuData: z.boolean().optional(),
    _count: z.boolean().optional()
  }).strict();

export const CourseFindFirstSchema: z.ZodType<Prisma.CourseFindFirstArgs> = z.object({ get select(){ return CourseFindFirstSelectSchema__findFirstCourse_schema.optional(); }, get include(){ return CourseIncludeObjectSchema.optional(); }, orderBy: z.union([CourseOrderByWithRelationInputObjectSchema, CourseOrderByWithRelationInputObjectSchema.array()]).optional(), where: CourseWhereInputObjectSchema.optional(), cursor: CourseWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([CourseScalarFieldEnumSchema, CourseScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.CourseFindFirstArgs>;

export const CourseFindFirstZodSchema = z.object({ get select(){ return CourseFindFirstSelectSchema__findFirstCourse_schema.optional(); }, get include(){ return CourseIncludeObjectSchema.optional(); }, orderBy: z.union([CourseOrderByWithRelationInputObjectSchema, CourseOrderByWithRelationInputObjectSchema.array()]).optional(), where: CourseWhereInputObjectSchema.optional(), cursor: CourseWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([CourseScalarFieldEnumSchema, CourseScalarFieldEnumSchema.array()]).optional() }).strict();

// File: findFirstOrThrowCourse.schema.ts

// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const CourseFindFirstOrThrowSelectSchema__findFirstOrThrowCourse_schema: z.ZodType<Prisma.CourseSelect> = z.object({
    id: z.boolean().optional(),
    code: z.boolean().optional(),
    nameNo: z.boolean().optional(),
    nameEn: z.boolean().optional(),
    credits: z.boolean().optional(),
    studyLevel: z.boolean().optional(),
    gradeType: z.boolean().optional(),
    firstYearTaught: z.boolean().optional(),
    lastYearTaught: z.boolean().optional(),
    contentNo: z.boolean().optional(),
    contentEn: z.boolean().optional(),
    teachingMethodsNo: z.boolean().optional(),
    teachingMethodsEn: z.boolean().optional(),
    learningOutcomesNo: z.boolean().optional(),
    learningOutcomesEn: z.boolean().optional(),
    examTypeNo: z.boolean().optional(),
    examTypeEn: z.boolean().optional(),
    candidateCount: z.boolean().optional(),
    averageGrade: z.boolean().optional(),
    passRate: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    taughtSemesters: z.boolean().optional(),
    teachingLanguages: z.boolean().optional(),
    campuses: z.boolean().optional(),
    grades: z.boolean().optional(),
    facultyId: z.boolean().optional(),
    faculty: z.boolean().optional(),
    departmentId: z.boolean().optional(),
    department: z.boolean().optional(),
    latestYearCheckedForNtnuData: z.boolean().optional(),
    _count: z.boolean().optional()
  }).strict() as unknown as z.ZodType<Prisma.CourseSelect>;

export const CourseFindFirstOrThrowSelectZodSchema__findFirstOrThrowCourse_schema = z.object({
    id: z.boolean().optional(),
    code: z.boolean().optional(),
    nameNo: z.boolean().optional(),
    nameEn: z.boolean().optional(),
    credits: z.boolean().optional(),
    studyLevel: z.boolean().optional(),
    gradeType: z.boolean().optional(),
    firstYearTaught: z.boolean().optional(),
    lastYearTaught: z.boolean().optional(),
    contentNo: z.boolean().optional(),
    contentEn: z.boolean().optional(),
    teachingMethodsNo: z.boolean().optional(),
    teachingMethodsEn: z.boolean().optional(),
    learningOutcomesNo: z.boolean().optional(),
    learningOutcomesEn: z.boolean().optional(),
    examTypeNo: z.boolean().optional(),
    examTypeEn: z.boolean().optional(),
    candidateCount: z.boolean().optional(),
    averageGrade: z.boolean().optional(),
    passRate: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    taughtSemesters: z.boolean().optional(),
    teachingLanguages: z.boolean().optional(),
    campuses: z.boolean().optional(),
    grades: z.boolean().optional(),
    facultyId: z.boolean().optional(),
    faculty: z.boolean().optional(),
    departmentId: z.boolean().optional(),
    department: z.boolean().optional(),
    latestYearCheckedForNtnuData: z.boolean().optional(),
    _count: z.boolean().optional()
  }).strict();

export const CourseFindFirstOrThrowSchema: z.ZodType<Prisma.CourseFindFirstOrThrowArgs> = z.object({ get select(){ return CourseFindFirstOrThrowSelectSchema__findFirstOrThrowCourse_schema.optional(); }, get include(){ return CourseIncludeObjectSchema.optional(); }, orderBy: z.union([CourseOrderByWithRelationInputObjectSchema, CourseOrderByWithRelationInputObjectSchema.array()]).optional(), where: CourseWhereInputObjectSchema.optional(), cursor: CourseWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([CourseScalarFieldEnumSchema, CourseScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.CourseFindFirstOrThrowArgs>;

export const CourseFindFirstOrThrowZodSchema = z.object({ get select(){ return CourseFindFirstOrThrowSelectSchema__findFirstOrThrowCourse_schema.optional(); }, get include(){ return CourseIncludeObjectSchema.optional(); }, orderBy: z.union([CourseOrderByWithRelationInputObjectSchema, CourseOrderByWithRelationInputObjectSchema.array()]).optional(), where: CourseWhereInputObjectSchema.optional(), cursor: CourseWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([CourseScalarFieldEnumSchema, CourseScalarFieldEnumSchema.array()]).optional() }).strict();

// File: findManyCourse.schema.ts

// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const CourseFindManySelectSchema__findManyCourse_schema: z.ZodType<Prisma.CourseSelect> = z.object({
    id: z.boolean().optional(),
    code: z.boolean().optional(),
    nameNo: z.boolean().optional(),
    nameEn: z.boolean().optional(),
    credits: z.boolean().optional(),
    studyLevel: z.boolean().optional(),
    gradeType: z.boolean().optional(),
    firstYearTaught: z.boolean().optional(),
    lastYearTaught: z.boolean().optional(),
    contentNo: z.boolean().optional(),
    contentEn: z.boolean().optional(),
    teachingMethodsNo: z.boolean().optional(),
    teachingMethodsEn: z.boolean().optional(),
    learningOutcomesNo: z.boolean().optional(),
    learningOutcomesEn: z.boolean().optional(),
    examTypeNo: z.boolean().optional(),
    examTypeEn: z.boolean().optional(),
    candidateCount: z.boolean().optional(),
    averageGrade: z.boolean().optional(),
    passRate: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    taughtSemesters: z.boolean().optional(),
    teachingLanguages: z.boolean().optional(),
    campuses: z.boolean().optional(),
    grades: z.boolean().optional(),
    facultyId: z.boolean().optional(),
    faculty: z.boolean().optional(),
    departmentId: z.boolean().optional(),
    department: z.boolean().optional(),
    latestYearCheckedForNtnuData: z.boolean().optional(),
    _count: z.boolean().optional()
  }).strict() as unknown as z.ZodType<Prisma.CourseSelect>;

export const CourseFindManySelectZodSchema__findManyCourse_schema = z.object({
    id: z.boolean().optional(),
    code: z.boolean().optional(),
    nameNo: z.boolean().optional(),
    nameEn: z.boolean().optional(),
    credits: z.boolean().optional(),
    studyLevel: z.boolean().optional(),
    gradeType: z.boolean().optional(),
    firstYearTaught: z.boolean().optional(),
    lastYearTaught: z.boolean().optional(),
    contentNo: z.boolean().optional(),
    contentEn: z.boolean().optional(),
    teachingMethodsNo: z.boolean().optional(),
    teachingMethodsEn: z.boolean().optional(),
    learningOutcomesNo: z.boolean().optional(),
    learningOutcomesEn: z.boolean().optional(),
    examTypeNo: z.boolean().optional(),
    examTypeEn: z.boolean().optional(),
    candidateCount: z.boolean().optional(),
    averageGrade: z.boolean().optional(),
    passRate: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    taughtSemesters: z.boolean().optional(),
    teachingLanguages: z.boolean().optional(),
    campuses: z.boolean().optional(),
    grades: z.boolean().optional(),
    facultyId: z.boolean().optional(),
    faculty: z.boolean().optional(),
    departmentId: z.boolean().optional(),
    department: z.boolean().optional(),
    latestYearCheckedForNtnuData: z.boolean().optional(),
    _count: z.boolean().optional()
  }).strict();

export const CourseFindManySchema: z.ZodType<Prisma.CourseFindManyArgs> = z.object({ get select(){ return CourseFindManySelectSchema__findManyCourse_schema.optional(); }, get include(){ return CourseIncludeObjectSchema.optional(); }, orderBy: z.union([CourseOrderByWithRelationInputObjectSchema, CourseOrderByWithRelationInputObjectSchema.array()]).optional(), where: CourseWhereInputObjectSchema.optional(), cursor: CourseWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([CourseScalarFieldEnumSchema, CourseScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.CourseFindManyArgs>;

export const CourseFindManyZodSchema = z.object({ get select(){ return CourseFindManySelectSchema__findManyCourse_schema.optional(); }, get include(){ return CourseIncludeObjectSchema.optional(); }, orderBy: z.union([CourseOrderByWithRelationInputObjectSchema, CourseOrderByWithRelationInputObjectSchema.array()]).optional(), where: CourseWhereInputObjectSchema.optional(), cursor: CourseWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([CourseScalarFieldEnumSchema, CourseScalarFieldEnumSchema.array()]).optional() }).strict();

// File: countCourse.schema.ts

export const CourseCountSchema: z.ZodType<Prisma.CourseCountArgs> = z.object({ orderBy: z.union([CourseOrderByWithRelationInputObjectSchema, CourseOrderByWithRelationInputObjectSchema.array()]).optional(), where: CourseWhereInputObjectSchema.optional(), cursor: CourseWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), select: z.union([ z.literal(true), CourseCountAggregateInputObjectSchema ]).optional() }).strict() as unknown as z.ZodType<Prisma.CourseCountArgs>;

export const CourseCountZodSchema = z.object({ orderBy: z.union([CourseOrderByWithRelationInputObjectSchema, CourseOrderByWithRelationInputObjectSchema.array()]).optional(), where: CourseWhereInputObjectSchema.optional(), cursor: CourseWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), select: z.union([ z.literal(true), CourseCountAggregateInputObjectSchema ]).optional() }).strict();

// File: createOneCourse.schema.ts

export const CourseCreateOneSchema: z.ZodType<Prisma.CourseCreateArgs> = z.object({ get select(){ return CourseSelectObjectSchema.optional(); }, get include(){ return CourseIncludeObjectSchema.optional(); }, data: z.union([CourseCreateInputObjectSchema, CourseUncheckedCreateInputObjectSchema]) }).strict() as unknown as z.ZodType<Prisma.CourseCreateArgs>;

export const CourseCreateOneZodSchema = z.object({ get select(){ return CourseSelectObjectSchema.optional(); }, get include(){ return CourseIncludeObjectSchema.optional(); }, data: z.union([CourseCreateInputObjectSchema, CourseUncheckedCreateInputObjectSchema]) }).strict();

// File: createManyCourse.schema.ts

export const CourseCreateManySchema: z.ZodType<Prisma.CourseCreateManyArgs> = z.object({ data: z.union([ CourseCreateManyInputObjectSchema, z.array(CourseCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict() as unknown as z.ZodType<Prisma.CourseCreateManyArgs>;

export const CourseCreateManyZodSchema = z.object({ data: z.union([ CourseCreateManyInputObjectSchema, z.array(CourseCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict();

// File: createManyAndReturnCourse.schema.ts

export const CourseCreateManyAndReturnSchema: z.ZodType<Prisma.CourseCreateManyAndReturnArgs> = z.object({ get select(){ return CourseSelectObjectSchema.optional(); }, data: z.union([ CourseCreateManyInputObjectSchema, z.array(CourseCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict() as unknown as z.ZodType<Prisma.CourseCreateManyAndReturnArgs>;

export const CourseCreateManyAndReturnZodSchema = z.object({ get select(){ return CourseSelectObjectSchema.optional(); }, data: z.union([ CourseCreateManyInputObjectSchema, z.array(CourseCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict();

// File: deleteOneCourse.schema.ts

export const CourseDeleteOneSchema: z.ZodType<Prisma.CourseDeleteArgs> = z.object({ get select(){ return CourseSelectObjectSchema.optional(); }, get include(){ return CourseIncludeObjectSchema.optional(); }, where: CourseWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.CourseDeleteArgs>;

export const CourseDeleteOneZodSchema = z.object({ get select(){ return CourseSelectObjectSchema.optional(); }, get include(){ return CourseIncludeObjectSchema.optional(); }, where: CourseWhereUniqueInputObjectSchema }).strict();

// File: deleteManyCourse.schema.ts

export const CourseDeleteManySchema: z.ZodType<Prisma.CourseDeleteManyArgs> = z.object({ where: CourseWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.CourseDeleteManyArgs>;

export const CourseDeleteManyZodSchema = z.object({ where: CourseWhereInputObjectSchema.optional() }).strict();

// File: updateOneCourse.schema.ts

export const CourseUpdateOneSchema: z.ZodType<Prisma.CourseUpdateArgs> = z.object({ get select(){ return CourseSelectObjectSchema.optional(); }, get include(){ return CourseIncludeObjectSchema.optional(); }, data: z.union([CourseUpdateInputObjectSchema, CourseUncheckedUpdateInputObjectSchema]), where: CourseWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.CourseUpdateArgs>;

export const CourseUpdateOneZodSchema = z.object({ get select(){ return CourseSelectObjectSchema.optional(); }, get include(){ return CourseIncludeObjectSchema.optional(); }, data: z.union([CourseUpdateInputObjectSchema, CourseUncheckedUpdateInputObjectSchema]), where: CourseWhereUniqueInputObjectSchema }).strict();

// File: updateManyCourse.schema.ts

export const CourseUpdateManySchema: z.ZodType<Prisma.CourseUpdateManyArgs> = z.object({ data: CourseUpdateManyMutationInputObjectSchema, where: CourseWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.CourseUpdateManyArgs>;

export const CourseUpdateManyZodSchema = z.object({ data: CourseUpdateManyMutationInputObjectSchema, where: CourseWhereInputObjectSchema.optional() }).strict();

// File: updateManyAndReturnCourse.schema.ts

export const CourseUpdateManyAndReturnSchema: z.ZodType<Prisma.CourseUpdateManyAndReturnArgs> = z.object({ get select(){ return CourseSelectObjectSchema.optional(); }, data: CourseUpdateManyMutationInputObjectSchema, where: CourseWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.CourseUpdateManyAndReturnArgs>;

export const CourseUpdateManyAndReturnZodSchema = z.object({ get select(){ return CourseSelectObjectSchema.optional(); }, data: CourseUpdateManyMutationInputObjectSchema, where: CourseWhereInputObjectSchema.optional() }).strict();

// File: upsertOneCourse.schema.ts

export const CourseUpsertOneSchema: z.ZodType<Prisma.CourseUpsertArgs> = z.object({ get select(){ return CourseSelectObjectSchema.optional(); }, get include(){ return CourseIncludeObjectSchema.optional(); }, where: CourseWhereUniqueInputObjectSchema, create: z.union([ CourseCreateInputObjectSchema, CourseUncheckedCreateInputObjectSchema ]), update: z.union([ CourseUpdateInputObjectSchema, CourseUncheckedUpdateInputObjectSchema ]) }).strict() as unknown as z.ZodType<Prisma.CourseUpsertArgs>;

export const CourseUpsertOneZodSchema = z.object({ get select(){ return CourseSelectObjectSchema.optional(); }, get include(){ return CourseIncludeObjectSchema.optional(); }, where: CourseWhereUniqueInputObjectSchema, create: z.union([ CourseCreateInputObjectSchema, CourseUncheckedCreateInputObjectSchema ]), update: z.union([ CourseUpdateInputObjectSchema, CourseUncheckedUpdateInputObjectSchema ]) }).strict();

// File: aggregateCourse.schema.ts

export const CourseAggregateSchema: z.ZodType<Prisma.CourseAggregateArgs> = z.object({ orderBy: z.union([CourseOrderByWithRelationInputObjectSchema, CourseOrderByWithRelationInputObjectSchema.array()]).optional(), where: CourseWhereInputObjectSchema.optional(), cursor: CourseWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), _count: z.union([ z.literal(true), CourseCountAggregateInputObjectSchema ]).optional(), _min: CourseMinAggregateInputObjectSchema.optional(), _max: CourseMaxAggregateInputObjectSchema.optional(), _avg: CourseAvgAggregateInputObjectSchema.optional(), _sum: CourseSumAggregateInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.CourseAggregateArgs>;

export const CourseAggregateZodSchema = z.object({ orderBy: z.union([CourseOrderByWithRelationInputObjectSchema, CourseOrderByWithRelationInputObjectSchema.array()]).optional(), where: CourseWhereInputObjectSchema.optional(), cursor: CourseWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), _count: z.union([ z.literal(true), CourseCountAggregateInputObjectSchema ]).optional(), _min: CourseMinAggregateInputObjectSchema.optional(), _max: CourseMaxAggregateInputObjectSchema.optional(), _avg: CourseAvgAggregateInputObjectSchema.optional(), _sum: CourseSumAggregateInputObjectSchema.optional() }).strict();

// File: groupByCourse.schema.ts

export const CourseGroupBySchema: z.ZodType<Prisma.CourseGroupByArgs> = z.object({ where: CourseWhereInputObjectSchema.optional(), orderBy: z.union([CourseOrderByWithAggregationInputObjectSchema, CourseOrderByWithAggregationInputObjectSchema.array()]).optional(), having: CourseScalarWhereWithAggregatesInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), by: z.array(CourseScalarFieldEnumSchema), _count: z.union([ z.literal(true), CourseCountAggregateInputObjectSchema ]).optional(), _min: CourseMinAggregateInputObjectSchema.optional(), _max: CourseMaxAggregateInputObjectSchema.optional(), _avg: CourseAvgAggregateInputObjectSchema.optional(), _sum: CourseSumAggregateInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.CourseGroupByArgs>;

export const CourseGroupByZodSchema = z.object({ where: CourseWhereInputObjectSchema.optional(), orderBy: z.union([CourseOrderByWithAggregationInputObjectSchema, CourseOrderByWithAggregationInputObjectSchema.array()]).optional(), having: CourseScalarWhereWithAggregatesInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), by: z.array(CourseScalarFieldEnumSchema), _count: z.union([ z.literal(true), CourseCountAggregateInputObjectSchema ]).optional(), _min: CourseMinAggregateInputObjectSchema.optional(), _max: CourseMaxAggregateInputObjectSchema.optional(), _avg: CourseAvgAggregateInputObjectSchema.optional(), _sum: CourseSumAggregateInputObjectSchema.optional() }).strict();

// File: findUniqueGrade.schema.ts

export const GradeFindUniqueSchema: z.ZodType<Prisma.GradeFindUniqueArgs> = z.object({ get select(){ return GradeSelectObjectSchema.optional(); }, get include(){ return GradeIncludeObjectSchema.optional(); }, where: GradeWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.GradeFindUniqueArgs>;

export const GradeFindUniqueZodSchema = z.object({ get select(){ return GradeSelectObjectSchema.optional(); }, get include(){ return GradeIncludeObjectSchema.optional(); }, where: GradeWhereUniqueInputObjectSchema }).strict();

// File: findUniqueOrThrowGrade.schema.ts

export const GradeFindUniqueOrThrowSchema: z.ZodType<Prisma.GradeFindUniqueOrThrowArgs> = z.object({ get select(){ return GradeSelectObjectSchema.optional(); }, get include(){ return GradeIncludeObjectSchema.optional(); }, where: GradeWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.GradeFindUniqueOrThrowArgs>;

export const GradeFindUniqueOrThrowZodSchema = z.object({ get select(){ return GradeSelectObjectSchema.optional(); }, get include(){ return GradeIncludeObjectSchema.optional(); }, where: GradeWhereUniqueInputObjectSchema }).strict();

// File: findFirstGrade.schema.ts

// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const GradeFindFirstSelectSchema__findFirstGrade_schema: z.ZodType<Prisma.GradeSelect> = z.object({
    id: z.boolean().optional(),
    gradeACount: z.boolean().optional(),
    gradeBCount: z.boolean().optional(),
    gradeCCount: z.boolean().optional(),
    gradeDCount: z.boolean().optional(),
    gradeECount: z.boolean().optional(),
    gradeFCount: z.boolean().optional(),
    passedCount: z.boolean().optional(),
    failedCount: z.boolean().optional(),
    courseId: z.boolean().optional(),
    course: z.boolean().optional(),
    semester: z.boolean().optional(),
    year: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional()
  }).strict() as unknown as z.ZodType<Prisma.GradeSelect>;

export const GradeFindFirstSelectZodSchema__findFirstGrade_schema = z.object({
    id: z.boolean().optional(),
    gradeACount: z.boolean().optional(),
    gradeBCount: z.boolean().optional(),
    gradeCCount: z.boolean().optional(),
    gradeDCount: z.boolean().optional(),
    gradeECount: z.boolean().optional(),
    gradeFCount: z.boolean().optional(),
    passedCount: z.boolean().optional(),
    failedCount: z.boolean().optional(),
    courseId: z.boolean().optional(),
    course: z.boolean().optional(),
    semester: z.boolean().optional(),
    year: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional()
  }).strict();

export const GradeFindFirstSchema: z.ZodType<Prisma.GradeFindFirstArgs> = z.object({ get select(){ return GradeFindFirstSelectSchema__findFirstGrade_schema.optional(); }, get include(){ return GradeIncludeObjectSchema.optional(); }, orderBy: z.union([GradeOrderByWithRelationInputObjectSchema, GradeOrderByWithRelationInputObjectSchema.array()]).optional(), where: GradeWhereInputObjectSchema.optional(), cursor: GradeWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([GradeScalarFieldEnumSchema, GradeScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.GradeFindFirstArgs>;

export const GradeFindFirstZodSchema = z.object({ get select(){ return GradeFindFirstSelectSchema__findFirstGrade_schema.optional(); }, get include(){ return GradeIncludeObjectSchema.optional(); }, orderBy: z.union([GradeOrderByWithRelationInputObjectSchema, GradeOrderByWithRelationInputObjectSchema.array()]).optional(), where: GradeWhereInputObjectSchema.optional(), cursor: GradeWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([GradeScalarFieldEnumSchema, GradeScalarFieldEnumSchema.array()]).optional() }).strict();

// File: findFirstOrThrowGrade.schema.ts

// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const GradeFindFirstOrThrowSelectSchema__findFirstOrThrowGrade_schema: z.ZodType<Prisma.GradeSelect> = z.object({
    id: z.boolean().optional(),
    gradeACount: z.boolean().optional(),
    gradeBCount: z.boolean().optional(),
    gradeCCount: z.boolean().optional(),
    gradeDCount: z.boolean().optional(),
    gradeECount: z.boolean().optional(),
    gradeFCount: z.boolean().optional(),
    passedCount: z.boolean().optional(),
    failedCount: z.boolean().optional(),
    courseId: z.boolean().optional(),
    course: z.boolean().optional(),
    semester: z.boolean().optional(),
    year: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional()
  }).strict() as unknown as z.ZodType<Prisma.GradeSelect>;

export const GradeFindFirstOrThrowSelectZodSchema__findFirstOrThrowGrade_schema = z.object({
    id: z.boolean().optional(),
    gradeACount: z.boolean().optional(),
    gradeBCount: z.boolean().optional(),
    gradeCCount: z.boolean().optional(),
    gradeDCount: z.boolean().optional(),
    gradeECount: z.boolean().optional(),
    gradeFCount: z.boolean().optional(),
    passedCount: z.boolean().optional(),
    failedCount: z.boolean().optional(),
    courseId: z.boolean().optional(),
    course: z.boolean().optional(),
    semester: z.boolean().optional(),
    year: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional()
  }).strict();

export const GradeFindFirstOrThrowSchema: z.ZodType<Prisma.GradeFindFirstOrThrowArgs> = z.object({ get select(){ return GradeFindFirstOrThrowSelectSchema__findFirstOrThrowGrade_schema.optional(); }, get include(){ return GradeIncludeObjectSchema.optional(); }, orderBy: z.union([GradeOrderByWithRelationInputObjectSchema, GradeOrderByWithRelationInputObjectSchema.array()]).optional(), where: GradeWhereInputObjectSchema.optional(), cursor: GradeWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([GradeScalarFieldEnumSchema, GradeScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.GradeFindFirstOrThrowArgs>;

export const GradeFindFirstOrThrowZodSchema = z.object({ get select(){ return GradeFindFirstOrThrowSelectSchema__findFirstOrThrowGrade_schema.optional(); }, get include(){ return GradeIncludeObjectSchema.optional(); }, orderBy: z.union([GradeOrderByWithRelationInputObjectSchema, GradeOrderByWithRelationInputObjectSchema.array()]).optional(), where: GradeWhereInputObjectSchema.optional(), cursor: GradeWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([GradeScalarFieldEnumSchema, GradeScalarFieldEnumSchema.array()]).optional() }).strict();

// File: findManyGrade.schema.ts

// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const GradeFindManySelectSchema__findManyGrade_schema: z.ZodType<Prisma.GradeSelect> = z.object({
    id: z.boolean().optional(),
    gradeACount: z.boolean().optional(),
    gradeBCount: z.boolean().optional(),
    gradeCCount: z.boolean().optional(),
    gradeDCount: z.boolean().optional(),
    gradeECount: z.boolean().optional(),
    gradeFCount: z.boolean().optional(),
    passedCount: z.boolean().optional(),
    failedCount: z.boolean().optional(),
    courseId: z.boolean().optional(),
    course: z.boolean().optional(),
    semester: z.boolean().optional(),
    year: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional()
  }).strict() as unknown as z.ZodType<Prisma.GradeSelect>;

export const GradeFindManySelectZodSchema__findManyGrade_schema = z.object({
    id: z.boolean().optional(),
    gradeACount: z.boolean().optional(),
    gradeBCount: z.boolean().optional(),
    gradeCCount: z.boolean().optional(),
    gradeDCount: z.boolean().optional(),
    gradeECount: z.boolean().optional(),
    gradeFCount: z.boolean().optional(),
    passedCount: z.boolean().optional(),
    failedCount: z.boolean().optional(),
    courseId: z.boolean().optional(),
    course: z.boolean().optional(),
    semester: z.boolean().optional(),
    year: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional()
  }).strict();

export const GradeFindManySchema: z.ZodType<Prisma.GradeFindManyArgs> = z.object({ get select(){ return GradeFindManySelectSchema__findManyGrade_schema.optional(); }, get include(){ return GradeIncludeObjectSchema.optional(); }, orderBy: z.union([GradeOrderByWithRelationInputObjectSchema, GradeOrderByWithRelationInputObjectSchema.array()]).optional(), where: GradeWhereInputObjectSchema.optional(), cursor: GradeWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([GradeScalarFieldEnumSchema, GradeScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.GradeFindManyArgs>;

export const GradeFindManyZodSchema = z.object({ get select(){ return GradeFindManySelectSchema__findManyGrade_schema.optional(); }, get include(){ return GradeIncludeObjectSchema.optional(); }, orderBy: z.union([GradeOrderByWithRelationInputObjectSchema, GradeOrderByWithRelationInputObjectSchema.array()]).optional(), where: GradeWhereInputObjectSchema.optional(), cursor: GradeWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([GradeScalarFieldEnumSchema, GradeScalarFieldEnumSchema.array()]).optional() }).strict();

// File: countGrade.schema.ts

export const GradeCountSchema: z.ZodType<Prisma.GradeCountArgs> = z.object({ orderBy: z.union([GradeOrderByWithRelationInputObjectSchema, GradeOrderByWithRelationInputObjectSchema.array()]).optional(), where: GradeWhereInputObjectSchema.optional(), cursor: GradeWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), select: z.union([ z.literal(true), GradeCountAggregateInputObjectSchema ]).optional() }).strict() as unknown as z.ZodType<Prisma.GradeCountArgs>;

export const GradeCountZodSchema = z.object({ orderBy: z.union([GradeOrderByWithRelationInputObjectSchema, GradeOrderByWithRelationInputObjectSchema.array()]).optional(), where: GradeWhereInputObjectSchema.optional(), cursor: GradeWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), select: z.union([ z.literal(true), GradeCountAggregateInputObjectSchema ]).optional() }).strict();

// File: createOneGrade.schema.ts

export const GradeCreateOneSchema: z.ZodType<Prisma.GradeCreateArgs> = z.object({ get select(){ return GradeSelectObjectSchema.optional(); }, get include(){ return GradeIncludeObjectSchema.optional(); }, data: z.union([GradeCreateInputObjectSchema, GradeUncheckedCreateInputObjectSchema]) }).strict() as unknown as z.ZodType<Prisma.GradeCreateArgs>;

export const GradeCreateOneZodSchema = z.object({ get select(){ return GradeSelectObjectSchema.optional(); }, get include(){ return GradeIncludeObjectSchema.optional(); }, data: z.union([GradeCreateInputObjectSchema, GradeUncheckedCreateInputObjectSchema]) }).strict();

// File: createManyGrade.schema.ts

export const GradeCreateManySchema: z.ZodType<Prisma.GradeCreateManyArgs> = z.object({ data: z.union([ GradeCreateManyInputObjectSchema, z.array(GradeCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict() as unknown as z.ZodType<Prisma.GradeCreateManyArgs>;

export const GradeCreateManyZodSchema = z.object({ data: z.union([ GradeCreateManyInputObjectSchema, z.array(GradeCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict();

// File: createManyAndReturnGrade.schema.ts

export const GradeCreateManyAndReturnSchema: z.ZodType<Prisma.GradeCreateManyAndReturnArgs> = z.object({ get select(){ return GradeSelectObjectSchema.optional(); }, data: z.union([ GradeCreateManyInputObjectSchema, z.array(GradeCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict() as unknown as z.ZodType<Prisma.GradeCreateManyAndReturnArgs>;

export const GradeCreateManyAndReturnZodSchema = z.object({ get select(){ return GradeSelectObjectSchema.optional(); }, data: z.union([ GradeCreateManyInputObjectSchema, z.array(GradeCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict();

// File: deleteOneGrade.schema.ts

export const GradeDeleteOneSchema: z.ZodType<Prisma.GradeDeleteArgs> = z.object({ get select(){ return GradeSelectObjectSchema.optional(); }, get include(){ return GradeIncludeObjectSchema.optional(); }, where: GradeWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.GradeDeleteArgs>;

export const GradeDeleteOneZodSchema = z.object({ get select(){ return GradeSelectObjectSchema.optional(); }, get include(){ return GradeIncludeObjectSchema.optional(); }, where: GradeWhereUniqueInputObjectSchema }).strict();

// File: deleteManyGrade.schema.ts

export const GradeDeleteManySchema: z.ZodType<Prisma.GradeDeleteManyArgs> = z.object({ where: GradeWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.GradeDeleteManyArgs>;

export const GradeDeleteManyZodSchema = z.object({ where: GradeWhereInputObjectSchema.optional() }).strict();

// File: updateOneGrade.schema.ts

export const GradeUpdateOneSchema: z.ZodType<Prisma.GradeUpdateArgs> = z.object({ get select(){ return GradeSelectObjectSchema.optional(); }, get include(){ return GradeIncludeObjectSchema.optional(); }, data: z.union([GradeUpdateInputObjectSchema, GradeUncheckedUpdateInputObjectSchema]), where: GradeWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.GradeUpdateArgs>;

export const GradeUpdateOneZodSchema = z.object({ get select(){ return GradeSelectObjectSchema.optional(); }, get include(){ return GradeIncludeObjectSchema.optional(); }, data: z.union([GradeUpdateInputObjectSchema, GradeUncheckedUpdateInputObjectSchema]), where: GradeWhereUniqueInputObjectSchema }).strict();

// File: updateManyGrade.schema.ts

export const GradeUpdateManySchema: z.ZodType<Prisma.GradeUpdateManyArgs> = z.object({ data: GradeUpdateManyMutationInputObjectSchema, where: GradeWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.GradeUpdateManyArgs>;

export const GradeUpdateManyZodSchema = z.object({ data: GradeUpdateManyMutationInputObjectSchema, where: GradeWhereInputObjectSchema.optional() }).strict();

// File: updateManyAndReturnGrade.schema.ts

export const GradeUpdateManyAndReturnSchema: z.ZodType<Prisma.GradeUpdateManyAndReturnArgs> = z.object({ get select(){ return GradeSelectObjectSchema.optional(); }, data: GradeUpdateManyMutationInputObjectSchema, where: GradeWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.GradeUpdateManyAndReturnArgs>;

export const GradeUpdateManyAndReturnZodSchema = z.object({ get select(){ return GradeSelectObjectSchema.optional(); }, data: GradeUpdateManyMutationInputObjectSchema, where: GradeWhereInputObjectSchema.optional() }).strict();

// File: upsertOneGrade.schema.ts

export const GradeUpsertOneSchema: z.ZodType<Prisma.GradeUpsertArgs> = z.object({ get select(){ return GradeSelectObjectSchema.optional(); }, get include(){ return GradeIncludeObjectSchema.optional(); }, where: GradeWhereUniqueInputObjectSchema, create: z.union([ GradeCreateInputObjectSchema, GradeUncheckedCreateInputObjectSchema ]), update: z.union([ GradeUpdateInputObjectSchema, GradeUncheckedUpdateInputObjectSchema ]) }).strict() as unknown as z.ZodType<Prisma.GradeUpsertArgs>;

export const GradeUpsertOneZodSchema = z.object({ get select(){ return GradeSelectObjectSchema.optional(); }, get include(){ return GradeIncludeObjectSchema.optional(); }, where: GradeWhereUniqueInputObjectSchema, create: z.union([ GradeCreateInputObjectSchema, GradeUncheckedCreateInputObjectSchema ]), update: z.union([ GradeUpdateInputObjectSchema, GradeUncheckedUpdateInputObjectSchema ]) }).strict();

// File: aggregateGrade.schema.ts

export const GradeAggregateSchema: z.ZodType<Prisma.GradeAggregateArgs> = z.object({ orderBy: z.union([GradeOrderByWithRelationInputObjectSchema, GradeOrderByWithRelationInputObjectSchema.array()]).optional(), where: GradeWhereInputObjectSchema.optional(), cursor: GradeWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), _count: z.union([ z.literal(true), GradeCountAggregateInputObjectSchema ]).optional(), _min: GradeMinAggregateInputObjectSchema.optional(), _max: GradeMaxAggregateInputObjectSchema.optional(), _avg: GradeAvgAggregateInputObjectSchema.optional(), _sum: GradeSumAggregateInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.GradeAggregateArgs>;

export const GradeAggregateZodSchema = z.object({ orderBy: z.union([GradeOrderByWithRelationInputObjectSchema, GradeOrderByWithRelationInputObjectSchema.array()]).optional(), where: GradeWhereInputObjectSchema.optional(), cursor: GradeWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), _count: z.union([ z.literal(true), GradeCountAggregateInputObjectSchema ]).optional(), _min: GradeMinAggregateInputObjectSchema.optional(), _max: GradeMaxAggregateInputObjectSchema.optional(), _avg: GradeAvgAggregateInputObjectSchema.optional(), _sum: GradeSumAggregateInputObjectSchema.optional() }).strict();

// File: groupByGrade.schema.ts

export const GradeGroupBySchema: z.ZodType<Prisma.GradeGroupByArgs> = z.object({ where: GradeWhereInputObjectSchema.optional(), orderBy: z.union([GradeOrderByWithAggregationInputObjectSchema, GradeOrderByWithAggregationInputObjectSchema.array()]).optional(), having: GradeScalarWhereWithAggregatesInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), by: z.array(GradeScalarFieldEnumSchema), _count: z.union([ z.literal(true), GradeCountAggregateInputObjectSchema ]).optional(), _min: GradeMinAggregateInputObjectSchema.optional(), _max: GradeMaxAggregateInputObjectSchema.optional(), _avg: GradeAvgAggregateInputObjectSchema.optional(), _sum: GradeSumAggregateInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.GradeGroupByArgs>;

export const GradeGroupByZodSchema = z.object({ where: GradeWhereInputObjectSchema.optional(), orderBy: z.union([GradeOrderByWithAggregationInputObjectSchema, GradeOrderByWithAggregationInputObjectSchema.array()]).optional(), having: GradeScalarWhereWithAggregatesInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), by: z.array(GradeScalarFieldEnumSchema), _count: z.union([ z.literal(true), GradeCountAggregateInputObjectSchema ]).optional(), _min: GradeMinAggregateInputObjectSchema.optional(), _max: GradeMaxAggregateInputObjectSchema.optional(), _avg: GradeAvgAggregateInputObjectSchema.optional(), _sum: GradeSumAggregateInputObjectSchema.optional() }).strict();

// File: findUniqueFaculty.schema.ts

export const FacultyFindUniqueSchema: z.ZodType<Prisma.FacultyFindUniqueArgs> = z.object({ get select(){ return FacultySelectObjectSchema.optional(); }, get include(){ return FacultyIncludeObjectSchema.optional(); }, where: FacultyWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.FacultyFindUniqueArgs>;

export const FacultyFindUniqueZodSchema = z.object({ get select(){ return FacultySelectObjectSchema.optional(); }, get include(){ return FacultyIncludeObjectSchema.optional(); }, where: FacultyWhereUniqueInputObjectSchema }).strict();

// File: findUniqueOrThrowFaculty.schema.ts

export const FacultyFindUniqueOrThrowSchema: z.ZodType<Prisma.FacultyFindUniqueOrThrowArgs> = z.object({ get select(){ return FacultySelectObjectSchema.optional(); }, get include(){ return FacultyIncludeObjectSchema.optional(); }, where: FacultyWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.FacultyFindUniqueOrThrowArgs>;

export const FacultyFindUniqueOrThrowZodSchema = z.object({ get select(){ return FacultySelectObjectSchema.optional(); }, get include(){ return FacultyIncludeObjectSchema.optional(); }, where: FacultyWhereUniqueInputObjectSchema }).strict();

// File: findFirstFaculty.schema.ts

// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const FacultyFindFirstSelectSchema__findFirstFaculty_schema: z.ZodType<Prisma.FacultySelect> = z.object({
    id: z.boolean().optional(),
    nameNo: z.boolean().optional(),
    nameEn: z.boolean().optional(),
    code: z.boolean().optional(),
    courses: z.boolean().optional(),
    departments: z.boolean().optional(),
    _count: z.boolean().optional()
  }).strict() as unknown as z.ZodType<Prisma.FacultySelect>;

export const FacultyFindFirstSelectZodSchema__findFirstFaculty_schema = z.object({
    id: z.boolean().optional(),
    nameNo: z.boolean().optional(),
    nameEn: z.boolean().optional(),
    code: z.boolean().optional(),
    courses: z.boolean().optional(),
    departments: z.boolean().optional(),
    _count: z.boolean().optional()
  }).strict();

export const FacultyFindFirstSchema: z.ZodType<Prisma.FacultyFindFirstArgs> = z.object({ get select(){ return FacultyFindFirstSelectSchema__findFirstFaculty_schema.optional(); }, get include(){ return FacultyIncludeObjectSchema.optional(); }, orderBy: z.union([FacultyOrderByWithRelationInputObjectSchema, FacultyOrderByWithRelationInputObjectSchema.array()]).optional(), where: FacultyWhereInputObjectSchema.optional(), cursor: FacultyWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([FacultyScalarFieldEnumSchema, FacultyScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.FacultyFindFirstArgs>;

export const FacultyFindFirstZodSchema = z.object({ get select(){ return FacultyFindFirstSelectSchema__findFirstFaculty_schema.optional(); }, get include(){ return FacultyIncludeObjectSchema.optional(); }, orderBy: z.union([FacultyOrderByWithRelationInputObjectSchema, FacultyOrderByWithRelationInputObjectSchema.array()]).optional(), where: FacultyWhereInputObjectSchema.optional(), cursor: FacultyWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([FacultyScalarFieldEnumSchema, FacultyScalarFieldEnumSchema.array()]).optional() }).strict();

// File: findFirstOrThrowFaculty.schema.ts

// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const FacultyFindFirstOrThrowSelectSchema__findFirstOrThrowFaculty_schema: z.ZodType<Prisma.FacultySelect> = z.object({
    id: z.boolean().optional(),
    nameNo: z.boolean().optional(),
    nameEn: z.boolean().optional(),
    code: z.boolean().optional(),
    courses: z.boolean().optional(),
    departments: z.boolean().optional(),
    _count: z.boolean().optional()
  }).strict() as unknown as z.ZodType<Prisma.FacultySelect>;

export const FacultyFindFirstOrThrowSelectZodSchema__findFirstOrThrowFaculty_schema = z.object({
    id: z.boolean().optional(),
    nameNo: z.boolean().optional(),
    nameEn: z.boolean().optional(),
    code: z.boolean().optional(),
    courses: z.boolean().optional(),
    departments: z.boolean().optional(),
    _count: z.boolean().optional()
  }).strict();

export const FacultyFindFirstOrThrowSchema: z.ZodType<Prisma.FacultyFindFirstOrThrowArgs> = z.object({ get select(){ return FacultyFindFirstOrThrowSelectSchema__findFirstOrThrowFaculty_schema.optional(); }, get include(){ return FacultyIncludeObjectSchema.optional(); }, orderBy: z.union([FacultyOrderByWithRelationInputObjectSchema, FacultyOrderByWithRelationInputObjectSchema.array()]).optional(), where: FacultyWhereInputObjectSchema.optional(), cursor: FacultyWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([FacultyScalarFieldEnumSchema, FacultyScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.FacultyFindFirstOrThrowArgs>;

export const FacultyFindFirstOrThrowZodSchema = z.object({ get select(){ return FacultyFindFirstOrThrowSelectSchema__findFirstOrThrowFaculty_schema.optional(); }, get include(){ return FacultyIncludeObjectSchema.optional(); }, orderBy: z.union([FacultyOrderByWithRelationInputObjectSchema, FacultyOrderByWithRelationInputObjectSchema.array()]).optional(), where: FacultyWhereInputObjectSchema.optional(), cursor: FacultyWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([FacultyScalarFieldEnumSchema, FacultyScalarFieldEnumSchema.array()]).optional() }).strict();

// File: findManyFaculty.schema.ts

// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const FacultyFindManySelectSchema__findManyFaculty_schema: z.ZodType<Prisma.FacultySelect> = z.object({
    id: z.boolean().optional(),
    nameNo: z.boolean().optional(),
    nameEn: z.boolean().optional(),
    code: z.boolean().optional(),
    courses: z.boolean().optional(),
    departments: z.boolean().optional(),
    _count: z.boolean().optional()
  }).strict() as unknown as z.ZodType<Prisma.FacultySelect>;

export const FacultyFindManySelectZodSchema__findManyFaculty_schema = z.object({
    id: z.boolean().optional(),
    nameNo: z.boolean().optional(),
    nameEn: z.boolean().optional(),
    code: z.boolean().optional(),
    courses: z.boolean().optional(),
    departments: z.boolean().optional(),
    _count: z.boolean().optional()
  }).strict();

export const FacultyFindManySchema: z.ZodType<Prisma.FacultyFindManyArgs> = z.object({ get select(){ return FacultyFindManySelectSchema__findManyFaculty_schema.optional(); }, get include(){ return FacultyIncludeObjectSchema.optional(); }, orderBy: z.union([FacultyOrderByWithRelationInputObjectSchema, FacultyOrderByWithRelationInputObjectSchema.array()]).optional(), where: FacultyWhereInputObjectSchema.optional(), cursor: FacultyWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([FacultyScalarFieldEnumSchema, FacultyScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.FacultyFindManyArgs>;

export const FacultyFindManyZodSchema = z.object({ get select(){ return FacultyFindManySelectSchema__findManyFaculty_schema.optional(); }, get include(){ return FacultyIncludeObjectSchema.optional(); }, orderBy: z.union([FacultyOrderByWithRelationInputObjectSchema, FacultyOrderByWithRelationInputObjectSchema.array()]).optional(), where: FacultyWhereInputObjectSchema.optional(), cursor: FacultyWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([FacultyScalarFieldEnumSchema, FacultyScalarFieldEnumSchema.array()]).optional() }).strict();

// File: countFaculty.schema.ts

export const FacultyCountSchema: z.ZodType<Prisma.FacultyCountArgs> = z.object({ orderBy: z.union([FacultyOrderByWithRelationInputObjectSchema, FacultyOrderByWithRelationInputObjectSchema.array()]).optional(), where: FacultyWhereInputObjectSchema.optional(), cursor: FacultyWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), select: z.union([ z.literal(true), FacultyCountAggregateInputObjectSchema ]).optional() }).strict() as unknown as z.ZodType<Prisma.FacultyCountArgs>;

export const FacultyCountZodSchema = z.object({ orderBy: z.union([FacultyOrderByWithRelationInputObjectSchema, FacultyOrderByWithRelationInputObjectSchema.array()]).optional(), where: FacultyWhereInputObjectSchema.optional(), cursor: FacultyWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), select: z.union([ z.literal(true), FacultyCountAggregateInputObjectSchema ]).optional() }).strict();

// File: createOneFaculty.schema.ts

export const FacultyCreateOneSchema: z.ZodType<Prisma.FacultyCreateArgs> = z.object({ get select(){ return FacultySelectObjectSchema.optional(); }, get include(){ return FacultyIncludeObjectSchema.optional(); }, data: z.union([FacultyCreateInputObjectSchema, FacultyUncheckedCreateInputObjectSchema]) }).strict() as unknown as z.ZodType<Prisma.FacultyCreateArgs>;

export const FacultyCreateOneZodSchema = z.object({ get select(){ return FacultySelectObjectSchema.optional(); }, get include(){ return FacultyIncludeObjectSchema.optional(); }, data: z.union([FacultyCreateInputObjectSchema, FacultyUncheckedCreateInputObjectSchema]) }).strict();

// File: createManyFaculty.schema.ts

export const FacultyCreateManySchema: z.ZodType<Prisma.FacultyCreateManyArgs> = z.object({ data: z.union([ FacultyCreateManyInputObjectSchema, z.array(FacultyCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict() as unknown as z.ZodType<Prisma.FacultyCreateManyArgs>;

export const FacultyCreateManyZodSchema = z.object({ data: z.union([ FacultyCreateManyInputObjectSchema, z.array(FacultyCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict();

// File: createManyAndReturnFaculty.schema.ts

export const FacultyCreateManyAndReturnSchema: z.ZodType<Prisma.FacultyCreateManyAndReturnArgs> = z.object({ get select(){ return FacultySelectObjectSchema.optional(); }, data: z.union([ FacultyCreateManyInputObjectSchema, z.array(FacultyCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict() as unknown as z.ZodType<Prisma.FacultyCreateManyAndReturnArgs>;

export const FacultyCreateManyAndReturnZodSchema = z.object({ get select(){ return FacultySelectObjectSchema.optional(); }, data: z.union([ FacultyCreateManyInputObjectSchema, z.array(FacultyCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict();

// File: deleteOneFaculty.schema.ts

export const FacultyDeleteOneSchema: z.ZodType<Prisma.FacultyDeleteArgs> = z.object({ get select(){ return FacultySelectObjectSchema.optional(); }, get include(){ return FacultyIncludeObjectSchema.optional(); }, where: FacultyWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.FacultyDeleteArgs>;

export const FacultyDeleteOneZodSchema = z.object({ get select(){ return FacultySelectObjectSchema.optional(); }, get include(){ return FacultyIncludeObjectSchema.optional(); }, where: FacultyWhereUniqueInputObjectSchema }).strict();

// File: deleteManyFaculty.schema.ts

export const FacultyDeleteManySchema: z.ZodType<Prisma.FacultyDeleteManyArgs> = z.object({ where: FacultyWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.FacultyDeleteManyArgs>;

export const FacultyDeleteManyZodSchema = z.object({ where: FacultyWhereInputObjectSchema.optional() }).strict();

// File: updateOneFaculty.schema.ts

export const FacultyUpdateOneSchema: z.ZodType<Prisma.FacultyUpdateArgs> = z.object({ get select(){ return FacultySelectObjectSchema.optional(); }, get include(){ return FacultyIncludeObjectSchema.optional(); }, data: z.union([FacultyUpdateInputObjectSchema, FacultyUncheckedUpdateInputObjectSchema]), where: FacultyWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.FacultyUpdateArgs>;

export const FacultyUpdateOneZodSchema = z.object({ get select(){ return FacultySelectObjectSchema.optional(); }, get include(){ return FacultyIncludeObjectSchema.optional(); }, data: z.union([FacultyUpdateInputObjectSchema, FacultyUncheckedUpdateInputObjectSchema]), where: FacultyWhereUniqueInputObjectSchema }).strict();

// File: updateManyFaculty.schema.ts

export const FacultyUpdateManySchema: z.ZodType<Prisma.FacultyUpdateManyArgs> = z.object({ data: FacultyUpdateManyMutationInputObjectSchema, where: FacultyWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.FacultyUpdateManyArgs>;

export const FacultyUpdateManyZodSchema = z.object({ data: FacultyUpdateManyMutationInputObjectSchema, where: FacultyWhereInputObjectSchema.optional() }).strict();

// File: updateManyAndReturnFaculty.schema.ts

export const FacultyUpdateManyAndReturnSchema: z.ZodType<Prisma.FacultyUpdateManyAndReturnArgs> = z.object({ get select(){ return FacultySelectObjectSchema.optional(); }, data: FacultyUpdateManyMutationInputObjectSchema, where: FacultyWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.FacultyUpdateManyAndReturnArgs>;

export const FacultyUpdateManyAndReturnZodSchema = z.object({ get select(){ return FacultySelectObjectSchema.optional(); }, data: FacultyUpdateManyMutationInputObjectSchema, where: FacultyWhereInputObjectSchema.optional() }).strict();

// File: upsertOneFaculty.schema.ts

export const FacultyUpsertOneSchema: z.ZodType<Prisma.FacultyUpsertArgs> = z.object({ get select(){ return FacultySelectObjectSchema.optional(); }, get include(){ return FacultyIncludeObjectSchema.optional(); }, where: FacultyWhereUniqueInputObjectSchema, create: z.union([ FacultyCreateInputObjectSchema, FacultyUncheckedCreateInputObjectSchema ]), update: z.union([ FacultyUpdateInputObjectSchema, FacultyUncheckedUpdateInputObjectSchema ]) }).strict() as unknown as z.ZodType<Prisma.FacultyUpsertArgs>;

export const FacultyUpsertOneZodSchema = z.object({ get select(){ return FacultySelectObjectSchema.optional(); }, get include(){ return FacultyIncludeObjectSchema.optional(); }, where: FacultyWhereUniqueInputObjectSchema, create: z.union([ FacultyCreateInputObjectSchema, FacultyUncheckedCreateInputObjectSchema ]), update: z.union([ FacultyUpdateInputObjectSchema, FacultyUncheckedUpdateInputObjectSchema ]) }).strict();

// File: aggregateFaculty.schema.ts

export const FacultyAggregateSchema: z.ZodType<Prisma.FacultyAggregateArgs> = z.object({ orderBy: z.union([FacultyOrderByWithRelationInputObjectSchema, FacultyOrderByWithRelationInputObjectSchema.array()]).optional(), where: FacultyWhereInputObjectSchema.optional(), cursor: FacultyWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), _count: z.union([ z.literal(true), FacultyCountAggregateInputObjectSchema ]).optional(), _min: FacultyMinAggregateInputObjectSchema.optional(), _max: FacultyMaxAggregateInputObjectSchema.optional(), _avg: FacultyAvgAggregateInputObjectSchema.optional(), _sum: FacultySumAggregateInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.FacultyAggregateArgs>;

export const FacultyAggregateZodSchema = z.object({ orderBy: z.union([FacultyOrderByWithRelationInputObjectSchema, FacultyOrderByWithRelationInputObjectSchema.array()]).optional(), where: FacultyWhereInputObjectSchema.optional(), cursor: FacultyWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), _count: z.union([ z.literal(true), FacultyCountAggregateInputObjectSchema ]).optional(), _min: FacultyMinAggregateInputObjectSchema.optional(), _max: FacultyMaxAggregateInputObjectSchema.optional(), _avg: FacultyAvgAggregateInputObjectSchema.optional(), _sum: FacultySumAggregateInputObjectSchema.optional() }).strict();

// File: groupByFaculty.schema.ts

export const FacultyGroupBySchema: z.ZodType<Prisma.FacultyGroupByArgs> = z.object({ where: FacultyWhereInputObjectSchema.optional(), orderBy: z.union([FacultyOrderByWithAggregationInputObjectSchema, FacultyOrderByWithAggregationInputObjectSchema.array()]).optional(), having: FacultyScalarWhereWithAggregatesInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), by: z.array(FacultyScalarFieldEnumSchema), _count: z.union([ z.literal(true), FacultyCountAggregateInputObjectSchema ]).optional(), _min: FacultyMinAggregateInputObjectSchema.optional(), _max: FacultyMaxAggregateInputObjectSchema.optional(), _avg: FacultyAvgAggregateInputObjectSchema.optional(), _sum: FacultySumAggregateInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.FacultyGroupByArgs>;

export const FacultyGroupByZodSchema = z.object({ where: FacultyWhereInputObjectSchema.optional(), orderBy: z.union([FacultyOrderByWithAggregationInputObjectSchema, FacultyOrderByWithAggregationInputObjectSchema.array()]).optional(), having: FacultyScalarWhereWithAggregatesInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), by: z.array(FacultyScalarFieldEnumSchema), _count: z.union([ z.literal(true), FacultyCountAggregateInputObjectSchema ]).optional(), _min: FacultyMinAggregateInputObjectSchema.optional(), _max: FacultyMaxAggregateInputObjectSchema.optional(), _avg: FacultyAvgAggregateInputObjectSchema.optional(), _sum: FacultySumAggregateInputObjectSchema.optional() }).strict();

// File: findUniqueDepartment.schema.ts

export const DepartmentFindUniqueSchema: z.ZodType<Prisma.DepartmentFindUniqueArgs> = z.object({ get select(){ return DepartmentSelectObjectSchema.optional(); }, get include(){ return DepartmentIncludeObjectSchema.optional(); }, where: DepartmentWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.DepartmentFindUniqueArgs>;

export const DepartmentFindUniqueZodSchema = z.object({ get select(){ return DepartmentSelectObjectSchema.optional(); }, get include(){ return DepartmentIncludeObjectSchema.optional(); }, where: DepartmentWhereUniqueInputObjectSchema }).strict();

// File: findUniqueOrThrowDepartment.schema.ts

export const DepartmentFindUniqueOrThrowSchema: z.ZodType<Prisma.DepartmentFindUniqueOrThrowArgs> = z.object({ get select(){ return DepartmentSelectObjectSchema.optional(); }, get include(){ return DepartmentIncludeObjectSchema.optional(); }, where: DepartmentWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.DepartmentFindUniqueOrThrowArgs>;

export const DepartmentFindUniqueOrThrowZodSchema = z.object({ get select(){ return DepartmentSelectObjectSchema.optional(); }, get include(){ return DepartmentIncludeObjectSchema.optional(); }, where: DepartmentWhereUniqueInputObjectSchema }).strict();

// File: findFirstDepartment.schema.ts

// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const DepartmentFindFirstSelectSchema__findFirstDepartment_schema: z.ZodType<Prisma.DepartmentSelect> = z.object({
    id: z.boolean().optional(),
    nameNo: z.boolean().optional(),
    nameEn: z.boolean().optional(),
    code: z.boolean().optional(),
    courses: z.boolean().optional(),
    facultyId: z.boolean().optional(),
    faculty: z.boolean().optional(),
    _count: z.boolean().optional()
  }).strict() as unknown as z.ZodType<Prisma.DepartmentSelect>;

export const DepartmentFindFirstSelectZodSchema__findFirstDepartment_schema = z.object({
    id: z.boolean().optional(),
    nameNo: z.boolean().optional(),
    nameEn: z.boolean().optional(),
    code: z.boolean().optional(),
    courses: z.boolean().optional(),
    facultyId: z.boolean().optional(),
    faculty: z.boolean().optional(),
    _count: z.boolean().optional()
  }).strict();

export const DepartmentFindFirstSchema: z.ZodType<Prisma.DepartmentFindFirstArgs> = z.object({ get select(){ return DepartmentFindFirstSelectSchema__findFirstDepartment_schema.optional(); }, get include(){ return DepartmentIncludeObjectSchema.optional(); }, orderBy: z.union([DepartmentOrderByWithRelationInputObjectSchema, DepartmentOrderByWithRelationInputObjectSchema.array()]).optional(), where: DepartmentWhereInputObjectSchema.optional(), cursor: DepartmentWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([DepartmentScalarFieldEnumSchema, DepartmentScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.DepartmentFindFirstArgs>;

export const DepartmentFindFirstZodSchema = z.object({ get select(){ return DepartmentFindFirstSelectSchema__findFirstDepartment_schema.optional(); }, get include(){ return DepartmentIncludeObjectSchema.optional(); }, orderBy: z.union([DepartmentOrderByWithRelationInputObjectSchema, DepartmentOrderByWithRelationInputObjectSchema.array()]).optional(), where: DepartmentWhereInputObjectSchema.optional(), cursor: DepartmentWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([DepartmentScalarFieldEnumSchema, DepartmentScalarFieldEnumSchema.array()]).optional() }).strict();

// File: findFirstOrThrowDepartment.schema.ts

// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const DepartmentFindFirstOrThrowSelectSchema__findFirstOrThrowDepartment_schema: z.ZodType<Prisma.DepartmentSelect> = z.object({
    id: z.boolean().optional(),
    nameNo: z.boolean().optional(),
    nameEn: z.boolean().optional(),
    code: z.boolean().optional(),
    courses: z.boolean().optional(),
    facultyId: z.boolean().optional(),
    faculty: z.boolean().optional(),
    _count: z.boolean().optional()
  }).strict() as unknown as z.ZodType<Prisma.DepartmentSelect>;

export const DepartmentFindFirstOrThrowSelectZodSchema__findFirstOrThrowDepartment_schema = z.object({
    id: z.boolean().optional(),
    nameNo: z.boolean().optional(),
    nameEn: z.boolean().optional(),
    code: z.boolean().optional(),
    courses: z.boolean().optional(),
    facultyId: z.boolean().optional(),
    faculty: z.boolean().optional(),
    _count: z.boolean().optional()
  }).strict();

export const DepartmentFindFirstOrThrowSchema: z.ZodType<Prisma.DepartmentFindFirstOrThrowArgs> = z.object({ get select(){ return DepartmentFindFirstOrThrowSelectSchema__findFirstOrThrowDepartment_schema.optional(); }, get include(){ return DepartmentIncludeObjectSchema.optional(); }, orderBy: z.union([DepartmentOrderByWithRelationInputObjectSchema, DepartmentOrderByWithRelationInputObjectSchema.array()]).optional(), where: DepartmentWhereInputObjectSchema.optional(), cursor: DepartmentWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([DepartmentScalarFieldEnumSchema, DepartmentScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.DepartmentFindFirstOrThrowArgs>;

export const DepartmentFindFirstOrThrowZodSchema = z.object({ get select(){ return DepartmentFindFirstOrThrowSelectSchema__findFirstOrThrowDepartment_schema.optional(); }, get include(){ return DepartmentIncludeObjectSchema.optional(); }, orderBy: z.union([DepartmentOrderByWithRelationInputObjectSchema, DepartmentOrderByWithRelationInputObjectSchema.array()]).optional(), where: DepartmentWhereInputObjectSchema.optional(), cursor: DepartmentWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([DepartmentScalarFieldEnumSchema, DepartmentScalarFieldEnumSchema.array()]).optional() }).strict();

// File: findManyDepartment.schema.ts

// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const DepartmentFindManySelectSchema__findManyDepartment_schema: z.ZodType<Prisma.DepartmentSelect> = z.object({
    id: z.boolean().optional(),
    nameNo: z.boolean().optional(),
    nameEn: z.boolean().optional(),
    code: z.boolean().optional(),
    courses: z.boolean().optional(),
    facultyId: z.boolean().optional(),
    faculty: z.boolean().optional(),
    _count: z.boolean().optional()
  }).strict() as unknown as z.ZodType<Prisma.DepartmentSelect>;

export const DepartmentFindManySelectZodSchema__findManyDepartment_schema = z.object({
    id: z.boolean().optional(),
    nameNo: z.boolean().optional(),
    nameEn: z.boolean().optional(),
    code: z.boolean().optional(),
    courses: z.boolean().optional(),
    facultyId: z.boolean().optional(),
    faculty: z.boolean().optional(),
    _count: z.boolean().optional()
  }).strict();

export const DepartmentFindManySchema: z.ZodType<Prisma.DepartmentFindManyArgs> = z.object({ get select(){ return DepartmentFindManySelectSchema__findManyDepartment_schema.optional(); }, get include(){ return DepartmentIncludeObjectSchema.optional(); }, orderBy: z.union([DepartmentOrderByWithRelationInputObjectSchema, DepartmentOrderByWithRelationInputObjectSchema.array()]).optional(), where: DepartmentWhereInputObjectSchema.optional(), cursor: DepartmentWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([DepartmentScalarFieldEnumSchema, DepartmentScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.DepartmentFindManyArgs>;

export const DepartmentFindManyZodSchema = z.object({ get select(){ return DepartmentFindManySelectSchema__findManyDepartment_schema.optional(); }, get include(){ return DepartmentIncludeObjectSchema.optional(); }, orderBy: z.union([DepartmentOrderByWithRelationInputObjectSchema, DepartmentOrderByWithRelationInputObjectSchema.array()]).optional(), where: DepartmentWhereInputObjectSchema.optional(), cursor: DepartmentWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([DepartmentScalarFieldEnumSchema, DepartmentScalarFieldEnumSchema.array()]).optional() }).strict();

// File: countDepartment.schema.ts

export const DepartmentCountSchema: z.ZodType<Prisma.DepartmentCountArgs> = z.object({ orderBy: z.union([DepartmentOrderByWithRelationInputObjectSchema, DepartmentOrderByWithRelationInputObjectSchema.array()]).optional(), where: DepartmentWhereInputObjectSchema.optional(), cursor: DepartmentWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), select: z.union([ z.literal(true), DepartmentCountAggregateInputObjectSchema ]).optional() }).strict() as unknown as z.ZodType<Prisma.DepartmentCountArgs>;

export const DepartmentCountZodSchema = z.object({ orderBy: z.union([DepartmentOrderByWithRelationInputObjectSchema, DepartmentOrderByWithRelationInputObjectSchema.array()]).optional(), where: DepartmentWhereInputObjectSchema.optional(), cursor: DepartmentWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), select: z.union([ z.literal(true), DepartmentCountAggregateInputObjectSchema ]).optional() }).strict();

// File: createOneDepartment.schema.ts

export const DepartmentCreateOneSchema: z.ZodType<Prisma.DepartmentCreateArgs> = z.object({ get select(){ return DepartmentSelectObjectSchema.optional(); }, get include(){ return DepartmentIncludeObjectSchema.optional(); }, data: z.union([DepartmentCreateInputObjectSchema, DepartmentUncheckedCreateInputObjectSchema]) }).strict() as unknown as z.ZodType<Prisma.DepartmentCreateArgs>;

export const DepartmentCreateOneZodSchema = z.object({ get select(){ return DepartmentSelectObjectSchema.optional(); }, get include(){ return DepartmentIncludeObjectSchema.optional(); }, data: z.union([DepartmentCreateInputObjectSchema, DepartmentUncheckedCreateInputObjectSchema]) }).strict();

// File: createManyDepartment.schema.ts

export const DepartmentCreateManySchema: z.ZodType<Prisma.DepartmentCreateManyArgs> = z.object({ data: z.union([ DepartmentCreateManyInputObjectSchema, z.array(DepartmentCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict() as unknown as z.ZodType<Prisma.DepartmentCreateManyArgs>;

export const DepartmentCreateManyZodSchema = z.object({ data: z.union([ DepartmentCreateManyInputObjectSchema, z.array(DepartmentCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict();

// File: createManyAndReturnDepartment.schema.ts

export const DepartmentCreateManyAndReturnSchema: z.ZodType<Prisma.DepartmentCreateManyAndReturnArgs> = z.object({ get select(){ return DepartmentSelectObjectSchema.optional(); }, data: z.union([ DepartmentCreateManyInputObjectSchema, z.array(DepartmentCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict() as unknown as z.ZodType<Prisma.DepartmentCreateManyAndReturnArgs>;

export const DepartmentCreateManyAndReturnZodSchema = z.object({ get select(){ return DepartmentSelectObjectSchema.optional(); }, data: z.union([ DepartmentCreateManyInputObjectSchema, z.array(DepartmentCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict();

// File: deleteOneDepartment.schema.ts

export const DepartmentDeleteOneSchema: z.ZodType<Prisma.DepartmentDeleteArgs> = z.object({ get select(){ return DepartmentSelectObjectSchema.optional(); }, get include(){ return DepartmentIncludeObjectSchema.optional(); }, where: DepartmentWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.DepartmentDeleteArgs>;

export const DepartmentDeleteOneZodSchema = z.object({ get select(){ return DepartmentSelectObjectSchema.optional(); }, get include(){ return DepartmentIncludeObjectSchema.optional(); }, where: DepartmentWhereUniqueInputObjectSchema }).strict();

// File: deleteManyDepartment.schema.ts

export const DepartmentDeleteManySchema: z.ZodType<Prisma.DepartmentDeleteManyArgs> = z.object({ where: DepartmentWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.DepartmentDeleteManyArgs>;

export const DepartmentDeleteManyZodSchema = z.object({ where: DepartmentWhereInputObjectSchema.optional() }).strict();

// File: updateOneDepartment.schema.ts

export const DepartmentUpdateOneSchema: z.ZodType<Prisma.DepartmentUpdateArgs> = z.object({ get select(){ return DepartmentSelectObjectSchema.optional(); }, get include(){ return DepartmentIncludeObjectSchema.optional(); }, data: z.union([DepartmentUpdateInputObjectSchema, DepartmentUncheckedUpdateInputObjectSchema]), where: DepartmentWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.DepartmentUpdateArgs>;

export const DepartmentUpdateOneZodSchema = z.object({ get select(){ return DepartmentSelectObjectSchema.optional(); }, get include(){ return DepartmentIncludeObjectSchema.optional(); }, data: z.union([DepartmentUpdateInputObjectSchema, DepartmentUncheckedUpdateInputObjectSchema]), where: DepartmentWhereUniqueInputObjectSchema }).strict();

// File: updateManyDepartment.schema.ts

export const DepartmentUpdateManySchema: z.ZodType<Prisma.DepartmentUpdateManyArgs> = z.object({ data: DepartmentUpdateManyMutationInputObjectSchema, where: DepartmentWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.DepartmentUpdateManyArgs>;

export const DepartmentUpdateManyZodSchema = z.object({ data: DepartmentUpdateManyMutationInputObjectSchema, where: DepartmentWhereInputObjectSchema.optional() }).strict();

// File: updateManyAndReturnDepartment.schema.ts

export const DepartmentUpdateManyAndReturnSchema: z.ZodType<Prisma.DepartmentUpdateManyAndReturnArgs> = z.object({ get select(){ return DepartmentSelectObjectSchema.optional(); }, data: DepartmentUpdateManyMutationInputObjectSchema, where: DepartmentWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.DepartmentUpdateManyAndReturnArgs>;

export const DepartmentUpdateManyAndReturnZodSchema = z.object({ get select(){ return DepartmentSelectObjectSchema.optional(); }, data: DepartmentUpdateManyMutationInputObjectSchema, where: DepartmentWhereInputObjectSchema.optional() }).strict();

// File: upsertOneDepartment.schema.ts

export const DepartmentUpsertOneSchema: z.ZodType<Prisma.DepartmentUpsertArgs> = z.object({ get select(){ return DepartmentSelectObjectSchema.optional(); }, get include(){ return DepartmentIncludeObjectSchema.optional(); }, where: DepartmentWhereUniqueInputObjectSchema, create: z.union([ DepartmentCreateInputObjectSchema, DepartmentUncheckedCreateInputObjectSchema ]), update: z.union([ DepartmentUpdateInputObjectSchema, DepartmentUncheckedUpdateInputObjectSchema ]) }).strict() as unknown as z.ZodType<Prisma.DepartmentUpsertArgs>;

export const DepartmentUpsertOneZodSchema = z.object({ get select(){ return DepartmentSelectObjectSchema.optional(); }, get include(){ return DepartmentIncludeObjectSchema.optional(); }, where: DepartmentWhereUniqueInputObjectSchema, create: z.union([ DepartmentCreateInputObjectSchema, DepartmentUncheckedCreateInputObjectSchema ]), update: z.union([ DepartmentUpdateInputObjectSchema, DepartmentUncheckedUpdateInputObjectSchema ]) }).strict();

// File: aggregateDepartment.schema.ts

export const DepartmentAggregateSchema: z.ZodType<Prisma.DepartmentAggregateArgs> = z.object({ orderBy: z.union([DepartmentOrderByWithRelationInputObjectSchema, DepartmentOrderByWithRelationInputObjectSchema.array()]).optional(), where: DepartmentWhereInputObjectSchema.optional(), cursor: DepartmentWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), _count: z.union([ z.literal(true), DepartmentCountAggregateInputObjectSchema ]).optional(), _min: DepartmentMinAggregateInputObjectSchema.optional(), _max: DepartmentMaxAggregateInputObjectSchema.optional(), _avg: DepartmentAvgAggregateInputObjectSchema.optional(), _sum: DepartmentSumAggregateInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.DepartmentAggregateArgs>;

export const DepartmentAggregateZodSchema = z.object({ orderBy: z.union([DepartmentOrderByWithRelationInputObjectSchema, DepartmentOrderByWithRelationInputObjectSchema.array()]).optional(), where: DepartmentWhereInputObjectSchema.optional(), cursor: DepartmentWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), _count: z.union([ z.literal(true), DepartmentCountAggregateInputObjectSchema ]).optional(), _min: DepartmentMinAggregateInputObjectSchema.optional(), _max: DepartmentMaxAggregateInputObjectSchema.optional(), _avg: DepartmentAvgAggregateInputObjectSchema.optional(), _sum: DepartmentSumAggregateInputObjectSchema.optional() }).strict();

// File: groupByDepartment.schema.ts

export const DepartmentGroupBySchema: z.ZodType<Prisma.DepartmentGroupByArgs> = z.object({ where: DepartmentWhereInputObjectSchema.optional(), orderBy: z.union([DepartmentOrderByWithAggregationInputObjectSchema, DepartmentOrderByWithAggregationInputObjectSchema.array()]).optional(), having: DepartmentScalarWhereWithAggregatesInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), by: z.array(DepartmentScalarFieldEnumSchema), _count: z.union([ z.literal(true), DepartmentCountAggregateInputObjectSchema ]).optional(), _min: DepartmentMinAggregateInputObjectSchema.optional(), _max: DepartmentMaxAggregateInputObjectSchema.optional(), _avg: DepartmentAvgAggregateInputObjectSchema.optional(), _sum: DepartmentSumAggregateInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.DepartmentGroupByArgs>;

export const DepartmentGroupByZodSchema = z.object({ where: DepartmentWhereInputObjectSchema.optional(), orderBy: z.union([DepartmentOrderByWithAggregationInputObjectSchema, DepartmentOrderByWithAggregationInputObjectSchema.array()]).optional(), having: DepartmentScalarWhereWithAggregatesInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), by: z.array(DepartmentScalarFieldEnumSchema), _count: z.union([ z.literal(true), DepartmentCountAggregateInputObjectSchema ]).optional(), _min: DepartmentMinAggregateInputObjectSchema.optional(), _max: DepartmentMaxAggregateInputObjectSchema.optional(), _avg: DepartmentAvgAggregateInputObjectSchema.optional(), _sum: DepartmentSumAggregateInputObjectSchema.optional() }).strict();

// File: CourseFindUniqueResult.schema.ts
export const CourseFindUniqueResultSchema = z.nullable(z.object({
  id: z.string(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().optional(),
  credits: z.number().optional(),
  studyLevel: z.unknown(),
  gradeType: z.unknown(),
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int().optional(),
  contentNo: z.string().optional(),
  contentEn: z.string().optional(),
  teachingMethodsNo: z.string().optional(),
  teachingMethodsEn: z.string().optional(),
  learningOutcomesNo: z.string().optional(),
  learningOutcomesEn: z.string().optional(),
  examTypeNo: z.string().optional(),
  examTypeEn: z.string().optional(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  taughtSemesters: z.array(z.unknown()),
  teachingLanguages: z.array(z.unknown()),
  campuses: z.array(z.unknown()),
  grades: z.array(z.unknown()),
  facultyId: z.string().optional(),
  faculty: z.unknown().optional(),
  departmentId: z.string().optional(),
  department: z.unknown().optional(),
  latestYearCheckedForNtnuData: z.number().int().optional()
}));

// File: CourseFindFirstResult.schema.ts
export const CourseFindFirstResultSchema = z.nullable(z.object({
  id: z.string(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().optional(),
  credits: z.number().optional(),
  studyLevel: z.unknown(),
  gradeType: z.unknown(),
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int().optional(),
  contentNo: z.string().optional(),
  contentEn: z.string().optional(),
  teachingMethodsNo: z.string().optional(),
  teachingMethodsEn: z.string().optional(),
  learningOutcomesNo: z.string().optional(),
  learningOutcomesEn: z.string().optional(),
  examTypeNo: z.string().optional(),
  examTypeEn: z.string().optional(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  taughtSemesters: z.array(z.unknown()),
  teachingLanguages: z.array(z.unknown()),
  campuses: z.array(z.unknown()),
  grades: z.array(z.unknown()),
  facultyId: z.string().optional(),
  faculty: z.unknown().optional(),
  departmentId: z.string().optional(),
  department: z.unknown().optional(),
  latestYearCheckedForNtnuData: z.number().int().optional()
}));

// File: CourseFindManyResult.schema.ts
export const CourseFindManyResultSchema = z.object({
  data: z.array(z.object({
  id: z.string(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().optional(),
  credits: z.number().optional(),
  studyLevel: z.unknown(),
  gradeType: z.unknown(),
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int().optional(),
  contentNo: z.string().optional(),
  contentEn: z.string().optional(),
  teachingMethodsNo: z.string().optional(),
  teachingMethodsEn: z.string().optional(),
  learningOutcomesNo: z.string().optional(),
  learningOutcomesEn: z.string().optional(),
  examTypeNo: z.string().optional(),
  examTypeEn: z.string().optional(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  taughtSemesters: z.array(z.unknown()),
  teachingLanguages: z.array(z.unknown()),
  campuses: z.array(z.unknown()),
  grades: z.array(z.unknown()),
  facultyId: z.string().optional(),
  faculty: z.unknown().optional(),
  departmentId: z.string().optional(),
  department: z.unknown().optional(),
  latestYearCheckedForNtnuData: z.number().int().optional()
})),
  pagination: z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean()
})
});

// File: CourseCreateResult.schema.ts
export const CourseCreateResultSchema = z.object({
  id: z.string(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().optional(),
  credits: z.number().optional(),
  studyLevel: z.unknown(),
  gradeType: z.unknown(),
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int().optional(),
  contentNo: z.string().optional(),
  contentEn: z.string().optional(),
  teachingMethodsNo: z.string().optional(),
  teachingMethodsEn: z.string().optional(),
  learningOutcomesNo: z.string().optional(),
  learningOutcomesEn: z.string().optional(),
  examTypeNo: z.string().optional(),
  examTypeEn: z.string().optional(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  taughtSemesters: z.array(z.unknown()),
  teachingLanguages: z.array(z.unknown()),
  campuses: z.array(z.unknown()),
  grades: z.array(z.unknown()),
  facultyId: z.string().optional(),
  faculty: z.unknown().optional(),
  departmentId: z.string().optional(),
  department: z.unknown().optional(),
  latestYearCheckedForNtnuData: z.number().int().optional()
});

// File: CourseCreateManyResult.schema.ts
export const CourseCreateManyResultSchema = z.object({
  count: z.number()
});

// File: CourseUpdateResult.schema.ts
export const CourseUpdateResultSchema = z.nullable(z.object({
  id: z.string(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().optional(),
  credits: z.number().optional(),
  studyLevel: z.unknown(),
  gradeType: z.unknown(),
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int().optional(),
  contentNo: z.string().optional(),
  contentEn: z.string().optional(),
  teachingMethodsNo: z.string().optional(),
  teachingMethodsEn: z.string().optional(),
  learningOutcomesNo: z.string().optional(),
  learningOutcomesEn: z.string().optional(),
  examTypeNo: z.string().optional(),
  examTypeEn: z.string().optional(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  taughtSemesters: z.array(z.unknown()),
  teachingLanguages: z.array(z.unknown()),
  campuses: z.array(z.unknown()),
  grades: z.array(z.unknown()),
  facultyId: z.string().optional(),
  faculty: z.unknown().optional(),
  departmentId: z.string().optional(),
  department: z.unknown().optional(),
  latestYearCheckedForNtnuData: z.number().int().optional()
}));

// File: CourseUpdateManyResult.schema.ts
export const CourseUpdateManyResultSchema = z.object({
  count: z.number()
});

// File: CourseUpsertResult.schema.ts
export const CourseUpsertResultSchema = z.object({
  id: z.string(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().optional(),
  credits: z.number().optional(),
  studyLevel: z.unknown(),
  gradeType: z.unknown(),
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int().optional(),
  contentNo: z.string().optional(),
  contentEn: z.string().optional(),
  teachingMethodsNo: z.string().optional(),
  teachingMethodsEn: z.string().optional(),
  learningOutcomesNo: z.string().optional(),
  learningOutcomesEn: z.string().optional(),
  examTypeNo: z.string().optional(),
  examTypeEn: z.string().optional(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  taughtSemesters: z.array(z.unknown()),
  teachingLanguages: z.array(z.unknown()),
  campuses: z.array(z.unknown()),
  grades: z.array(z.unknown()),
  facultyId: z.string().optional(),
  faculty: z.unknown().optional(),
  departmentId: z.string().optional(),
  department: z.unknown().optional(),
  latestYearCheckedForNtnuData: z.number().int().optional()
});

// File: CourseDeleteResult.schema.ts
export const CourseDeleteResultSchema = z.nullable(z.object({
  id: z.string(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().optional(),
  credits: z.number().optional(),
  studyLevel: z.unknown(),
  gradeType: z.unknown(),
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int().optional(),
  contentNo: z.string().optional(),
  contentEn: z.string().optional(),
  teachingMethodsNo: z.string().optional(),
  teachingMethodsEn: z.string().optional(),
  learningOutcomesNo: z.string().optional(),
  learningOutcomesEn: z.string().optional(),
  examTypeNo: z.string().optional(),
  examTypeEn: z.string().optional(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  taughtSemesters: z.array(z.unknown()),
  teachingLanguages: z.array(z.unknown()),
  campuses: z.array(z.unknown()),
  grades: z.array(z.unknown()),
  facultyId: z.string().optional(),
  faculty: z.unknown().optional(),
  departmentId: z.string().optional(),
  department: z.unknown().optional(),
  latestYearCheckedForNtnuData: z.number().int().optional()
}));

// File: CourseDeleteManyResult.schema.ts
export const CourseDeleteManyResultSchema = z.object({
  count: z.number()
});

// File: CourseAggregateResult.schema.ts
export const CourseAggregateResultSchema = z.object({  _count: z.object({
    id: z.number(),
    code: z.number(),
    nameNo: z.number(),
    nameEn: z.number(),
    credits: z.number(),
    studyLevel: z.number(),
    gradeType: z.number(),
    firstYearTaught: z.number(),
    lastYearTaught: z.number(),
    contentNo: z.number(),
    contentEn: z.number(),
    teachingMethodsNo: z.number(),
    teachingMethodsEn: z.number(),
    learningOutcomesNo: z.number(),
    learningOutcomesEn: z.number(),
    examTypeNo: z.number(),
    examTypeEn: z.number(),
    candidateCount: z.number(),
    averageGrade: z.number(),
    passRate: z.number(),
    createdAt: z.number(),
    updatedAt: z.number(),
    taughtSemesters: z.number(),
    teachingLanguages: z.number(),
    campuses: z.number(),
    grades: z.number(),
    facultyId: z.number(),
    faculty: z.number(),
    departmentId: z.number(),
    department: z.number(),
    latestYearCheckedForNtnuData: z.number()
  }).optional(),
  _sum: z.object({
    credits: z.number().nullable(),
    firstYearTaught: z.number().nullable(),
    lastYearTaught: z.number().nullable(),
    candidateCount: z.number().nullable(),
    averageGrade: z.number().nullable(),
    passRate: z.number().nullable(),
    latestYearCheckedForNtnuData: z.number().nullable()
  }).nullable().optional(),
  _avg: z.object({
    credits: z.number().nullable(),
    firstYearTaught: z.number().nullable(),
    lastYearTaught: z.number().nullable(),
    candidateCount: z.number().nullable(),
    averageGrade: z.number().nullable(),
    passRate: z.number().nullable(),
    latestYearCheckedForNtnuData: z.number().nullable()
  }).nullable().optional(),
  _min: z.object({
    id: z.string().nullable(),
    code: z.string().nullable(),
    nameNo: z.string().nullable(),
    nameEn: z.string().nullable(),
    credits: z.number().nullable(),
    firstYearTaught: z.number().int().nullable(),
    lastYearTaught: z.number().int().nullable(),
    contentNo: z.string().nullable(),
    contentEn: z.string().nullable(),
    teachingMethodsNo: z.string().nullable(),
    teachingMethodsEn: z.string().nullable(),
    learningOutcomesNo: z.string().nullable(),
    learningOutcomesEn: z.string().nullable(),
    examTypeNo: z.string().nullable(),
    examTypeEn: z.string().nullable(),
    candidateCount: z.number().int().nullable(),
    averageGrade: z.number().nullable(),
    passRate: z.number().nullable(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable(),
    facultyId: z.string().nullable(),
    departmentId: z.string().nullable(),
    latestYearCheckedForNtnuData: z.number().int().nullable()
  }).nullable().optional(),
  _max: z.object({
    id: z.string().nullable(),
    code: z.string().nullable(),
    nameNo: z.string().nullable(),
    nameEn: z.string().nullable(),
    credits: z.number().nullable(),
    firstYearTaught: z.number().int().nullable(),
    lastYearTaught: z.number().int().nullable(),
    contentNo: z.string().nullable(),
    contentEn: z.string().nullable(),
    teachingMethodsNo: z.string().nullable(),
    teachingMethodsEn: z.string().nullable(),
    learningOutcomesNo: z.string().nullable(),
    learningOutcomesEn: z.string().nullable(),
    examTypeNo: z.string().nullable(),
    examTypeEn: z.string().nullable(),
    candidateCount: z.number().int().nullable(),
    averageGrade: z.number().nullable(),
    passRate: z.number().nullable(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable(),
    facultyId: z.string().nullable(),
    departmentId: z.string().nullable(),
    latestYearCheckedForNtnuData: z.number().int().nullable()
  }).nullable().optional()});

// File: CourseGroupByResult.schema.ts
export const CourseGroupByResultSchema = z.array(z.object({
  id: z.string(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  credits: z.number(),
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int(),
  contentNo: z.string(),
  contentEn: z.string(),
  teachingMethodsNo: z.string(),
  teachingMethodsEn: z.string(),
  learningOutcomesNo: z.string(),
  learningOutcomesEn: z.string(),
  examTypeNo: z.string(),
  examTypeEn: z.string(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  facultyId: z.string(),
  departmentId: z.string(),
  latestYearCheckedForNtnuData: z.number().int(),
  _count: z.object({
    id: z.number(),
    code: z.number(),
    nameNo: z.number(),
    nameEn: z.number(),
    credits: z.number(),
    studyLevel: z.number(),
    gradeType: z.number(),
    firstYearTaught: z.number(),
    lastYearTaught: z.number(),
    contentNo: z.number(),
    contentEn: z.number(),
    teachingMethodsNo: z.number(),
    teachingMethodsEn: z.number(),
    learningOutcomesNo: z.number(),
    learningOutcomesEn: z.number(),
    examTypeNo: z.number(),
    examTypeEn: z.number(),
    candidateCount: z.number(),
    averageGrade: z.number(),
    passRate: z.number(),
    createdAt: z.number(),
    updatedAt: z.number(),
    taughtSemesters: z.number(),
    teachingLanguages: z.number(),
    campuses: z.number(),
    grades: z.number(),
    facultyId: z.number(),
    faculty: z.number(),
    departmentId: z.number(),
    department: z.number(),
    latestYearCheckedForNtnuData: z.number()
  }).optional(),
  _sum: z.object({
    credits: z.number().nullable(),
    firstYearTaught: z.number().nullable(),
    lastYearTaught: z.number().nullable(),
    candidateCount: z.number().nullable(),
    averageGrade: z.number().nullable(),
    passRate: z.number().nullable(),
    latestYearCheckedForNtnuData: z.number().nullable()
  }).nullable().optional(),
  _avg: z.object({
    credits: z.number().nullable(),
    firstYearTaught: z.number().nullable(),
    lastYearTaught: z.number().nullable(),
    candidateCount: z.number().nullable(),
    averageGrade: z.number().nullable(),
    passRate: z.number().nullable(),
    latestYearCheckedForNtnuData: z.number().nullable()
  }).nullable().optional(),
  _min: z.object({
    id: z.string().nullable(),
    code: z.string().nullable(),
    nameNo: z.string().nullable(),
    nameEn: z.string().nullable(),
    credits: z.number().nullable(),
    firstYearTaught: z.number().int().nullable(),
    lastYearTaught: z.number().int().nullable(),
    contentNo: z.string().nullable(),
    contentEn: z.string().nullable(),
    teachingMethodsNo: z.string().nullable(),
    teachingMethodsEn: z.string().nullable(),
    learningOutcomesNo: z.string().nullable(),
    learningOutcomesEn: z.string().nullable(),
    examTypeNo: z.string().nullable(),
    examTypeEn: z.string().nullable(),
    candidateCount: z.number().int().nullable(),
    averageGrade: z.number().nullable(),
    passRate: z.number().nullable(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable(),
    facultyId: z.string().nullable(),
    departmentId: z.string().nullable(),
    latestYearCheckedForNtnuData: z.number().int().nullable()
  }).nullable().optional(),
  _max: z.object({
    id: z.string().nullable(),
    code: z.string().nullable(),
    nameNo: z.string().nullable(),
    nameEn: z.string().nullable(),
    credits: z.number().nullable(),
    firstYearTaught: z.number().int().nullable(),
    lastYearTaught: z.number().int().nullable(),
    contentNo: z.string().nullable(),
    contentEn: z.string().nullable(),
    teachingMethodsNo: z.string().nullable(),
    teachingMethodsEn: z.string().nullable(),
    learningOutcomesNo: z.string().nullable(),
    learningOutcomesEn: z.string().nullable(),
    examTypeNo: z.string().nullable(),
    examTypeEn: z.string().nullable(),
    candidateCount: z.number().int().nullable(),
    averageGrade: z.number().nullable(),
    passRate: z.number().nullable(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable(),
    facultyId: z.string().nullable(),
    departmentId: z.string().nullable(),
    latestYearCheckedForNtnuData: z.number().int().nullable()
  }).nullable().optional()
}));

// File: CourseCountResult.schema.ts
export const CourseCountResultSchema = z.number();

// File: GradeFindUniqueResult.schema.ts
export const GradeFindUniqueResultSchema = z.nullable(z.object({
  id: z.string(),
  gradeACount: z.number().int(),
  gradeBCount: z.number().int(),
  gradeCCount: z.number().int(),
  gradeDCount: z.number().int(),
  gradeECount: z.number().int(),
  gradeFCount: z.number().int(),
  passedCount: z.number().int(),
  failedCount: z.number().int(),
  courseId: z.string(),
  course: z.unknown(),
  semester: z.unknown(),
  year: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date()
}));

// File: GradeFindFirstResult.schema.ts
export const GradeFindFirstResultSchema = z.nullable(z.object({
  id: z.string(),
  gradeACount: z.number().int(),
  gradeBCount: z.number().int(),
  gradeCCount: z.number().int(),
  gradeDCount: z.number().int(),
  gradeECount: z.number().int(),
  gradeFCount: z.number().int(),
  passedCount: z.number().int(),
  failedCount: z.number().int(),
  courseId: z.string(),
  course: z.unknown(),
  semester: z.unknown(),
  year: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date()
}));

// File: GradeFindManyResult.schema.ts
export const GradeFindManyResultSchema = z.object({
  data: z.array(z.object({
  id: z.string(),
  gradeACount: z.number().int(),
  gradeBCount: z.number().int(),
  gradeCCount: z.number().int(),
  gradeDCount: z.number().int(),
  gradeECount: z.number().int(),
  gradeFCount: z.number().int(),
  passedCount: z.number().int(),
  failedCount: z.number().int(),
  courseId: z.string(),
  course: z.unknown(),
  semester: z.unknown(),
  year: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date()
})),
  pagination: z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean()
})
});

// File: GradeCreateResult.schema.ts
export const GradeCreateResultSchema = z.object({
  id: z.string(),
  gradeACount: z.number().int(),
  gradeBCount: z.number().int(),
  gradeCCount: z.number().int(),
  gradeDCount: z.number().int(),
  gradeECount: z.number().int(),
  gradeFCount: z.number().int(),
  passedCount: z.number().int(),
  failedCount: z.number().int(),
  courseId: z.string(),
  course: z.unknown(),
  semester: z.unknown(),
  year: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// File: GradeCreateManyResult.schema.ts
export const GradeCreateManyResultSchema = z.object({
  count: z.number()
});

// File: GradeUpdateResult.schema.ts
export const GradeUpdateResultSchema = z.nullable(z.object({
  id: z.string(),
  gradeACount: z.number().int(),
  gradeBCount: z.number().int(),
  gradeCCount: z.number().int(),
  gradeDCount: z.number().int(),
  gradeECount: z.number().int(),
  gradeFCount: z.number().int(),
  passedCount: z.number().int(),
  failedCount: z.number().int(),
  courseId: z.string(),
  course: z.unknown(),
  semester: z.unknown(),
  year: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date()
}));

// File: GradeUpdateManyResult.schema.ts
export const GradeUpdateManyResultSchema = z.object({
  count: z.number()
});

// File: GradeUpsertResult.schema.ts
export const GradeUpsertResultSchema = z.object({
  id: z.string(),
  gradeACount: z.number().int(),
  gradeBCount: z.number().int(),
  gradeCCount: z.number().int(),
  gradeDCount: z.number().int(),
  gradeECount: z.number().int(),
  gradeFCount: z.number().int(),
  passedCount: z.number().int(),
  failedCount: z.number().int(),
  courseId: z.string(),
  course: z.unknown(),
  semester: z.unknown(),
  year: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// File: GradeDeleteResult.schema.ts
export const GradeDeleteResultSchema = z.nullable(z.object({
  id: z.string(),
  gradeACount: z.number().int(),
  gradeBCount: z.number().int(),
  gradeCCount: z.number().int(),
  gradeDCount: z.number().int(),
  gradeECount: z.number().int(),
  gradeFCount: z.number().int(),
  passedCount: z.number().int(),
  failedCount: z.number().int(),
  courseId: z.string(),
  course: z.unknown(),
  semester: z.unknown(),
  year: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date()
}));

// File: GradeDeleteManyResult.schema.ts
export const GradeDeleteManyResultSchema = z.object({
  count: z.number()
});

// File: GradeAggregateResult.schema.ts
export const GradeAggregateResultSchema = z.object({  _count: z.object({
    id: z.number(),
    gradeACount: z.number(),
    gradeBCount: z.number(),
    gradeCCount: z.number(),
    gradeDCount: z.number(),
    gradeECount: z.number(),
    gradeFCount: z.number(),
    passedCount: z.number(),
    failedCount: z.number(),
    courseId: z.number(),
    course: z.number(),
    semester: z.number(),
    year: z.number(),
    createdAt: z.number(),
    updatedAt: z.number()
  }).optional(),
  _sum: z.object({
    gradeACount: z.number().nullable(),
    gradeBCount: z.number().nullable(),
    gradeCCount: z.number().nullable(),
    gradeDCount: z.number().nullable(),
    gradeECount: z.number().nullable(),
    gradeFCount: z.number().nullable(),
    passedCount: z.number().nullable(),
    failedCount: z.number().nullable(),
    year: z.number().nullable()
  }).nullable().optional(),
  _avg: z.object({
    gradeACount: z.number().nullable(),
    gradeBCount: z.number().nullable(),
    gradeCCount: z.number().nullable(),
    gradeDCount: z.number().nullable(),
    gradeECount: z.number().nullable(),
    gradeFCount: z.number().nullable(),
    passedCount: z.number().nullable(),
    failedCount: z.number().nullable(),
    year: z.number().nullable()
  }).nullable().optional(),
  _min: z.object({
    id: z.string().nullable(),
    gradeACount: z.number().int().nullable(),
    gradeBCount: z.number().int().nullable(),
    gradeCCount: z.number().int().nullable(),
    gradeDCount: z.number().int().nullable(),
    gradeECount: z.number().int().nullable(),
    gradeFCount: z.number().int().nullable(),
    passedCount: z.number().int().nullable(),
    failedCount: z.number().int().nullable(),
    courseId: z.string().nullable(),
    year: z.number().int().nullable(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable()
  }).nullable().optional(),
  _max: z.object({
    id: z.string().nullable(),
    gradeACount: z.number().int().nullable(),
    gradeBCount: z.number().int().nullable(),
    gradeCCount: z.number().int().nullable(),
    gradeDCount: z.number().int().nullable(),
    gradeECount: z.number().int().nullable(),
    gradeFCount: z.number().int().nullable(),
    passedCount: z.number().int().nullable(),
    failedCount: z.number().int().nullable(),
    courseId: z.string().nullable(),
    year: z.number().int().nullable(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable()
  }).nullable().optional()});

// File: GradeGroupByResult.schema.ts
export const GradeGroupByResultSchema = z.array(z.object({
  id: z.string(),
  gradeACount: z.number().int(),
  gradeBCount: z.number().int(),
  gradeCCount: z.number().int(),
  gradeDCount: z.number().int(),
  gradeECount: z.number().int(),
  gradeFCount: z.number().int(),
  passedCount: z.number().int(),
  failedCount: z.number().int(),
  courseId: z.string(),
  year: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  _count: z.object({
    id: z.number(),
    gradeACount: z.number(),
    gradeBCount: z.number(),
    gradeCCount: z.number(),
    gradeDCount: z.number(),
    gradeECount: z.number(),
    gradeFCount: z.number(),
    passedCount: z.number(),
    failedCount: z.number(),
    courseId: z.number(),
    course: z.number(),
    semester: z.number(),
    year: z.number(),
    createdAt: z.number(),
    updatedAt: z.number()
  }).optional(),
  _sum: z.object({
    gradeACount: z.number().nullable(),
    gradeBCount: z.number().nullable(),
    gradeCCount: z.number().nullable(),
    gradeDCount: z.number().nullable(),
    gradeECount: z.number().nullable(),
    gradeFCount: z.number().nullable(),
    passedCount: z.number().nullable(),
    failedCount: z.number().nullable(),
    year: z.number().nullable()
  }).nullable().optional(),
  _avg: z.object({
    gradeACount: z.number().nullable(),
    gradeBCount: z.number().nullable(),
    gradeCCount: z.number().nullable(),
    gradeDCount: z.number().nullable(),
    gradeECount: z.number().nullable(),
    gradeFCount: z.number().nullable(),
    passedCount: z.number().nullable(),
    failedCount: z.number().nullable(),
    year: z.number().nullable()
  }).nullable().optional(),
  _min: z.object({
    id: z.string().nullable(),
    gradeACount: z.number().int().nullable(),
    gradeBCount: z.number().int().nullable(),
    gradeCCount: z.number().int().nullable(),
    gradeDCount: z.number().int().nullable(),
    gradeECount: z.number().int().nullable(),
    gradeFCount: z.number().int().nullable(),
    passedCount: z.number().int().nullable(),
    failedCount: z.number().int().nullable(),
    courseId: z.string().nullable(),
    year: z.number().int().nullable(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable()
  }).nullable().optional(),
  _max: z.object({
    id: z.string().nullable(),
    gradeACount: z.number().int().nullable(),
    gradeBCount: z.number().int().nullable(),
    gradeCCount: z.number().int().nullable(),
    gradeDCount: z.number().int().nullable(),
    gradeECount: z.number().int().nullable(),
    gradeFCount: z.number().int().nullable(),
    passedCount: z.number().int().nullable(),
    failedCount: z.number().int().nullable(),
    courseId: z.string().nullable(),
    year: z.number().int().nullable(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable()
  }).nullable().optional()
}));

// File: GradeCountResult.schema.ts
export const GradeCountResultSchema = z.number();

// File: FacultyFindUniqueResult.schema.ts
export const FacultyFindUniqueResultSchema = z.nullable(z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.array(z.unknown()),
  departments: z.array(z.unknown())
}));

// File: FacultyFindFirstResult.schema.ts
export const FacultyFindFirstResultSchema = z.nullable(z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.array(z.unknown()),
  departments: z.array(z.unknown())
}));

// File: FacultyFindManyResult.schema.ts
export const FacultyFindManyResultSchema = z.object({
  data: z.array(z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.array(z.unknown()),
  departments: z.array(z.unknown())
})),
  pagination: z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean()
})
});

// File: FacultyCreateResult.schema.ts
export const FacultyCreateResultSchema = z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.array(z.unknown()),
  departments: z.array(z.unknown())
});

// File: FacultyCreateManyResult.schema.ts
export const FacultyCreateManyResultSchema = z.object({
  count: z.number()
});

// File: FacultyUpdateResult.schema.ts
export const FacultyUpdateResultSchema = z.nullable(z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.array(z.unknown()),
  departments: z.array(z.unknown())
}));

// File: FacultyUpdateManyResult.schema.ts
export const FacultyUpdateManyResultSchema = z.object({
  count: z.number()
});

// File: FacultyUpsertResult.schema.ts
export const FacultyUpsertResultSchema = z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.array(z.unknown()),
  departments: z.array(z.unknown())
});

// File: FacultyDeleteResult.schema.ts
export const FacultyDeleteResultSchema = z.nullable(z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.array(z.unknown()),
  departments: z.array(z.unknown())
}));

// File: FacultyDeleteManyResult.schema.ts
export const FacultyDeleteManyResultSchema = z.object({
  count: z.number()
});

// File: FacultyAggregateResult.schema.ts
export const FacultyAggregateResultSchema = z.object({  _count: z.object({
    id: z.number(),
    nameNo: z.number(),
    nameEn: z.number(),
    code: z.number(),
    courses: z.number(),
    departments: z.number()
  }).optional(),
  _sum: z.object({
    code: z.number().nullable()
  }).nullable().optional(),
  _avg: z.object({
    code: z.number().nullable()
  }).nullable().optional(),
  _min: z.object({
    id: z.string().nullable(),
    nameNo: z.string().nullable(),
    nameEn: z.string().nullable(),
    code: z.number().int().nullable()
  }).nullable().optional(),
  _max: z.object({
    id: z.string().nullable(),
    nameNo: z.string().nullable(),
    nameEn: z.string().nullable(),
    code: z.number().int().nullable()
  }).nullable().optional()});

// File: FacultyGroupByResult.schema.ts
export const FacultyGroupByResultSchema = z.array(z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  _count: z.object({
    id: z.number(),
    nameNo: z.number(),
    nameEn: z.number(),
    code: z.number(),
    courses: z.number(),
    departments: z.number()
  }).optional(),
  _sum: z.object({
    code: z.number().nullable()
  }).nullable().optional(),
  _avg: z.object({
    code: z.number().nullable()
  }).nullable().optional(),
  _min: z.object({
    id: z.string().nullable(),
    nameNo: z.string().nullable(),
    nameEn: z.string().nullable(),
    code: z.number().int().nullable()
  }).nullable().optional(),
  _max: z.object({
    id: z.string().nullable(),
    nameNo: z.string().nullable(),
    nameEn: z.string().nullable(),
    code: z.number().int().nullable()
  }).nullable().optional()
}));

// File: FacultyCountResult.schema.ts
export const FacultyCountResultSchema = z.number();

// File: DepartmentFindUniqueResult.schema.ts
export const DepartmentFindUniqueResultSchema = z.nullable(z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.array(z.unknown()),
  facultyId: z.string(),
  faculty: z.unknown()
}));

// File: DepartmentFindFirstResult.schema.ts
export const DepartmentFindFirstResultSchema = z.nullable(z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.array(z.unknown()),
  facultyId: z.string(),
  faculty: z.unknown()
}));

// File: DepartmentFindManyResult.schema.ts
export const DepartmentFindManyResultSchema = z.object({
  data: z.array(z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.array(z.unknown()),
  facultyId: z.string(),
  faculty: z.unknown()
})),
  pagination: z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean()
})
});

// File: DepartmentCreateResult.schema.ts
export const DepartmentCreateResultSchema = z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.array(z.unknown()),
  facultyId: z.string(),
  faculty: z.unknown()
});

// File: DepartmentCreateManyResult.schema.ts
export const DepartmentCreateManyResultSchema = z.object({
  count: z.number()
});

// File: DepartmentUpdateResult.schema.ts
export const DepartmentUpdateResultSchema = z.nullable(z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.array(z.unknown()),
  facultyId: z.string(),
  faculty: z.unknown()
}));

// File: DepartmentUpdateManyResult.schema.ts
export const DepartmentUpdateManyResultSchema = z.object({
  count: z.number()
});

// File: DepartmentUpsertResult.schema.ts
export const DepartmentUpsertResultSchema = z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.array(z.unknown()),
  facultyId: z.string(),
  faculty: z.unknown()
});

// File: DepartmentDeleteResult.schema.ts
export const DepartmentDeleteResultSchema = z.nullable(z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.array(z.unknown()),
  facultyId: z.string(),
  faculty: z.unknown()
}));

// File: DepartmentDeleteManyResult.schema.ts
export const DepartmentDeleteManyResultSchema = z.object({
  count: z.number()
});

// File: DepartmentAggregateResult.schema.ts
export const DepartmentAggregateResultSchema = z.object({  _count: z.object({
    id: z.number(),
    nameNo: z.number(),
    nameEn: z.number(),
    code: z.number(),
    courses: z.number(),
    facultyId: z.number(),
    faculty: z.number()
  }).optional(),
  _sum: z.object({
    code: z.number().nullable()
  }).nullable().optional(),
  _avg: z.object({
    code: z.number().nullable()
  }).nullable().optional(),
  _min: z.object({
    id: z.string().nullable(),
    nameNo: z.string().nullable(),
    nameEn: z.string().nullable(),
    code: z.number().int().nullable(),
    facultyId: z.string().nullable()
  }).nullable().optional(),
  _max: z.object({
    id: z.string().nullable(),
    nameNo: z.string().nullable(),
    nameEn: z.string().nullable(),
    code: z.number().int().nullable(),
    facultyId: z.string().nullable()
  }).nullable().optional()});

// File: DepartmentGroupByResult.schema.ts
export const DepartmentGroupByResultSchema = z.array(z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  facultyId: z.string(),
  _count: z.object({
    id: z.number(),
    nameNo: z.number(),
    nameEn: z.number(),
    code: z.number(),
    courses: z.number(),
    facultyId: z.number(),
    faculty: z.number()
  }).optional(),
  _sum: z.object({
    code: z.number().nullable()
  }).nullable().optional(),
  _avg: z.object({
    code: z.number().nullable()
  }).nullable().optional(),
  _min: z.object({
    id: z.string().nullable(),
    nameNo: z.string().nullable(),
    nameEn: z.string().nullable(),
    code: z.number().int().nullable(),
    facultyId: z.string().nullable()
  }).nullable().optional(),
  _max: z.object({
    id: z.string().nullable(),
    nameNo: z.string().nullable(),
    nameEn: z.string().nullable(),
    code: z.number().int().nullable(),
    facultyId: z.string().nullable()
  }).nullable().optional()
}));

// File: DepartmentCountResult.schema.ts
export const DepartmentCountResultSchema = z.number();

// File: index.ts


// File: index.ts


// File: Course.schema.ts

export const Course = z.object({
  id: z.string(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().nullable(),
  credits: z.number().nullable(),
  studyLevel: StudyLevelSchema,
  gradeType: GradeTypeSchema,
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int().nullable(),
  contentNo: z.string().nullable(),
  contentEn: z.string().nullable(),
  teachingMethodsNo: z.string().nullable(),
  teachingMethodsEn: z.string().nullable(),
  learningOutcomesNo: z.string().nullable(),
  learningOutcomesEn: z.string().nullable(),
  examTypeNo: z.string().nullable(),
  examTypeEn: z.string().nullable(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  taughtSemesters: z.array(SemesterSchema),
  teachingLanguages: z.array(TeachingLanguageSchema),
  campuses: z.array(CampusSchema),
  facultyId: z.string().nullable(),
  departmentId: z.string().nullable(),
  latestYearCheckedForNtnuData: z.number().int().nullable(),
});

export type Course = z.infer<typeof Course>;

// Legacy aliases
export const CourseSchema = Course;
export type CourseType = z.infer<typeof Course>;

// File: Grade.schema.ts

export const Grade = z.object({
  id: z.string(),
  gradeACount: z.number().int(),
  gradeBCount: z.number().int(),
  gradeCCount: z.number().int(),
  gradeDCount: z.number().int(),
  gradeECount: z.number().int(),
  gradeFCount: z.number().int(),
  passedCount: z.number().int(),
  failedCount: z.number().int(),
  courseId: z.string(),
  semester: SemesterSchema,
  year: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Grade = z.infer<typeof Grade>;

// Legacy aliases
export const GradeSchema = Grade;
export type GradeModel = z.infer<typeof Grade>;

// File: Faculty.schema.ts

export const Faculty = z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
});

export type Faculty = z.infer<typeof Faculty>;

// Legacy aliases
export const FacultySchema = Faculty;
export type FacultyType = z.infer<typeof Faculty>;

// File: Department.schema.ts

export const Department = z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  facultyId: z.string(),
});

export type Department = z.infer<typeof Department>;

// Legacy aliases
export const DepartmentSchema = Department;
export type DepartmentType = z.infer<typeof Department>;
