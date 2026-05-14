// @ts-nocheck
/**
 * Prisma Zod Generator - Single File (inlined)
 * Auto-generated. Do not edit.
 */

import * as z from 'zod';
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

const coursewhereinputSchema = z.object({
  AND: z.union([z.lazy(() => CourseWhereInputObjectSchema), z.lazy(() => CourseWhereInputObjectSchema).array()]).optional(),
  OR: z.lazy(() => CourseWhereInputObjectSchema).array().optional(),
  NOT: z.union([z.lazy(() => CourseWhereInputObjectSchema), z.lazy(() => CourseWhereInputObjectSchema).array()]).optional(),
  id: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  code: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  nameNo: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  nameEn: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  credits: z.union([z.lazy(() => FloatNullableFilterObjectSchema), z.number()]).optional().nullable(),
  studyLevel: z.union([z.lazy(() => EnumStudyLevelFilterObjectSchema), StudyLevelSchema]).optional(),
  gradeType: z.union([z.lazy(() => EnumGradeTypeFilterObjectSchema), GradeTypeSchema]).optional(),
  firstYearTaught: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  lastYearTaught: z.union([z.lazy(() => IntNullableFilterObjectSchema), z.number().int()]).optional().nullable(),
  contentNo: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  contentEn: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  teachingMethodsNo: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  teachingMethodsEn: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  learningOutcomesNo: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  learningOutcomesEn: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  examTypeNo: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  examTypeEn: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  candidateCount: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  averageGrade: z.union([z.lazy(() => FloatFilterObjectSchema), z.number()]).optional(),
  passRate: z.union([z.lazy(() => FloatFilterObjectSchema), z.number()]).optional(),
  createdAt: z.union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()]).optional(),
  updatedAt: z.union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()]).optional(),
  taughtSemesters: z.lazy(() => EnumSemesterNullableListFilterObjectSchema).optional(),
  teachingLanguages: z.lazy(() => EnumTeachingLanguageNullableListFilterObjectSchema).optional(),
  campuses: z.lazy(() => EnumCampusNullableListFilterObjectSchema).optional(),
  facultyId: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  departmentId: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  latestYearCheckedForNtnuData: z.union([z.lazy(() => IntNullableFilterObjectSchema), z.number().int()]).optional().nullable(),
  grades: z.lazy(() => GradeListRelationFilterObjectSchema).optional(),
  faculty: z.union([z.lazy(() => FacultyNullableScalarRelationFilterObjectSchema), z.lazy(() => FacultyWhereInputObjectSchema)]).optional(),
  department: z.union([z.lazy(() => DepartmentNullableScalarRelationFilterObjectSchema), z.lazy(() => DepartmentWhereInputObjectSchema)]).optional()
}).strict();
export const CourseWhereInputObjectSchema: z.ZodType<Prisma.CourseWhereInput> = coursewhereinputSchema as unknown as z.ZodType<Prisma.CourseWhereInput>;
export const CourseWhereInputObjectZodSchema = coursewhereinputSchema;


// File: CourseOrderByWithRelationInput.schema.ts
const __makeSchema_CourseOrderByWithRelationInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  credits: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  studyLevel: SortOrderSchema.optional(),
  gradeType: SortOrderSchema.optional(),
  firstYearTaught: SortOrderSchema.optional(),
  lastYearTaught: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  contentNo: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  contentEn: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  teachingMethodsNo: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  teachingMethodsEn: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  learningOutcomesNo: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  learningOutcomesEn: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  examTypeNo: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  examTypeEn: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  candidateCount: SortOrderSchema.optional(),
  averageGrade: SortOrderSchema.optional(),
  passRate: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional(),
  taughtSemesters: SortOrderSchema.optional(),
  teachingLanguages: SortOrderSchema.optional(),
  campuses: SortOrderSchema.optional(),
  facultyId: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  departmentId: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  latestYearCheckedForNtnuData: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  grades: z.lazy(() => GradeOrderByRelationAggregateInputObjectSchema).optional(),
  faculty: z.lazy(() => FacultyOrderByWithRelationInputObjectSchema).optional(),
  department: z.lazy(() => DepartmentOrderByWithRelationInputObjectSchema).optional()
}).strict();
export const CourseOrderByWithRelationInputObjectSchema: z.ZodType<Prisma.CourseOrderByWithRelationInput> = __makeSchema_CourseOrderByWithRelationInput_schema() as unknown as z.ZodType<Prisma.CourseOrderByWithRelationInput>;
export const CourseOrderByWithRelationInputObjectZodSchema = __makeSchema_CourseOrderByWithRelationInput_schema();


// File: CourseWhereUniqueInput.schema.ts
const __makeSchema_CourseWhereUniqueInput_schema = () => z.object({
  id: z.string().optional(),
  code: z.string().optional()
}).strict();
export const CourseWhereUniqueInputObjectSchema: z.ZodType<Prisma.CourseWhereUniqueInput> = __makeSchema_CourseWhereUniqueInput_schema() as unknown as z.ZodType<Prisma.CourseWhereUniqueInput>;
export const CourseWhereUniqueInputObjectZodSchema = __makeSchema_CourseWhereUniqueInput_schema();


// File: CourseOrderByWithAggregationInput.schema.ts
const __makeSchema_CourseOrderByWithAggregationInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  credits: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  studyLevel: SortOrderSchema.optional(),
  gradeType: SortOrderSchema.optional(),
  firstYearTaught: SortOrderSchema.optional(),
  lastYearTaught: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  contentNo: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  contentEn: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  teachingMethodsNo: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  teachingMethodsEn: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  learningOutcomesNo: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  learningOutcomesEn: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  examTypeNo: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  examTypeEn: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  candidateCount: SortOrderSchema.optional(),
  averageGrade: SortOrderSchema.optional(),
  passRate: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional(),
  taughtSemesters: SortOrderSchema.optional(),
  teachingLanguages: SortOrderSchema.optional(),
  campuses: SortOrderSchema.optional(),
  facultyId: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  departmentId: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  latestYearCheckedForNtnuData: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  _count: z.lazy(() => CourseCountOrderByAggregateInputObjectSchema).optional(),
  _avg: z.lazy(() => CourseAvgOrderByAggregateInputObjectSchema).optional(),
  _max: z.lazy(() => CourseMaxOrderByAggregateInputObjectSchema).optional(),
  _min: z.lazy(() => CourseMinOrderByAggregateInputObjectSchema).optional(),
  _sum: z.lazy(() => CourseSumOrderByAggregateInputObjectSchema).optional()
}).strict();
export const CourseOrderByWithAggregationInputObjectSchema: z.ZodType<Prisma.CourseOrderByWithAggregationInput> = __makeSchema_CourseOrderByWithAggregationInput_schema() as unknown as z.ZodType<Prisma.CourseOrderByWithAggregationInput>;
export const CourseOrderByWithAggregationInputObjectZodSchema = __makeSchema_CourseOrderByWithAggregationInput_schema();


// File: CourseScalarWhereWithAggregatesInput.schema.ts

const coursescalarwherewithaggregatesinputSchema = z.object({
  AND: z.union([z.lazy(() => CourseScalarWhereWithAggregatesInputObjectSchema), z.lazy(() => CourseScalarWhereWithAggregatesInputObjectSchema).array()]).optional(),
  OR: z.lazy(() => CourseScalarWhereWithAggregatesInputObjectSchema).array().optional(),
  NOT: z.union([z.lazy(() => CourseScalarWhereWithAggregatesInputObjectSchema), z.lazy(() => CourseScalarWhereWithAggregatesInputObjectSchema).array()]).optional(),
  id: z.union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()]).optional(),
  code: z.union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()]).optional(),
  nameNo: z.union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()]).optional(),
  nameEn: z.union([z.lazy(() => StringNullableWithAggregatesFilterObjectSchema), z.string()]).optional().nullable(),
  credits: z.union([z.lazy(() => FloatNullableWithAggregatesFilterObjectSchema), z.number()]).optional().nullable(),
  studyLevel: z.union([z.lazy(() => EnumStudyLevelWithAggregatesFilterObjectSchema), StudyLevelSchema]).optional(),
  gradeType: z.union([z.lazy(() => EnumGradeTypeWithAggregatesFilterObjectSchema), GradeTypeSchema]).optional(),
  firstYearTaught: z.union([z.lazy(() => IntWithAggregatesFilterObjectSchema), z.number().int()]).optional(),
  lastYearTaught: z.union([z.lazy(() => IntNullableWithAggregatesFilterObjectSchema), z.number().int()]).optional().nullable(),
  contentNo: z.union([z.lazy(() => StringNullableWithAggregatesFilterObjectSchema), z.string()]).optional().nullable(),
  contentEn: z.union([z.lazy(() => StringNullableWithAggregatesFilterObjectSchema), z.string()]).optional().nullable(),
  teachingMethodsNo: z.union([z.lazy(() => StringNullableWithAggregatesFilterObjectSchema), z.string()]).optional().nullable(),
  teachingMethodsEn: z.union([z.lazy(() => StringNullableWithAggregatesFilterObjectSchema), z.string()]).optional().nullable(),
  learningOutcomesNo: z.union([z.lazy(() => StringNullableWithAggregatesFilterObjectSchema), z.string()]).optional().nullable(),
  learningOutcomesEn: z.union([z.lazy(() => StringNullableWithAggregatesFilterObjectSchema), z.string()]).optional().nullable(),
  examTypeNo: z.union([z.lazy(() => StringNullableWithAggregatesFilterObjectSchema), z.string()]).optional().nullable(),
  examTypeEn: z.union([z.lazy(() => StringNullableWithAggregatesFilterObjectSchema), z.string()]).optional().nullable(),
  candidateCount: z.union([z.lazy(() => IntWithAggregatesFilterObjectSchema), z.number().int()]).optional(),
  averageGrade: z.union([z.lazy(() => FloatWithAggregatesFilterObjectSchema), z.number()]).optional(),
  passRate: z.union([z.lazy(() => FloatWithAggregatesFilterObjectSchema), z.number()]).optional(),
  createdAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterObjectSchema), z.coerce.date()]).optional(),
  updatedAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterObjectSchema), z.coerce.date()]).optional(),
  taughtSemesters: z.lazy(() => EnumSemesterNullableListFilterObjectSchema).optional(),
  teachingLanguages: z.lazy(() => EnumTeachingLanguageNullableListFilterObjectSchema).optional(),
  campuses: z.lazy(() => EnumCampusNullableListFilterObjectSchema).optional(),
  facultyId: z.union([z.lazy(() => StringNullableWithAggregatesFilterObjectSchema), z.string()]).optional().nullable(),
  departmentId: z.union([z.lazy(() => StringNullableWithAggregatesFilterObjectSchema), z.string()]).optional().nullable(),
  latestYearCheckedForNtnuData: z.union([z.lazy(() => IntNullableWithAggregatesFilterObjectSchema), z.number().int()]).optional().nullable()
}).strict();
export const CourseScalarWhereWithAggregatesInputObjectSchema: z.ZodType<Prisma.CourseScalarWhereWithAggregatesInput> = coursescalarwherewithaggregatesinputSchema as unknown as z.ZodType<Prisma.CourseScalarWhereWithAggregatesInput>;
export const CourseScalarWhereWithAggregatesInputObjectZodSchema = coursescalarwherewithaggregatesinputSchema;


// File: GradeWhereInput.schema.ts

const gradewhereinputSchema = z.object({
  AND: z.union([z.lazy(() => GradeWhereInputObjectSchema), z.lazy(() => GradeWhereInputObjectSchema).array()]).optional(),
  OR: z.lazy(() => GradeWhereInputObjectSchema).array().optional(),
  NOT: z.union([z.lazy(() => GradeWhereInputObjectSchema), z.lazy(() => GradeWhereInputObjectSchema).array()]).optional(),
  id: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  gradeACount: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  gradeBCount: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  gradeCCount: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  gradeDCount: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  gradeECount: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  gradeFCount: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  passedCount: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  failedCount: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  courseId: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  semester: z.union([z.lazy(() => EnumSemesterFilterObjectSchema), SemesterSchema]).optional(),
  year: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  createdAt: z.union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()]).optional(),
  updatedAt: z.union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()]).optional(),
  course: z.union([z.lazy(() => CourseScalarRelationFilterObjectSchema), z.lazy(() => CourseWhereInputObjectSchema)]).optional()
}).strict();
export const GradeWhereInputObjectSchema: z.ZodType<Prisma.GradeWhereInput> = gradewhereinputSchema as unknown as z.ZodType<Prisma.GradeWhereInput>;
export const GradeWhereInputObjectZodSchema = gradewhereinputSchema;


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
  course: z.lazy(() => CourseOrderByWithRelationInputObjectSchema).optional()
}).strict();
export const GradeOrderByWithRelationInputObjectSchema: z.ZodType<Prisma.GradeOrderByWithRelationInput> = __makeSchema_GradeOrderByWithRelationInput_schema() as unknown as z.ZodType<Prisma.GradeOrderByWithRelationInput>;
export const GradeOrderByWithRelationInputObjectZodSchema = __makeSchema_GradeOrderByWithRelationInput_schema();


// File: GradeWhereUniqueInput.schema.ts
const __makeSchema_GradeWhereUniqueInput_schema = () => z.object({
  id: z.string().optional(),
  courseId_semester_year: z.lazy(() => GradeCourseIdSemesterYearCompoundUniqueInputObjectSchema).optional()
}).strict();
export const GradeWhereUniqueInputObjectSchema: z.ZodType<Prisma.GradeWhereUniqueInput> = __makeSchema_GradeWhereUniqueInput_schema() as unknown as z.ZodType<Prisma.GradeWhereUniqueInput>;
export const GradeWhereUniqueInputObjectZodSchema = __makeSchema_GradeWhereUniqueInput_schema();


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
  _count: z.lazy(() => GradeCountOrderByAggregateInputObjectSchema).optional(),
  _avg: z.lazy(() => GradeAvgOrderByAggregateInputObjectSchema).optional(),
  _max: z.lazy(() => GradeMaxOrderByAggregateInputObjectSchema).optional(),
  _min: z.lazy(() => GradeMinOrderByAggregateInputObjectSchema).optional(),
  _sum: z.lazy(() => GradeSumOrderByAggregateInputObjectSchema).optional()
}).strict();
export const GradeOrderByWithAggregationInputObjectSchema: z.ZodType<Prisma.GradeOrderByWithAggregationInput> = __makeSchema_GradeOrderByWithAggregationInput_schema() as unknown as z.ZodType<Prisma.GradeOrderByWithAggregationInput>;
export const GradeOrderByWithAggregationInputObjectZodSchema = __makeSchema_GradeOrderByWithAggregationInput_schema();


// File: GradeScalarWhereWithAggregatesInput.schema.ts

const gradescalarwherewithaggregatesinputSchema = z.object({
  AND: z.union([z.lazy(() => GradeScalarWhereWithAggregatesInputObjectSchema), z.lazy(() => GradeScalarWhereWithAggregatesInputObjectSchema).array()]).optional(),
  OR: z.lazy(() => GradeScalarWhereWithAggregatesInputObjectSchema).array().optional(),
  NOT: z.union([z.lazy(() => GradeScalarWhereWithAggregatesInputObjectSchema), z.lazy(() => GradeScalarWhereWithAggregatesInputObjectSchema).array()]).optional(),
  id: z.union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()]).optional(),
  gradeACount: z.union([z.lazy(() => IntWithAggregatesFilterObjectSchema), z.number().int()]).optional(),
  gradeBCount: z.union([z.lazy(() => IntWithAggregatesFilterObjectSchema), z.number().int()]).optional(),
  gradeCCount: z.union([z.lazy(() => IntWithAggregatesFilterObjectSchema), z.number().int()]).optional(),
  gradeDCount: z.union([z.lazy(() => IntWithAggregatesFilterObjectSchema), z.number().int()]).optional(),
  gradeECount: z.union([z.lazy(() => IntWithAggregatesFilterObjectSchema), z.number().int()]).optional(),
  gradeFCount: z.union([z.lazy(() => IntWithAggregatesFilterObjectSchema), z.number().int()]).optional(),
  passedCount: z.union([z.lazy(() => IntWithAggregatesFilterObjectSchema), z.number().int()]).optional(),
  failedCount: z.union([z.lazy(() => IntWithAggregatesFilterObjectSchema), z.number().int()]).optional(),
  courseId: z.union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()]).optional(),
  semester: z.union([z.lazy(() => EnumSemesterWithAggregatesFilterObjectSchema), SemesterSchema]).optional(),
  year: z.union([z.lazy(() => IntWithAggregatesFilterObjectSchema), z.number().int()]).optional(),
  createdAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterObjectSchema), z.coerce.date()]).optional(),
  updatedAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterObjectSchema), z.coerce.date()]).optional()
}).strict();
export const GradeScalarWhereWithAggregatesInputObjectSchema: z.ZodType<Prisma.GradeScalarWhereWithAggregatesInput> = gradescalarwherewithaggregatesinputSchema as unknown as z.ZodType<Prisma.GradeScalarWhereWithAggregatesInput>;
export const GradeScalarWhereWithAggregatesInputObjectZodSchema = gradescalarwherewithaggregatesinputSchema;


// File: FacultyWhereInput.schema.ts

const facultywhereinputSchema = z.object({
  AND: z.union([z.lazy(() => FacultyWhereInputObjectSchema), z.lazy(() => FacultyWhereInputObjectSchema).array()]).optional(),
  OR: z.lazy(() => FacultyWhereInputObjectSchema).array().optional(),
  NOT: z.union([z.lazy(() => FacultyWhereInputObjectSchema), z.lazy(() => FacultyWhereInputObjectSchema).array()]).optional(),
  id: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  nameNo: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  nameEn: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  code: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  courses: z.lazy(() => CourseListRelationFilterObjectSchema).optional(),
  departments: z.lazy(() => DepartmentListRelationFilterObjectSchema).optional()
}).strict();
export const FacultyWhereInputObjectSchema: z.ZodType<Prisma.FacultyWhereInput> = facultywhereinputSchema as unknown as z.ZodType<Prisma.FacultyWhereInput>;
export const FacultyWhereInputObjectZodSchema = facultywhereinputSchema;


// File: FacultyOrderByWithRelationInput.schema.ts
const __makeSchema_FacultyOrderByWithRelationInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  courses: z.lazy(() => CourseOrderByRelationAggregateInputObjectSchema).optional(),
  departments: z.lazy(() => DepartmentOrderByRelationAggregateInputObjectSchema).optional()
}).strict();
export const FacultyOrderByWithRelationInputObjectSchema: z.ZodType<Prisma.FacultyOrderByWithRelationInput> = __makeSchema_FacultyOrderByWithRelationInput_schema() as unknown as z.ZodType<Prisma.FacultyOrderByWithRelationInput>;
export const FacultyOrderByWithRelationInputObjectZodSchema = __makeSchema_FacultyOrderByWithRelationInput_schema();


// File: FacultyWhereUniqueInput.schema.ts
const __makeSchema_FacultyWhereUniqueInput_schema = () => z.object({
  id: z.string().optional(),
  code: z.number().int().optional()
}).strict();
export const FacultyWhereUniqueInputObjectSchema: z.ZodType<Prisma.FacultyWhereUniqueInput> = __makeSchema_FacultyWhereUniqueInput_schema() as unknown as z.ZodType<Prisma.FacultyWhereUniqueInput>;
export const FacultyWhereUniqueInputObjectZodSchema = __makeSchema_FacultyWhereUniqueInput_schema();


// File: FacultyOrderByWithAggregationInput.schema.ts
const __makeSchema_FacultyOrderByWithAggregationInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  _count: z.lazy(() => FacultyCountOrderByAggregateInputObjectSchema).optional(),
  _avg: z.lazy(() => FacultyAvgOrderByAggregateInputObjectSchema).optional(),
  _max: z.lazy(() => FacultyMaxOrderByAggregateInputObjectSchema).optional(),
  _min: z.lazy(() => FacultyMinOrderByAggregateInputObjectSchema).optional(),
  _sum: z.lazy(() => FacultySumOrderByAggregateInputObjectSchema).optional()
}).strict();
export const FacultyOrderByWithAggregationInputObjectSchema: z.ZodType<Prisma.FacultyOrderByWithAggregationInput> = __makeSchema_FacultyOrderByWithAggregationInput_schema() as unknown as z.ZodType<Prisma.FacultyOrderByWithAggregationInput>;
export const FacultyOrderByWithAggregationInputObjectZodSchema = __makeSchema_FacultyOrderByWithAggregationInput_schema();


// File: FacultyScalarWhereWithAggregatesInput.schema.ts

const facultyscalarwherewithaggregatesinputSchema = z.object({
  AND: z.union([z.lazy(() => FacultyScalarWhereWithAggregatesInputObjectSchema), z.lazy(() => FacultyScalarWhereWithAggregatesInputObjectSchema).array()]).optional(),
  OR: z.lazy(() => FacultyScalarWhereWithAggregatesInputObjectSchema).array().optional(),
  NOT: z.union([z.lazy(() => FacultyScalarWhereWithAggregatesInputObjectSchema), z.lazy(() => FacultyScalarWhereWithAggregatesInputObjectSchema).array()]).optional(),
  id: z.union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()]).optional(),
  nameNo: z.union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()]).optional(),
  nameEn: z.union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()]).optional(),
  code: z.union([z.lazy(() => IntWithAggregatesFilterObjectSchema), z.number().int()]).optional()
}).strict();
export const FacultyScalarWhereWithAggregatesInputObjectSchema: z.ZodType<Prisma.FacultyScalarWhereWithAggregatesInput> = facultyscalarwherewithaggregatesinputSchema as unknown as z.ZodType<Prisma.FacultyScalarWhereWithAggregatesInput>;
export const FacultyScalarWhereWithAggregatesInputObjectZodSchema = facultyscalarwherewithaggregatesinputSchema;


// File: DepartmentWhereInput.schema.ts

const departmentwhereinputSchema = z.object({
  AND: z.union([z.lazy(() => DepartmentWhereInputObjectSchema), z.lazy(() => DepartmentWhereInputObjectSchema).array()]).optional(),
  OR: z.lazy(() => DepartmentWhereInputObjectSchema).array().optional(),
  NOT: z.union([z.lazy(() => DepartmentWhereInputObjectSchema), z.lazy(() => DepartmentWhereInputObjectSchema).array()]).optional(),
  id: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  nameNo: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  nameEn: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  code: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  facultyId: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  courses: z.lazy(() => CourseListRelationFilterObjectSchema).optional(),
  faculty: z.union([z.lazy(() => FacultyScalarRelationFilterObjectSchema), z.lazy(() => FacultyWhereInputObjectSchema)]).optional()
}).strict();
export const DepartmentWhereInputObjectSchema: z.ZodType<Prisma.DepartmentWhereInput> = departmentwhereinputSchema as unknown as z.ZodType<Prisma.DepartmentWhereInput>;
export const DepartmentWhereInputObjectZodSchema = departmentwhereinputSchema;


// File: DepartmentOrderByWithRelationInput.schema.ts
const __makeSchema_DepartmentOrderByWithRelationInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  facultyId: SortOrderSchema.optional(),
  courses: z.lazy(() => CourseOrderByRelationAggregateInputObjectSchema).optional(),
  faculty: z.lazy(() => FacultyOrderByWithRelationInputObjectSchema).optional()
}).strict();
export const DepartmentOrderByWithRelationInputObjectSchema: z.ZodType<Prisma.DepartmentOrderByWithRelationInput> = __makeSchema_DepartmentOrderByWithRelationInput_schema() as unknown as z.ZodType<Prisma.DepartmentOrderByWithRelationInput>;
export const DepartmentOrderByWithRelationInputObjectZodSchema = __makeSchema_DepartmentOrderByWithRelationInput_schema();


// File: DepartmentWhereUniqueInput.schema.ts
const __makeSchema_DepartmentWhereUniqueInput_schema = () => z.object({
  id: z.string().optional(),
  code: z.number().int().optional()
}).strict();
export const DepartmentWhereUniqueInputObjectSchema: z.ZodType<Prisma.DepartmentWhereUniqueInput> = __makeSchema_DepartmentWhereUniqueInput_schema() as unknown as z.ZodType<Prisma.DepartmentWhereUniqueInput>;
export const DepartmentWhereUniqueInputObjectZodSchema = __makeSchema_DepartmentWhereUniqueInput_schema();


// File: DepartmentOrderByWithAggregationInput.schema.ts
const __makeSchema_DepartmentOrderByWithAggregationInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  facultyId: SortOrderSchema.optional(),
  _count: z.lazy(() => DepartmentCountOrderByAggregateInputObjectSchema).optional(),
  _avg: z.lazy(() => DepartmentAvgOrderByAggregateInputObjectSchema).optional(),
  _max: z.lazy(() => DepartmentMaxOrderByAggregateInputObjectSchema).optional(),
  _min: z.lazy(() => DepartmentMinOrderByAggregateInputObjectSchema).optional(),
  _sum: z.lazy(() => DepartmentSumOrderByAggregateInputObjectSchema).optional()
}).strict();
export const DepartmentOrderByWithAggregationInputObjectSchema: z.ZodType<Prisma.DepartmentOrderByWithAggregationInput> = __makeSchema_DepartmentOrderByWithAggregationInput_schema() as unknown as z.ZodType<Prisma.DepartmentOrderByWithAggregationInput>;
export const DepartmentOrderByWithAggregationInputObjectZodSchema = __makeSchema_DepartmentOrderByWithAggregationInput_schema();


// File: DepartmentScalarWhereWithAggregatesInput.schema.ts

const departmentscalarwherewithaggregatesinputSchema = z.object({
  AND: z.union([z.lazy(() => DepartmentScalarWhereWithAggregatesInputObjectSchema), z.lazy(() => DepartmentScalarWhereWithAggregatesInputObjectSchema).array()]).optional(),
  OR: z.lazy(() => DepartmentScalarWhereWithAggregatesInputObjectSchema).array().optional(),
  NOT: z.union([z.lazy(() => DepartmentScalarWhereWithAggregatesInputObjectSchema), z.lazy(() => DepartmentScalarWhereWithAggregatesInputObjectSchema).array()]).optional(),
  id: z.union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()]).optional(),
  nameNo: z.union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()]).optional(),
  nameEn: z.union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()]).optional(),
  code: z.union([z.lazy(() => IntWithAggregatesFilterObjectSchema), z.number().int()]).optional(),
  facultyId: z.union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()]).optional()
}).strict();
export const DepartmentScalarWhereWithAggregatesInputObjectSchema: z.ZodType<Prisma.DepartmentScalarWhereWithAggregatesInput> = departmentscalarwherewithaggregatesinputSchema as unknown as z.ZodType<Prisma.DepartmentScalarWhereWithAggregatesInput>;
export const DepartmentScalarWhereWithAggregatesInputObjectZodSchema = departmentscalarwherewithaggregatesinputSchema;


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
  taughtSemesters: z.union([z.lazy(() => CourseCreatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseCreateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseCreatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable(),
  grades: z.lazy(() => GradeCreateNestedManyWithoutCourseInputObjectSchema).optional(),
  faculty: z.lazy(() => FacultyCreateNestedOneWithoutCoursesInputObjectSchema).optional(),
  department: z.lazy(() => DepartmentCreateNestedOneWithoutCoursesInputObjectSchema).optional()
}).strict();
export const CourseCreateInputObjectSchema: z.ZodType<Prisma.CourseCreateInput> = __makeSchema_CourseCreateInput_schema() as unknown as z.ZodType<Prisma.CourseCreateInput>;
export const CourseCreateInputObjectZodSchema = __makeSchema_CourseCreateInput_schema();


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
  taughtSemesters: z.union([z.lazy(() => CourseCreatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseCreateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseCreatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  facultyId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable(),
  grades: z.lazy(() => GradeUncheckedCreateNestedManyWithoutCourseInputObjectSchema).optional()
}).strict();
export const CourseUncheckedCreateInputObjectSchema: z.ZodType<Prisma.CourseUncheckedCreateInput> = __makeSchema_CourseUncheckedCreateInput_schema() as unknown as z.ZodType<Prisma.CourseUncheckedCreateInput>;
export const CourseUncheckedCreateInputObjectZodSchema = __makeSchema_CourseUncheckedCreateInput_schema();


// File: CourseUpdateInput.schema.ts
const __makeSchema_CourseUpdateInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  credits: z.union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, z.lazy(() => EnumStudyLevelFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeType: z.union([GradeTypeSchema, z.lazy(() => EnumGradeTypeFieldUpdateOperationsInputObjectSchema)]).optional(),
  firstYearTaught: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  lastYearTaught: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  candidateCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  averageGrade: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  passRate: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  taughtSemesters: z.union([z.lazy(() => CourseUpdatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseUpdateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseUpdatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  grades: z.lazy(() => GradeUpdateManyWithoutCourseNestedInputObjectSchema).optional(),
  faculty: z.lazy(() => FacultyUpdateOneWithoutCoursesNestedInputObjectSchema).optional(),
  department: z.lazy(() => DepartmentUpdateOneWithoutCoursesNestedInputObjectSchema).optional()
}).strict();
export const CourseUpdateInputObjectSchema: z.ZodType<Prisma.CourseUpdateInput> = __makeSchema_CourseUpdateInput_schema() as unknown as z.ZodType<Prisma.CourseUpdateInput>;
export const CourseUpdateInputObjectZodSchema = __makeSchema_CourseUpdateInput_schema();


// File: CourseUncheckedUpdateInput.schema.ts
const __makeSchema_CourseUncheckedUpdateInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  credits: z.union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, z.lazy(() => EnumStudyLevelFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeType: z.union([GradeTypeSchema, z.lazy(() => EnumGradeTypeFieldUpdateOperationsInputObjectSchema)]).optional(),
  firstYearTaught: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  lastYearTaught: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  candidateCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  averageGrade: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  passRate: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  taughtSemesters: z.union([z.lazy(() => CourseUpdatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseUpdateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseUpdatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  facultyId: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  departmentId: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  grades: z.lazy(() => GradeUncheckedUpdateManyWithoutCourseNestedInputObjectSchema).optional()
}).strict();
export const CourseUncheckedUpdateInputObjectSchema: z.ZodType<Prisma.CourseUncheckedUpdateInput> = __makeSchema_CourseUncheckedUpdateInput_schema() as unknown as z.ZodType<Prisma.CourseUncheckedUpdateInput>;
export const CourseUncheckedUpdateInputObjectZodSchema = __makeSchema_CourseUncheckedUpdateInput_schema();


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
  taughtSemesters: z.union([z.lazy(() => CourseCreatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseCreateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseCreatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  facultyId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable()
}).strict();
export const CourseCreateManyInputObjectSchema: z.ZodType<Prisma.CourseCreateManyInput> = __makeSchema_CourseCreateManyInput_schema() as unknown as z.ZodType<Prisma.CourseCreateManyInput>;
export const CourseCreateManyInputObjectZodSchema = __makeSchema_CourseCreateManyInput_schema();


// File: CourseUpdateManyMutationInput.schema.ts
const __makeSchema_CourseUpdateManyMutationInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  credits: z.union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, z.lazy(() => EnumStudyLevelFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeType: z.union([GradeTypeSchema, z.lazy(() => EnumGradeTypeFieldUpdateOperationsInputObjectSchema)]).optional(),
  firstYearTaught: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  lastYearTaught: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  candidateCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  averageGrade: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  passRate: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  taughtSemesters: z.union([z.lazy(() => CourseUpdatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseUpdateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseUpdatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable()
}).strict();
export const CourseUpdateManyMutationInputObjectSchema: z.ZodType<Prisma.CourseUpdateManyMutationInput> = __makeSchema_CourseUpdateManyMutationInput_schema() as unknown as z.ZodType<Prisma.CourseUpdateManyMutationInput>;
export const CourseUpdateManyMutationInputObjectZodSchema = __makeSchema_CourseUpdateManyMutationInput_schema();


// File: CourseUncheckedUpdateManyInput.schema.ts
const __makeSchema_CourseUncheckedUpdateManyInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  credits: z.union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, z.lazy(() => EnumStudyLevelFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeType: z.union([GradeTypeSchema, z.lazy(() => EnumGradeTypeFieldUpdateOperationsInputObjectSchema)]).optional(),
  firstYearTaught: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  lastYearTaught: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  candidateCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  averageGrade: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  passRate: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  taughtSemesters: z.union([z.lazy(() => CourseUpdatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseUpdateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseUpdatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  facultyId: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  departmentId: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable()
}).strict();
export const CourseUncheckedUpdateManyInputObjectSchema: z.ZodType<Prisma.CourseUncheckedUpdateManyInput> = __makeSchema_CourseUncheckedUpdateManyInput_schema() as unknown as z.ZodType<Prisma.CourseUncheckedUpdateManyInput>;
export const CourseUncheckedUpdateManyInputObjectZodSchema = __makeSchema_CourseUncheckedUpdateManyInput_schema();


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
  course: z.lazy(() => CourseCreateNestedOneWithoutGradesInputObjectSchema)
}).strict();
export const GradeCreateInputObjectSchema: z.ZodType<Prisma.GradeCreateInput> = __makeSchema_GradeCreateInput_schema() as unknown as z.ZodType<Prisma.GradeCreateInput>;
export const GradeCreateInputObjectZodSchema = __makeSchema_GradeCreateInput_schema();


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
export const GradeUncheckedCreateInputObjectSchema: z.ZodType<Prisma.GradeUncheckedCreateInput> = __makeSchema_GradeUncheckedCreateInput_schema() as unknown as z.ZodType<Prisma.GradeUncheckedCreateInput>;
export const GradeUncheckedCreateInputObjectZodSchema = __makeSchema_GradeUncheckedCreateInput_schema();


// File: GradeUpdateInput.schema.ts
const __makeSchema_GradeUpdateInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeACount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeBCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeCCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeDCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeECount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeFCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  passedCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  failedCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  semester: z.union([SemesterSchema, z.lazy(() => EnumSemesterFieldUpdateOperationsInputObjectSchema)]).optional(),
  year: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  course: z.lazy(() => CourseUpdateOneRequiredWithoutGradesNestedInputObjectSchema).optional()
}).strict();
export const GradeUpdateInputObjectSchema: z.ZodType<Prisma.GradeUpdateInput> = __makeSchema_GradeUpdateInput_schema() as unknown as z.ZodType<Prisma.GradeUpdateInput>;
export const GradeUpdateInputObjectZodSchema = __makeSchema_GradeUpdateInput_schema();


// File: GradeUncheckedUpdateInput.schema.ts
const __makeSchema_GradeUncheckedUpdateInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeACount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeBCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeCCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeDCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeECount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeFCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  passedCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  failedCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  courseId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  semester: z.union([SemesterSchema, z.lazy(() => EnumSemesterFieldUpdateOperationsInputObjectSchema)]).optional(),
  year: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional()
}).strict();
export const GradeUncheckedUpdateInputObjectSchema: z.ZodType<Prisma.GradeUncheckedUpdateInput> = __makeSchema_GradeUncheckedUpdateInput_schema() as unknown as z.ZodType<Prisma.GradeUncheckedUpdateInput>;
export const GradeUncheckedUpdateInputObjectZodSchema = __makeSchema_GradeUncheckedUpdateInput_schema();


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
export const GradeCreateManyInputObjectSchema: z.ZodType<Prisma.GradeCreateManyInput> = __makeSchema_GradeCreateManyInput_schema() as unknown as z.ZodType<Prisma.GradeCreateManyInput>;
export const GradeCreateManyInputObjectZodSchema = __makeSchema_GradeCreateManyInput_schema();


// File: GradeUpdateManyMutationInput.schema.ts
const __makeSchema_GradeUpdateManyMutationInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeACount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeBCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeCCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeDCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeECount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeFCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  passedCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  failedCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  semester: z.union([SemesterSchema, z.lazy(() => EnumSemesterFieldUpdateOperationsInputObjectSchema)]).optional(),
  year: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional()
}).strict();
export const GradeUpdateManyMutationInputObjectSchema: z.ZodType<Prisma.GradeUpdateManyMutationInput> = __makeSchema_GradeUpdateManyMutationInput_schema() as unknown as z.ZodType<Prisma.GradeUpdateManyMutationInput>;
export const GradeUpdateManyMutationInputObjectZodSchema = __makeSchema_GradeUpdateManyMutationInput_schema();


// File: GradeUncheckedUpdateManyInput.schema.ts
const __makeSchema_GradeUncheckedUpdateManyInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeACount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeBCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeCCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeDCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeECount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeFCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  passedCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  failedCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  courseId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  semester: z.union([SemesterSchema, z.lazy(() => EnumSemesterFieldUpdateOperationsInputObjectSchema)]).optional(),
  year: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional()
}).strict();
export const GradeUncheckedUpdateManyInputObjectSchema: z.ZodType<Prisma.GradeUncheckedUpdateManyInput> = __makeSchema_GradeUncheckedUpdateManyInput_schema() as unknown as z.ZodType<Prisma.GradeUncheckedUpdateManyInput>;
export const GradeUncheckedUpdateManyInputObjectZodSchema = __makeSchema_GradeUncheckedUpdateManyInput_schema();


// File: FacultyCreateInput.schema.ts
const __makeSchema_FacultyCreateInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.lazy(() => CourseCreateNestedManyWithoutFacultyInputObjectSchema).optional(),
  departments: z.lazy(() => DepartmentCreateNestedManyWithoutFacultyInputObjectSchema).optional()
}).strict();
export const FacultyCreateInputObjectSchema: z.ZodType<Prisma.FacultyCreateInput> = __makeSchema_FacultyCreateInput_schema() as unknown as z.ZodType<Prisma.FacultyCreateInput>;
export const FacultyCreateInputObjectZodSchema = __makeSchema_FacultyCreateInput_schema();


// File: FacultyUncheckedCreateInput.schema.ts
const __makeSchema_FacultyUncheckedCreateInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.lazy(() => CourseUncheckedCreateNestedManyWithoutFacultyInputObjectSchema).optional(),
  departments: z.lazy(() => DepartmentUncheckedCreateNestedManyWithoutFacultyInputObjectSchema).optional()
}).strict();
export const FacultyUncheckedCreateInputObjectSchema: z.ZodType<Prisma.FacultyUncheckedCreateInput> = __makeSchema_FacultyUncheckedCreateInput_schema() as unknown as z.ZodType<Prisma.FacultyUncheckedCreateInput>;
export const FacultyUncheckedCreateInputObjectZodSchema = __makeSchema_FacultyUncheckedCreateInput_schema();


// File: FacultyUpdateInput.schema.ts
const __makeSchema_FacultyUpdateInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  courses: z.lazy(() => CourseUpdateManyWithoutFacultyNestedInputObjectSchema).optional(),
  departments: z.lazy(() => DepartmentUpdateManyWithoutFacultyNestedInputObjectSchema).optional()
}).strict();
export const FacultyUpdateInputObjectSchema: z.ZodType<Prisma.FacultyUpdateInput> = __makeSchema_FacultyUpdateInput_schema() as unknown as z.ZodType<Prisma.FacultyUpdateInput>;
export const FacultyUpdateInputObjectZodSchema = __makeSchema_FacultyUpdateInput_schema();


// File: FacultyUncheckedUpdateInput.schema.ts
const __makeSchema_FacultyUncheckedUpdateInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  courses: z.lazy(() => CourseUncheckedUpdateManyWithoutFacultyNestedInputObjectSchema).optional(),
  departments: z.lazy(() => DepartmentUncheckedUpdateManyWithoutFacultyNestedInputObjectSchema).optional()
}).strict();
export const FacultyUncheckedUpdateInputObjectSchema: z.ZodType<Prisma.FacultyUncheckedUpdateInput> = __makeSchema_FacultyUncheckedUpdateInput_schema() as unknown as z.ZodType<Prisma.FacultyUncheckedUpdateInput>;
export const FacultyUncheckedUpdateInputObjectZodSchema = __makeSchema_FacultyUncheckedUpdateInput_schema();


// File: FacultyCreateManyInput.schema.ts
const __makeSchema_FacultyCreateManyInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int()
}).strict();
export const FacultyCreateManyInputObjectSchema: z.ZodType<Prisma.FacultyCreateManyInput> = __makeSchema_FacultyCreateManyInput_schema() as unknown as z.ZodType<Prisma.FacultyCreateManyInput>;
export const FacultyCreateManyInputObjectZodSchema = __makeSchema_FacultyCreateManyInput_schema();


// File: FacultyUpdateManyMutationInput.schema.ts
const __makeSchema_FacultyUpdateManyMutationInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional()
}).strict();
export const FacultyUpdateManyMutationInputObjectSchema: z.ZodType<Prisma.FacultyUpdateManyMutationInput> = __makeSchema_FacultyUpdateManyMutationInput_schema() as unknown as z.ZodType<Prisma.FacultyUpdateManyMutationInput>;
export const FacultyUpdateManyMutationInputObjectZodSchema = __makeSchema_FacultyUpdateManyMutationInput_schema();


// File: FacultyUncheckedUpdateManyInput.schema.ts
const __makeSchema_FacultyUncheckedUpdateManyInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional()
}).strict();
export const FacultyUncheckedUpdateManyInputObjectSchema: z.ZodType<Prisma.FacultyUncheckedUpdateManyInput> = __makeSchema_FacultyUncheckedUpdateManyInput_schema() as unknown as z.ZodType<Prisma.FacultyUncheckedUpdateManyInput>;
export const FacultyUncheckedUpdateManyInputObjectZodSchema = __makeSchema_FacultyUncheckedUpdateManyInput_schema();


// File: DepartmentCreateInput.schema.ts
const __makeSchema_DepartmentCreateInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.lazy(() => CourseCreateNestedManyWithoutDepartmentInputObjectSchema).optional(),
  faculty: z.lazy(() => FacultyCreateNestedOneWithoutDepartmentsInputObjectSchema)
}).strict();
export const DepartmentCreateInputObjectSchema: z.ZodType<Prisma.DepartmentCreateInput> = __makeSchema_DepartmentCreateInput_schema() as unknown as z.ZodType<Prisma.DepartmentCreateInput>;
export const DepartmentCreateInputObjectZodSchema = __makeSchema_DepartmentCreateInput_schema();


// File: DepartmentUncheckedCreateInput.schema.ts
const __makeSchema_DepartmentUncheckedCreateInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  facultyId: z.string(),
  courses: z.lazy(() => CourseUncheckedCreateNestedManyWithoutDepartmentInputObjectSchema).optional()
}).strict();
export const DepartmentUncheckedCreateInputObjectSchema: z.ZodType<Prisma.DepartmentUncheckedCreateInput> = __makeSchema_DepartmentUncheckedCreateInput_schema() as unknown as z.ZodType<Prisma.DepartmentUncheckedCreateInput>;
export const DepartmentUncheckedCreateInputObjectZodSchema = __makeSchema_DepartmentUncheckedCreateInput_schema();


// File: DepartmentUpdateInput.schema.ts
const __makeSchema_DepartmentUpdateInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  courses: z.lazy(() => CourseUpdateManyWithoutDepartmentNestedInputObjectSchema).optional(),
  faculty: z.lazy(() => FacultyUpdateOneRequiredWithoutDepartmentsNestedInputObjectSchema).optional()
}).strict();
export const DepartmentUpdateInputObjectSchema: z.ZodType<Prisma.DepartmentUpdateInput> = __makeSchema_DepartmentUpdateInput_schema() as unknown as z.ZodType<Prisma.DepartmentUpdateInput>;
export const DepartmentUpdateInputObjectZodSchema = __makeSchema_DepartmentUpdateInput_schema();


// File: DepartmentUncheckedUpdateInput.schema.ts
const __makeSchema_DepartmentUncheckedUpdateInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  facultyId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  courses: z.lazy(() => CourseUncheckedUpdateManyWithoutDepartmentNestedInputObjectSchema).optional()
}).strict();
export const DepartmentUncheckedUpdateInputObjectSchema: z.ZodType<Prisma.DepartmentUncheckedUpdateInput> = __makeSchema_DepartmentUncheckedUpdateInput_schema() as unknown as z.ZodType<Prisma.DepartmentUncheckedUpdateInput>;
export const DepartmentUncheckedUpdateInputObjectZodSchema = __makeSchema_DepartmentUncheckedUpdateInput_schema();


// File: DepartmentCreateManyInput.schema.ts
const __makeSchema_DepartmentCreateManyInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  facultyId: z.string()
}).strict();
export const DepartmentCreateManyInputObjectSchema: z.ZodType<Prisma.DepartmentCreateManyInput> = __makeSchema_DepartmentCreateManyInput_schema() as unknown as z.ZodType<Prisma.DepartmentCreateManyInput>;
export const DepartmentCreateManyInputObjectZodSchema = __makeSchema_DepartmentCreateManyInput_schema();


// File: DepartmentUpdateManyMutationInput.schema.ts
const __makeSchema_DepartmentUpdateManyMutationInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional()
}).strict();
export const DepartmentUpdateManyMutationInputObjectSchema: z.ZodType<Prisma.DepartmentUpdateManyMutationInput> = __makeSchema_DepartmentUpdateManyMutationInput_schema() as unknown as z.ZodType<Prisma.DepartmentUpdateManyMutationInput>;
export const DepartmentUpdateManyMutationInputObjectZodSchema = __makeSchema_DepartmentUpdateManyMutationInput_schema();


// File: DepartmentUncheckedUpdateManyInput.schema.ts
const __makeSchema_DepartmentUncheckedUpdateManyInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  facultyId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional()
}).strict();
export const DepartmentUncheckedUpdateManyInputObjectSchema: z.ZodType<Prisma.DepartmentUncheckedUpdateManyInput> = __makeSchema_DepartmentUncheckedUpdateManyInput_schema() as unknown as z.ZodType<Prisma.DepartmentUncheckedUpdateManyInput>;
export const DepartmentUncheckedUpdateManyInputObjectZodSchema = __makeSchema_DepartmentUncheckedUpdateManyInput_schema();


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
  not: z.union([z.string(), z.lazy(() => NestedStringFilterObjectSchema)]).optional()
}).strict();
export const StringFilterObjectSchema: z.ZodType<Prisma.StringFilter> = __makeSchema_StringFilter_schema() as unknown as z.ZodType<Prisma.StringFilter>;
export const StringFilterObjectZodSchema = __makeSchema_StringFilter_schema();


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
  not: z.union([z.string(), z.lazy(() => NestedStringNullableFilterObjectSchema)]).optional().nullable()
}).strict();
export const StringNullableFilterObjectSchema: z.ZodType<Prisma.StringNullableFilter> = __makeSchema_StringNullableFilter_schema() as unknown as z.ZodType<Prisma.StringNullableFilter>;
export const StringNullableFilterObjectZodSchema = __makeSchema_StringNullableFilter_schema();


// File: FloatNullableFilter.schema.ts
const __makeSchema_FloatNullableFilter_schema = () => z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), z.lazy(() => NestedFloatNullableFilterObjectSchema)]).optional().nullable()
}).strict();
export const FloatNullableFilterObjectSchema: z.ZodType<Prisma.FloatNullableFilter> = __makeSchema_FloatNullableFilter_schema() as unknown as z.ZodType<Prisma.FloatNullableFilter>;
export const FloatNullableFilterObjectZodSchema = __makeSchema_FloatNullableFilter_schema();


// File: EnumStudyLevelFilter.schema.ts
const __makeSchema_EnumStudyLevelFilter_schema = () => z.object({
  equals: StudyLevelSchema.optional(),
  in: StudyLevelSchema.array().optional(),
  notIn: StudyLevelSchema.array().optional(),
  not: z.union([StudyLevelSchema, z.lazy(() => NestedEnumStudyLevelFilterObjectSchema)]).optional()
}).strict();
export const EnumStudyLevelFilterObjectSchema: z.ZodType<Prisma.EnumStudyLevelFilter> = __makeSchema_EnumStudyLevelFilter_schema() as unknown as z.ZodType<Prisma.EnumStudyLevelFilter>;
export const EnumStudyLevelFilterObjectZodSchema = __makeSchema_EnumStudyLevelFilter_schema();


// File: EnumGradeTypeFilter.schema.ts
const __makeSchema_EnumGradeTypeFilter_schema = () => z.object({
  equals: GradeTypeSchema.optional(),
  in: GradeTypeSchema.array().optional(),
  notIn: GradeTypeSchema.array().optional(),
  not: z.union([GradeTypeSchema, z.lazy(() => NestedEnumGradeTypeFilterObjectSchema)]).optional()
}).strict();
export const EnumGradeTypeFilterObjectSchema: z.ZodType<Prisma.EnumGradeTypeFilter> = __makeSchema_EnumGradeTypeFilter_schema() as unknown as z.ZodType<Prisma.EnumGradeTypeFilter>;
export const EnumGradeTypeFilterObjectZodSchema = __makeSchema_EnumGradeTypeFilter_schema();


// File: IntFilter.schema.ts
const __makeSchema_IntFilter_schema = () => z.object({
  equals: z.number().int().optional(),
  in: z.number().int().array().optional(),
  notIn: z.number().int().array().optional(),
  lt: z.number().int().optional(),
  lte: z.number().int().optional(),
  gt: z.number().int().optional(),
  gte: z.number().int().optional(),
  not: z.union([z.number().int(), z.lazy(() => NestedIntFilterObjectSchema)]).optional()
}).strict();
export const IntFilterObjectSchema: z.ZodType<Prisma.IntFilter> = __makeSchema_IntFilter_schema() as unknown as z.ZodType<Prisma.IntFilter>;
export const IntFilterObjectZodSchema = __makeSchema_IntFilter_schema();


// File: IntNullableFilter.schema.ts
const __makeSchema_IntNullableFilter_schema = () => z.object({
  equals: z.number().int().optional().nullable(),
  in: z.number().int().array().optional().nullable(),
  notIn: z.number().int().array().optional().nullable(),
  lt: z.number().int().optional(),
  lte: z.number().int().optional(),
  gt: z.number().int().optional(),
  gte: z.number().int().optional(),
  not: z.union([z.number().int(), z.lazy(() => NestedIntNullableFilterObjectSchema)]).optional().nullable()
}).strict();
export const IntNullableFilterObjectSchema: z.ZodType<Prisma.IntNullableFilter> = __makeSchema_IntNullableFilter_schema() as unknown as z.ZodType<Prisma.IntNullableFilter>;
export const IntNullableFilterObjectZodSchema = __makeSchema_IntNullableFilter_schema();


// File: FloatFilter.schema.ts
const __makeSchema_FloatFilter_schema = () => z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), z.lazy(() => NestedFloatFilterObjectSchema)]).optional()
}).strict();
export const FloatFilterObjectSchema: z.ZodType<Prisma.FloatFilter> = __makeSchema_FloatFilter_schema() as unknown as z.ZodType<Prisma.FloatFilter>;
export const FloatFilterObjectZodSchema = __makeSchema_FloatFilter_schema();


// File: DateTimeFilter.schema.ts
const __makeSchema_DateTimeFilter_schema = () => z.object({
  equals: z.date().optional(),
  in: z.union([z.date().array(), z.string().datetime().array()]).optional(),
  notIn: z.union([z.date().array(), z.string().datetime().array()]).optional(),
  lt: z.date().optional(),
  lte: z.date().optional(),
  gt: z.date().optional(),
  gte: z.date().optional(),
  not: z.union([z.date(), z.lazy(() => NestedDateTimeFilterObjectSchema)]).optional()
}).strict();
export const DateTimeFilterObjectSchema: z.ZodType<Prisma.DateTimeFilter> = __makeSchema_DateTimeFilter_schema() as unknown as z.ZodType<Prisma.DateTimeFilter>;
export const DateTimeFilterObjectZodSchema = __makeSchema_DateTimeFilter_schema();


// File: EnumSemesterNullableListFilter.schema.ts
const __makeSchema_EnumSemesterNullableListFilter_schema = () => z.object({
  equals: SemesterSchema.array().optional().nullable(),
  has: SemesterSchema.optional().nullable(),
  hasEvery: SemesterSchema.array().optional(),
  hasSome: SemesterSchema.array().optional(),
  isEmpty: z.boolean().optional()
}).strict();
export const EnumSemesterNullableListFilterObjectSchema: z.ZodType<Prisma.EnumSemesterNullableListFilter> = __makeSchema_EnumSemesterNullableListFilter_schema() as unknown as z.ZodType<Prisma.EnumSemesterNullableListFilter>;
export const EnumSemesterNullableListFilterObjectZodSchema = __makeSchema_EnumSemesterNullableListFilter_schema();


// File: EnumTeachingLanguageNullableListFilter.schema.ts
const __makeSchema_EnumTeachingLanguageNullableListFilter_schema = () => z.object({
  equals: TeachingLanguageSchema.array().optional().nullable(),
  has: TeachingLanguageSchema.optional().nullable(),
  hasEvery: TeachingLanguageSchema.array().optional(),
  hasSome: TeachingLanguageSchema.array().optional(),
  isEmpty: z.boolean().optional()
}).strict();
export const EnumTeachingLanguageNullableListFilterObjectSchema: z.ZodType<Prisma.EnumTeachingLanguageNullableListFilter> = __makeSchema_EnumTeachingLanguageNullableListFilter_schema() as unknown as z.ZodType<Prisma.EnumTeachingLanguageNullableListFilter>;
export const EnumTeachingLanguageNullableListFilterObjectZodSchema = __makeSchema_EnumTeachingLanguageNullableListFilter_schema();


// File: EnumCampusNullableListFilter.schema.ts
const __makeSchema_EnumCampusNullableListFilter_schema = () => z.object({
  equals: CampusSchema.array().optional().nullable(),
  has: CampusSchema.optional().nullable(),
  hasEvery: CampusSchema.array().optional(),
  hasSome: CampusSchema.array().optional(),
  isEmpty: z.boolean().optional()
}).strict();
export const EnumCampusNullableListFilterObjectSchema: z.ZodType<Prisma.EnumCampusNullableListFilter> = __makeSchema_EnumCampusNullableListFilter_schema() as unknown as z.ZodType<Prisma.EnumCampusNullableListFilter>;
export const EnumCampusNullableListFilterObjectZodSchema = __makeSchema_EnumCampusNullableListFilter_schema();


// File: GradeListRelationFilter.schema.ts
const __makeSchema_GradeListRelationFilter_schema = () => z.object({
  every: z.lazy(() => GradeWhereInputObjectSchema).optional(),
  some: z.lazy(() => GradeWhereInputObjectSchema).optional(),
  none: z.lazy(() => GradeWhereInputObjectSchema).optional()
}).strict();
export const GradeListRelationFilterObjectSchema: z.ZodType<Prisma.GradeListRelationFilter> = __makeSchema_GradeListRelationFilter_schema() as unknown as z.ZodType<Prisma.GradeListRelationFilter>;
export const GradeListRelationFilterObjectZodSchema = __makeSchema_GradeListRelationFilter_schema();


// File: FacultyNullableScalarRelationFilter.schema.ts
const __makeSchema_FacultyNullableScalarRelationFilter_schema = () => z.object({
  is: z.lazy(() => FacultyWhereInputObjectSchema).optional().nullable(),
  isNot: z.lazy(() => FacultyWhereInputObjectSchema).optional().nullable()
}).strict();
export const FacultyNullableScalarRelationFilterObjectSchema: z.ZodType<Prisma.FacultyNullableScalarRelationFilter> = __makeSchema_FacultyNullableScalarRelationFilter_schema() as unknown as z.ZodType<Prisma.FacultyNullableScalarRelationFilter>;
export const FacultyNullableScalarRelationFilterObjectZodSchema = __makeSchema_FacultyNullableScalarRelationFilter_schema();


// File: DepartmentNullableScalarRelationFilter.schema.ts
const __makeSchema_DepartmentNullableScalarRelationFilter_schema = () => z.object({
  is: z.lazy(() => DepartmentWhereInputObjectSchema).optional().nullable(),
  isNot: z.lazy(() => DepartmentWhereInputObjectSchema).optional().nullable()
}).strict();
export const DepartmentNullableScalarRelationFilterObjectSchema: z.ZodType<Prisma.DepartmentNullableScalarRelationFilter> = __makeSchema_DepartmentNullableScalarRelationFilter_schema() as unknown as z.ZodType<Prisma.DepartmentNullableScalarRelationFilter>;
export const DepartmentNullableScalarRelationFilterObjectZodSchema = __makeSchema_DepartmentNullableScalarRelationFilter_schema();


// File: SortOrderInput.schema.ts
const __makeSchema_SortOrderInput_schema = () => z.object({
  sort: SortOrderSchema,
  nulls: NullsOrderSchema.optional()
}).strict();
export const SortOrderInputObjectSchema: z.ZodType<Prisma.SortOrderInput> = __makeSchema_SortOrderInput_schema() as unknown as z.ZodType<Prisma.SortOrderInput>;
export const SortOrderInputObjectZodSchema = __makeSchema_SortOrderInput_schema();


// File: GradeOrderByRelationAggregateInput.schema.ts
const __makeSchema_GradeOrderByRelationAggregateInput_schema = () => z.object({
  _count: SortOrderSchema.optional()
}).strict();
export const GradeOrderByRelationAggregateInputObjectSchema: z.ZodType<Prisma.GradeOrderByRelationAggregateInput> = __makeSchema_GradeOrderByRelationAggregateInput_schema() as unknown as z.ZodType<Prisma.GradeOrderByRelationAggregateInput>;
export const GradeOrderByRelationAggregateInputObjectZodSchema = __makeSchema_GradeOrderByRelationAggregateInput_schema();


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
export const CourseCountOrderByAggregateInputObjectSchema: z.ZodType<Prisma.CourseCountOrderByAggregateInput> = __makeSchema_CourseCountOrderByAggregateInput_schema() as unknown as z.ZodType<Prisma.CourseCountOrderByAggregateInput>;
export const CourseCountOrderByAggregateInputObjectZodSchema = __makeSchema_CourseCountOrderByAggregateInput_schema();


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
export const CourseAvgOrderByAggregateInputObjectSchema: z.ZodType<Prisma.CourseAvgOrderByAggregateInput> = __makeSchema_CourseAvgOrderByAggregateInput_schema() as unknown as z.ZodType<Prisma.CourseAvgOrderByAggregateInput>;
export const CourseAvgOrderByAggregateInputObjectZodSchema = __makeSchema_CourseAvgOrderByAggregateInput_schema();


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
export const CourseMaxOrderByAggregateInputObjectSchema: z.ZodType<Prisma.CourseMaxOrderByAggregateInput> = __makeSchema_CourseMaxOrderByAggregateInput_schema() as unknown as z.ZodType<Prisma.CourseMaxOrderByAggregateInput>;
export const CourseMaxOrderByAggregateInputObjectZodSchema = __makeSchema_CourseMaxOrderByAggregateInput_schema();


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
export const CourseMinOrderByAggregateInputObjectSchema: z.ZodType<Prisma.CourseMinOrderByAggregateInput> = __makeSchema_CourseMinOrderByAggregateInput_schema() as unknown as z.ZodType<Prisma.CourseMinOrderByAggregateInput>;
export const CourseMinOrderByAggregateInputObjectZodSchema = __makeSchema_CourseMinOrderByAggregateInput_schema();


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
export const CourseSumOrderByAggregateInputObjectSchema: z.ZodType<Prisma.CourseSumOrderByAggregateInput> = __makeSchema_CourseSumOrderByAggregateInput_schema() as unknown as z.ZodType<Prisma.CourseSumOrderByAggregateInput>;
export const CourseSumOrderByAggregateInputObjectZodSchema = __makeSchema_CourseSumOrderByAggregateInput_schema();


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
  not: z.union([z.string(), z.lazy(() => NestedStringWithAggregatesFilterObjectSchema)]).optional(),
  _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
  _min: z.lazy(() => NestedStringFilterObjectSchema).optional(),
  _max: z.lazy(() => NestedStringFilterObjectSchema).optional()
}).strict();
export const StringWithAggregatesFilterObjectSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = __makeSchema_StringWithAggregatesFilter_schema() as unknown as z.ZodType<Prisma.StringWithAggregatesFilter>;
export const StringWithAggregatesFilterObjectZodSchema = __makeSchema_StringWithAggregatesFilter_schema();


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
  not: z.union([z.string(), z.lazy(() => NestedStringNullableWithAggregatesFilterObjectSchema)]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterObjectSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterObjectSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterObjectSchema).optional()
}).strict();
export const StringNullableWithAggregatesFilterObjectSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = __makeSchema_StringNullableWithAggregatesFilter_schema() as unknown as z.ZodType<Prisma.StringNullableWithAggregatesFilter>;
export const StringNullableWithAggregatesFilterObjectZodSchema = __makeSchema_StringNullableWithAggregatesFilter_schema();


// File: FloatNullableWithAggregatesFilter.schema.ts
const __makeSchema_FloatNullableWithAggregatesFilter_schema = () => z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), z.lazy(() => NestedFloatNullableWithAggregatesFilterObjectSchema)]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterObjectSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterObjectSchema).optional(),
  _sum: z.lazy(() => NestedFloatNullableFilterObjectSchema).optional(),
  _min: z.lazy(() => NestedFloatNullableFilterObjectSchema).optional(),
  _max: z.lazy(() => NestedFloatNullableFilterObjectSchema).optional()
}).strict();
export const FloatNullableWithAggregatesFilterObjectSchema: z.ZodType<Prisma.FloatNullableWithAggregatesFilter> = __makeSchema_FloatNullableWithAggregatesFilter_schema() as unknown as z.ZodType<Prisma.FloatNullableWithAggregatesFilter>;
export const FloatNullableWithAggregatesFilterObjectZodSchema = __makeSchema_FloatNullableWithAggregatesFilter_schema();


// File: EnumStudyLevelWithAggregatesFilter.schema.ts
const __makeSchema_EnumStudyLevelWithAggregatesFilter_schema = () => z.object({
  equals: StudyLevelSchema.optional(),
  in: StudyLevelSchema.array().optional(),
  notIn: StudyLevelSchema.array().optional(),
  not: z.union([StudyLevelSchema, z.lazy(() => NestedEnumStudyLevelWithAggregatesFilterObjectSchema)]).optional(),
  _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
  _min: z.lazy(() => NestedEnumStudyLevelFilterObjectSchema).optional(),
  _max: z.lazy(() => NestedEnumStudyLevelFilterObjectSchema).optional()
}).strict();
export const EnumStudyLevelWithAggregatesFilterObjectSchema: z.ZodType<Prisma.EnumStudyLevelWithAggregatesFilter> = __makeSchema_EnumStudyLevelWithAggregatesFilter_schema() as unknown as z.ZodType<Prisma.EnumStudyLevelWithAggregatesFilter>;
export const EnumStudyLevelWithAggregatesFilterObjectZodSchema = __makeSchema_EnumStudyLevelWithAggregatesFilter_schema();


// File: EnumGradeTypeWithAggregatesFilter.schema.ts
const __makeSchema_EnumGradeTypeWithAggregatesFilter_schema = () => z.object({
  equals: GradeTypeSchema.optional(),
  in: GradeTypeSchema.array().optional(),
  notIn: GradeTypeSchema.array().optional(),
  not: z.union([GradeTypeSchema, z.lazy(() => NestedEnumGradeTypeWithAggregatesFilterObjectSchema)]).optional(),
  _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
  _min: z.lazy(() => NestedEnumGradeTypeFilterObjectSchema).optional(),
  _max: z.lazy(() => NestedEnumGradeTypeFilterObjectSchema).optional()
}).strict();
export const EnumGradeTypeWithAggregatesFilterObjectSchema: z.ZodType<Prisma.EnumGradeTypeWithAggregatesFilter> = __makeSchema_EnumGradeTypeWithAggregatesFilter_schema() as unknown as z.ZodType<Prisma.EnumGradeTypeWithAggregatesFilter>;
export const EnumGradeTypeWithAggregatesFilterObjectZodSchema = __makeSchema_EnumGradeTypeWithAggregatesFilter_schema();


// File: IntWithAggregatesFilter.schema.ts
const __makeSchema_IntWithAggregatesFilter_schema = () => z.object({
  equals: z.number().int().optional(),
  in: z.number().int().array().optional(),
  notIn: z.number().int().array().optional(),
  lt: z.number().int().optional(),
  lte: z.number().int().optional(),
  gt: z.number().int().optional(),
  gte: z.number().int().optional(),
  not: z.union([z.number().int(), z.lazy(() => NestedIntWithAggregatesFilterObjectSchema)]).optional(),
  _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterObjectSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterObjectSchema).optional(),
  _min: z.lazy(() => NestedIntFilterObjectSchema).optional(),
  _max: z.lazy(() => NestedIntFilterObjectSchema).optional()
}).strict();
export const IntWithAggregatesFilterObjectSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = __makeSchema_IntWithAggregatesFilter_schema() as unknown as z.ZodType<Prisma.IntWithAggregatesFilter>;
export const IntWithAggregatesFilterObjectZodSchema = __makeSchema_IntWithAggregatesFilter_schema();


// File: IntNullableWithAggregatesFilter.schema.ts
const __makeSchema_IntNullableWithAggregatesFilter_schema = () => z.object({
  equals: z.number().int().optional().nullable(),
  in: z.number().int().array().optional().nullable(),
  notIn: z.number().int().array().optional().nullable(),
  lt: z.number().int().optional(),
  lte: z.number().int().optional(),
  gt: z.number().int().optional(),
  gte: z.number().int().optional(),
  not: z.union([z.number().int(), z.lazy(() => NestedIntNullableWithAggregatesFilterObjectSchema)]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterObjectSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterObjectSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterObjectSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterObjectSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterObjectSchema).optional()
}).strict();
export const IntNullableWithAggregatesFilterObjectSchema: z.ZodType<Prisma.IntNullableWithAggregatesFilter> = __makeSchema_IntNullableWithAggregatesFilter_schema() as unknown as z.ZodType<Prisma.IntNullableWithAggregatesFilter>;
export const IntNullableWithAggregatesFilterObjectZodSchema = __makeSchema_IntNullableWithAggregatesFilter_schema();


// File: FloatWithAggregatesFilter.schema.ts
const __makeSchema_FloatWithAggregatesFilter_schema = () => z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), z.lazy(() => NestedFloatWithAggregatesFilterObjectSchema)]).optional(),
  _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterObjectSchema).optional(),
  _sum: z.lazy(() => NestedFloatFilterObjectSchema).optional(),
  _min: z.lazy(() => NestedFloatFilterObjectSchema).optional(),
  _max: z.lazy(() => NestedFloatFilterObjectSchema).optional()
}).strict();
export const FloatWithAggregatesFilterObjectSchema: z.ZodType<Prisma.FloatWithAggregatesFilter> = __makeSchema_FloatWithAggregatesFilter_schema() as unknown as z.ZodType<Prisma.FloatWithAggregatesFilter>;
export const FloatWithAggregatesFilterObjectZodSchema = __makeSchema_FloatWithAggregatesFilter_schema();


// File: DateTimeWithAggregatesFilter.schema.ts
const __makeSchema_DateTimeWithAggregatesFilter_schema = () => z.object({
  equals: z.date().optional(),
  in: z.union([z.date().array(), z.string().datetime().array()]).optional(),
  notIn: z.union([z.date().array(), z.string().datetime().array()]).optional(),
  lt: z.date().optional(),
  lte: z.date().optional(),
  gt: z.date().optional(),
  gte: z.date().optional(),
  not: z.union([z.date(), z.lazy(() => NestedDateTimeWithAggregatesFilterObjectSchema)]).optional(),
  _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterObjectSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterObjectSchema).optional()
}).strict();
export const DateTimeWithAggregatesFilterObjectSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = __makeSchema_DateTimeWithAggregatesFilter_schema() as unknown as z.ZodType<Prisma.DateTimeWithAggregatesFilter>;
export const DateTimeWithAggregatesFilterObjectZodSchema = __makeSchema_DateTimeWithAggregatesFilter_schema();


// File: EnumSemesterFilter.schema.ts
const __makeSchema_EnumSemesterFilter_schema = () => z.object({
  equals: SemesterSchema.optional(),
  in: SemesterSchema.array().optional(),
  notIn: SemesterSchema.array().optional(),
  not: z.union([SemesterSchema, z.lazy(() => NestedEnumSemesterFilterObjectSchema)]).optional()
}).strict();
export const EnumSemesterFilterObjectSchema: z.ZodType<Prisma.EnumSemesterFilter> = __makeSchema_EnumSemesterFilter_schema() as unknown as z.ZodType<Prisma.EnumSemesterFilter>;
export const EnumSemesterFilterObjectZodSchema = __makeSchema_EnumSemesterFilter_schema();


// File: CourseScalarRelationFilter.schema.ts
const __makeSchema_CourseScalarRelationFilter_schema = () => z.object({
  is: z.lazy(() => CourseWhereInputObjectSchema).optional(),
  isNot: z.lazy(() => CourseWhereInputObjectSchema).optional()
}).strict();
export const CourseScalarRelationFilterObjectSchema: z.ZodType<Prisma.CourseScalarRelationFilter> = __makeSchema_CourseScalarRelationFilter_schema() as unknown as z.ZodType<Prisma.CourseScalarRelationFilter>;
export const CourseScalarRelationFilterObjectZodSchema = __makeSchema_CourseScalarRelationFilter_schema();


// File: GradeCourseIdSemesterYearCompoundUniqueInput.schema.ts
const __makeSchema_GradeCourseIdSemesterYearCompoundUniqueInput_schema = () => z.object({
  courseId: z.string(),
  semester: SemesterSchema,
  year: z.number().int()
}).strict();
export const GradeCourseIdSemesterYearCompoundUniqueInputObjectSchema: z.ZodType<Prisma.GradeCourseIdSemesterYearCompoundUniqueInput> = __makeSchema_GradeCourseIdSemesterYearCompoundUniqueInput_schema() as unknown as z.ZodType<Prisma.GradeCourseIdSemesterYearCompoundUniqueInput>;
export const GradeCourseIdSemesterYearCompoundUniqueInputObjectZodSchema = __makeSchema_GradeCourseIdSemesterYearCompoundUniqueInput_schema();


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
export const GradeCountOrderByAggregateInputObjectSchema: z.ZodType<Prisma.GradeCountOrderByAggregateInput> = __makeSchema_GradeCountOrderByAggregateInput_schema() as unknown as z.ZodType<Prisma.GradeCountOrderByAggregateInput>;
export const GradeCountOrderByAggregateInputObjectZodSchema = __makeSchema_GradeCountOrderByAggregateInput_schema();


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
export const GradeAvgOrderByAggregateInputObjectSchema: z.ZodType<Prisma.GradeAvgOrderByAggregateInput> = __makeSchema_GradeAvgOrderByAggregateInput_schema() as unknown as z.ZodType<Prisma.GradeAvgOrderByAggregateInput>;
export const GradeAvgOrderByAggregateInputObjectZodSchema = __makeSchema_GradeAvgOrderByAggregateInput_schema();


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
export const GradeMaxOrderByAggregateInputObjectSchema: z.ZodType<Prisma.GradeMaxOrderByAggregateInput> = __makeSchema_GradeMaxOrderByAggregateInput_schema() as unknown as z.ZodType<Prisma.GradeMaxOrderByAggregateInput>;
export const GradeMaxOrderByAggregateInputObjectZodSchema = __makeSchema_GradeMaxOrderByAggregateInput_schema();


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
export const GradeMinOrderByAggregateInputObjectSchema: z.ZodType<Prisma.GradeMinOrderByAggregateInput> = __makeSchema_GradeMinOrderByAggregateInput_schema() as unknown as z.ZodType<Prisma.GradeMinOrderByAggregateInput>;
export const GradeMinOrderByAggregateInputObjectZodSchema = __makeSchema_GradeMinOrderByAggregateInput_schema();


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
export const GradeSumOrderByAggregateInputObjectSchema: z.ZodType<Prisma.GradeSumOrderByAggregateInput> = __makeSchema_GradeSumOrderByAggregateInput_schema() as unknown as z.ZodType<Prisma.GradeSumOrderByAggregateInput>;
export const GradeSumOrderByAggregateInputObjectZodSchema = __makeSchema_GradeSumOrderByAggregateInput_schema();


// File: EnumSemesterWithAggregatesFilter.schema.ts
const __makeSchema_EnumSemesterWithAggregatesFilter_schema = () => z.object({
  equals: SemesterSchema.optional(),
  in: SemesterSchema.array().optional(),
  notIn: SemesterSchema.array().optional(),
  not: z.union([SemesterSchema, z.lazy(() => NestedEnumSemesterWithAggregatesFilterObjectSchema)]).optional(),
  _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
  _min: z.lazy(() => NestedEnumSemesterFilterObjectSchema).optional(),
  _max: z.lazy(() => NestedEnumSemesterFilterObjectSchema).optional()
}).strict();
export const EnumSemesterWithAggregatesFilterObjectSchema: z.ZodType<Prisma.EnumSemesterWithAggregatesFilter> = __makeSchema_EnumSemesterWithAggregatesFilter_schema() as unknown as z.ZodType<Prisma.EnumSemesterWithAggregatesFilter>;
export const EnumSemesterWithAggregatesFilterObjectZodSchema = __makeSchema_EnumSemesterWithAggregatesFilter_schema();


// File: CourseListRelationFilter.schema.ts
const __makeSchema_CourseListRelationFilter_schema = () => z.object({
  every: z.lazy(() => CourseWhereInputObjectSchema).optional(),
  some: z.lazy(() => CourseWhereInputObjectSchema).optional(),
  none: z.lazy(() => CourseWhereInputObjectSchema).optional()
}).strict();
export const CourseListRelationFilterObjectSchema: z.ZodType<Prisma.CourseListRelationFilter> = __makeSchema_CourseListRelationFilter_schema() as unknown as z.ZodType<Prisma.CourseListRelationFilter>;
export const CourseListRelationFilterObjectZodSchema = __makeSchema_CourseListRelationFilter_schema();


// File: DepartmentListRelationFilter.schema.ts
const __makeSchema_DepartmentListRelationFilter_schema = () => z.object({
  every: z.lazy(() => DepartmentWhereInputObjectSchema).optional(),
  some: z.lazy(() => DepartmentWhereInputObjectSchema).optional(),
  none: z.lazy(() => DepartmentWhereInputObjectSchema).optional()
}).strict();
export const DepartmentListRelationFilterObjectSchema: z.ZodType<Prisma.DepartmentListRelationFilter> = __makeSchema_DepartmentListRelationFilter_schema() as unknown as z.ZodType<Prisma.DepartmentListRelationFilter>;
export const DepartmentListRelationFilterObjectZodSchema = __makeSchema_DepartmentListRelationFilter_schema();


// File: CourseOrderByRelationAggregateInput.schema.ts
const __makeSchema_CourseOrderByRelationAggregateInput_schema = () => z.object({
  _count: SortOrderSchema.optional()
}).strict();
export const CourseOrderByRelationAggregateInputObjectSchema: z.ZodType<Prisma.CourseOrderByRelationAggregateInput> = __makeSchema_CourseOrderByRelationAggregateInput_schema() as unknown as z.ZodType<Prisma.CourseOrderByRelationAggregateInput>;
export const CourseOrderByRelationAggregateInputObjectZodSchema = __makeSchema_CourseOrderByRelationAggregateInput_schema();


// File: DepartmentOrderByRelationAggregateInput.schema.ts
const __makeSchema_DepartmentOrderByRelationAggregateInput_schema = () => z.object({
  _count: SortOrderSchema.optional()
}).strict();
export const DepartmentOrderByRelationAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentOrderByRelationAggregateInput> = __makeSchema_DepartmentOrderByRelationAggregateInput_schema() as unknown as z.ZodType<Prisma.DepartmentOrderByRelationAggregateInput>;
export const DepartmentOrderByRelationAggregateInputObjectZodSchema = __makeSchema_DepartmentOrderByRelationAggregateInput_schema();


// File: FacultyCountOrderByAggregateInput.schema.ts
const __makeSchema_FacultyCountOrderByAggregateInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  code: SortOrderSchema.optional()
}).strict();
export const FacultyCountOrderByAggregateInputObjectSchema: z.ZodType<Prisma.FacultyCountOrderByAggregateInput> = __makeSchema_FacultyCountOrderByAggregateInput_schema() as unknown as z.ZodType<Prisma.FacultyCountOrderByAggregateInput>;
export const FacultyCountOrderByAggregateInputObjectZodSchema = __makeSchema_FacultyCountOrderByAggregateInput_schema();


// File: FacultyAvgOrderByAggregateInput.schema.ts
const __makeSchema_FacultyAvgOrderByAggregateInput_schema = () => z.object({
  code: SortOrderSchema.optional()
}).strict();
export const FacultyAvgOrderByAggregateInputObjectSchema: z.ZodType<Prisma.FacultyAvgOrderByAggregateInput> = __makeSchema_FacultyAvgOrderByAggregateInput_schema() as unknown as z.ZodType<Prisma.FacultyAvgOrderByAggregateInput>;
export const FacultyAvgOrderByAggregateInputObjectZodSchema = __makeSchema_FacultyAvgOrderByAggregateInput_schema();


// File: FacultyMaxOrderByAggregateInput.schema.ts
const __makeSchema_FacultyMaxOrderByAggregateInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  code: SortOrderSchema.optional()
}).strict();
export const FacultyMaxOrderByAggregateInputObjectSchema: z.ZodType<Prisma.FacultyMaxOrderByAggregateInput> = __makeSchema_FacultyMaxOrderByAggregateInput_schema() as unknown as z.ZodType<Prisma.FacultyMaxOrderByAggregateInput>;
export const FacultyMaxOrderByAggregateInputObjectZodSchema = __makeSchema_FacultyMaxOrderByAggregateInput_schema();


// File: FacultyMinOrderByAggregateInput.schema.ts
const __makeSchema_FacultyMinOrderByAggregateInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  code: SortOrderSchema.optional()
}).strict();
export const FacultyMinOrderByAggregateInputObjectSchema: z.ZodType<Prisma.FacultyMinOrderByAggregateInput> = __makeSchema_FacultyMinOrderByAggregateInput_schema() as unknown as z.ZodType<Prisma.FacultyMinOrderByAggregateInput>;
export const FacultyMinOrderByAggregateInputObjectZodSchema = __makeSchema_FacultyMinOrderByAggregateInput_schema();


// File: FacultySumOrderByAggregateInput.schema.ts
const __makeSchema_FacultySumOrderByAggregateInput_schema = () => z.object({
  code: SortOrderSchema.optional()
}).strict();
export const FacultySumOrderByAggregateInputObjectSchema: z.ZodType<Prisma.FacultySumOrderByAggregateInput> = __makeSchema_FacultySumOrderByAggregateInput_schema() as unknown as z.ZodType<Prisma.FacultySumOrderByAggregateInput>;
export const FacultySumOrderByAggregateInputObjectZodSchema = __makeSchema_FacultySumOrderByAggregateInput_schema();


// File: FacultyScalarRelationFilter.schema.ts
const __makeSchema_FacultyScalarRelationFilter_schema = () => z.object({
  is: z.lazy(() => FacultyWhereInputObjectSchema).optional(),
  isNot: z.lazy(() => FacultyWhereInputObjectSchema).optional()
}).strict();
export const FacultyScalarRelationFilterObjectSchema: z.ZodType<Prisma.FacultyScalarRelationFilter> = __makeSchema_FacultyScalarRelationFilter_schema() as unknown as z.ZodType<Prisma.FacultyScalarRelationFilter>;
export const FacultyScalarRelationFilterObjectZodSchema = __makeSchema_FacultyScalarRelationFilter_schema();


// File: DepartmentCountOrderByAggregateInput.schema.ts
const __makeSchema_DepartmentCountOrderByAggregateInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  facultyId: SortOrderSchema.optional()
}).strict();
export const DepartmentCountOrderByAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentCountOrderByAggregateInput> = __makeSchema_DepartmentCountOrderByAggregateInput_schema() as unknown as z.ZodType<Prisma.DepartmentCountOrderByAggregateInput>;
export const DepartmentCountOrderByAggregateInputObjectZodSchema = __makeSchema_DepartmentCountOrderByAggregateInput_schema();


// File: DepartmentAvgOrderByAggregateInput.schema.ts
const __makeSchema_DepartmentAvgOrderByAggregateInput_schema = () => z.object({
  code: SortOrderSchema.optional()
}).strict();
export const DepartmentAvgOrderByAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentAvgOrderByAggregateInput> = __makeSchema_DepartmentAvgOrderByAggregateInput_schema() as unknown as z.ZodType<Prisma.DepartmentAvgOrderByAggregateInput>;
export const DepartmentAvgOrderByAggregateInputObjectZodSchema = __makeSchema_DepartmentAvgOrderByAggregateInput_schema();


// File: DepartmentMaxOrderByAggregateInput.schema.ts
const __makeSchema_DepartmentMaxOrderByAggregateInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  facultyId: SortOrderSchema.optional()
}).strict();
export const DepartmentMaxOrderByAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentMaxOrderByAggregateInput> = __makeSchema_DepartmentMaxOrderByAggregateInput_schema() as unknown as z.ZodType<Prisma.DepartmentMaxOrderByAggregateInput>;
export const DepartmentMaxOrderByAggregateInputObjectZodSchema = __makeSchema_DepartmentMaxOrderByAggregateInput_schema();


// File: DepartmentMinOrderByAggregateInput.schema.ts
const __makeSchema_DepartmentMinOrderByAggregateInput_schema = () => z.object({
  id: SortOrderSchema.optional(),
  nameNo: SortOrderSchema.optional(),
  nameEn: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  facultyId: SortOrderSchema.optional()
}).strict();
export const DepartmentMinOrderByAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentMinOrderByAggregateInput> = __makeSchema_DepartmentMinOrderByAggregateInput_schema() as unknown as z.ZodType<Prisma.DepartmentMinOrderByAggregateInput>;
export const DepartmentMinOrderByAggregateInputObjectZodSchema = __makeSchema_DepartmentMinOrderByAggregateInput_schema();


// File: DepartmentSumOrderByAggregateInput.schema.ts
const __makeSchema_DepartmentSumOrderByAggregateInput_schema = () => z.object({
  code: SortOrderSchema.optional()
}).strict();
export const DepartmentSumOrderByAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentSumOrderByAggregateInput> = __makeSchema_DepartmentSumOrderByAggregateInput_schema() as unknown as z.ZodType<Prisma.DepartmentSumOrderByAggregateInput>;
export const DepartmentSumOrderByAggregateInputObjectZodSchema = __makeSchema_DepartmentSumOrderByAggregateInput_schema();


// File: CourseCreatetaughtSemestersInput.schema.ts
const __makeSchema_CourseCreatetaughtSemestersInput_schema = () => z.object({
  set: SemesterSchema.array()
}).strict();
export const CourseCreatetaughtSemestersInputObjectSchema: z.ZodType<Prisma.CourseCreatetaughtSemestersInput> = __makeSchema_CourseCreatetaughtSemestersInput_schema() as unknown as z.ZodType<Prisma.CourseCreatetaughtSemestersInput>;
export const CourseCreatetaughtSemestersInputObjectZodSchema = __makeSchema_CourseCreatetaughtSemestersInput_schema();


// File: CourseCreateteachingLanguagesInput.schema.ts
const __makeSchema_CourseCreateteachingLanguagesInput_schema = () => z.object({
  set: TeachingLanguageSchema.array()
}).strict();
export const CourseCreateteachingLanguagesInputObjectSchema: z.ZodType<Prisma.CourseCreateteachingLanguagesInput> = __makeSchema_CourseCreateteachingLanguagesInput_schema() as unknown as z.ZodType<Prisma.CourseCreateteachingLanguagesInput>;
export const CourseCreateteachingLanguagesInputObjectZodSchema = __makeSchema_CourseCreateteachingLanguagesInput_schema();


// File: CourseCreatecampusesInput.schema.ts
const __makeSchema_CourseCreatecampusesInput_schema = () => z.object({
  set: CampusSchema.array()
}).strict();
export const CourseCreatecampusesInputObjectSchema: z.ZodType<Prisma.CourseCreatecampusesInput> = __makeSchema_CourseCreatecampusesInput_schema() as unknown as z.ZodType<Prisma.CourseCreatecampusesInput>;
export const CourseCreatecampusesInputObjectZodSchema = __makeSchema_CourseCreatecampusesInput_schema();


// File: GradeCreateNestedManyWithoutCourseInput.schema.ts
const __makeSchema_GradeCreateNestedManyWithoutCourseInput_schema = () => z.object({
  create: z.union([z.lazy(() => GradeCreateWithoutCourseInputObjectSchema), z.lazy(() => GradeCreateWithoutCourseInputObjectSchema).array(), z.lazy(() => GradeUncheckedCreateWithoutCourseInputObjectSchema), z.lazy(() => GradeUncheckedCreateWithoutCourseInputObjectSchema).array()]).optional(),
  connectOrCreate: z.union([z.lazy(() => GradeCreateOrConnectWithoutCourseInputObjectSchema), z.lazy(() => GradeCreateOrConnectWithoutCourseInputObjectSchema).array()]).optional(),
  createMany: z.lazy(() => GradeCreateManyCourseInputEnvelopeObjectSchema).optional(),
  connect: z.union([z.lazy(() => GradeWhereUniqueInputObjectSchema), z.lazy(() => GradeWhereUniqueInputObjectSchema).array()]).optional()
}).strict();
export const GradeCreateNestedManyWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeCreateNestedManyWithoutCourseInput> = __makeSchema_GradeCreateNestedManyWithoutCourseInput_schema() as unknown as z.ZodType<Prisma.GradeCreateNestedManyWithoutCourseInput>;
export const GradeCreateNestedManyWithoutCourseInputObjectZodSchema = __makeSchema_GradeCreateNestedManyWithoutCourseInput_schema();


// File: FacultyCreateNestedOneWithoutCoursesInput.schema.ts
const __makeSchema_FacultyCreateNestedOneWithoutCoursesInput_schema = () => z.object({
  create: z.union([z.lazy(() => FacultyCreateWithoutCoursesInputObjectSchema), z.lazy(() => FacultyUncheckedCreateWithoutCoursesInputObjectSchema)]).optional(),
  connectOrCreate: z.lazy(() => FacultyCreateOrConnectWithoutCoursesInputObjectSchema).optional(),
  connect: z.lazy(() => FacultyWhereUniqueInputObjectSchema).optional()
}).strict();
export const FacultyCreateNestedOneWithoutCoursesInputObjectSchema: z.ZodType<Prisma.FacultyCreateNestedOneWithoutCoursesInput> = __makeSchema_FacultyCreateNestedOneWithoutCoursesInput_schema() as unknown as z.ZodType<Prisma.FacultyCreateNestedOneWithoutCoursesInput>;
export const FacultyCreateNestedOneWithoutCoursesInputObjectZodSchema = __makeSchema_FacultyCreateNestedOneWithoutCoursesInput_schema();


// File: DepartmentCreateNestedOneWithoutCoursesInput.schema.ts
const __makeSchema_DepartmentCreateNestedOneWithoutCoursesInput_schema = () => z.object({
  create: z.union([z.lazy(() => DepartmentCreateWithoutCoursesInputObjectSchema), z.lazy(() => DepartmentUncheckedCreateWithoutCoursesInputObjectSchema)]).optional(),
  connectOrCreate: z.lazy(() => DepartmentCreateOrConnectWithoutCoursesInputObjectSchema).optional(),
  connect: z.lazy(() => DepartmentWhereUniqueInputObjectSchema).optional()
}).strict();
export const DepartmentCreateNestedOneWithoutCoursesInputObjectSchema: z.ZodType<Prisma.DepartmentCreateNestedOneWithoutCoursesInput> = __makeSchema_DepartmentCreateNestedOneWithoutCoursesInput_schema() as unknown as z.ZodType<Prisma.DepartmentCreateNestedOneWithoutCoursesInput>;
export const DepartmentCreateNestedOneWithoutCoursesInputObjectZodSchema = __makeSchema_DepartmentCreateNestedOneWithoutCoursesInput_schema();


// File: GradeUncheckedCreateNestedManyWithoutCourseInput.schema.ts
const __makeSchema_GradeUncheckedCreateNestedManyWithoutCourseInput_schema = () => z.object({
  create: z.union([z.lazy(() => GradeCreateWithoutCourseInputObjectSchema), z.lazy(() => GradeCreateWithoutCourseInputObjectSchema).array(), z.lazy(() => GradeUncheckedCreateWithoutCourseInputObjectSchema), z.lazy(() => GradeUncheckedCreateWithoutCourseInputObjectSchema).array()]).optional(),
  connectOrCreate: z.union([z.lazy(() => GradeCreateOrConnectWithoutCourseInputObjectSchema), z.lazy(() => GradeCreateOrConnectWithoutCourseInputObjectSchema).array()]).optional(),
  createMany: z.lazy(() => GradeCreateManyCourseInputEnvelopeObjectSchema).optional(),
  connect: z.union([z.lazy(() => GradeWhereUniqueInputObjectSchema), z.lazy(() => GradeWhereUniqueInputObjectSchema).array()]).optional()
}).strict();
export const GradeUncheckedCreateNestedManyWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeUncheckedCreateNestedManyWithoutCourseInput> = __makeSchema_GradeUncheckedCreateNestedManyWithoutCourseInput_schema() as unknown as z.ZodType<Prisma.GradeUncheckedCreateNestedManyWithoutCourseInput>;
export const GradeUncheckedCreateNestedManyWithoutCourseInputObjectZodSchema = __makeSchema_GradeUncheckedCreateNestedManyWithoutCourseInput_schema();


// File: StringFieldUpdateOperationsInput.schema.ts
const __makeSchema_StringFieldUpdateOperationsInput_schema = () => z.object({
  set: z.string().optional()
}).strict();
export const StringFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = __makeSchema_StringFieldUpdateOperationsInput_schema() as unknown as z.ZodType<Prisma.StringFieldUpdateOperationsInput>;
export const StringFieldUpdateOperationsInputObjectZodSchema = __makeSchema_StringFieldUpdateOperationsInput_schema();


// File: NullableStringFieldUpdateOperationsInput.schema.ts
const __makeSchema_NullableStringFieldUpdateOperationsInput_schema = () => z.object({
  set: z.string().optional()
}).strict();
export const NullableStringFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = __makeSchema_NullableStringFieldUpdateOperationsInput_schema() as unknown as z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput>;
export const NullableStringFieldUpdateOperationsInputObjectZodSchema = __makeSchema_NullableStringFieldUpdateOperationsInput_schema();


// File: NullableFloatFieldUpdateOperationsInput.schema.ts
const __makeSchema_NullableFloatFieldUpdateOperationsInput_schema = () => z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();
export const NullableFloatFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.NullableFloatFieldUpdateOperationsInput> = __makeSchema_NullableFloatFieldUpdateOperationsInput_schema() as unknown as z.ZodType<Prisma.NullableFloatFieldUpdateOperationsInput>;
export const NullableFloatFieldUpdateOperationsInputObjectZodSchema = __makeSchema_NullableFloatFieldUpdateOperationsInput_schema();


// File: EnumStudyLevelFieldUpdateOperationsInput.schema.ts
const __makeSchema_EnumStudyLevelFieldUpdateOperationsInput_schema = () => z.object({
  set: StudyLevelSchema.optional()
}).strict();
export const EnumStudyLevelFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.EnumStudyLevelFieldUpdateOperationsInput> = __makeSchema_EnumStudyLevelFieldUpdateOperationsInput_schema() as unknown as z.ZodType<Prisma.EnumStudyLevelFieldUpdateOperationsInput>;
export const EnumStudyLevelFieldUpdateOperationsInputObjectZodSchema = __makeSchema_EnumStudyLevelFieldUpdateOperationsInput_schema();


// File: EnumGradeTypeFieldUpdateOperationsInput.schema.ts
const __makeSchema_EnumGradeTypeFieldUpdateOperationsInput_schema = () => z.object({
  set: GradeTypeSchema.optional()
}).strict();
export const EnumGradeTypeFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.EnumGradeTypeFieldUpdateOperationsInput> = __makeSchema_EnumGradeTypeFieldUpdateOperationsInput_schema() as unknown as z.ZodType<Prisma.EnumGradeTypeFieldUpdateOperationsInput>;
export const EnumGradeTypeFieldUpdateOperationsInputObjectZodSchema = __makeSchema_EnumGradeTypeFieldUpdateOperationsInput_schema();


// File: IntFieldUpdateOperationsInput.schema.ts
const __makeSchema_IntFieldUpdateOperationsInput_schema = () => z.object({
  set: z.number().int().optional(),
  increment: z.number().int().optional(),
  decrement: z.number().int().optional(),
  multiply: z.number().int().optional(),
  divide: z.number().int().optional()
}).strict();
export const IntFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = __makeSchema_IntFieldUpdateOperationsInput_schema() as unknown as z.ZodType<Prisma.IntFieldUpdateOperationsInput>;
export const IntFieldUpdateOperationsInputObjectZodSchema = __makeSchema_IntFieldUpdateOperationsInput_schema();


// File: NullableIntFieldUpdateOperationsInput.schema.ts
const __makeSchema_NullableIntFieldUpdateOperationsInput_schema = () => z.object({
  set: z.number().int().optional(),
  increment: z.number().int().optional(),
  decrement: z.number().int().optional(),
  multiply: z.number().int().optional(),
  divide: z.number().int().optional()
}).strict();
export const NullableIntFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.NullableIntFieldUpdateOperationsInput> = __makeSchema_NullableIntFieldUpdateOperationsInput_schema() as unknown as z.ZodType<Prisma.NullableIntFieldUpdateOperationsInput>;
export const NullableIntFieldUpdateOperationsInputObjectZodSchema = __makeSchema_NullableIntFieldUpdateOperationsInput_schema();


// File: FloatFieldUpdateOperationsInput.schema.ts
const __makeSchema_FloatFieldUpdateOperationsInput_schema = () => z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();
export const FloatFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.FloatFieldUpdateOperationsInput> = __makeSchema_FloatFieldUpdateOperationsInput_schema() as unknown as z.ZodType<Prisma.FloatFieldUpdateOperationsInput>;
export const FloatFieldUpdateOperationsInputObjectZodSchema = __makeSchema_FloatFieldUpdateOperationsInput_schema();


// File: DateTimeFieldUpdateOperationsInput.schema.ts
const __makeSchema_DateTimeFieldUpdateOperationsInput_schema = () => z.object({
  set: z.coerce.date().optional()
}).strict();
export const DateTimeFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = __makeSchema_DateTimeFieldUpdateOperationsInput_schema() as unknown as z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput>;
export const DateTimeFieldUpdateOperationsInputObjectZodSchema = __makeSchema_DateTimeFieldUpdateOperationsInput_schema();


// File: CourseUpdatetaughtSemestersInput.schema.ts
const __makeSchema_CourseUpdatetaughtSemestersInput_schema = () => z.object({
  set: SemesterSchema.array().optional(),
  push: z.union([SemesterSchema, SemesterSchema.array()]).optional()
}).strict();
export const CourseUpdatetaughtSemestersInputObjectSchema: z.ZodType<Prisma.CourseUpdatetaughtSemestersInput> = __makeSchema_CourseUpdatetaughtSemestersInput_schema() as unknown as z.ZodType<Prisma.CourseUpdatetaughtSemestersInput>;
export const CourseUpdatetaughtSemestersInputObjectZodSchema = __makeSchema_CourseUpdatetaughtSemestersInput_schema();


// File: CourseUpdateteachingLanguagesInput.schema.ts
const __makeSchema_CourseUpdateteachingLanguagesInput_schema = () => z.object({
  set: TeachingLanguageSchema.array().optional(),
  push: z.union([TeachingLanguageSchema, TeachingLanguageSchema.array()]).optional()
}).strict();
export const CourseUpdateteachingLanguagesInputObjectSchema: z.ZodType<Prisma.CourseUpdateteachingLanguagesInput> = __makeSchema_CourseUpdateteachingLanguagesInput_schema() as unknown as z.ZodType<Prisma.CourseUpdateteachingLanguagesInput>;
export const CourseUpdateteachingLanguagesInputObjectZodSchema = __makeSchema_CourseUpdateteachingLanguagesInput_schema();


// File: CourseUpdatecampusesInput.schema.ts
const __makeSchema_CourseUpdatecampusesInput_schema = () => z.object({
  set: CampusSchema.array().optional(),
  push: z.union([CampusSchema, CampusSchema.array()]).optional()
}).strict();
export const CourseUpdatecampusesInputObjectSchema: z.ZodType<Prisma.CourseUpdatecampusesInput> = __makeSchema_CourseUpdatecampusesInput_schema() as unknown as z.ZodType<Prisma.CourseUpdatecampusesInput>;
export const CourseUpdatecampusesInputObjectZodSchema = __makeSchema_CourseUpdatecampusesInput_schema();


// File: GradeUpdateManyWithoutCourseNestedInput.schema.ts
const __makeSchema_GradeUpdateManyWithoutCourseNestedInput_schema = () => z.object({
  create: z.union([z.lazy(() => GradeCreateWithoutCourseInputObjectSchema), z.lazy(() => GradeCreateWithoutCourseInputObjectSchema).array(), z.lazy(() => GradeUncheckedCreateWithoutCourseInputObjectSchema), z.lazy(() => GradeUncheckedCreateWithoutCourseInputObjectSchema).array()]).optional(),
  connectOrCreate: z.union([z.lazy(() => GradeCreateOrConnectWithoutCourseInputObjectSchema), z.lazy(() => GradeCreateOrConnectWithoutCourseInputObjectSchema).array()]).optional(),
  upsert: z.union([z.lazy(() => GradeUpsertWithWhereUniqueWithoutCourseInputObjectSchema), z.lazy(() => GradeUpsertWithWhereUniqueWithoutCourseInputObjectSchema).array()]).optional(),
  createMany: z.lazy(() => GradeCreateManyCourseInputEnvelopeObjectSchema).optional(),
  set: z.union([z.lazy(() => GradeWhereUniqueInputObjectSchema), z.lazy(() => GradeWhereUniqueInputObjectSchema).array()]).optional(),
  disconnect: z.union([z.lazy(() => GradeWhereUniqueInputObjectSchema), z.lazy(() => GradeWhereUniqueInputObjectSchema).array()]).optional(),
  delete: z.union([z.lazy(() => GradeWhereUniqueInputObjectSchema), z.lazy(() => GradeWhereUniqueInputObjectSchema).array()]).optional(),
  connect: z.union([z.lazy(() => GradeWhereUniqueInputObjectSchema), z.lazy(() => GradeWhereUniqueInputObjectSchema).array()]).optional(),
  update: z.union([z.lazy(() => GradeUpdateWithWhereUniqueWithoutCourseInputObjectSchema), z.lazy(() => GradeUpdateWithWhereUniqueWithoutCourseInputObjectSchema).array()]).optional(),
  updateMany: z.union([z.lazy(() => GradeUpdateManyWithWhereWithoutCourseInputObjectSchema), z.lazy(() => GradeUpdateManyWithWhereWithoutCourseInputObjectSchema).array()]).optional(),
  deleteMany: z.union([z.lazy(() => GradeScalarWhereInputObjectSchema), z.lazy(() => GradeScalarWhereInputObjectSchema).array()]).optional()
}).strict();
export const GradeUpdateManyWithoutCourseNestedInputObjectSchema: z.ZodType<Prisma.GradeUpdateManyWithoutCourseNestedInput> = __makeSchema_GradeUpdateManyWithoutCourseNestedInput_schema() as unknown as z.ZodType<Prisma.GradeUpdateManyWithoutCourseNestedInput>;
export const GradeUpdateManyWithoutCourseNestedInputObjectZodSchema = __makeSchema_GradeUpdateManyWithoutCourseNestedInput_schema();


// File: FacultyUpdateOneWithoutCoursesNestedInput.schema.ts
const __makeSchema_FacultyUpdateOneWithoutCoursesNestedInput_schema = () => z.object({
  create: z.union([z.lazy(() => FacultyCreateWithoutCoursesInputObjectSchema), z.lazy(() => FacultyUncheckedCreateWithoutCoursesInputObjectSchema)]).optional(),
  connectOrCreate: z.lazy(() => FacultyCreateOrConnectWithoutCoursesInputObjectSchema).optional(),
  upsert: z.lazy(() => FacultyUpsertWithoutCoursesInputObjectSchema).optional(),
  disconnect: z.union([z.boolean(), z.lazy(() => FacultyWhereInputObjectSchema)]).optional(),
  delete: z.union([z.boolean(), z.lazy(() => FacultyWhereInputObjectSchema)]).optional(),
  connect: z.lazy(() => FacultyWhereUniqueInputObjectSchema).optional(),
  update: z.union([z.lazy(() => FacultyUpdateToOneWithWhereWithoutCoursesInputObjectSchema), z.lazy(() => FacultyUpdateWithoutCoursesInputObjectSchema), z.lazy(() => FacultyUncheckedUpdateWithoutCoursesInputObjectSchema)]).optional()
}).strict();
export const FacultyUpdateOneWithoutCoursesNestedInputObjectSchema: z.ZodType<Prisma.FacultyUpdateOneWithoutCoursesNestedInput> = __makeSchema_FacultyUpdateOneWithoutCoursesNestedInput_schema() as unknown as z.ZodType<Prisma.FacultyUpdateOneWithoutCoursesNestedInput>;
export const FacultyUpdateOneWithoutCoursesNestedInputObjectZodSchema = __makeSchema_FacultyUpdateOneWithoutCoursesNestedInput_schema();


// File: DepartmentUpdateOneWithoutCoursesNestedInput.schema.ts
const __makeSchema_DepartmentUpdateOneWithoutCoursesNestedInput_schema = () => z.object({
  create: z.union([z.lazy(() => DepartmentCreateWithoutCoursesInputObjectSchema), z.lazy(() => DepartmentUncheckedCreateWithoutCoursesInputObjectSchema)]).optional(),
  connectOrCreate: z.lazy(() => DepartmentCreateOrConnectWithoutCoursesInputObjectSchema).optional(),
  upsert: z.lazy(() => DepartmentUpsertWithoutCoursesInputObjectSchema).optional(),
  disconnect: z.union([z.boolean(), z.lazy(() => DepartmentWhereInputObjectSchema)]).optional(),
  delete: z.union([z.boolean(), z.lazy(() => DepartmentWhereInputObjectSchema)]).optional(),
  connect: z.lazy(() => DepartmentWhereUniqueInputObjectSchema).optional(),
  update: z.union([z.lazy(() => DepartmentUpdateToOneWithWhereWithoutCoursesInputObjectSchema), z.lazy(() => DepartmentUpdateWithoutCoursesInputObjectSchema), z.lazy(() => DepartmentUncheckedUpdateWithoutCoursesInputObjectSchema)]).optional()
}).strict();
export const DepartmentUpdateOneWithoutCoursesNestedInputObjectSchema: z.ZodType<Prisma.DepartmentUpdateOneWithoutCoursesNestedInput> = __makeSchema_DepartmentUpdateOneWithoutCoursesNestedInput_schema() as unknown as z.ZodType<Prisma.DepartmentUpdateOneWithoutCoursesNestedInput>;
export const DepartmentUpdateOneWithoutCoursesNestedInputObjectZodSchema = __makeSchema_DepartmentUpdateOneWithoutCoursesNestedInput_schema();


// File: GradeUncheckedUpdateManyWithoutCourseNestedInput.schema.ts
const __makeSchema_GradeUncheckedUpdateManyWithoutCourseNestedInput_schema = () => z.object({
  create: z.union([z.lazy(() => GradeCreateWithoutCourseInputObjectSchema), z.lazy(() => GradeCreateWithoutCourseInputObjectSchema).array(), z.lazy(() => GradeUncheckedCreateWithoutCourseInputObjectSchema), z.lazy(() => GradeUncheckedCreateWithoutCourseInputObjectSchema).array()]).optional(),
  connectOrCreate: z.union([z.lazy(() => GradeCreateOrConnectWithoutCourseInputObjectSchema), z.lazy(() => GradeCreateOrConnectWithoutCourseInputObjectSchema).array()]).optional(),
  upsert: z.union([z.lazy(() => GradeUpsertWithWhereUniqueWithoutCourseInputObjectSchema), z.lazy(() => GradeUpsertWithWhereUniqueWithoutCourseInputObjectSchema).array()]).optional(),
  createMany: z.lazy(() => GradeCreateManyCourseInputEnvelopeObjectSchema).optional(),
  set: z.union([z.lazy(() => GradeWhereUniqueInputObjectSchema), z.lazy(() => GradeWhereUniqueInputObjectSchema).array()]).optional(),
  disconnect: z.union([z.lazy(() => GradeWhereUniqueInputObjectSchema), z.lazy(() => GradeWhereUniqueInputObjectSchema).array()]).optional(),
  delete: z.union([z.lazy(() => GradeWhereUniqueInputObjectSchema), z.lazy(() => GradeWhereUniqueInputObjectSchema).array()]).optional(),
  connect: z.union([z.lazy(() => GradeWhereUniqueInputObjectSchema), z.lazy(() => GradeWhereUniqueInputObjectSchema).array()]).optional(),
  update: z.union([z.lazy(() => GradeUpdateWithWhereUniqueWithoutCourseInputObjectSchema), z.lazy(() => GradeUpdateWithWhereUniqueWithoutCourseInputObjectSchema).array()]).optional(),
  updateMany: z.union([z.lazy(() => GradeUpdateManyWithWhereWithoutCourseInputObjectSchema), z.lazy(() => GradeUpdateManyWithWhereWithoutCourseInputObjectSchema).array()]).optional(),
  deleteMany: z.union([z.lazy(() => GradeScalarWhereInputObjectSchema), z.lazy(() => GradeScalarWhereInputObjectSchema).array()]).optional()
}).strict();
export const GradeUncheckedUpdateManyWithoutCourseNestedInputObjectSchema: z.ZodType<Prisma.GradeUncheckedUpdateManyWithoutCourseNestedInput> = __makeSchema_GradeUncheckedUpdateManyWithoutCourseNestedInput_schema() as unknown as z.ZodType<Prisma.GradeUncheckedUpdateManyWithoutCourseNestedInput>;
export const GradeUncheckedUpdateManyWithoutCourseNestedInputObjectZodSchema = __makeSchema_GradeUncheckedUpdateManyWithoutCourseNestedInput_schema();


// File: CourseCreateNestedOneWithoutGradesInput.schema.ts
const __makeSchema_CourseCreateNestedOneWithoutGradesInput_schema = () => z.object({
  create: z.union([z.lazy(() => CourseCreateWithoutGradesInputObjectSchema), z.lazy(() => CourseUncheckedCreateWithoutGradesInputObjectSchema)]).optional(),
  connectOrCreate: z.lazy(() => CourseCreateOrConnectWithoutGradesInputObjectSchema).optional(),
  connect: z.lazy(() => CourseWhereUniqueInputObjectSchema).optional()
}).strict();
export const CourseCreateNestedOneWithoutGradesInputObjectSchema: z.ZodType<Prisma.CourseCreateNestedOneWithoutGradesInput> = __makeSchema_CourseCreateNestedOneWithoutGradesInput_schema() as unknown as z.ZodType<Prisma.CourseCreateNestedOneWithoutGradesInput>;
export const CourseCreateNestedOneWithoutGradesInputObjectZodSchema = __makeSchema_CourseCreateNestedOneWithoutGradesInput_schema();


// File: EnumSemesterFieldUpdateOperationsInput.schema.ts
const __makeSchema_EnumSemesterFieldUpdateOperationsInput_schema = () => z.object({
  set: SemesterSchema.optional()
}).strict();
export const EnumSemesterFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.EnumSemesterFieldUpdateOperationsInput> = __makeSchema_EnumSemesterFieldUpdateOperationsInput_schema() as unknown as z.ZodType<Prisma.EnumSemesterFieldUpdateOperationsInput>;
export const EnumSemesterFieldUpdateOperationsInputObjectZodSchema = __makeSchema_EnumSemesterFieldUpdateOperationsInput_schema();


// File: CourseUpdateOneRequiredWithoutGradesNestedInput.schema.ts
const __makeSchema_CourseUpdateOneRequiredWithoutGradesNestedInput_schema = () => z.object({
  create: z.union([z.lazy(() => CourseCreateWithoutGradesInputObjectSchema), z.lazy(() => CourseUncheckedCreateWithoutGradesInputObjectSchema)]).optional(),
  connectOrCreate: z.lazy(() => CourseCreateOrConnectWithoutGradesInputObjectSchema).optional(),
  upsert: z.lazy(() => CourseUpsertWithoutGradesInputObjectSchema).optional(),
  connect: z.lazy(() => CourseWhereUniqueInputObjectSchema).optional(),
  update: z.union([z.lazy(() => CourseUpdateToOneWithWhereWithoutGradesInputObjectSchema), z.lazy(() => CourseUpdateWithoutGradesInputObjectSchema), z.lazy(() => CourseUncheckedUpdateWithoutGradesInputObjectSchema)]).optional()
}).strict();
export const CourseUpdateOneRequiredWithoutGradesNestedInputObjectSchema: z.ZodType<Prisma.CourseUpdateOneRequiredWithoutGradesNestedInput> = __makeSchema_CourseUpdateOneRequiredWithoutGradesNestedInput_schema() as unknown as z.ZodType<Prisma.CourseUpdateOneRequiredWithoutGradesNestedInput>;
export const CourseUpdateOneRequiredWithoutGradesNestedInputObjectZodSchema = __makeSchema_CourseUpdateOneRequiredWithoutGradesNestedInput_schema();


// File: CourseCreateNestedManyWithoutFacultyInput.schema.ts
const __makeSchema_CourseCreateNestedManyWithoutFacultyInput_schema = () => z.object({
  create: z.union([z.lazy(() => CourseCreateWithoutFacultyInputObjectSchema), z.lazy(() => CourseCreateWithoutFacultyInputObjectSchema).array(), z.lazy(() => CourseUncheckedCreateWithoutFacultyInputObjectSchema), z.lazy(() => CourseUncheckedCreateWithoutFacultyInputObjectSchema).array()]).optional(),
  connectOrCreate: z.union([z.lazy(() => CourseCreateOrConnectWithoutFacultyInputObjectSchema), z.lazy(() => CourseCreateOrConnectWithoutFacultyInputObjectSchema).array()]).optional(),
  createMany: z.lazy(() => CourseCreateManyFacultyInputEnvelopeObjectSchema).optional(),
  connect: z.union([z.lazy(() => CourseWhereUniqueInputObjectSchema), z.lazy(() => CourseWhereUniqueInputObjectSchema).array()]).optional()
}).strict();
export const CourseCreateNestedManyWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseCreateNestedManyWithoutFacultyInput> = __makeSchema_CourseCreateNestedManyWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.CourseCreateNestedManyWithoutFacultyInput>;
export const CourseCreateNestedManyWithoutFacultyInputObjectZodSchema = __makeSchema_CourseCreateNestedManyWithoutFacultyInput_schema();


// File: DepartmentCreateNestedManyWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentCreateNestedManyWithoutFacultyInput_schema = () => z.object({
  create: z.union([z.lazy(() => DepartmentCreateWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentCreateWithoutFacultyInputObjectSchema).array(), z.lazy(() => DepartmentUncheckedCreateWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentUncheckedCreateWithoutFacultyInputObjectSchema).array()]).optional(),
  connectOrCreate: z.union([z.lazy(() => DepartmentCreateOrConnectWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentCreateOrConnectWithoutFacultyInputObjectSchema).array()]).optional(),
  createMany: z.lazy(() => DepartmentCreateManyFacultyInputEnvelopeObjectSchema).optional(),
  connect: z.union([z.lazy(() => DepartmentWhereUniqueInputObjectSchema), z.lazy(() => DepartmentWhereUniqueInputObjectSchema).array()]).optional()
}).strict();
export const DepartmentCreateNestedManyWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentCreateNestedManyWithoutFacultyInput> = __makeSchema_DepartmentCreateNestedManyWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.DepartmentCreateNestedManyWithoutFacultyInput>;
export const DepartmentCreateNestedManyWithoutFacultyInputObjectZodSchema = __makeSchema_DepartmentCreateNestedManyWithoutFacultyInput_schema();


// File: CourseUncheckedCreateNestedManyWithoutFacultyInput.schema.ts
const __makeSchema_CourseUncheckedCreateNestedManyWithoutFacultyInput_schema = () => z.object({
  create: z.union([z.lazy(() => CourseCreateWithoutFacultyInputObjectSchema), z.lazy(() => CourseCreateWithoutFacultyInputObjectSchema).array(), z.lazy(() => CourseUncheckedCreateWithoutFacultyInputObjectSchema), z.lazy(() => CourseUncheckedCreateWithoutFacultyInputObjectSchema).array()]).optional(),
  connectOrCreate: z.union([z.lazy(() => CourseCreateOrConnectWithoutFacultyInputObjectSchema), z.lazy(() => CourseCreateOrConnectWithoutFacultyInputObjectSchema).array()]).optional(),
  createMany: z.lazy(() => CourseCreateManyFacultyInputEnvelopeObjectSchema).optional(),
  connect: z.union([z.lazy(() => CourseWhereUniqueInputObjectSchema), z.lazy(() => CourseWhereUniqueInputObjectSchema).array()]).optional()
}).strict();
export const CourseUncheckedCreateNestedManyWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseUncheckedCreateNestedManyWithoutFacultyInput> = __makeSchema_CourseUncheckedCreateNestedManyWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.CourseUncheckedCreateNestedManyWithoutFacultyInput>;
export const CourseUncheckedCreateNestedManyWithoutFacultyInputObjectZodSchema = __makeSchema_CourseUncheckedCreateNestedManyWithoutFacultyInput_schema();


// File: DepartmentUncheckedCreateNestedManyWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentUncheckedCreateNestedManyWithoutFacultyInput_schema = () => z.object({
  create: z.union([z.lazy(() => DepartmentCreateWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentCreateWithoutFacultyInputObjectSchema).array(), z.lazy(() => DepartmentUncheckedCreateWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentUncheckedCreateWithoutFacultyInputObjectSchema).array()]).optional(),
  connectOrCreate: z.union([z.lazy(() => DepartmentCreateOrConnectWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentCreateOrConnectWithoutFacultyInputObjectSchema).array()]).optional(),
  createMany: z.lazy(() => DepartmentCreateManyFacultyInputEnvelopeObjectSchema).optional(),
  connect: z.union([z.lazy(() => DepartmentWhereUniqueInputObjectSchema), z.lazy(() => DepartmentWhereUniqueInputObjectSchema).array()]).optional()
}).strict();
export const DepartmentUncheckedCreateNestedManyWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentUncheckedCreateNestedManyWithoutFacultyInput> = __makeSchema_DepartmentUncheckedCreateNestedManyWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.DepartmentUncheckedCreateNestedManyWithoutFacultyInput>;
export const DepartmentUncheckedCreateNestedManyWithoutFacultyInputObjectZodSchema = __makeSchema_DepartmentUncheckedCreateNestedManyWithoutFacultyInput_schema();


// File: CourseUpdateManyWithoutFacultyNestedInput.schema.ts
const __makeSchema_CourseUpdateManyWithoutFacultyNestedInput_schema = () => z.object({
  create: z.union([z.lazy(() => CourseCreateWithoutFacultyInputObjectSchema), z.lazy(() => CourseCreateWithoutFacultyInputObjectSchema).array(), z.lazy(() => CourseUncheckedCreateWithoutFacultyInputObjectSchema), z.lazy(() => CourseUncheckedCreateWithoutFacultyInputObjectSchema).array()]).optional(),
  connectOrCreate: z.union([z.lazy(() => CourseCreateOrConnectWithoutFacultyInputObjectSchema), z.lazy(() => CourseCreateOrConnectWithoutFacultyInputObjectSchema).array()]).optional(),
  upsert: z.union([z.lazy(() => CourseUpsertWithWhereUniqueWithoutFacultyInputObjectSchema), z.lazy(() => CourseUpsertWithWhereUniqueWithoutFacultyInputObjectSchema).array()]).optional(),
  createMany: z.lazy(() => CourseCreateManyFacultyInputEnvelopeObjectSchema).optional(),
  set: z.union([z.lazy(() => CourseWhereUniqueInputObjectSchema), z.lazy(() => CourseWhereUniqueInputObjectSchema).array()]).optional(),
  disconnect: z.union([z.lazy(() => CourseWhereUniqueInputObjectSchema), z.lazy(() => CourseWhereUniqueInputObjectSchema).array()]).optional(),
  delete: z.union([z.lazy(() => CourseWhereUniqueInputObjectSchema), z.lazy(() => CourseWhereUniqueInputObjectSchema).array()]).optional(),
  connect: z.union([z.lazy(() => CourseWhereUniqueInputObjectSchema), z.lazy(() => CourseWhereUniqueInputObjectSchema).array()]).optional(),
  update: z.union([z.lazy(() => CourseUpdateWithWhereUniqueWithoutFacultyInputObjectSchema), z.lazy(() => CourseUpdateWithWhereUniqueWithoutFacultyInputObjectSchema).array()]).optional(),
  updateMany: z.union([z.lazy(() => CourseUpdateManyWithWhereWithoutFacultyInputObjectSchema), z.lazy(() => CourseUpdateManyWithWhereWithoutFacultyInputObjectSchema).array()]).optional(),
  deleteMany: z.union([z.lazy(() => CourseScalarWhereInputObjectSchema), z.lazy(() => CourseScalarWhereInputObjectSchema).array()]).optional()
}).strict();
export const CourseUpdateManyWithoutFacultyNestedInputObjectSchema: z.ZodType<Prisma.CourseUpdateManyWithoutFacultyNestedInput> = __makeSchema_CourseUpdateManyWithoutFacultyNestedInput_schema() as unknown as z.ZodType<Prisma.CourseUpdateManyWithoutFacultyNestedInput>;
export const CourseUpdateManyWithoutFacultyNestedInputObjectZodSchema = __makeSchema_CourseUpdateManyWithoutFacultyNestedInput_schema();


// File: DepartmentUpdateManyWithoutFacultyNestedInput.schema.ts
const __makeSchema_DepartmentUpdateManyWithoutFacultyNestedInput_schema = () => z.object({
  create: z.union([z.lazy(() => DepartmentCreateWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentCreateWithoutFacultyInputObjectSchema).array(), z.lazy(() => DepartmentUncheckedCreateWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentUncheckedCreateWithoutFacultyInputObjectSchema).array()]).optional(),
  connectOrCreate: z.union([z.lazy(() => DepartmentCreateOrConnectWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentCreateOrConnectWithoutFacultyInputObjectSchema).array()]).optional(),
  upsert: z.union([z.lazy(() => DepartmentUpsertWithWhereUniqueWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentUpsertWithWhereUniqueWithoutFacultyInputObjectSchema).array()]).optional(),
  createMany: z.lazy(() => DepartmentCreateManyFacultyInputEnvelopeObjectSchema).optional(),
  set: z.union([z.lazy(() => DepartmentWhereUniqueInputObjectSchema), z.lazy(() => DepartmentWhereUniqueInputObjectSchema).array()]).optional(),
  disconnect: z.union([z.lazy(() => DepartmentWhereUniqueInputObjectSchema), z.lazy(() => DepartmentWhereUniqueInputObjectSchema).array()]).optional(),
  delete: z.union([z.lazy(() => DepartmentWhereUniqueInputObjectSchema), z.lazy(() => DepartmentWhereUniqueInputObjectSchema).array()]).optional(),
  connect: z.union([z.lazy(() => DepartmentWhereUniqueInputObjectSchema), z.lazy(() => DepartmentWhereUniqueInputObjectSchema).array()]).optional(),
  update: z.union([z.lazy(() => DepartmentUpdateWithWhereUniqueWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentUpdateWithWhereUniqueWithoutFacultyInputObjectSchema).array()]).optional(),
  updateMany: z.union([z.lazy(() => DepartmentUpdateManyWithWhereWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentUpdateManyWithWhereWithoutFacultyInputObjectSchema).array()]).optional(),
  deleteMany: z.union([z.lazy(() => DepartmentScalarWhereInputObjectSchema), z.lazy(() => DepartmentScalarWhereInputObjectSchema).array()]).optional()
}).strict();
export const DepartmentUpdateManyWithoutFacultyNestedInputObjectSchema: z.ZodType<Prisma.DepartmentUpdateManyWithoutFacultyNestedInput> = __makeSchema_DepartmentUpdateManyWithoutFacultyNestedInput_schema() as unknown as z.ZodType<Prisma.DepartmentUpdateManyWithoutFacultyNestedInput>;
export const DepartmentUpdateManyWithoutFacultyNestedInputObjectZodSchema = __makeSchema_DepartmentUpdateManyWithoutFacultyNestedInput_schema();


// File: CourseUncheckedUpdateManyWithoutFacultyNestedInput.schema.ts
const __makeSchema_CourseUncheckedUpdateManyWithoutFacultyNestedInput_schema = () => z.object({
  create: z.union([z.lazy(() => CourseCreateWithoutFacultyInputObjectSchema), z.lazy(() => CourseCreateWithoutFacultyInputObjectSchema).array(), z.lazy(() => CourseUncheckedCreateWithoutFacultyInputObjectSchema), z.lazy(() => CourseUncheckedCreateWithoutFacultyInputObjectSchema).array()]).optional(),
  connectOrCreate: z.union([z.lazy(() => CourseCreateOrConnectWithoutFacultyInputObjectSchema), z.lazy(() => CourseCreateOrConnectWithoutFacultyInputObjectSchema).array()]).optional(),
  upsert: z.union([z.lazy(() => CourseUpsertWithWhereUniqueWithoutFacultyInputObjectSchema), z.lazy(() => CourseUpsertWithWhereUniqueWithoutFacultyInputObjectSchema).array()]).optional(),
  createMany: z.lazy(() => CourseCreateManyFacultyInputEnvelopeObjectSchema).optional(),
  set: z.union([z.lazy(() => CourseWhereUniqueInputObjectSchema), z.lazy(() => CourseWhereUniqueInputObjectSchema).array()]).optional(),
  disconnect: z.union([z.lazy(() => CourseWhereUniqueInputObjectSchema), z.lazy(() => CourseWhereUniqueInputObjectSchema).array()]).optional(),
  delete: z.union([z.lazy(() => CourseWhereUniqueInputObjectSchema), z.lazy(() => CourseWhereUniqueInputObjectSchema).array()]).optional(),
  connect: z.union([z.lazy(() => CourseWhereUniqueInputObjectSchema), z.lazy(() => CourseWhereUniqueInputObjectSchema).array()]).optional(),
  update: z.union([z.lazy(() => CourseUpdateWithWhereUniqueWithoutFacultyInputObjectSchema), z.lazy(() => CourseUpdateWithWhereUniqueWithoutFacultyInputObjectSchema).array()]).optional(),
  updateMany: z.union([z.lazy(() => CourseUpdateManyWithWhereWithoutFacultyInputObjectSchema), z.lazy(() => CourseUpdateManyWithWhereWithoutFacultyInputObjectSchema).array()]).optional(),
  deleteMany: z.union([z.lazy(() => CourseScalarWhereInputObjectSchema), z.lazy(() => CourseScalarWhereInputObjectSchema).array()]).optional()
}).strict();
export const CourseUncheckedUpdateManyWithoutFacultyNestedInputObjectSchema: z.ZodType<Prisma.CourseUncheckedUpdateManyWithoutFacultyNestedInput> = __makeSchema_CourseUncheckedUpdateManyWithoutFacultyNestedInput_schema() as unknown as z.ZodType<Prisma.CourseUncheckedUpdateManyWithoutFacultyNestedInput>;
export const CourseUncheckedUpdateManyWithoutFacultyNestedInputObjectZodSchema = __makeSchema_CourseUncheckedUpdateManyWithoutFacultyNestedInput_schema();


// File: DepartmentUncheckedUpdateManyWithoutFacultyNestedInput.schema.ts
const __makeSchema_DepartmentUncheckedUpdateManyWithoutFacultyNestedInput_schema = () => z.object({
  create: z.union([z.lazy(() => DepartmentCreateWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentCreateWithoutFacultyInputObjectSchema).array(), z.lazy(() => DepartmentUncheckedCreateWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentUncheckedCreateWithoutFacultyInputObjectSchema).array()]).optional(),
  connectOrCreate: z.union([z.lazy(() => DepartmentCreateOrConnectWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentCreateOrConnectWithoutFacultyInputObjectSchema).array()]).optional(),
  upsert: z.union([z.lazy(() => DepartmentUpsertWithWhereUniqueWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentUpsertWithWhereUniqueWithoutFacultyInputObjectSchema).array()]).optional(),
  createMany: z.lazy(() => DepartmentCreateManyFacultyInputEnvelopeObjectSchema).optional(),
  set: z.union([z.lazy(() => DepartmentWhereUniqueInputObjectSchema), z.lazy(() => DepartmentWhereUniqueInputObjectSchema).array()]).optional(),
  disconnect: z.union([z.lazy(() => DepartmentWhereUniqueInputObjectSchema), z.lazy(() => DepartmentWhereUniqueInputObjectSchema).array()]).optional(),
  delete: z.union([z.lazy(() => DepartmentWhereUniqueInputObjectSchema), z.lazy(() => DepartmentWhereUniqueInputObjectSchema).array()]).optional(),
  connect: z.union([z.lazy(() => DepartmentWhereUniqueInputObjectSchema), z.lazy(() => DepartmentWhereUniqueInputObjectSchema).array()]).optional(),
  update: z.union([z.lazy(() => DepartmentUpdateWithWhereUniqueWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentUpdateWithWhereUniqueWithoutFacultyInputObjectSchema).array()]).optional(),
  updateMany: z.union([z.lazy(() => DepartmentUpdateManyWithWhereWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentUpdateManyWithWhereWithoutFacultyInputObjectSchema).array()]).optional(),
  deleteMany: z.union([z.lazy(() => DepartmentScalarWhereInputObjectSchema), z.lazy(() => DepartmentScalarWhereInputObjectSchema).array()]).optional()
}).strict();
export const DepartmentUncheckedUpdateManyWithoutFacultyNestedInputObjectSchema: z.ZodType<Prisma.DepartmentUncheckedUpdateManyWithoutFacultyNestedInput> = __makeSchema_DepartmentUncheckedUpdateManyWithoutFacultyNestedInput_schema() as unknown as z.ZodType<Prisma.DepartmentUncheckedUpdateManyWithoutFacultyNestedInput>;
export const DepartmentUncheckedUpdateManyWithoutFacultyNestedInputObjectZodSchema = __makeSchema_DepartmentUncheckedUpdateManyWithoutFacultyNestedInput_schema();


// File: CourseCreateNestedManyWithoutDepartmentInput.schema.ts
const __makeSchema_CourseCreateNestedManyWithoutDepartmentInput_schema = () => z.object({
  create: z.union([z.lazy(() => CourseCreateWithoutDepartmentInputObjectSchema), z.lazy(() => CourseCreateWithoutDepartmentInputObjectSchema).array(), z.lazy(() => CourseUncheckedCreateWithoutDepartmentInputObjectSchema), z.lazy(() => CourseUncheckedCreateWithoutDepartmentInputObjectSchema).array()]).optional(),
  connectOrCreate: z.union([z.lazy(() => CourseCreateOrConnectWithoutDepartmentInputObjectSchema), z.lazy(() => CourseCreateOrConnectWithoutDepartmentInputObjectSchema).array()]).optional(),
  createMany: z.lazy(() => CourseCreateManyDepartmentInputEnvelopeObjectSchema).optional(),
  connect: z.union([z.lazy(() => CourseWhereUniqueInputObjectSchema), z.lazy(() => CourseWhereUniqueInputObjectSchema).array()]).optional()
}).strict();
export const CourseCreateNestedManyWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseCreateNestedManyWithoutDepartmentInput> = __makeSchema_CourseCreateNestedManyWithoutDepartmentInput_schema() as unknown as z.ZodType<Prisma.CourseCreateNestedManyWithoutDepartmentInput>;
export const CourseCreateNestedManyWithoutDepartmentInputObjectZodSchema = __makeSchema_CourseCreateNestedManyWithoutDepartmentInput_schema();


// File: FacultyCreateNestedOneWithoutDepartmentsInput.schema.ts
const __makeSchema_FacultyCreateNestedOneWithoutDepartmentsInput_schema = () => z.object({
  create: z.union([z.lazy(() => FacultyCreateWithoutDepartmentsInputObjectSchema), z.lazy(() => FacultyUncheckedCreateWithoutDepartmentsInputObjectSchema)]).optional(),
  connectOrCreate: z.lazy(() => FacultyCreateOrConnectWithoutDepartmentsInputObjectSchema).optional(),
  connect: z.lazy(() => FacultyWhereUniqueInputObjectSchema).optional()
}).strict();
export const FacultyCreateNestedOneWithoutDepartmentsInputObjectSchema: z.ZodType<Prisma.FacultyCreateNestedOneWithoutDepartmentsInput> = __makeSchema_FacultyCreateNestedOneWithoutDepartmentsInput_schema() as unknown as z.ZodType<Prisma.FacultyCreateNestedOneWithoutDepartmentsInput>;
export const FacultyCreateNestedOneWithoutDepartmentsInputObjectZodSchema = __makeSchema_FacultyCreateNestedOneWithoutDepartmentsInput_schema();


// File: CourseUncheckedCreateNestedManyWithoutDepartmentInput.schema.ts
const __makeSchema_CourseUncheckedCreateNestedManyWithoutDepartmentInput_schema = () => z.object({
  create: z.union([z.lazy(() => CourseCreateWithoutDepartmentInputObjectSchema), z.lazy(() => CourseCreateWithoutDepartmentInputObjectSchema).array(), z.lazy(() => CourseUncheckedCreateWithoutDepartmentInputObjectSchema), z.lazy(() => CourseUncheckedCreateWithoutDepartmentInputObjectSchema).array()]).optional(),
  connectOrCreate: z.union([z.lazy(() => CourseCreateOrConnectWithoutDepartmentInputObjectSchema), z.lazy(() => CourseCreateOrConnectWithoutDepartmentInputObjectSchema).array()]).optional(),
  createMany: z.lazy(() => CourseCreateManyDepartmentInputEnvelopeObjectSchema).optional(),
  connect: z.union([z.lazy(() => CourseWhereUniqueInputObjectSchema), z.lazy(() => CourseWhereUniqueInputObjectSchema).array()]).optional()
}).strict();
export const CourseUncheckedCreateNestedManyWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseUncheckedCreateNestedManyWithoutDepartmentInput> = __makeSchema_CourseUncheckedCreateNestedManyWithoutDepartmentInput_schema() as unknown as z.ZodType<Prisma.CourseUncheckedCreateNestedManyWithoutDepartmentInput>;
export const CourseUncheckedCreateNestedManyWithoutDepartmentInputObjectZodSchema = __makeSchema_CourseUncheckedCreateNestedManyWithoutDepartmentInput_schema();


// File: CourseUpdateManyWithoutDepartmentNestedInput.schema.ts
const __makeSchema_CourseUpdateManyWithoutDepartmentNestedInput_schema = () => z.object({
  create: z.union([z.lazy(() => CourseCreateWithoutDepartmentInputObjectSchema), z.lazy(() => CourseCreateWithoutDepartmentInputObjectSchema).array(), z.lazy(() => CourseUncheckedCreateWithoutDepartmentInputObjectSchema), z.lazy(() => CourseUncheckedCreateWithoutDepartmentInputObjectSchema).array()]).optional(),
  connectOrCreate: z.union([z.lazy(() => CourseCreateOrConnectWithoutDepartmentInputObjectSchema), z.lazy(() => CourseCreateOrConnectWithoutDepartmentInputObjectSchema).array()]).optional(),
  upsert: z.union([z.lazy(() => CourseUpsertWithWhereUniqueWithoutDepartmentInputObjectSchema), z.lazy(() => CourseUpsertWithWhereUniqueWithoutDepartmentInputObjectSchema).array()]).optional(),
  createMany: z.lazy(() => CourseCreateManyDepartmentInputEnvelopeObjectSchema).optional(),
  set: z.union([z.lazy(() => CourseWhereUniqueInputObjectSchema), z.lazy(() => CourseWhereUniqueInputObjectSchema).array()]).optional(),
  disconnect: z.union([z.lazy(() => CourseWhereUniqueInputObjectSchema), z.lazy(() => CourseWhereUniqueInputObjectSchema).array()]).optional(),
  delete: z.union([z.lazy(() => CourseWhereUniqueInputObjectSchema), z.lazy(() => CourseWhereUniqueInputObjectSchema).array()]).optional(),
  connect: z.union([z.lazy(() => CourseWhereUniqueInputObjectSchema), z.lazy(() => CourseWhereUniqueInputObjectSchema).array()]).optional(),
  update: z.union([z.lazy(() => CourseUpdateWithWhereUniqueWithoutDepartmentInputObjectSchema), z.lazy(() => CourseUpdateWithWhereUniqueWithoutDepartmentInputObjectSchema).array()]).optional(),
  updateMany: z.union([z.lazy(() => CourseUpdateManyWithWhereWithoutDepartmentInputObjectSchema), z.lazy(() => CourseUpdateManyWithWhereWithoutDepartmentInputObjectSchema).array()]).optional(),
  deleteMany: z.union([z.lazy(() => CourseScalarWhereInputObjectSchema), z.lazy(() => CourseScalarWhereInputObjectSchema).array()]).optional()
}).strict();
export const CourseUpdateManyWithoutDepartmentNestedInputObjectSchema: z.ZodType<Prisma.CourseUpdateManyWithoutDepartmentNestedInput> = __makeSchema_CourseUpdateManyWithoutDepartmentNestedInput_schema() as unknown as z.ZodType<Prisma.CourseUpdateManyWithoutDepartmentNestedInput>;
export const CourseUpdateManyWithoutDepartmentNestedInputObjectZodSchema = __makeSchema_CourseUpdateManyWithoutDepartmentNestedInput_schema();


// File: FacultyUpdateOneRequiredWithoutDepartmentsNestedInput.schema.ts
const __makeSchema_FacultyUpdateOneRequiredWithoutDepartmentsNestedInput_schema = () => z.object({
  create: z.union([z.lazy(() => FacultyCreateWithoutDepartmentsInputObjectSchema), z.lazy(() => FacultyUncheckedCreateWithoutDepartmentsInputObjectSchema)]).optional(),
  connectOrCreate: z.lazy(() => FacultyCreateOrConnectWithoutDepartmentsInputObjectSchema).optional(),
  upsert: z.lazy(() => FacultyUpsertWithoutDepartmentsInputObjectSchema).optional(),
  connect: z.lazy(() => FacultyWhereUniqueInputObjectSchema).optional(),
  update: z.union([z.lazy(() => FacultyUpdateToOneWithWhereWithoutDepartmentsInputObjectSchema), z.lazy(() => FacultyUpdateWithoutDepartmentsInputObjectSchema), z.lazy(() => FacultyUncheckedUpdateWithoutDepartmentsInputObjectSchema)]).optional()
}).strict();
export const FacultyUpdateOneRequiredWithoutDepartmentsNestedInputObjectSchema: z.ZodType<Prisma.FacultyUpdateOneRequiredWithoutDepartmentsNestedInput> = __makeSchema_FacultyUpdateOneRequiredWithoutDepartmentsNestedInput_schema() as unknown as z.ZodType<Prisma.FacultyUpdateOneRequiredWithoutDepartmentsNestedInput>;
export const FacultyUpdateOneRequiredWithoutDepartmentsNestedInputObjectZodSchema = __makeSchema_FacultyUpdateOneRequiredWithoutDepartmentsNestedInput_schema();


// File: CourseUncheckedUpdateManyWithoutDepartmentNestedInput.schema.ts
const __makeSchema_CourseUncheckedUpdateManyWithoutDepartmentNestedInput_schema = () => z.object({
  create: z.union([z.lazy(() => CourseCreateWithoutDepartmentInputObjectSchema), z.lazy(() => CourseCreateWithoutDepartmentInputObjectSchema).array(), z.lazy(() => CourseUncheckedCreateWithoutDepartmentInputObjectSchema), z.lazy(() => CourseUncheckedCreateWithoutDepartmentInputObjectSchema).array()]).optional(),
  connectOrCreate: z.union([z.lazy(() => CourseCreateOrConnectWithoutDepartmentInputObjectSchema), z.lazy(() => CourseCreateOrConnectWithoutDepartmentInputObjectSchema).array()]).optional(),
  upsert: z.union([z.lazy(() => CourseUpsertWithWhereUniqueWithoutDepartmentInputObjectSchema), z.lazy(() => CourseUpsertWithWhereUniqueWithoutDepartmentInputObjectSchema).array()]).optional(),
  createMany: z.lazy(() => CourseCreateManyDepartmentInputEnvelopeObjectSchema).optional(),
  set: z.union([z.lazy(() => CourseWhereUniqueInputObjectSchema), z.lazy(() => CourseWhereUniqueInputObjectSchema).array()]).optional(),
  disconnect: z.union([z.lazy(() => CourseWhereUniqueInputObjectSchema), z.lazy(() => CourseWhereUniqueInputObjectSchema).array()]).optional(),
  delete: z.union([z.lazy(() => CourseWhereUniqueInputObjectSchema), z.lazy(() => CourseWhereUniqueInputObjectSchema).array()]).optional(),
  connect: z.union([z.lazy(() => CourseWhereUniqueInputObjectSchema), z.lazy(() => CourseWhereUniqueInputObjectSchema).array()]).optional(),
  update: z.union([z.lazy(() => CourseUpdateWithWhereUniqueWithoutDepartmentInputObjectSchema), z.lazy(() => CourseUpdateWithWhereUniqueWithoutDepartmentInputObjectSchema).array()]).optional(),
  updateMany: z.union([z.lazy(() => CourseUpdateManyWithWhereWithoutDepartmentInputObjectSchema), z.lazy(() => CourseUpdateManyWithWhereWithoutDepartmentInputObjectSchema).array()]).optional(),
  deleteMany: z.union([z.lazy(() => CourseScalarWhereInputObjectSchema), z.lazy(() => CourseScalarWhereInputObjectSchema).array()]).optional()
}).strict();
export const CourseUncheckedUpdateManyWithoutDepartmentNestedInputObjectSchema: z.ZodType<Prisma.CourseUncheckedUpdateManyWithoutDepartmentNestedInput> = __makeSchema_CourseUncheckedUpdateManyWithoutDepartmentNestedInput_schema() as unknown as z.ZodType<Prisma.CourseUncheckedUpdateManyWithoutDepartmentNestedInput>;
export const CourseUncheckedUpdateManyWithoutDepartmentNestedInputObjectZodSchema = __makeSchema_CourseUncheckedUpdateManyWithoutDepartmentNestedInput_schema();


// File: NestedStringFilter.schema.ts


const nestedstringfilterSchema = z.object({
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
  not: z.union([z.string(), z.lazy(() => NestedStringFilterObjectSchema)]).optional()
}).strict();
export const NestedStringFilterObjectSchema: z.ZodType<Prisma.NestedStringFilter> = nestedstringfilterSchema as unknown as z.ZodType<Prisma.NestedStringFilter>;
export const NestedStringFilterObjectZodSchema = nestedstringfilterSchema;


// File: NestedStringNullableFilter.schema.ts


const nestedstringnullablefilterSchema = z.object({
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
  not: z.union([z.string(), z.lazy(() => NestedStringNullableFilterObjectSchema)]).optional().nullable()
}).strict();
export const NestedStringNullableFilterObjectSchema: z.ZodType<Prisma.NestedStringNullableFilter> = nestedstringnullablefilterSchema as unknown as z.ZodType<Prisma.NestedStringNullableFilter>;
export const NestedStringNullableFilterObjectZodSchema = nestedstringnullablefilterSchema;


// File: NestedFloatNullableFilter.schema.ts


const nestedfloatnullablefilterSchema = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), z.lazy(() => NestedFloatNullableFilterObjectSchema)]).optional().nullable()
}).strict();
export const NestedFloatNullableFilterObjectSchema: z.ZodType<Prisma.NestedFloatNullableFilter> = nestedfloatnullablefilterSchema as unknown as z.ZodType<Prisma.NestedFloatNullableFilter>;
export const NestedFloatNullableFilterObjectZodSchema = nestedfloatnullablefilterSchema;


// File: NestedEnumStudyLevelFilter.schema.ts

const nestedenumstudylevelfilterSchema = z.object({
  equals: StudyLevelSchema.optional(),
  in: StudyLevelSchema.array().optional(),
  notIn: StudyLevelSchema.array().optional(),
  not: z.union([StudyLevelSchema, z.lazy(() => NestedEnumStudyLevelFilterObjectSchema)]).optional()
}).strict();
export const NestedEnumStudyLevelFilterObjectSchema: z.ZodType<Prisma.NestedEnumStudyLevelFilter> = nestedenumstudylevelfilterSchema as unknown as z.ZodType<Prisma.NestedEnumStudyLevelFilter>;
export const NestedEnumStudyLevelFilterObjectZodSchema = nestedenumstudylevelfilterSchema;


// File: NestedEnumGradeTypeFilter.schema.ts

const nestedenumgradetypefilterSchema = z.object({
  equals: GradeTypeSchema.optional(),
  in: GradeTypeSchema.array().optional(),
  notIn: GradeTypeSchema.array().optional(),
  not: z.union([GradeTypeSchema, z.lazy(() => NestedEnumGradeTypeFilterObjectSchema)]).optional()
}).strict();
export const NestedEnumGradeTypeFilterObjectSchema: z.ZodType<Prisma.NestedEnumGradeTypeFilter> = nestedenumgradetypefilterSchema as unknown as z.ZodType<Prisma.NestedEnumGradeTypeFilter>;
export const NestedEnumGradeTypeFilterObjectZodSchema = nestedenumgradetypefilterSchema;


// File: NestedIntFilter.schema.ts


const nestedintfilterSchema = z.object({
  equals: z.number().int().optional(),
  in: z.number().int().array().optional(),
  notIn: z.number().int().array().optional(),
  lt: z.number().int().optional(),
  lte: z.number().int().optional(),
  gt: z.number().int().optional(),
  gte: z.number().int().optional(),
  not: z.union([z.number().int(), z.lazy(() => NestedIntFilterObjectSchema)]).optional()
}).strict();
export const NestedIntFilterObjectSchema: z.ZodType<Prisma.NestedIntFilter> = nestedintfilterSchema as unknown as z.ZodType<Prisma.NestedIntFilter>;
export const NestedIntFilterObjectZodSchema = nestedintfilterSchema;


// File: NestedIntNullableFilter.schema.ts


const nestedintnullablefilterSchema = z.object({
  equals: z.number().int().optional().nullable(),
  in: z.number().int().array().optional().nullable(),
  notIn: z.number().int().array().optional().nullable(),
  lt: z.number().int().optional(),
  lte: z.number().int().optional(),
  gt: z.number().int().optional(),
  gte: z.number().int().optional(),
  not: z.union([z.number().int(), z.lazy(() => NestedIntNullableFilterObjectSchema)]).optional().nullable()
}).strict();
export const NestedIntNullableFilterObjectSchema: z.ZodType<Prisma.NestedIntNullableFilter> = nestedintnullablefilterSchema as unknown as z.ZodType<Prisma.NestedIntNullableFilter>;
export const NestedIntNullableFilterObjectZodSchema = nestedintnullablefilterSchema;


// File: NestedFloatFilter.schema.ts


const nestedfloatfilterSchema = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), z.lazy(() => NestedFloatFilterObjectSchema)]).optional()
}).strict();
export const NestedFloatFilterObjectSchema: z.ZodType<Prisma.NestedFloatFilter> = nestedfloatfilterSchema as unknown as z.ZodType<Prisma.NestedFloatFilter>;
export const NestedFloatFilterObjectZodSchema = nestedfloatfilterSchema;


// File: NestedDateTimeFilter.schema.ts


const nesteddatetimefilterSchema = z.object({
  equals: z.date().optional(),
  in: z.union([z.date().array(), z.string().datetime().array()]).optional(),
  notIn: z.union([z.date().array(), z.string().datetime().array()]).optional(),
  lt: z.date().optional(),
  lte: z.date().optional(),
  gt: z.date().optional(),
  gte: z.date().optional(),
  not: z.union([z.date(), z.lazy(() => NestedDateTimeFilterObjectSchema)]).optional()
}).strict();
export const NestedDateTimeFilterObjectSchema: z.ZodType<Prisma.NestedDateTimeFilter> = nesteddatetimefilterSchema as unknown as z.ZodType<Prisma.NestedDateTimeFilter>;
export const NestedDateTimeFilterObjectZodSchema = nesteddatetimefilterSchema;


// File: NestedStringWithAggregatesFilter.schema.ts

const nestedstringwithaggregatesfilterSchema = z.object({
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
  not: z.union([z.string(), z.lazy(() => NestedStringWithAggregatesFilterObjectSchema)]).optional(),
  _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
  _min: z.lazy(() => NestedStringFilterObjectSchema).optional(),
  _max: z.lazy(() => NestedStringFilterObjectSchema).optional()
}).strict();
export const NestedStringWithAggregatesFilterObjectSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = nestedstringwithaggregatesfilterSchema as unknown as z.ZodType<Prisma.NestedStringWithAggregatesFilter>;
export const NestedStringWithAggregatesFilterObjectZodSchema = nestedstringwithaggregatesfilterSchema;


// File: NestedStringNullableWithAggregatesFilter.schema.ts

const nestedstringnullablewithaggregatesfilterSchema = z.object({
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
  not: z.union([z.string(), z.lazy(() => NestedStringNullableWithAggregatesFilterObjectSchema)]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterObjectSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterObjectSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterObjectSchema).optional()
}).strict();
export const NestedStringNullableWithAggregatesFilterObjectSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = nestedstringnullablewithaggregatesfilterSchema as unknown as z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter>;
export const NestedStringNullableWithAggregatesFilterObjectZodSchema = nestedstringnullablewithaggregatesfilterSchema;


// File: NestedFloatNullableWithAggregatesFilter.schema.ts

const nestedfloatnullablewithaggregatesfilterSchema = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), z.lazy(() => NestedFloatNullableWithAggregatesFilterObjectSchema)]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterObjectSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterObjectSchema).optional(),
  _sum: z.lazy(() => NestedFloatNullableFilterObjectSchema).optional(),
  _min: z.lazy(() => NestedFloatNullableFilterObjectSchema).optional(),
  _max: z.lazy(() => NestedFloatNullableFilterObjectSchema).optional()
}).strict();
export const NestedFloatNullableWithAggregatesFilterObjectSchema: z.ZodType<Prisma.NestedFloatNullableWithAggregatesFilter> = nestedfloatnullablewithaggregatesfilterSchema as unknown as z.ZodType<Prisma.NestedFloatNullableWithAggregatesFilter>;
export const NestedFloatNullableWithAggregatesFilterObjectZodSchema = nestedfloatnullablewithaggregatesfilterSchema;


// File: NestedEnumStudyLevelWithAggregatesFilter.schema.ts

const nestedenumstudylevelwithaggregatesfilterSchema = z.object({
  equals: StudyLevelSchema.optional(),
  in: StudyLevelSchema.array().optional(),
  notIn: StudyLevelSchema.array().optional(),
  not: z.union([StudyLevelSchema, z.lazy(() => NestedEnumStudyLevelWithAggregatesFilterObjectSchema)]).optional(),
  _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
  _min: z.lazy(() => NestedEnumStudyLevelFilterObjectSchema).optional(),
  _max: z.lazy(() => NestedEnumStudyLevelFilterObjectSchema).optional()
}).strict();
export const NestedEnumStudyLevelWithAggregatesFilterObjectSchema: z.ZodType<Prisma.NestedEnumStudyLevelWithAggregatesFilter> = nestedenumstudylevelwithaggregatesfilterSchema as unknown as z.ZodType<Prisma.NestedEnumStudyLevelWithAggregatesFilter>;
export const NestedEnumStudyLevelWithAggregatesFilterObjectZodSchema = nestedenumstudylevelwithaggregatesfilterSchema;


// File: NestedEnumGradeTypeWithAggregatesFilter.schema.ts

const nestedenumgradetypewithaggregatesfilterSchema = z.object({
  equals: GradeTypeSchema.optional(),
  in: GradeTypeSchema.array().optional(),
  notIn: GradeTypeSchema.array().optional(),
  not: z.union([GradeTypeSchema, z.lazy(() => NestedEnumGradeTypeWithAggregatesFilterObjectSchema)]).optional(),
  _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
  _min: z.lazy(() => NestedEnumGradeTypeFilterObjectSchema).optional(),
  _max: z.lazy(() => NestedEnumGradeTypeFilterObjectSchema).optional()
}).strict();
export const NestedEnumGradeTypeWithAggregatesFilterObjectSchema: z.ZodType<Prisma.NestedEnumGradeTypeWithAggregatesFilter> = nestedenumgradetypewithaggregatesfilterSchema as unknown as z.ZodType<Prisma.NestedEnumGradeTypeWithAggregatesFilter>;
export const NestedEnumGradeTypeWithAggregatesFilterObjectZodSchema = nestedenumgradetypewithaggregatesfilterSchema;


// File: NestedIntWithAggregatesFilter.schema.ts

const nestedintwithaggregatesfilterSchema = z.object({
  equals: z.number().int().optional(),
  in: z.number().int().array().optional(),
  notIn: z.number().int().array().optional(),
  lt: z.number().int().optional(),
  lte: z.number().int().optional(),
  gt: z.number().int().optional(),
  gte: z.number().int().optional(),
  not: z.union([z.number().int(), z.lazy(() => NestedIntWithAggregatesFilterObjectSchema)]).optional(),
  _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterObjectSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterObjectSchema).optional(),
  _min: z.lazy(() => NestedIntFilterObjectSchema).optional(),
  _max: z.lazy(() => NestedIntFilterObjectSchema).optional()
}).strict();
export const NestedIntWithAggregatesFilterObjectSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = nestedintwithaggregatesfilterSchema as unknown as z.ZodType<Prisma.NestedIntWithAggregatesFilter>;
export const NestedIntWithAggregatesFilterObjectZodSchema = nestedintwithaggregatesfilterSchema;


// File: NestedIntNullableWithAggregatesFilter.schema.ts

const nestedintnullablewithaggregatesfilterSchema = z.object({
  equals: z.number().int().optional().nullable(),
  in: z.number().int().array().optional().nullable(),
  notIn: z.number().int().array().optional().nullable(),
  lt: z.number().int().optional(),
  lte: z.number().int().optional(),
  gt: z.number().int().optional(),
  gte: z.number().int().optional(),
  not: z.union([z.number().int(), z.lazy(() => NestedIntNullableWithAggregatesFilterObjectSchema)]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterObjectSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterObjectSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterObjectSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterObjectSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterObjectSchema).optional()
}).strict();
export const NestedIntNullableWithAggregatesFilterObjectSchema: z.ZodType<Prisma.NestedIntNullableWithAggregatesFilter> = nestedintnullablewithaggregatesfilterSchema as unknown as z.ZodType<Prisma.NestedIntNullableWithAggregatesFilter>;
export const NestedIntNullableWithAggregatesFilterObjectZodSchema = nestedintnullablewithaggregatesfilterSchema;


// File: NestedFloatWithAggregatesFilter.schema.ts

const nestedfloatwithaggregatesfilterSchema = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([z.number(), z.lazy(() => NestedFloatWithAggregatesFilterObjectSchema)]).optional(),
  _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterObjectSchema).optional(),
  _sum: z.lazy(() => NestedFloatFilterObjectSchema).optional(),
  _min: z.lazy(() => NestedFloatFilterObjectSchema).optional(),
  _max: z.lazy(() => NestedFloatFilterObjectSchema).optional()
}).strict();
export const NestedFloatWithAggregatesFilterObjectSchema: z.ZodType<Prisma.NestedFloatWithAggregatesFilter> = nestedfloatwithaggregatesfilterSchema as unknown as z.ZodType<Prisma.NestedFloatWithAggregatesFilter>;
export const NestedFloatWithAggregatesFilterObjectZodSchema = nestedfloatwithaggregatesfilterSchema;


// File: NestedDateTimeWithAggregatesFilter.schema.ts

const nesteddatetimewithaggregatesfilterSchema = z.object({
  equals: z.date().optional(),
  in: z.union([z.date().array(), z.string().datetime().array()]).optional(),
  notIn: z.union([z.date().array(), z.string().datetime().array()]).optional(),
  lt: z.date().optional(),
  lte: z.date().optional(),
  gt: z.date().optional(),
  gte: z.date().optional(),
  not: z.union([z.date(), z.lazy(() => NestedDateTimeWithAggregatesFilterObjectSchema)]).optional(),
  _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterObjectSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterObjectSchema).optional()
}).strict();
export const NestedDateTimeWithAggregatesFilterObjectSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = nesteddatetimewithaggregatesfilterSchema as unknown as z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter>;
export const NestedDateTimeWithAggregatesFilterObjectZodSchema = nesteddatetimewithaggregatesfilterSchema;


// File: NestedEnumSemesterFilter.schema.ts

const nestedenumsemesterfilterSchema = z.object({
  equals: SemesterSchema.optional(),
  in: SemesterSchema.array().optional(),
  notIn: SemesterSchema.array().optional(),
  not: z.union([SemesterSchema, z.lazy(() => NestedEnumSemesterFilterObjectSchema)]).optional()
}).strict();
export const NestedEnumSemesterFilterObjectSchema: z.ZodType<Prisma.NestedEnumSemesterFilter> = nestedenumsemesterfilterSchema as unknown as z.ZodType<Prisma.NestedEnumSemesterFilter>;
export const NestedEnumSemesterFilterObjectZodSchema = nestedenumsemesterfilterSchema;


// File: NestedEnumSemesterWithAggregatesFilter.schema.ts

const nestedenumsemesterwithaggregatesfilterSchema = z.object({
  equals: SemesterSchema.optional(),
  in: SemesterSchema.array().optional(),
  notIn: SemesterSchema.array().optional(),
  not: z.union([SemesterSchema, z.lazy(() => NestedEnumSemesterWithAggregatesFilterObjectSchema)]).optional(),
  _count: z.lazy(() => NestedIntFilterObjectSchema).optional(),
  _min: z.lazy(() => NestedEnumSemesterFilterObjectSchema).optional(),
  _max: z.lazy(() => NestedEnumSemesterFilterObjectSchema).optional()
}).strict();
export const NestedEnumSemesterWithAggregatesFilterObjectSchema: z.ZodType<Prisma.NestedEnumSemesterWithAggregatesFilter> = nestedenumsemesterwithaggregatesfilterSchema as unknown as z.ZodType<Prisma.NestedEnumSemesterWithAggregatesFilter>;
export const NestedEnumSemesterWithAggregatesFilterObjectZodSchema = nestedenumsemesterwithaggregatesfilterSchema;


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
export const GradeCreateWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeCreateWithoutCourseInput> = __makeSchema_GradeCreateWithoutCourseInput_schema() as unknown as z.ZodType<Prisma.GradeCreateWithoutCourseInput>;
export const GradeCreateWithoutCourseInputObjectZodSchema = __makeSchema_GradeCreateWithoutCourseInput_schema();


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
export const GradeUncheckedCreateWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeUncheckedCreateWithoutCourseInput> = __makeSchema_GradeUncheckedCreateWithoutCourseInput_schema() as unknown as z.ZodType<Prisma.GradeUncheckedCreateWithoutCourseInput>;
export const GradeUncheckedCreateWithoutCourseInputObjectZodSchema = __makeSchema_GradeUncheckedCreateWithoutCourseInput_schema();


// File: GradeCreateOrConnectWithoutCourseInput.schema.ts
const __makeSchema_GradeCreateOrConnectWithoutCourseInput_schema = () => z.object({
  where: z.lazy(() => GradeWhereUniqueInputObjectSchema),
  create: z.union([z.lazy(() => GradeCreateWithoutCourseInputObjectSchema), z.lazy(() => GradeUncheckedCreateWithoutCourseInputObjectSchema)])
}).strict();
export const GradeCreateOrConnectWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeCreateOrConnectWithoutCourseInput> = __makeSchema_GradeCreateOrConnectWithoutCourseInput_schema() as unknown as z.ZodType<Prisma.GradeCreateOrConnectWithoutCourseInput>;
export const GradeCreateOrConnectWithoutCourseInputObjectZodSchema = __makeSchema_GradeCreateOrConnectWithoutCourseInput_schema();


// File: GradeCreateManyCourseInputEnvelope.schema.ts
const __makeSchema_GradeCreateManyCourseInputEnvelope_schema = () => z.object({
  data: z.union([z.lazy(() => GradeCreateManyCourseInputObjectSchema), z.lazy(() => GradeCreateManyCourseInputObjectSchema).array()]),
  skipDuplicates: z.boolean().optional()
}).strict();
export const GradeCreateManyCourseInputEnvelopeObjectSchema: z.ZodType<Prisma.GradeCreateManyCourseInputEnvelope> = __makeSchema_GradeCreateManyCourseInputEnvelope_schema() as unknown as z.ZodType<Prisma.GradeCreateManyCourseInputEnvelope>;
export const GradeCreateManyCourseInputEnvelopeObjectZodSchema = __makeSchema_GradeCreateManyCourseInputEnvelope_schema();


// File: FacultyCreateWithoutCoursesInput.schema.ts
const __makeSchema_FacultyCreateWithoutCoursesInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  departments: z.lazy(() => DepartmentCreateNestedManyWithoutFacultyInputObjectSchema).optional()
}).strict();
export const FacultyCreateWithoutCoursesInputObjectSchema: z.ZodType<Prisma.FacultyCreateWithoutCoursesInput> = __makeSchema_FacultyCreateWithoutCoursesInput_schema() as unknown as z.ZodType<Prisma.FacultyCreateWithoutCoursesInput>;
export const FacultyCreateWithoutCoursesInputObjectZodSchema = __makeSchema_FacultyCreateWithoutCoursesInput_schema();


// File: FacultyUncheckedCreateWithoutCoursesInput.schema.ts
const __makeSchema_FacultyUncheckedCreateWithoutCoursesInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  departments: z.lazy(() => DepartmentUncheckedCreateNestedManyWithoutFacultyInputObjectSchema).optional()
}).strict();
export const FacultyUncheckedCreateWithoutCoursesInputObjectSchema: z.ZodType<Prisma.FacultyUncheckedCreateWithoutCoursesInput> = __makeSchema_FacultyUncheckedCreateWithoutCoursesInput_schema() as unknown as z.ZodType<Prisma.FacultyUncheckedCreateWithoutCoursesInput>;
export const FacultyUncheckedCreateWithoutCoursesInputObjectZodSchema = __makeSchema_FacultyUncheckedCreateWithoutCoursesInput_schema();


// File: FacultyCreateOrConnectWithoutCoursesInput.schema.ts
const __makeSchema_FacultyCreateOrConnectWithoutCoursesInput_schema = () => z.object({
  where: z.lazy(() => FacultyWhereUniqueInputObjectSchema),
  create: z.union([z.lazy(() => FacultyCreateWithoutCoursesInputObjectSchema), z.lazy(() => FacultyUncheckedCreateWithoutCoursesInputObjectSchema)])
}).strict();
export const FacultyCreateOrConnectWithoutCoursesInputObjectSchema: z.ZodType<Prisma.FacultyCreateOrConnectWithoutCoursesInput> = __makeSchema_FacultyCreateOrConnectWithoutCoursesInput_schema() as unknown as z.ZodType<Prisma.FacultyCreateOrConnectWithoutCoursesInput>;
export const FacultyCreateOrConnectWithoutCoursesInputObjectZodSchema = __makeSchema_FacultyCreateOrConnectWithoutCoursesInput_schema();


// File: DepartmentCreateWithoutCoursesInput.schema.ts
const __makeSchema_DepartmentCreateWithoutCoursesInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  faculty: z.lazy(() => FacultyCreateNestedOneWithoutDepartmentsInputObjectSchema)
}).strict();
export const DepartmentCreateWithoutCoursesInputObjectSchema: z.ZodType<Prisma.DepartmentCreateWithoutCoursesInput> = __makeSchema_DepartmentCreateWithoutCoursesInput_schema() as unknown as z.ZodType<Prisma.DepartmentCreateWithoutCoursesInput>;
export const DepartmentCreateWithoutCoursesInputObjectZodSchema = __makeSchema_DepartmentCreateWithoutCoursesInput_schema();


// File: DepartmentUncheckedCreateWithoutCoursesInput.schema.ts
const __makeSchema_DepartmentUncheckedCreateWithoutCoursesInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  facultyId: z.string()
}).strict();
export const DepartmentUncheckedCreateWithoutCoursesInputObjectSchema: z.ZodType<Prisma.DepartmentUncheckedCreateWithoutCoursesInput> = __makeSchema_DepartmentUncheckedCreateWithoutCoursesInput_schema() as unknown as z.ZodType<Prisma.DepartmentUncheckedCreateWithoutCoursesInput>;
export const DepartmentUncheckedCreateWithoutCoursesInputObjectZodSchema = __makeSchema_DepartmentUncheckedCreateWithoutCoursesInput_schema();


// File: DepartmentCreateOrConnectWithoutCoursesInput.schema.ts
const __makeSchema_DepartmentCreateOrConnectWithoutCoursesInput_schema = () => z.object({
  where: z.lazy(() => DepartmentWhereUniqueInputObjectSchema),
  create: z.union([z.lazy(() => DepartmentCreateWithoutCoursesInputObjectSchema), z.lazy(() => DepartmentUncheckedCreateWithoutCoursesInputObjectSchema)])
}).strict();
export const DepartmentCreateOrConnectWithoutCoursesInputObjectSchema: z.ZodType<Prisma.DepartmentCreateOrConnectWithoutCoursesInput> = __makeSchema_DepartmentCreateOrConnectWithoutCoursesInput_schema() as unknown as z.ZodType<Prisma.DepartmentCreateOrConnectWithoutCoursesInput>;
export const DepartmentCreateOrConnectWithoutCoursesInputObjectZodSchema = __makeSchema_DepartmentCreateOrConnectWithoutCoursesInput_schema();


// File: GradeUpsertWithWhereUniqueWithoutCourseInput.schema.ts
const __makeSchema_GradeUpsertWithWhereUniqueWithoutCourseInput_schema = () => z.object({
  where: z.lazy(() => GradeWhereUniqueInputObjectSchema),
  update: z.union([z.lazy(() => GradeUpdateWithoutCourseInputObjectSchema), z.lazy(() => GradeUncheckedUpdateWithoutCourseInputObjectSchema)]),
  create: z.union([z.lazy(() => GradeCreateWithoutCourseInputObjectSchema), z.lazy(() => GradeUncheckedCreateWithoutCourseInputObjectSchema)])
}).strict();
export const GradeUpsertWithWhereUniqueWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeUpsertWithWhereUniqueWithoutCourseInput> = __makeSchema_GradeUpsertWithWhereUniqueWithoutCourseInput_schema() as unknown as z.ZodType<Prisma.GradeUpsertWithWhereUniqueWithoutCourseInput>;
export const GradeUpsertWithWhereUniqueWithoutCourseInputObjectZodSchema = __makeSchema_GradeUpsertWithWhereUniqueWithoutCourseInput_schema();


// File: GradeUpdateWithWhereUniqueWithoutCourseInput.schema.ts
const __makeSchema_GradeUpdateWithWhereUniqueWithoutCourseInput_schema = () => z.object({
  where: z.lazy(() => GradeWhereUniqueInputObjectSchema),
  data: z.union([z.lazy(() => GradeUpdateWithoutCourseInputObjectSchema), z.lazy(() => GradeUncheckedUpdateWithoutCourseInputObjectSchema)])
}).strict();
export const GradeUpdateWithWhereUniqueWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeUpdateWithWhereUniqueWithoutCourseInput> = __makeSchema_GradeUpdateWithWhereUniqueWithoutCourseInput_schema() as unknown as z.ZodType<Prisma.GradeUpdateWithWhereUniqueWithoutCourseInput>;
export const GradeUpdateWithWhereUniqueWithoutCourseInputObjectZodSchema = __makeSchema_GradeUpdateWithWhereUniqueWithoutCourseInput_schema();


// File: GradeUpdateManyWithWhereWithoutCourseInput.schema.ts
const __makeSchema_GradeUpdateManyWithWhereWithoutCourseInput_schema = () => z.object({
  where: z.lazy(() => GradeScalarWhereInputObjectSchema),
  data: z.union([z.lazy(() => GradeUpdateManyMutationInputObjectSchema), z.lazy(() => GradeUncheckedUpdateManyWithoutCourseInputObjectSchema)])
}).strict();
export const GradeUpdateManyWithWhereWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeUpdateManyWithWhereWithoutCourseInput> = __makeSchema_GradeUpdateManyWithWhereWithoutCourseInput_schema() as unknown as z.ZodType<Prisma.GradeUpdateManyWithWhereWithoutCourseInput>;
export const GradeUpdateManyWithWhereWithoutCourseInputObjectZodSchema = __makeSchema_GradeUpdateManyWithWhereWithoutCourseInput_schema();


// File: GradeScalarWhereInput.schema.ts

const gradescalarwhereinputSchema = z.object({
  AND: z.union([z.lazy(() => GradeScalarWhereInputObjectSchema), z.lazy(() => GradeScalarWhereInputObjectSchema).array()]).optional(),
  OR: z.lazy(() => GradeScalarWhereInputObjectSchema).array().optional(),
  NOT: z.union([z.lazy(() => GradeScalarWhereInputObjectSchema), z.lazy(() => GradeScalarWhereInputObjectSchema).array()]).optional(),
  id: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  gradeACount: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  gradeBCount: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  gradeCCount: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  gradeDCount: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  gradeECount: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  gradeFCount: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  passedCount: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  failedCount: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  courseId: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  semester: z.union([z.lazy(() => EnumSemesterFilterObjectSchema), SemesterSchema]).optional(),
  year: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  createdAt: z.union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()]).optional(),
  updatedAt: z.union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()]).optional()
}).strict();
export const GradeScalarWhereInputObjectSchema: z.ZodType<Prisma.GradeScalarWhereInput> = gradescalarwhereinputSchema as unknown as z.ZodType<Prisma.GradeScalarWhereInput>;
export const GradeScalarWhereInputObjectZodSchema = gradescalarwhereinputSchema;


// File: FacultyUpsertWithoutCoursesInput.schema.ts
const __makeSchema_FacultyUpsertWithoutCoursesInput_schema = () => z.object({
  update: z.union([z.lazy(() => FacultyUpdateWithoutCoursesInputObjectSchema), z.lazy(() => FacultyUncheckedUpdateWithoutCoursesInputObjectSchema)]),
  create: z.union([z.lazy(() => FacultyCreateWithoutCoursesInputObjectSchema), z.lazy(() => FacultyUncheckedCreateWithoutCoursesInputObjectSchema)]),
  where: z.lazy(() => FacultyWhereInputObjectSchema).optional()
}).strict();
export const FacultyUpsertWithoutCoursesInputObjectSchema: z.ZodType<Prisma.FacultyUpsertWithoutCoursesInput> = __makeSchema_FacultyUpsertWithoutCoursesInput_schema() as unknown as z.ZodType<Prisma.FacultyUpsertWithoutCoursesInput>;
export const FacultyUpsertWithoutCoursesInputObjectZodSchema = __makeSchema_FacultyUpsertWithoutCoursesInput_schema();


// File: FacultyUpdateToOneWithWhereWithoutCoursesInput.schema.ts
const __makeSchema_FacultyUpdateToOneWithWhereWithoutCoursesInput_schema = () => z.object({
  where: z.lazy(() => FacultyWhereInputObjectSchema).optional(),
  data: z.union([z.lazy(() => FacultyUpdateWithoutCoursesInputObjectSchema), z.lazy(() => FacultyUncheckedUpdateWithoutCoursesInputObjectSchema)])
}).strict();
export const FacultyUpdateToOneWithWhereWithoutCoursesInputObjectSchema: z.ZodType<Prisma.FacultyUpdateToOneWithWhereWithoutCoursesInput> = __makeSchema_FacultyUpdateToOneWithWhereWithoutCoursesInput_schema() as unknown as z.ZodType<Prisma.FacultyUpdateToOneWithWhereWithoutCoursesInput>;
export const FacultyUpdateToOneWithWhereWithoutCoursesInputObjectZodSchema = __makeSchema_FacultyUpdateToOneWithWhereWithoutCoursesInput_schema();


// File: FacultyUpdateWithoutCoursesInput.schema.ts
const __makeSchema_FacultyUpdateWithoutCoursesInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  departments: z.lazy(() => DepartmentUpdateManyWithoutFacultyNestedInputObjectSchema).optional()
}).strict();
export const FacultyUpdateWithoutCoursesInputObjectSchema: z.ZodType<Prisma.FacultyUpdateWithoutCoursesInput> = __makeSchema_FacultyUpdateWithoutCoursesInput_schema() as unknown as z.ZodType<Prisma.FacultyUpdateWithoutCoursesInput>;
export const FacultyUpdateWithoutCoursesInputObjectZodSchema = __makeSchema_FacultyUpdateWithoutCoursesInput_schema();


// File: FacultyUncheckedUpdateWithoutCoursesInput.schema.ts
const __makeSchema_FacultyUncheckedUpdateWithoutCoursesInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  departments: z.lazy(() => DepartmentUncheckedUpdateManyWithoutFacultyNestedInputObjectSchema).optional()
}).strict();
export const FacultyUncheckedUpdateWithoutCoursesInputObjectSchema: z.ZodType<Prisma.FacultyUncheckedUpdateWithoutCoursesInput> = __makeSchema_FacultyUncheckedUpdateWithoutCoursesInput_schema() as unknown as z.ZodType<Prisma.FacultyUncheckedUpdateWithoutCoursesInput>;
export const FacultyUncheckedUpdateWithoutCoursesInputObjectZodSchema = __makeSchema_FacultyUncheckedUpdateWithoutCoursesInput_schema();


// File: DepartmentUpsertWithoutCoursesInput.schema.ts
const __makeSchema_DepartmentUpsertWithoutCoursesInput_schema = () => z.object({
  update: z.union([z.lazy(() => DepartmentUpdateWithoutCoursesInputObjectSchema), z.lazy(() => DepartmentUncheckedUpdateWithoutCoursesInputObjectSchema)]),
  create: z.union([z.lazy(() => DepartmentCreateWithoutCoursesInputObjectSchema), z.lazy(() => DepartmentUncheckedCreateWithoutCoursesInputObjectSchema)]),
  where: z.lazy(() => DepartmentWhereInputObjectSchema).optional()
}).strict();
export const DepartmentUpsertWithoutCoursesInputObjectSchema: z.ZodType<Prisma.DepartmentUpsertWithoutCoursesInput> = __makeSchema_DepartmentUpsertWithoutCoursesInput_schema() as unknown as z.ZodType<Prisma.DepartmentUpsertWithoutCoursesInput>;
export const DepartmentUpsertWithoutCoursesInputObjectZodSchema = __makeSchema_DepartmentUpsertWithoutCoursesInput_schema();


// File: DepartmentUpdateToOneWithWhereWithoutCoursesInput.schema.ts
const __makeSchema_DepartmentUpdateToOneWithWhereWithoutCoursesInput_schema = () => z.object({
  where: z.lazy(() => DepartmentWhereInputObjectSchema).optional(),
  data: z.union([z.lazy(() => DepartmentUpdateWithoutCoursesInputObjectSchema), z.lazy(() => DepartmentUncheckedUpdateWithoutCoursesInputObjectSchema)])
}).strict();
export const DepartmentUpdateToOneWithWhereWithoutCoursesInputObjectSchema: z.ZodType<Prisma.DepartmentUpdateToOneWithWhereWithoutCoursesInput> = __makeSchema_DepartmentUpdateToOneWithWhereWithoutCoursesInput_schema() as unknown as z.ZodType<Prisma.DepartmentUpdateToOneWithWhereWithoutCoursesInput>;
export const DepartmentUpdateToOneWithWhereWithoutCoursesInputObjectZodSchema = __makeSchema_DepartmentUpdateToOneWithWhereWithoutCoursesInput_schema();


// File: DepartmentUpdateWithoutCoursesInput.schema.ts
const __makeSchema_DepartmentUpdateWithoutCoursesInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  faculty: z.lazy(() => FacultyUpdateOneRequiredWithoutDepartmentsNestedInputObjectSchema).optional()
}).strict();
export const DepartmentUpdateWithoutCoursesInputObjectSchema: z.ZodType<Prisma.DepartmentUpdateWithoutCoursesInput> = __makeSchema_DepartmentUpdateWithoutCoursesInput_schema() as unknown as z.ZodType<Prisma.DepartmentUpdateWithoutCoursesInput>;
export const DepartmentUpdateWithoutCoursesInputObjectZodSchema = __makeSchema_DepartmentUpdateWithoutCoursesInput_schema();


// File: DepartmentUncheckedUpdateWithoutCoursesInput.schema.ts
const __makeSchema_DepartmentUncheckedUpdateWithoutCoursesInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  facultyId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional()
}).strict();
export const DepartmentUncheckedUpdateWithoutCoursesInputObjectSchema: z.ZodType<Prisma.DepartmentUncheckedUpdateWithoutCoursesInput> = __makeSchema_DepartmentUncheckedUpdateWithoutCoursesInput_schema() as unknown as z.ZodType<Prisma.DepartmentUncheckedUpdateWithoutCoursesInput>;
export const DepartmentUncheckedUpdateWithoutCoursesInputObjectZodSchema = __makeSchema_DepartmentUncheckedUpdateWithoutCoursesInput_schema();


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
  taughtSemesters: z.union([z.lazy(() => CourseCreatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseCreateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseCreatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable(),
  faculty: z.lazy(() => FacultyCreateNestedOneWithoutCoursesInputObjectSchema).optional(),
  department: z.lazy(() => DepartmentCreateNestedOneWithoutCoursesInputObjectSchema).optional()
}).strict();
export const CourseCreateWithoutGradesInputObjectSchema: z.ZodType<Prisma.CourseCreateWithoutGradesInput> = __makeSchema_CourseCreateWithoutGradesInput_schema() as unknown as z.ZodType<Prisma.CourseCreateWithoutGradesInput>;
export const CourseCreateWithoutGradesInputObjectZodSchema = __makeSchema_CourseCreateWithoutGradesInput_schema();


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
  taughtSemesters: z.union([z.lazy(() => CourseCreatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseCreateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseCreatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  facultyId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable()
}).strict();
export const CourseUncheckedCreateWithoutGradesInputObjectSchema: z.ZodType<Prisma.CourseUncheckedCreateWithoutGradesInput> = __makeSchema_CourseUncheckedCreateWithoutGradesInput_schema() as unknown as z.ZodType<Prisma.CourseUncheckedCreateWithoutGradesInput>;
export const CourseUncheckedCreateWithoutGradesInputObjectZodSchema = __makeSchema_CourseUncheckedCreateWithoutGradesInput_schema();


// File: CourseCreateOrConnectWithoutGradesInput.schema.ts
const __makeSchema_CourseCreateOrConnectWithoutGradesInput_schema = () => z.object({
  where: z.lazy(() => CourseWhereUniqueInputObjectSchema),
  create: z.union([z.lazy(() => CourseCreateWithoutGradesInputObjectSchema), z.lazy(() => CourseUncheckedCreateWithoutGradesInputObjectSchema)])
}).strict();
export const CourseCreateOrConnectWithoutGradesInputObjectSchema: z.ZodType<Prisma.CourseCreateOrConnectWithoutGradesInput> = __makeSchema_CourseCreateOrConnectWithoutGradesInput_schema() as unknown as z.ZodType<Prisma.CourseCreateOrConnectWithoutGradesInput>;
export const CourseCreateOrConnectWithoutGradesInputObjectZodSchema = __makeSchema_CourseCreateOrConnectWithoutGradesInput_schema();


// File: CourseUpsertWithoutGradesInput.schema.ts
const __makeSchema_CourseUpsertWithoutGradesInput_schema = () => z.object({
  update: z.union([z.lazy(() => CourseUpdateWithoutGradesInputObjectSchema), z.lazy(() => CourseUncheckedUpdateWithoutGradesInputObjectSchema)]),
  create: z.union([z.lazy(() => CourseCreateWithoutGradesInputObjectSchema), z.lazy(() => CourseUncheckedCreateWithoutGradesInputObjectSchema)]),
  where: z.lazy(() => CourseWhereInputObjectSchema).optional()
}).strict();
export const CourseUpsertWithoutGradesInputObjectSchema: z.ZodType<Prisma.CourseUpsertWithoutGradesInput> = __makeSchema_CourseUpsertWithoutGradesInput_schema() as unknown as z.ZodType<Prisma.CourseUpsertWithoutGradesInput>;
export const CourseUpsertWithoutGradesInputObjectZodSchema = __makeSchema_CourseUpsertWithoutGradesInput_schema();


// File: CourseUpdateToOneWithWhereWithoutGradesInput.schema.ts
const __makeSchema_CourseUpdateToOneWithWhereWithoutGradesInput_schema = () => z.object({
  where: z.lazy(() => CourseWhereInputObjectSchema).optional(),
  data: z.union([z.lazy(() => CourseUpdateWithoutGradesInputObjectSchema), z.lazy(() => CourseUncheckedUpdateWithoutGradesInputObjectSchema)])
}).strict();
export const CourseUpdateToOneWithWhereWithoutGradesInputObjectSchema: z.ZodType<Prisma.CourseUpdateToOneWithWhereWithoutGradesInput> = __makeSchema_CourseUpdateToOneWithWhereWithoutGradesInput_schema() as unknown as z.ZodType<Prisma.CourseUpdateToOneWithWhereWithoutGradesInput>;
export const CourseUpdateToOneWithWhereWithoutGradesInputObjectZodSchema = __makeSchema_CourseUpdateToOneWithWhereWithoutGradesInput_schema();


// File: CourseUpdateWithoutGradesInput.schema.ts
const __makeSchema_CourseUpdateWithoutGradesInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  credits: z.union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, z.lazy(() => EnumStudyLevelFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeType: z.union([GradeTypeSchema, z.lazy(() => EnumGradeTypeFieldUpdateOperationsInputObjectSchema)]).optional(),
  firstYearTaught: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  lastYearTaught: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  candidateCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  averageGrade: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  passRate: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  taughtSemesters: z.union([z.lazy(() => CourseUpdatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseUpdateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseUpdatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  faculty: z.lazy(() => FacultyUpdateOneWithoutCoursesNestedInputObjectSchema).optional(),
  department: z.lazy(() => DepartmentUpdateOneWithoutCoursesNestedInputObjectSchema).optional()
}).strict();
export const CourseUpdateWithoutGradesInputObjectSchema: z.ZodType<Prisma.CourseUpdateWithoutGradesInput> = __makeSchema_CourseUpdateWithoutGradesInput_schema() as unknown as z.ZodType<Prisma.CourseUpdateWithoutGradesInput>;
export const CourseUpdateWithoutGradesInputObjectZodSchema = __makeSchema_CourseUpdateWithoutGradesInput_schema();


// File: CourseUncheckedUpdateWithoutGradesInput.schema.ts
const __makeSchema_CourseUncheckedUpdateWithoutGradesInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  credits: z.union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, z.lazy(() => EnumStudyLevelFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeType: z.union([GradeTypeSchema, z.lazy(() => EnumGradeTypeFieldUpdateOperationsInputObjectSchema)]).optional(),
  firstYearTaught: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  lastYearTaught: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  candidateCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  averageGrade: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  passRate: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  taughtSemesters: z.union([z.lazy(() => CourseUpdatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseUpdateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseUpdatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  facultyId: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  departmentId: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable()
}).strict();
export const CourseUncheckedUpdateWithoutGradesInputObjectSchema: z.ZodType<Prisma.CourseUncheckedUpdateWithoutGradesInput> = __makeSchema_CourseUncheckedUpdateWithoutGradesInput_schema() as unknown as z.ZodType<Prisma.CourseUncheckedUpdateWithoutGradesInput>;
export const CourseUncheckedUpdateWithoutGradesInputObjectZodSchema = __makeSchema_CourseUncheckedUpdateWithoutGradesInput_schema();


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
  taughtSemesters: z.union([z.lazy(() => CourseCreatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseCreateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseCreatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable(),
  grades: z.lazy(() => GradeCreateNestedManyWithoutCourseInputObjectSchema).optional(),
  department: z.lazy(() => DepartmentCreateNestedOneWithoutCoursesInputObjectSchema).optional()
}).strict();
export const CourseCreateWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseCreateWithoutFacultyInput> = __makeSchema_CourseCreateWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.CourseCreateWithoutFacultyInput>;
export const CourseCreateWithoutFacultyInputObjectZodSchema = __makeSchema_CourseCreateWithoutFacultyInput_schema();


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
  taughtSemesters: z.union([z.lazy(() => CourseCreatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseCreateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseCreatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  departmentId: z.string().optional().nullable(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable(),
  grades: z.lazy(() => GradeUncheckedCreateNestedManyWithoutCourseInputObjectSchema).optional()
}).strict();
export const CourseUncheckedCreateWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseUncheckedCreateWithoutFacultyInput> = __makeSchema_CourseUncheckedCreateWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.CourseUncheckedCreateWithoutFacultyInput>;
export const CourseUncheckedCreateWithoutFacultyInputObjectZodSchema = __makeSchema_CourseUncheckedCreateWithoutFacultyInput_schema();


// File: CourseCreateOrConnectWithoutFacultyInput.schema.ts
const __makeSchema_CourseCreateOrConnectWithoutFacultyInput_schema = () => z.object({
  where: z.lazy(() => CourseWhereUniqueInputObjectSchema),
  create: z.union([z.lazy(() => CourseCreateWithoutFacultyInputObjectSchema), z.lazy(() => CourseUncheckedCreateWithoutFacultyInputObjectSchema)])
}).strict();
export const CourseCreateOrConnectWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseCreateOrConnectWithoutFacultyInput> = __makeSchema_CourseCreateOrConnectWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.CourseCreateOrConnectWithoutFacultyInput>;
export const CourseCreateOrConnectWithoutFacultyInputObjectZodSchema = __makeSchema_CourseCreateOrConnectWithoutFacultyInput_schema();


// File: CourseCreateManyFacultyInputEnvelope.schema.ts
const __makeSchema_CourseCreateManyFacultyInputEnvelope_schema = () => z.object({
  data: z.union([z.lazy(() => CourseCreateManyFacultyInputObjectSchema), z.lazy(() => CourseCreateManyFacultyInputObjectSchema).array()]),
  skipDuplicates: z.boolean().optional()
}).strict();
export const CourseCreateManyFacultyInputEnvelopeObjectSchema: z.ZodType<Prisma.CourseCreateManyFacultyInputEnvelope> = __makeSchema_CourseCreateManyFacultyInputEnvelope_schema() as unknown as z.ZodType<Prisma.CourseCreateManyFacultyInputEnvelope>;
export const CourseCreateManyFacultyInputEnvelopeObjectZodSchema = __makeSchema_CourseCreateManyFacultyInputEnvelope_schema();


// File: DepartmentCreateWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentCreateWithoutFacultyInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.lazy(() => CourseCreateNestedManyWithoutDepartmentInputObjectSchema).optional()
}).strict();
export const DepartmentCreateWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentCreateWithoutFacultyInput> = __makeSchema_DepartmentCreateWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.DepartmentCreateWithoutFacultyInput>;
export const DepartmentCreateWithoutFacultyInputObjectZodSchema = __makeSchema_DepartmentCreateWithoutFacultyInput_schema();


// File: DepartmentUncheckedCreateWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentUncheckedCreateWithoutFacultyInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.lazy(() => CourseUncheckedCreateNestedManyWithoutDepartmentInputObjectSchema).optional()
}).strict();
export const DepartmentUncheckedCreateWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentUncheckedCreateWithoutFacultyInput> = __makeSchema_DepartmentUncheckedCreateWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.DepartmentUncheckedCreateWithoutFacultyInput>;
export const DepartmentUncheckedCreateWithoutFacultyInputObjectZodSchema = __makeSchema_DepartmentUncheckedCreateWithoutFacultyInput_schema();


// File: DepartmentCreateOrConnectWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentCreateOrConnectWithoutFacultyInput_schema = () => z.object({
  where: z.lazy(() => DepartmentWhereUniqueInputObjectSchema),
  create: z.union([z.lazy(() => DepartmentCreateWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentUncheckedCreateWithoutFacultyInputObjectSchema)])
}).strict();
export const DepartmentCreateOrConnectWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentCreateOrConnectWithoutFacultyInput> = __makeSchema_DepartmentCreateOrConnectWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.DepartmentCreateOrConnectWithoutFacultyInput>;
export const DepartmentCreateOrConnectWithoutFacultyInputObjectZodSchema = __makeSchema_DepartmentCreateOrConnectWithoutFacultyInput_schema();


// File: DepartmentCreateManyFacultyInputEnvelope.schema.ts
const __makeSchema_DepartmentCreateManyFacultyInputEnvelope_schema = () => z.object({
  data: z.union([z.lazy(() => DepartmentCreateManyFacultyInputObjectSchema), z.lazy(() => DepartmentCreateManyFacultyInputObjectSchema).array()]),
  skipDuplicates: z.boolean().optional()
}).strict();
export const DepartmentCreateManyFacultyInputEnvelopeObjectSchema: z.ZodType<Prisma.DepartmentCreateManyFacultyInputEnvelope> = __makeSchema_DepartmentCreateManyFacultyInputEnvelope_schema() as unknown as z.ZodType<Prisma.DepartmentCreateManyFacultyInputEnvelope>;
export const DepartmentCreateManyFacultyInputEnvelopeObjectZodSchema = __makeSchema_DepartmentCreateManyFacultyInputEnvelope_schema();


// File: CourseUpsertWithWhereUniqueWithoutFacultyInput.schema.ts
const __makeSchema_CourseUpsertWithWhereUniqueWithoutFacultyInput_schema = () => z.object({
  where: z.lazy(() => CourseWhereUniqueInputObjectSchema),
  update: z.union([z.lazy(() => CourseUpdateWithoutFacultyInputObjectSchema), z.lazy(() => CourseUncheckedUpdateWithoutFacultyInputObjectSchema)]),
  create: z.union([z.lazy(() => CourseCreateWithoutFacultyInputObjectSchema), z.lazy(() => CourseUncheckedCreateWithoutFacultyInputObjectSchema)])
}).strict();
export const CourseUpsertWithWhereUniqueWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseUpsertWithWhereUniqueWithoutFacultyInput> = __makeSchema_CourseUpsertWithWhereUniqueWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.CourseUpsertWithWhereUniqueWithoutFacultyInput>;
export const CourseUpsertWithWhereUniqueWithoutFacultyInputObjectZodSchema = __makeSchema_CourseUpsertWithWhereUniqueWithoutFacultyInput_schema();


// File: CourseUpdateWithWhereUniqueWithoutFacultyInput.schema.ts
const __makeSchema_CourseUpdateWithWhereUniqueWithoutFacultyInput_schema = () => z.object({
  where: z.lazy(() => CourseWhereUniqueInputObjectSchema),
  data: z.union([z.lazy(() => CourseUpdateWithoutFacultyInputObjectSchema), z.lazy(() => CourseUncheckedUpdateWithoutFacultyInputObjectSchema)])
}).strict();
export const CourseUpdateWithWhereUniqueWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseUpdateWithWhereUniqueWithoutFacultyInput> = __makeSchema_CourseUpdateWithWhereUniqueWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.CourseUpdateWithWhereUniqueWithoutFacultyInput>;
export const CourseUpdateWithWhereUniqueWithoutFacultyInputObjectZodSchema = __makeSchema_CourseUpdateWithWhereUniqueWithoutFacultyInput_schema();


// File: CourseUpdateManyWithWhereWithoutFacultyInput.schema.ts
const __makeSchema_CourseUpdateManyWithWhereWithoutFacultyInput_schema = () => z.object({
  where: z.lazy(() => CourseScalarWhereInputObjectSchema),
  data: z.union([z.lazy(() => CourseUpdateManyMutationInputObjectSchema), z.lazy(() => CourseUncheckedUpdateManyWithoutFacultyInputObjectSchema)])
}).strict();
export const CourseUpdateManyWithWhereWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseUpdateManyWithWhereWithoutFacultyInput> = __makeSchema_CourseUpdateManyWithWhereWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.CourseUpdateManyWithWhereWithoutFacultyInput>;
export const CourseUpdateManyWithWhereWithoutFacultyInputObjectZodSchema = __makeSchema_CourseUpdateManyWithWhereWithoutFacultyInput_schema();


// File: CourseScalarWhereInput.schema.ts

const coursescalarwhereinputSchema = z.object({
  AND: z.union([z.lazy(() => CourseScalarWhereInputObjectSchema), z.lazy(() => CourseScalarWhereInputObjectSchema).array()]).optional(),
  OR: z.lazy(() => CourseScalarWhereInputObjectSchema).array().optional(),
  NOT: z.union([z.lazy(() => CourseScalarWhereInputObjectSchema), z.lazy(() => CourseScalarWhereInputObjectSchema).array()]).optional(),
  id: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  code: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  nameNo: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  nameEn: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  credits: z.union([z.lazy(() => FloatNullableFilterObjectSchema), z.number()]).optional().nullable(),
  studyLevel: z.union([z.lazy(() => EnumStudyLevelFilterObjectSchema), StudyLevelSchema]).optional(),
  gradeType: z.union([z.lazy(() => EnumGradeTypeFilterObjectSchema), GradeTypeSchema]).optional(),
  firstYearTaught: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  lastYearTaught: z.union([z.lazy(() => IntNullableFilterObjectSchema), z.number().int()]).optional().nullable(),
  contentNo: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  contentEn: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  teachingMethodsNo: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  teachingMethodsEn: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  learningOutcomesNo: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  learningOutcomesEn: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  examTypeNo: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  examTypeEn: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  candidateCount: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  averageGrade: z.union([z.lazy(() => FloatFilterObjectSchema), z.number()]).optional(),
  passRate: z.union([z.lazy(() => FloatFilterObjectSchema), z.number()]).optional(),
  createdAt: z.union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()]).optional(),
  updatedAt: z.union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()]).optional(),
  taughtSemesters: z.lazy(() => EnumSemesterNullableListFilterObjectSchema).optional(),
  teachingLanguages: z.lazy(() => EnumTeachingLanguageNullableListFilterObjectSchema).optional(),
  campuses: z.lazy(() => EnumCampusNullableListFilterObjectSchema).optional(),
  facultyId: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  departmentId: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  latestYearCheckedForNtnuData: z.union([z.lazy(() => IntNullableFilterObjectSchema), z.number().int()]).optional().nullable()
}).strict();
export const CourseScalarWhereInputObjectSchema: z.ZodType<Prisma.CourseScalarWhereInput> = coursescalarwhereinputSchema as unknown as z.ZodType<Prisma.CourseScalarWhereInput>;
export const CourseScalarWhereInputObjectZodSchema = coursescalarwhereinputSchema;


// File: DepartmentUpsertWithWhereUniqueWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentUpsertWithWhereUniqueWithoutFacultyInput_schema = () => z.object({
  where: z.lazy(() => DepartmentWhereUniqueInputObjectSchema),
  update: z.union([z.lazy(() => DepartmentUpdateWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentUncheckedUpdateWithoutFacultyInputObjectSchema)]),
  create: z.union([z.lazy(() => DepartmentCreateWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentUncheckedCreateWithoutFacultyInputObjectSchema)])
}).strict();
export const DepartmentUpsertWithWhereUniqueWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentUpsertWithWhereUniqueWithoutFacultyInput> = __makeSchema_DepartmentUpsertWithWhereUniqueWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.DepartmentUpsertWithWhereUniqueWithoutFacultyInput>;
export const DepartmentUpsertWithWhereUniqueWithoutFacultyInputObjectZodSchema = __makeSchema_DepartmentUpsertWithWhereUniqueWithoutFacultyInput_schema();


// File: DepartmentUpdateWithWhereUniqueWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentUpdateWithWhereUniqueWithoutFacultyInput_schema = () => z.object({
  where: z.lazy(() => DepartmentWhereUniqueInputObjectSchema),
  data: z.union([z.lazy(() => DepartmentUpdateWithoutFacultyInputObjectSchema), z.lazy(() => DepartmentUncheckedUpdateWithoutFacultyInputObjectSchema)])
}).strict();
export const DepartmentUpdateWithWhereUniqueWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentUpdateWithWhereUniqueWithoutFacultyInput> = __makeSchema_DepartmentUpdateWithWhereUniqueWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.DepartmentUpdateWithWhereUniqueWithoutFacultyInput>;
export const DepartmentUpdateWithWhereUniqueWithoutFacultyInputObjectZodSchema = __makeSchema_DepartmentUpdateWithWhereUniqueWithoutFacultyInput_schema();


// File: DepartmentUpdateManyWithWhereWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentUpdateManyWithWhereWithoutFacultyInput_schema = () => z.object({
  where: z.lazy(() => DepartmentScalarWhereInputObjectSchema),
  data: z.union([z.lazy(() => DepartmentUpdateManyMutationInputObjectSchema), z.lazy(() => DepartmentUncheckedUpdateManyWithoutFacultyInputObjectSchema)])
}).strict();
export const DepartmentUpdateManyWithWhereWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentUpdateManyWithWhereWithoutFacultyInput> = __makeSchema_DepartmentUpdateManyWithWhereWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.DepartmentUpdateManyWithWhereWithoutFacultyInput>;
export const DepartmentUpdateManyWithWhereWithoutFacultyInputObjectZodSchema = __makeSchema_DepartmentUpdateManyWithWhereWithoutFacultyInput_schema();


// File: DepartmentScalarWhereInput.schema.ts

const departmentscalarwhereinputSchema = z.object({
  AND: z.union([z.lazy(() => DepartmentScalarWhereInputObjectSchema), z.lazy(() => DepartmentScalarWhereInputObjectSchema).array()]).optional(),
  OR: z.lazy(() => DepartmentScalarWhereInputObjectSchema).array().optional(),
  NOT: z.union([z.lazy(() => DepartmentScalarWhereInputObjectSchema), z.lazy(() => DepartmentScalarWhereInputObjectSchema).array()]).optional(),
  id: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  nameNo: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  nameEn: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  code: z.union([z.lazy(() => IntFilterObjectSchema), z.number().int()]).optional(),
  facultyId: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional()
}).strict();
export const DepartmentScalarWhereInputObjectSchema: z.ZodType<Prisma.DepartmentScalarWhereInput> = departmentscalarwhereinputSchema as unknown as z.ZodType<Prisma.DepartmentScalarWhereInput>;
export const DepartmentScalarWhereInputObjectZodSchema = departmentscalarwhereinputSchema;


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
  taughtSemesters: z.union([z.lazy(() => CourseCreatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseCreateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseCreatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable(),
  grades: z.lazy(() => GradeCreateNestedManyWithoutCourseInputObjectSchema).optional(),
  faculty: z.lazy(() => FacultyCreateNestedOneWithoutCoursesInputObjectSchema).optional()
}).strict();
export const CourseCreateWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseCreateWithoutDepartmentInput> = __makeSchema_CourseCreateWithoutDepartmentInput_schema() as unknown as z.ZodType<Prisma.CourseCreateWithoutDepartmentInput>;
export const CourseCreateWithoutDepartmentInputObjectZodSchema = __makeSchema_CourseCreateWithoutDepartmentInput_schema();


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
  taughtSemesters: z.union([z.lazy(() => CourseCreatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseCreateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseCreatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  facultyId: z.string().optional().nullable(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable(),
  grades: z.lazy(() => GradeUncheckedCreateNestedManyWithoutCourseInputObjectSchema).optional()
}).strict();
export const CourseUncheckedCreateWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseUncheckedCreateWithoutDepartmentInput> = __makeSchema_CourseUncheckedCreateWithoutDepartmentInput_schema() as unknown as z.ZodType<Prisma.CourseUncheckedCreateWithoutDepartmentInput>;
export const CourseUncheckedCreateWithoutDepartmentInputObjectZodSchema = __makeSchema_CourseUncheckedCreateWithoutDepartmentInput_schema();


// File: CourseCreateOrConnectWithoutDepartmentInput.schema.ts
const __makeSchema_CourseCreateOrConnectWithoutDepartmentInput_schema = () => z.object({
  where: z.lazy(() => CourseWhereUniqueInputObjectSchema),
  create: z.union([z.lazy(() => CourseCreateWithoutDepartmentInputObjectSchema), z.lazy(() => CourseUncheckedCreateWithoutDepartmentInputObjectSchema)])
}).strict();
export const CourseCreateOrConnectWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseCreateOrConnectWithoutDepartmentInput> = __makeSchema_CourseCreateOrConnectWithoutDepartmentInput_schema() as unknown as z.ZodType<Prisma.CourseCreateOrConnectWithoutDepartmentInput>;
export const CourseCreateOrConnectWithoutDepartmentInputObjectZodSchema = __makeSchema_CourseCreateOrConnectWithoutDepartmentInput_schema();


// File: CourseCreateManyDepartmentInputEnvelope.schema.ts
const __makeSchema_CourseCreateManyDepartmentInputEnvelope_schema = () => z.object({
  data: z.union([z.lazy(() => CourseCreateManyDepartmentInputObjectSchema), z.lazy(() => CourseCreateManyDepartmentInputObjectSchema).array()]),
  skipDuplicates: z.boolean().optional()
}).strict();
export const CourseCreateManyDepartmentInputEnvelopeObjectSchema: z.ZodType<Prisma.CourseCreateManyDepartmentInputEnvelope> = __makeSchema_CourseCreateManyDepartmentInputEnvelope_schema() as unknown as z.ZodType<Prisma.CourseCreateManyDepartmentInputEnvelope>;
export const CourseCreateManyDepartmentInputEnvelopeObjectZodSchema = __makeSchema_CourseCreateManyDepartmentInputEnvelope_schema();


// File: FacultyCreateWithoutDepartmentsInput.schema.ts
const __makeSchema_FacultyCreateWithoutDepartmentsInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.lazy(() => CourseCreateNestedManyWithoutFacultyInputObjectSchema).optional()
}).strict();
export const FacultyCreateWithoutDepartmentsInputObjectSchema: z.ZodType<Prisma.FacultyCreateWithoutDepartmentsInput> = __makeSchema_FacultyCreateWithoutDepartmentsInput_schema() as unknown as z.ZodType<Prisma.FacultyCreateWithoutDepartmentsInput>;
export const FacultyCreateWithoutDepartmentsInputObjectZodSchema = __makeSchema_FacultyCreateWithoutDepartmentsInput_schema();


// File: FacultyUncheckedCreateWithoutDepartmentsInput.schema.ts
const __makeSchema_FacultyUncheckedCreateWithoutDepartmentsInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
  courses: z.lazy(() => CourseUncheckedCreateNestedManyWithoutFacultyInputObjectSchema).optional()
}).strict();
export const FacultyUncheckedCreateWithoutDepartmentsInputObjectSchema: z.ZodType<Prisma.FacultyUncheckedCreateWithoutDepartmentsInput> = __makeSchema_FacultyUncheckedCreateWithoutDepartmentsInput_schema() as unknown as z.ZodType<Prisma.FacultyUncheckedCreateWithoutDepartmentsInput>;
export const FacultyUncheckedCreateWithoutDepartmentsInputObjectZodSchema = __makeSchema_FacultyUncheckedCreateWithoutDepartmentsInput_schema();


// File: FacultyCreateOrConnectWithoutDepartmentsInput.schema.ts
const __makeSchema_FacultyCreateOrConnectWithoutDepartmentsInput_schema = () => z.object({
  where: z.lazy(() => FacultyWhereUniqueInputObjectSchema),
  create: z.union([z.lazy(() => FacultyCreateWithoutDepartmentsInputObjectSchema), z.lazy(() => FacultyUncheckedCreateWithoutDepartmentsInputObjectSchema)])
}).strict();
export const FacultyCreateOrConnectWithoutDepartmentsInputObjectSchema: z.ZodType<Prisma.FacultyCreateOrConnectWithoutDepartmentsInput> = __makeSchema_FacultyCreateOrConnectWithoutDepartmentsInput_schema() as unknown as z.ZodType<Prisma.FacultyCreateOrConnectWithoutDepartmentsInput>;
export const FacultyCreateOrConnectWithoutDepartmentsInputObjectZodSchema = __makeSchema_FacultyCreateOrConnectWithoutDepartmentsInput_schema();


// File: CourseUpsertWithWhereUniqueWithoutDepartmentInput.schema.ts
const __makeSchema_CourseUpsertWithWhereUniqueWithoutDepartmentInput_schema = () => z.object({
  where: z.lazy(() => CourseWhereUniqueInputObjectSchema),
  update: z.union([z.lazy(() => CourseUpdateWithoutDepartmentInputObjectSchema), z.lazy(() => CourseUncheckedUpdateWithoutDepartmentInputObjectSchema)]),
  create: z.union([z.lazy(() => CourseCreateWithoutDepartmentInputObjectSchema), z.lazy(() => CourseUncheckedCreateWithoutDepartmentInputObjectSchema)])
}).strict();
export const CourseUpsertWithWhereUniqueWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseUpsertWithWhereUniqueWithoutDepartmentInput> = __makeSchema_CourseUpsertWithWhereUniqueWithoutDepartmentInput_schema() as unknown as z.ZodType<Prisma.CourseUpsertWithWhereUniqueWithoutDepartmentInput>;
export const CourseUpsertWithWhereUniqueWithoutDepartmentInputObjectZodSchema = __makeSchema_CourseUpsertWithWhereUniqueWithoutDepartmentInput_schema();


// File: CourseUpdateWithWhereUniqueWithoutDepartmentInput.schema.ts
const __makeSchema_CourseUpdateWithWhereUniqueWithoutDepartmentInput_schema = () => z.object({
  where: z.lazy(() => CourseWhereUniqueInputObjectSchema),
  data: z.union([z.lazy(() => CourseUpdateWithoutDepartmentInputObjectSchema), z.lazy(() => CourseUncheckedUpdateWithoutDepartmentInputObjectSchema)])
}).strict();
export const CourseUpdateWithWhereUniqueWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseUpdateWithWhereUniqueWithoutDepartmentInput> = __makeSchema_CourseUpdateWithWhereUniqueWithoutDepartmentInput_schema() as unknown as z.ZodType<Prisma.CourseUpdateWithWhereUniqueWithoutDepartmentInput>;
export const CourseUpdateWithWhereUniqueWithoutDepartmentInputObjectZodSchema = __makeSchema_CourseUpdateWithWhereUniqueWithoutDepartmentInput_schema();


// File: CourseUpdateManyWithWhereWithoutDepartmentInput.schema.ts
const __makeSchema_CourseUpdateManyWithWhereWithoutDepartmentInput_schema = () => z.object({
  where: z.lazy(() => CourseScalarWhereInputObjectSchema),
  data: z.union([z.lazy(() => CourseUpdateManyMutationInputObjectSchema), z.lazy(() => CourseUncheckedUpdateManyWithoutDepartmentInputObjectSchema)])
}).strict();
export const CourseUpdateManyWithWhereWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseUpdateManyWithWhereWithoutDepartmentInput> = __makeSchema_CourseUpdateManyWithWhereWithoutDepartmentInput_schema() as unknown as z.ZodType<Prisma.CourseUpdateManyWithWhereWithoutDepartmentInput>;
export const CourseUpdateManyWithWhereWithoutDepartmentInputObjectZodSchema = __makeSchema_CourseUpdateManyWithWhereWithoutDepartmentInput_schema();


// File: FacultyUpsertWithoutDepartmentsInput.schema.ts
const __makeSchema_FacultyUpsertWithoutDepartmentsInput_schema = () => z.object({
  update: z.union([z.lazy(() => FacultyUpdateWithoutDepartmentsInputObjectSchema), z.lazy(() => FacultyUncheckedUpdateWithoutDepartmentsInputObjectSchema)]),
  create: z.union([z.lazy(() => FacultyCreateWithoutDepartmentsInputObjectSchema), z.lazy(() => FacultyUncheckedCreateWithoutDepartmentsInputObjectSchema)]),
  where: z.lazy(() => FacultyWhereInputObjectSchema).optional()
}).strict();
export const FacultyUpsertWithoutDepartmentsInputObjectSchema: z.ZodType<Prisma.FacultyUpsertWithoutDepartmentsInput> = __makeSchema_FacultyUpsertWithoutDepartmentsInput_schema() as unknown as z.ZodType<Prisma.FacultyUpsertWithoutDepartmentsInput>;
export const FacultyUpsertWithoutDepartmentsInputObjectZodSchema = __makeSchema_FacultyUpsertWithoutDepartmentsInput_schema();


// File: FacultyUpdateToOneWithWhereWithoutDepartmentsInput.schema.ts
const __makeSchema_FacultyUpdateToOneWithWhereWithoutDepartmentsInput_schema = () => z.object({
  where: z.lazy(() => FacultyWhereInputObjectSchema).optional(),
  data: z.union([z.lazy(() => FacultyUpdateWithoutDepartmentsInputObjectSchema), z.lazy(() => FacultyUncheckedUpdateWithoutDepartmentsInputObjectSchema)])
}).strict();
export const FacultyUpdateToOneWithWhereWithoutDepartmentsInputObjectSchema: z.ZodType<Prisma.FacultyUpdateToOneWithWhereWithoutDepartmentsInput> = __makeSchema_FacultyUpdateToOneWithWhereWithoutDepartmentsInput_schema() as unknown as z.ZodType<Prisma.FacultyUpdateToOneWithWhereWithoutDepartmentsInput>;
export const FacultyUpdateToOneWithWhereWithoutDepartmentsInputObjectZodSchema = __makeSchema_FacultyUpdateToOneWithWhereWithoutDepartmentsInput_schema();


// File: FacultyUpdateWithoutDepartmentsInput.schema.ts
const __makeSchema_FacultyUpdateWithoutDepartmentsInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  courses: z.lazy(() => CourseUpdateManyWithoutFacultyNestedInputObjectSchema).optional()
}).strict();
export const FacultyUpdateWithoutDepartmentsInputObjectSchema: z.ZodType<Prisma.FacultyUpdateWithoutDepartmentsInput> = __makeSchema_FacultyUpdateWithoutDepartmentsInput_schema() as unknown as z.ZodType<Prisma.FacultyUpdateWithoutDepartmentsInput>;
export const FacultyUpdateWithoutDepartmentsInputObjectZodSchema = __makeSchema_FacultyUpdateWithoutDepartmentsInput_schema();


// File: FacultyUncheckedUpdateWithoutDepartmentsInput.schema.ts
const __makeSchema_FacultyUncheckedUpdateWithoutDepartmentsInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  courses: z.lazy(() => CourseUncheckedUpdateManyWithoutFacultyNestedInputObjectSchema).optional()
}).strict();
export const FacultyUncheckedUpdateWithoutDepartmentsInputObjectSchema: z.ZodType<Prisma.FacultyUncheckedUpdateWithoutDepartmentsInput> = __makeSchema_FacultyUncheckedUpdateWithoutDepartmentsInput_schema() as unknown as z.ZodType<Prisma.FacultyUncheckedUpdateWithoutDepartmentsInput>;
export const FacultyUncheckedUpdateWithoutDepartmentsInputObjectZodSchema = __makeSchema_FacultyUncheckedUpdateWithoutDepartmentsInput_schema();


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
export const GradeCreateManyCourseInputObjectSchema: z.ZodType<Prisma.GradeCreateManyCourseInput> = __makeSchema_GradeCreateManyCourseInput_schema() as unknown as z.ZodType<Prisma.GradeCreateManyCourseInput>;
export const GradeCreateManyCourseInputObjectZodSchema = __makeSchema_GradeCreateManyCourseInput_schema();


// File: GradeUpdateWithoutCourseInput.schema.ts
const __makeSchema_GradeUpdateWithoutCourseInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeACount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeBCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeCCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeDCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeECount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeFCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  passedCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  failedCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  semester: z.union([SemesterSchema, z.lazy(() => EnumSemesterFieldUpdateOperationsInputObjectSchema)]).optional(),
  year: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional()
}).strict();
export const GradeUpdateWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeUpdateWithoutCourseInput> = __makeSchema_GradeUpdateWithoutCourseInput_schema() as unknown as z.ZodType<Prisma.GradeUpdateWithoutCourseInput>;
export const GradeUpdateWithoutCourseInputObjectZodSchema = __makeSchema_GradeUpdateWithoutCourseInput_schema();


// File: GradeUncheckedUpdateWithoutCourseInput.schema.ts
const __makeSchema_GradeUncheckedUpdateWithoutCourseInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeACount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeBCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeCCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeDCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeECount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeFCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  passedCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  failedCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  semester: z.union([SemesterSchema, z.lazy(() => EnumSemesterFieldUpdateOperationsInputObjectSchema)]).optional(),
  year: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional()
}).strict();
export const GradeUncheckedUpdateWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeUncheckedUpdateWithoutCourseInput> = __makeSchema_GradeUncheckedUpdateWithoutCourseInput_schema() as unknown as z.ZodType<Prisma.GradeUncheckedUpdateWithoutCourseInput>;
export const GradeUncheckedUpdateWithoutCourseInputObjectZodSchema = __makeSchema_GradeUncheckedUpdateWithoutCourseInput_schema();


// File: GradeUncheckedUpdateManyWithoutCourseInput.schema.ts
const __makeSchema_GradeUncheckedUpdateManyWithoutCourseInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeACount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeBCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeCCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeDCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeECount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeFCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  passedCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  failedCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  semester: z.union([SemesterSchema, z.lazy(() => EnumSemesterFieldUpdateOperationsInputObjectSchema)]).optional(),
  year: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional()
}).strict();
export const GradeUncheckedUpdateManyWithoutCourseInputObjectSchema: z.ZodType<Prisma.GradeUncheckedUpdateManyWithoutCourseInput> = __makeSchema_GradeUncheckedUpdateManyWithoutCourseInput_schema() as unknown as z.ZodType<Prisma.GradeUncheckedUpdateManyWithoutCourseInput>;
export const GradeUncheckedUpdateManyWithoutCourseInputObjectZodSchema = __makeSchema_GradeUncheckedUpdateManyWithoutCourseInput_schema();


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
  taughtSemesters: z.union([z.lazy(() => CourseCreatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseCreateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseCreatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  departmentId: z.string().optional().nullable(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable()
}).strict();
export const CourseCreateManyFacultyInputObjectSchema: z.ZodType<Prisma.CourseCreateManyFacultyInput> = __makeSchema_CourseCreateManyFacultyInput_schema() as unknown as z.ZodType<Prisma.CourseCreateManyFacultyInput>;
export const CourseCreateManyFacultyInputObjectZodSchema = __makeSchema_CourseCreateManyFacultyInput_schema();


// File: DepartmentCreateManyFacultyInput.schema.ts
const __makeSchema_DepartmentCreateManyFacultyInput_schema = () => z.object({
  id: z.string().optional(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int()
}).strict();
export const DepartmentCreateManyFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentCreateManyFacultyInput> = __makeSchema_DepartmentCreateManyFacultyInput_schema() as unknown as z.ZodType<Prisma.DepartmentCreateManyFacultyInput>;
export const DepartmentCreateManyFacultyInputObjectZodSchema = __makeSchema_DepartmentCreateManyFacultyInput_schema();


// File: CourseUpdateWithoutFacultyInput.schema.ts
const __makeSchema_CourseUpdateWithoutFacultyInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  credits: z.union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, z.lazy(() => EnumStudyLevelFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeType: z.union([GradeTypeSchema, z.lazy(() => EnumGradeTypeFieldUpdateOperationsInputObjectSchema)]).optional(),
  firstYearTaught: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  lastYearTaught: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  candidateCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  averageGrade: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  passRate: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  taughtSemesters: z.union([z.lazy(() => CourseUpdatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseUpdateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseUpdatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  grades: z.lazy(() => GradeUpdateManyWithoutCourseNestedInputObjectSchema).optional(),
  department: z.lazy(() => DepartmentUpdateOneWithoutCoursesNestedInputObjectSchema).optional()
}).strict();
export const CourseUpdateWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseUpdateWithoutFacultyInput> = __makeSchema_CourseUpdateWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.CourseUpdateWithoutFacultyInput>;
export const CourseUpdateWithoutFacultyInputObjectZodSchema = __makeSchema_CourseUpdateWithoutFacultyInput_schema();


// File: CourseUncheckedUpdateWithoutFacultyInput.schema.ts
const __makeSchema_CourseUncheckedUpdateWithoutFacultyInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  credits: z.union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, z.lazy(() => EnumStudyLevelFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeType: z.union([GradeTypeSchema, z.lazy(() => EnumGradeTypeFieldUpdateOperationsInputObjectSchema)]).optional(),
  firstYearTaught: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  lastYearTaught: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  candidateCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  averageGrade: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  passRate: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  taughtSemesters: z.union([z.lazy(() => CourseUpdatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseUpdateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseUpdatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  departmentId: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  grades: z.lazy(() => GradeUncheckedUpdateManyWithoutCourseNestedInputObjectSchema).optional()
}).strict();
export const CourseUncheckedUpdateWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseUncheckedUpdateWithoutFacultyInput> = __makeSchema_CourseUncheckedUpdateWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.CourseUncheckedUpdateWithoutFacultyInput>;
export const CourseUncheckedUpdateWithoutFacultyInputObjectZodSchema = __makeSchema_CourseUncheckedUpdateWithoutFacultyInput_schema();


// File: CourseUncheckedUpdateManyWithoutFacultyInput.schema.ts
const __makeSchema_CourseUncheckedUpdateManyWithoutFacultyInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  credits: z.union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, z.lazy(() => EnumStudyLevelFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeType: z.union([GradeTypeSchema, z.lazy(() => EnumGradeTypeFieldUpdateOperationsInputObjectSchema)]).optional(),
  firstYearTaught: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  lastYearTaught: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  candidateCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  averageGrade: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  passRate: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  taughtSemesters: z.union([z.lazy(() => CourseUpdatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseUpdateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseUpdatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  departmentId: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable()
}).strict();
export const CourseUncheckedUpdateManyWithoutFacultyInputObjectSchema: z.ZodType<Prisma.CourseUncheckedUpdateManyWithoutFacultyInput> = __makeSchema_CourseUncheckedUpdateManyWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.CourseUncheckedUpdateManyWithoutFacultyInput>;
export const CourseUncheckedUpdateManyWithoutFacultyInputObjectZodSchema = __makeSchema_CourseUncheckedUpdateManyWithoutFacultyInput_schema();


// File: DepartmentUpdateWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentUpdateWithoutFacultyInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  courses: z.lazy(() => CourseUpdateManyWithoutDepartmentNestedInputObjectSchema).optional()
}).strict();
export const DepartmentUpdateWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentUpdateWithoutFacultyInput> = __makeSchema_DepartmentUpdateWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.DepartmentUpdateWithoutFacultyInput>;
export const DepartmentUpdateWithoutFacultyInputObjectZodSchema = __makeSchema_DepartmentUpdateWithoutFacultyInput_schema();


// File: DepartmentUncheckedUpdateWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentUncheckedUpdateWithoutFacultyInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  courses: z.lazy(() => CourseUncheckedUpdateManyWithoutDepartmentNestedInputObjectSchema).optional()
}).strict();
export const DepartmentUncheckedUpdateWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentUncheckedUpdateWithoutFacultyInput> = __makeSchema_DepartmentUncheckedUpdateWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.DepartmentUncheckedUpdateWithoutFacultyInput>;
export const DepartmentUncheckedUpdateWithoutFacultyInputObjectZodSchema = __makeSchema_DepartmentUncheckedUpdateWithoutFacultyInput_schema();


// File: DepartmentUncheckedUpdateManyWithoutFacultyInput.schema.ts
const __makeSchema_DepartmentUncheckedUpdateManyWithoutFacultyInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional()
}).strict();
export const DepartmentUncheckedUpdateManyWithoutFacultyInputObjectSchema: z.ZodType<Prisma.DepartmentUncheckedUpdateManyWithoutFacultyInput> = __makeSchema_DepartmentUncheckedUpdateManyWithoutFacultyInput_schema() as unknown as z.ZodType<Prisma.DepartmentUncheckedUpdateManyWithoutFacultyInput>;
export const DepartmentUncheckedUpdateManyWithoutFacultyInputObjectZodSchema = __makeSchema_DepartmentUncheckedUpdateManyWithoutFacultyInput_schema();


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
  taughtSemesters: z.union([z.lazy(() => CourseCreatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseCreateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseCreatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  facultyId: z.string().optional().nullable(),
  latestYearCheckedForNtnuData: z.number().int().optional().nullable()
}).strict();
export const CourseCreateManyDepartmentInputObjectSchema: z.ZodType<Prisma.CourseCreateManyDepartmentInput> = __makeSchema_CourseCreateManyDepartmentInput_schema() as unknown as z.ZodType<Prisma.CourseCreateManyDepartmentInput>;
export const CourseCreateManyDepartmentInputObjectZodSchema = __makeSchema_CourseCreateManyDepartmentInput_schema();


// File: CourseUpdateWithoutDepartmentInput.schema.ts
const __makeSchema_CourseUpdateWithoutDepartmentInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  credits: z.union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, z.lazy(() => EnumStudyLevelFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeType: z.union([GradeTypeSchema, z.lazy(() => EnumGradeTypeFieldUpdateOperationsInputObjectSchema)]).optional(),
  firstYearTaught: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  lastYearTaught: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  candidateCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  averageGrade: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  passRate: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  taughtSemesters: z.union([z.lazy(() => CourseUpdatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseUpdateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseUpdatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  grades: z.lazy(() => GradeUpdateManyWithoutCourseNestedInputObjectSchema).optional(),
  faculty: z.lazy(() => FacultyUpdateOneWithoutCoursesNestedInputObjectSchema).optional()
}).strict();
export const CourseUpdateWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseUpdateWithoutDepartmentInput> = __makeSchema_CourseUpdateWithoutDepartmentInput_schema() as unknown as z.ZodType<Prisma.CourseUpdateWithoutDepartmentInput>;
export const CourseUpdateWithoutDepartmentInputObjectZodSchema = __makeSchema_CourseUpdateWithoutDepartmentInput_schema();


// File: CourseUncheckedUpdateWithoutDepartmentInput.schema.ts
const __makeSchema_CourseUncheckedUpdateWithoutDepartmentInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  credits: z.union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, z.lazy(() => EnumStudyLevelFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeType: z.union([GradeTypeSchema, z.lazy(() => EnumGradeTypeFieldUpdateOperationsInputObjectSchema)]).optional(),
  firstYearTaught: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  lastYearTaught: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  candidateCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  averageGrade: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  passRate: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  taughtSemesters: z.union([z.lazy(() => CourseUpdatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseUpdateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseUpdatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  facultyId: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  grades: z.lazy(() => GradeUncheckedUpdateManyWithoutCourseNestedInputObjectSchema).optional()
}).strict();
export const CourseUncheckedUpdateWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseUncheckedUpdateWithoutDepartmentInput> = __makeSchema_CourseUncheckedUpdateWithoutDepartmentInput_schema() as unknown as z.ZodType<Prisma.CourseUncheckedUpdateWithoutDepartmentInput>;
export const CourseUncheckedUpdateWithoutDepartmentInputObjectZodSchema = __makeSchema_CourseUncheckedUpdateWithoutDepartmentInput_schema();


// File: CourseUncheckedUpdateManyWithoutDepartmentInput.schema.ts
const __makeSchema_CourseUncheckedUpdateManyWithoutDepartmentInput_schema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameNo: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  nameEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  credits: z.union([z.number(), z.lazy(() => NullableFloatFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  studyLevel: z.union([StudyLevelSchema, z.lazy(() => EnumStudyLevelFieldUpdateOperationsInputObjectSchema)]).optional(),
  gradeType: z.union([GradeTypeSchema, z.lazy(() => EnumGradeTypeFieldUpdateOperationsInputObjectSchema)]).optional(),
  firstYearTaught: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  lastYearTaught: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  contentEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  teachingMethodsEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  learningOutcomesEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeNo: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  examTypeEn: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  candidateCount: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  averageGrade: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  passRate: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  taughtSemesters: z.union([z.lazy(() => CourseUpdatetaughtSemestersInputObjectSchema), SemesterSchema.array()]).optional(),
  teachingLanguages: z.union([z.lazy(() => CourseUpdateteachingLanguagesInputObjectSchema), TeachingLanguageSchema.array()]).optional(),
  campuses: z.union([z.lazy(() => CourseUpdatecampusesInputObjectSchema), CampusSchema.array()]).optional(),
  facultyId: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  latestYearCheckedForNtnuData: z.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema)]).optional().nullable()
}).strict();
export const CourseUncheckedUpdateManyWithoutDepartmentInputObjectSchema: z.ZodType<Prisma.CourseUncheckedUpdateManyWithoutDepartmentInput> = __makeSchema_CourseUncheckedUpdateManyWithoutDepartmentInput_schema() as unknown as z.ZodType<Prisma.CourseUncheckedUpdateManyWithoutDepartmentInput>;
export const CourseUncheckedUpdateManyWithoutDepartmentInputObjectZodSchema = __makeSchema_CourseUncheckedUpdateManyWithoutDepartmentInput_schema();


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
export const CourseCountAggregateInputObjectSchema: z.ZodType<Prisma.CourseCountAggregateInputType> = __makeSchema_CourseCountAggregateInput_schema() as unknown as z.ZodType<Prisma.CourseCountAggregateInputType>;
export const CourseCountAggregateInputObjectZodSchema = __makeSchema_CourseCountAggregateInput_schema();


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
export const CourseAvgAggregateInputObjectSchema: z.ZodType<Prisma.CourseAvgAggregateInputType> = __makeSchema_CourseAvgAggregateInput_schema() as unknown as z.ZodType<Prisma.CourseAvgAggregateInputType>;
export const CourseAvgAggregateInputObjectZodSchema = __makeSchema_CourseAvgAggregateInput_schema();


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
export const CourseSumAggregateInputObjectSchema: z.ZodType<Prisma.CourseSumAggregateInputType> = __makeSchema_CourseSumAggregateInput_schema() as unknown as z.ZodType<Prisma.CourseSumAggregateInputType>;
export const CourseSumAggregateInputObjectZodSchema = __makeSchema_CourseSumAggregateInput_schema();


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
export const CourseMinAggregateInputObjectSchema: z.ZodType<Prisma.CourseMinAggregateInputType> = __makeSchema_CourseMinAggregateInput_schema() as unknown as z.ZodType<Prisma.CourseMinAggregateInputType>;
export const CourseMinAggregateInputObjectZodSchema = __makeSchema_CourseMinAggregateInput_schema();


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
export const CourseMaxAggregateInputObjectSchema: z.ZodType<Prisma.CourseMaxAggregateInputType> = __makeSchema_CourseMaxAggregateInput_schema() as unknown as z.ZodType<Prisma.CourseMaxAggregateInputType>;
export const CourseMaxAggregateInputObjectZodSchema = __makeSchema_CourseMaxAggregateInput_schema();


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
export const GradeCountAggregateInputObjectSchema: z.ZodType<Prisma.GradeCountAggregateInputType> = __makeSchema_GradeCountAggregateInput_schema() as unknown as z.ZodType<Prisma.GradeCountAggregateInputType>;
export const GradeCountAggregateInputObjectZodSchema = __makeSchema_GradeCountAggregateInput_schema();


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
export const GradeAvgAggregateInputObjectSchema: z.ZodType<Prisma.GradeAvgAggregateInputType> = __makeSchema_GradeAvgAggregateInput_schema() as unknown as z.ZodType<Prisma.GradeAvgAggregateInputType>;
export const GradeAvgAggregateInputObjectZodSchema = __makeSchema_GradeAvgAggregateInput_schema();


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
export const GradeSumAggregateInputObjectSchema: z.ZodType<Prisma.GradeSumAggregateInputType> = __makeSchema_GradeSumAggregateInput_schema() as unknown as z.ZodType<Prisma.GradeSumAggregateInputType>;
export const GradeSumAggregateInputObjectZodSchema = __makeSchema_GradeSumAggregateInput_schema();


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
export const GradeMinAggregateInputObjectSchema: z.ZodType<Prisma.GradeMinAggregateInputType> = __makeSchema_GradeMinAggregateInput_schema() as unknown as z.ZodType<Prisma.GradeMinAggregateInputType>;
export const GradeMinAggregateInputObjectZodSchema = __makeSchema_GradeMinAggregateInput_schema();


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
export const GradeMaxAggregateInputObjectSchema: z.ZodType<Prisma.GradeMaxAggregateInputType> = __makeSchema_GradeMaxAggregateInput_schema() as unknown as z.ZodType<Prisma.GradeMaxAggregateInputType>;
export const GradeMaxAggregateInputObjectZodSchema = __makeSchema_GradeMaxAggregateInput_schema();


// File: FacultyCountAggregateInput.schema.ts
const __makeSchema_FacultyCountAggregateInput_schema = () => z.object({
  id: z.literal(true).optional(),
  nameNo: z.literal(true).optional(),
  nameEn: z.literal(true).optional(),
  code: z.literal(true).optional(),
  _all: z.literal(true).optional()
}).strict();
export const FacultyCountAggregateInputObjectSchema: z.ZodType<Prisma.FacultyCountAggregateInputType> = __makeSchema_FacultyCountAggregateInput_schema() as unknown as z.ZodType<Prisma.FacultyCountAggregateInputType>;
export const FacultyCountAggregateInputObjectZodSchema = __makeSchema_FacultyCountAggregateInput_schema();


// File: FacultyAvgAggregateInput.schema.ts
const __makeSchema_FacultyAvgAggregateInput_schema = () => z.object({
  code: z.literal(true).optional()
}).strict();
export const FacultyAvgAggregateInputObjectSchema: z.ZodType<Prisma.FacultyAvgAggregateInputType> = __makeSchema_FacultyAvgAggregateInput_schema() as unknown as z.ZodType<Prisma.FacultyAvgAggregateInputType>;
export const FacultyAvgAggregateInputObjectZodSchema = __makeSchema_FacultyAvgAggregateInput_schema();


// File: FacultySumAggregateInput.schema.ts
const __makeSchema_FacultySumAggregateInput_schema = () => z.object({
  code: z.literal(true).optional()
}).strict();
export const FacultySumAggregateInputObjectSchema: z.ZodType<Prisma.FacultySumAggregateInputType> = __makeSchema_FacultySumAggregateInput_schema() as unknown as z.ZodType<Prisma.FacultySumAggregateInputType>;
export const FacultySumAggregateInputObjectZodSchema = __makeSchema_FacultySumAggregateInput_schema();


// File: FacultyMinAggregateInput.schema.ts
const __makeSchema_FacultyMinAggregateInput_schema = () => z.object({
  id: z.literal(true).optional(),
  nameNo: z.literal(true).optional(),
  nameEn: z.literal(true).optional(),
  code: z.literal(true).optional()
}).strict();
export const FacultyMinAggregateInputObjectSchema: z.ZodType<Prisma.FacultyMinAggregateInputType> = __makeSchema_FacultyMinAggregateInput_schema() as unknown as z.ZodType<Prisma.FacultyMinAggregateInputType>;
export const FacultyMinAggregateInputObjectZodSchema = __makeSchema_FacultyMinAggregateInput_schema();


// File: FacultyMaxAggregateInput.schema.ts
const __makeSchema_FacultyMaxAggregateInput_schema = () => z.object({
  id: z.literal(true).optional(),
  nameNo: z.literal(true).optional(),
  nameEn: z.literal(true).optional(),
  code: z.literal(true).optional()
}).strict();
export const FacultyMaxAggregateInputObjectSchema: z.ZodType<Prisma.FacultyMaxAggregateInputType> = __makeSchema_FacultyMaxAggregateInput_schema() as unknown as z.ZodType<Prisma.FacultyMaxAggregateInputType>;
export const FacultyMaxAggregateInputObjectZodSchema = __makeSchema_FacultyMaxAggregateInput_schema();


// File: DepartmentCountAggregateInput.schema.ts
const __makeSchema_DepartmentCountAggregateInput_schema = () => z.object({
  id: z.literal(true).optional(),
  nameNo: z.literal(true).optional(),
  nameEn: z.literal(true).optional(),
  code: z.literal(true).optional(),
  facultyId: z.literal(true).optional(),
  _all: z.literal(true).optional()
}).strict();
export const DepartmentCountAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentCountAggregateInputType> = __makeSchema_DepartmentCountAggregateInput_schema() as unknown as z.ZodType<Prisma.DepartmentCountAggregateInputType>;
export const DepartmentCountAggregateInputObjectZodSchema = __makeSchema_DepartmentCountAggregateInput_schema();


// File: DepartmentAvgAggregateInput.schema.ts
const __makeSchema_DepartmentAvgAggregateInput_schema = () => z.object({
  code: z.literal(true).optional()
}).strict();
export const DepartmentAvgAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentAvgAggregateInputType> = __makeSchema_DepartmentAvgAggregateInput_schema() as unknown as z.ZodType<Prisma.DepartmentAvgAggregateInputType>;
export const DepartmentAvgAggregateInputObjectZodSchema = __makeSchema_DepartmentAvgAggregateInput_schema();


// File: DepartmentSumAggregateInput.schema.ts
const __makeSchema_DepartmentSumAggregateInput_schema = () => z.object({
  code: z.literal(true).optional()
}).strict();
export const DepartmentSumAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentSumAggregateInputType> = __makeSchema_DepartmentSumAggregateInput_schema() as unknown as z.ZodType<Prisma.DepartmentSumAggregateInputType>;
export const DepartmentSumAggregateInputObjectZodSchema = __makeSchema_DepartmentSumAggregateInput_schema();


// File: DepartmentMinAggregateInput.schema.ts
const __makeSchema_DepartmentMinAggregateInput_schema = () => z.object({
  id: z.literal(true).optional(),
  nameNo: z.literal(true).optional(),
  nameEn: z.literal(true).optional(),
  code: z.literal(true).optional(),
  facultyId: z.literal(true).optional()
}).strict();
export const DepartmentMinAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentMinAggregateInputType> = __makeSchema_DepartmentMinAggregateInput_schema() as unknown as z.ZodType<Prisma.DepartmentMinAggregateInputType>;
export const DepartmentMinAggregateInputObjectZodSchema = __makeSchema_DepartmentMinAggregateInput_schema();


// File: DepartmentMaxAggregateInput.schema.ts
const __makeSchema_DepartmentMaxAggregateInput_schema = () => z.object({
  id: z.literal(true).optional(),
  nameNo: z.literal(true).optional(),
  nameEn: z.literal(true).optional(),
  code: z.literal(true).optional(),
  facultyId: z.literal(true).optional()
}).strict();
export const DepartmentMaxAggregateInputObjectSchema: z.ZodType<Prisma.DepartmentMaxAggregateInputType> = __makeSchema_DepartmentMaxAggregateInput_schema() as unknown as z.ZodType<Prisma.DepartmentMaxAggregateInputType>;
export const DepartmentMaxAggregateInputObjectZodSchema = __makeSchema_DepartmentMaxAggregateInput_schema();


// File: CourseCountOutputTypeSelect.schema.ts
const __makeSchema_CourseCountOutputTypeSelect_schema = () => z.object({
  grades: z.union([z.boolean(), z.lazy(() => CourseCountOutputTypeCountGradesArgsObjectSchema)]).optional()
}).strict();
export const CourseCountOutputTypeSelectObjectSchema: z.ZodType<Prisma.CourseCountOutputTypeSelect> = __makeSchema_CourseCountOutputTypeSelect_schema() as unknown as z.ZodType<Prisma.CourseCountOutputTypeSelect>;
export const CourseCountOutputTypeSelectObjectZodSchema = __makeSchema_CourseCountOutputTypeSelect_schema();


// File: FacultyCountOutputTypeSelect.schema.ts
const __makeSchema_FacultyCountOutputTypeSelect_schema = () => z.object({
  courses: z.union([z.boolean(), z.lazy(() => FacultyCountOutputTypeCountCoursesArgsObjectSchema)]).optional(),
  departments: z.union([z.boolean(), z.lazy(() => FacultyCountOutputTypeCountDepartmentsArgsObjectSchema)]).optional()
}).strict();
export const FacultyCountOutputTypeSelectObjectSchema: z.ZodType<Prisma.FacultyCountOutputTypeSelect> = __makeSchema_FacultyCountOutputTypeSelect_schema() as unknown as z.ZodType<Prisma.FacultyCountOutputTypeSelect>;
export const FacultyCountOutputTypeSelectObjectZodSchema = __makeSchema_FacultyCountOutputTypeSelect_schema();


// File: DepartmentCountOutputTypeSelect.schema.ts
const __makeSchema_DepartmentCountOutputTypeSelect_schema = () => z.object({
  courses: z.union([z.boolean(), z.lazy(() => DepartmentCountOutputTypeCountCoursesArgsObjectSchema)]).optional()
}).strict();
export const DepartmentCountOutputTypeSelectObjectSchema: z.ZodType<Prisma.DepartmentCountOutputTypeSelect> = __makeSchema_DepartmentCountOutputTypeSelect_schema() as unknown as z.ZodType<Prisma.DepartmentCountOutputTypeSelect>;
export const DepartmentCountOutputTypeSelectObjectZodSchema = __makeSchema_DepartmentCountOutputTypeSelect_schema();


// File: CourseCountOutputTypeArgs.schema.ts
const __makeSchema_CourseCountOutputTypeArgs_schema = () => z.object({
  select: z.lazy(() => CourseCountOutputTypeSelectObjectSchema).optional()
}).strict();
export const CourseCountOutputTypeArgsObjectSchema = __makeSchema_CourseCountOutputTypeArgs_schema();
export const CourseCountOutputTypeArgsObjectZodSchema = __makeSchema_CourseCountOutputTypeArgs_schema();


// File: CourseCountOutputTypeCountGradesArgs.schema.ts
const __makeSchema_CourseCountOutputTypeCountGradesArgs_schema = () => z.object({
  where: z.lazy(() => GradeWhereInputObjectSchema).optional()
}).strict();
export const CourseCountOutputTypeCountGradesArgsObjectSchema = __makeSchema_CourseCountOutputTypeCountGradesArgs_schema();
export const CourseCountOutputTypeCountGradesArgsObjectZodSchema = __makeSchema_CourseCountOutputTypeCountGradesArgs_schema();


// File: FacultyCountOutputTypeArgs.schema.ts
const __makeSchema_FacultyCountOutputTypeArgs_schema = () => z.object({
  select: z.lazy(() => FacultyCountOutputTypeSelectObjectSchema).optional()
}).strict();
export const FacultyCountOutputTypeArgsObjectSchema = __makeSchema_FacultyCountOutputTypeArgs_schema();
export const FacultyCountOutputTypeArgsObjectZodSchema = __makeSchema_FacultyCountOutputTypeArgs_schema();


// File: FacultyCountOutputTypeCountCoursesArgs.schema.ts
const __makeSchema_FacultyCountOutputTypeCountCoursesArgs_schema = () => z.object({
  where: z.lazy(() => CourseWhereInputObjectSchema).optional()
}).strict();
export const FacultyCountOutputTypeCountCoursesArgsObjectSchema = __makeSchema_FacultyCountOutputTypeCountCoursesArgs_schema();
export const FacultyCountOutputTypeCountCoursesArgsObjectZodSchema = __makeSchema_FacultyCountOutputTypeCountCoursesArgs_schema();


// File: FacultyCountOutputTypeCountDepartmentsArgs.schema.ts
const __makeSchema_FacultyCountOutputTypeCountDepartmentsArgs_schema = () => z.object({
  where: z.lazy(() => DepartmentWhereInputObjectSchema).optional()
}).strict();
export const FacultyCountOutputTypeCountDepartmentsArgsObjectSchema = __makeSchema_FacultyCountOutputTypeCountDepartmentsArgs_schema();
export const FacultyCountOutputTypeCountDepartmentsArgsObjectZodSchema = __makeSchema_FacultyCountOutputTypeCountDepartmentsArgs_schema();


// File: DepartmentCountOutputTypeArgs.schema.ts
const __makeSchema_DepartmentCountOutputTypeArgs_schema = () => z.object({
  select: z.lazy(() => DepartmentCountOutputTypeSelectObjectSchema).optional()
}).strict();
export const DepartmentCountOutputTypeArgsObjectSchema = __makeSchema_DepartmentCountOutputTypeArgs_schema();
export const DepartmentCountOutputTypeArgsObjectZodSchema = __makeSchema_DepartmentCountOutputTypeArgs_schema();


// File: DepartmentCountOutputTypeCountCoursesArgs.schema.ts
const __makeSchema_DepartmentCountOutputTypeCountCoursesArgs_schema = () => z.object({
  where: z.lazy(() => CourseWhereInputObjectSchema).optional()
}).strict();
export const DepartmentCountOutputTypeCountCoursesArgsObjectSchema = __makeSchema_DepartmentCountOutputTypeCountCoursesArgs_schema();
export const DepartmentCountOutputTypeCountCoursesArgsObjectZodSchema = __makeSchema_DepartmentCountOutputTypeCountCoursesArgs_schema();


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
  grades: z.union([z.boolean(), z.lazy(() => GradeFindManySchema)]).optional(),
  facultyId: z.boolean().optional(),
  faculty: z.union([z.boolean(), z.lazy(() => FacultyArgsObjectSchema)]).optional(),
  departmentId: z.boolean().optional(),
  department: z.union([z.boolean(), z.lazy(() => DepartmentArgsObjectSchema)]).optional(),
  latestYearCheckedForNtnuData: z.boolean().optional(),
  _count: z.union([z.boolean(), z.lazy(() => CourseCountOutputTypeArgsObjectSchema)]).optional()
}).strict();
export const CourseSelectObjectSchema: z.ZodType<Prisma.CourseSelect> = __makeSchema_CourseSelect_schema() as unknown as z.ZodType<Prisma.CourseSelect>;
export const CourseSelectObjectZodSchema = __makeSchema_CourseSelect_schema();


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
  course: z.union([z.boolean(), z.lazy(() => CourseArgsObjectSchema)]).optional(),
  semester: z.boolean().optional(),
  year: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional()
}).strict();
export const GradeSelectObjectSchema: z.ZodType<Prisma.GradeSelect> = __makeSchema_GradeSelect_schema() as unknown as z.ZodType<Prisma.GradeSelect>;
export const GradeSelectObjectZodSchema = __makeSchema_GradeSelect_schema();


// File: FacultySelect.schema.ts
const __makeSchema_FacultySelect_schema = () => z.object({
  id: z.boolean().optional(),
  nameNo: z.boolean().optional(),
  nameEn: z.boolean().optional(),
  code: z.boolean().optional(),
  courses: z.union([z.boolean(), z.lazy(() => CourseFindManySchema)]).optional(),
  departments: z.union([z.boolean(), z.lazy(() => DepartmentFindManySchema)]).optional(),
  _count: z.union([z.boolean(), z.lazy(() => FacultyCountOutputTypeArgsObjectSchema)]).optional()
}).strict();
export const FacultySelectObjectSchema: z.ZodType<Prisma.FacultySelect> = __makeSchema_FacultySelect_schema() as unknown as z.ZodType<Prisma.FacultySelect>;
export const FacultySelectObjectZodSchema = __makeSchema_FacultySelect_schema();


// File: DepartmentSelect.schema.ts
const __makeSchema_DepartmentSelect_schema = () => z.object({
  id: z.boolean().optional(),
  nameNo: z.boolean().optional(),
  nameEn: z.boolean().optional(),
  code: z.boolean().optional(),
  courses: z.union([z.boolean(), z.lazy(() => CourseFindManySchema)]).optional(),
  facultyId: z.boolean().optional(),
  faculty: z.union([z.boolean(), z.lazy(() => FacultyArgsObjectSchema)]).optional(),
  _count: z.union([z.boolean(), z.lazy(() => DepartmentCountOutputTypeArgsObjectSchema)]).optional()
}).strict();
export const DepartmentSelectObjectSchema: z.ZodType<Prisma.DepartmentSelect> = __makeSchema_DepartmentSelect_schema() as unknown as z.ZodType<Prisma.DepartmentSelect>;
export const DepartmentSelectObjectZodSchema = __makeSchema_DepartmentSelect_schema();


// File: CourseArgs.schema.ts
const __makeSchema_CourseArgs_schema = () => z.object({
  select: z.lazy(() => CourseSelectObjectSchema).optional(),
  include: z.lazy(() => CourseIncludeObjectSchema).optional()
}).strict();
export const CourseArgsObjectSchema = __makeSchema_CourseArgs_schema();
export const CourseArgsObjectZodSchema = __makeSchema_CourseArgs_schema();


// File: GradeArgs.schema.ts
const __makeSchema_GradeArgs_schema = () => z.object({
  select: z.lazy(() => GradeSelectObjectSchema).optional(),
  include: z.lazy(() => GradeIncludeObjectSchema).optional()
}).strict();
export const GradeArgsObjectSchema = __makeSchema_GradeArgs_schema();
export const GradeArgsObjectZodSchema = __makeSchema_GradeArgs_schema();


// File: FacultyArgs.schema.ts
const __makeSchema_FacultyArgs_schema = () => z.object({
  select: z.lazy(() => FacultySelectObjectSchema).optional(),
  include: z.lazy(() => FacultyIncludeObjectSchema).optional()
}).strict();
export const FacultyArgsObjectSchema = __makeSchema_FacultyArgs_schema();
export const FacultyArgsObjectZodSchema = __makeSchema_FacultyArgs_schema();


// File: DepartmentArgs.schema.ts
const __makeSchema_DepartmentArgs_schema = () => z.object({
  select: z.lazy(() => DepartmentSelectObjectSchema).optional(),
  include: z.lazy(() => DepartmentIncludeObjectSchema).optional()
}).strict();
export const DepartmentArgsObjectSchema = __makeSchema_DepartmentArgs_schema();
export const DepartmentArgsObjectZodSchema = __makeSchema_DepartmentArgs_schema();


// File: CourseInclude.schema.ts
const __makeSchema_CourseInclude_schema = () => z.object({
  grades: z.union([z.boolean(), z.lazy(() => GradeFindManySchema)]).optional(),
  faculty: z.union([z.boolean(), z.lazy(() => FacultyArgsObjectSchema)]).optional(),
  department: z.union([z.boolean(), z.lazy(() => DepartmentArgsObjectSchema)]).optional(),
  _count: z.union([z.boolean(), z.lazy(() => CourseCountOutputTypeArgsObjectSchema)]).optional()
}).strict();
export const CourseIncludeObjectSchema: z.ZodType<Prisma.CourseInclude> = __makeSchema_CourseInclude_schema() as unknown as z.ZodType<Prisma.CourseInclude>;
export const CourseIncludeObjectZodSchema = __makeSchema_CourseInclude_schema();


// File: GradeInclude.schema.ts
const __makeSchema_GradeInclude_schema = () => z.object({
  course: z.union([z.boolean(), z.lazy(() => CourseArgsObjectSchema)]).optional()
}).strict();
export const GradeIncludeObjectSchema: z.ZodType<Prisma.GradeInclude> = __makeSchema_GradeInclude_schema() as unknown as z.ZodType<Prisma.GradeInclude>;
export const GradeIncludeObjectZodSchema = __makeSchema_GradeInclude_schema();


// File: FacultyInclude.schema.ts
const __makeSchema_FacultyInclude_schema = () => z.object({
  courses: z.union([z.boolean(), z.lazy(() => CourseFindManySchema)]).optional(),
  departments: z.union([z.boolean(), z.lazy(() => DepartmentFindManySchema)]).optional(),
  _count: z.union([z.boolean(), z.lazy(() => FacultyCountOutputTypeArgsObjectSchema)]).optional()
}).strict();
export const FacultyIncludeObjectSchema: z.ZodType<Prisma.FacultyInclude> = __makeSchema_FacultyInclude_schema() as unknown as z.ZodType<Prisma.FacultyInclude>;
export const FacultyIncludeObjectZodSchema = __makeSchema_FacultyInclude_schema();


// File: DepartmentInclude.schema.ts
const __makeSchema_DepartmentInclude_schema = () => z.object({
  courses: z.union([z.boolean(), z.lazy(() => CourseFindManySchema)]).optional(),
  faculty: z.union([z.boolean(), z.lazy(() => FacultyArgsObjectSchema)]).optional(),
  _count: z.union([z.boolean(), z.lazy(() => DepartmentCountOutputTypeArgsObjectSchema)]).optional()
}).strict();
export const DepartmentIncludeObjectSchema: z.ZodType<Prisma.DepartmentInclude> = __makeSchema_DepartmentInclude_schema() as unknown as z.ZodType<Prisma.DepartmentInclude>;
export const DepartmentIncludeObjectZodSchema = __makeSchema_DepartmentInclude_schema();


// File: findUniqueCourse.schema.ts

export const CourseFindUniqueSchema: z.ZodType<Prisma.CourseFindUniqueArgs> = z.object({ select: CourseSelectObjectSchema.optional(), include: CourseIncludeObjectSchema.optional(), where: CourseWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.CourseFindUniqueArgs>;

export const CourseFindUniqueZodSchema = z.object({ select: CourseSelectObjectSchema.optional(), include: CourseIncludeObjectSchema.optional(), where: CourseWhereUniqueInputObjectSchema }).strict();

// File: findUniqueOrThrowCourse.schema.ts

export const CourseFindUniqueOrThrowSchema: z.ZodType<Prisma.CourseFindUniqueOrThrowArgs> = z.object({ select: CourseSelectObjectSchema.optional(), include: CourseIncludeObjectSchema.optional(), where: CourseWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.CourseFindUniqueOrThrowArgs>;

export const CourseFindUniqueOrThrowZodSchema = z.object({ select: CourseSelectObjectSchema.optional(), include: CourseIncludeObjectSchema.optional(), where: CourseWhereUniqueInputObjectSchema }).strict();

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

export const CourseFindFirstSchema: z.ZodType<Prisma.CourseFindFirstArgs> = z.object({ select: CourseFindFirstSelectSchema__findFirstCourse_schema.optional(), include: z.lazy(() => CourseIncludeObjectSchema.optional()), orderBy: z.union([CourseOrderByWithRelationInputObjectSchema, CourseOrderByWithRelationInputObjectSchema.array()]).optional(), where: CourseWhereInputObjectSchema.optional(), cursor: CourseWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([CourseScalarFieldEnumSchema, CourseScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.CourseFindFirstArgs>;

export const CourseFindFirstZodSchema = z.object({ select: CourseFindFirstSelectSchema__findFirstCourse_schema.optional(), include: z.lazy(() => CourseIncludeObjectSchema.optional()), orderBy: z.union([CourseOrderByWithRelationInputObjectSchema, CourseOrderByWithRelationInputObjectSchema.array()]).optional(), where: CourseWhereInputObjectSchema.optional(), cursor: CourseWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([CourseScalarFieldEnumSchema, CourseScalarFieldEnumSchema.array()]).optional() }).strict();

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

export const CourseFindFirstOrThrowSchema: z.ZodType<Prisma.CourseFindFirstOrThrowArgs> = z.object({ select: CourseFindFirstOrThrowSelectSchema__findFirstOrThrowCourse_schema.optional(), include: z.lazy(() => CourseIncludeObjectSchema.optional()), orderBy: z.union([CourseOrderByWithRelationInputObjectSchema, CourseOrderByWithRelationInputObjectSchema.array()]).optional(), where: CourseWhereInputObjectSchema.optional(), cursor: CourseWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([CourseScalarFieldEnumSchema, CourseScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.CourseFindFirstOrThrowArgs>;

export const CourseFindFirstOrThrowZodSchema = z.object({ select: CourseFindFirstOrThrowSelectSchema__findFirstOrThrowCourse_schema.optional(), include: z.lazy(() => CourseIncludeObjectSchema.optional()), orderBy: z.union([CourseOrderByWithRelationInputObjectSchema, CourseOrderByWithRelationInputObjectSchema.array()]).optional(), where: CourseWhereInputObjectSchema.optional(), cursor: CourseWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([CourseScalarFieldEnumSchema, CourseScalarFieldEnumSchema.array()]).optional() }).strict();

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

export const CourseFindManySchema: z.ZodType<Prisma.CourseFindManyArgs> = z.object({ select: CourseFindManySelectSchema__findManyCourse_schema.optional(), include: z.lazy(() => CourseIncludeObjectSchema.optional()), orderBy: z.union([CourseOrderByWithRelationInputObjectSchema, CourseOrderByWithRelationInputObjectSchema.array()]).optional(), where: CourseWhereInputObjectSchema.optional(), cursor: CourseWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([CourseScalarFieldEnumSchema, CourseScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.CourseFindManyArgs>;

export const CourseFindManyZodSchema = z.object({ select: CourseFindManySelectSchema__findManyCourse_schema.optional(), include: z.lazy(() => CourseIncludeObjectSchema.optional()), orderBy: z.union([CourseOrderByWithRelationInputObjectSchema, CourseOrderByWithRelationInputObjectSchema.array()]).optional(), where: CourseWhereInputObjectSchema.optional(), cursor: CourseWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([CourseScalarFieldEnumSchema, CourseScalarFieldEnumSchema.array()]).optional() }).strict();

// File: countCourse.schema.ts

export const CourseCountSchema: z.ZodType<Prisma.CourseCountArgs> = z.object({ orderBy: z.union([CourseOrderByWithRelationInputObjectSchema, CourseOrderByWithRelationInputObjectSchema.array()]).optional(), where: CourseWhereInputObjectSchema.optional(), cursor: CourseWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), select: z.union([ z.literal(true), CourseCountAggregateInputObjectSchema ]).optional() }).strict() as unknown as z.ZodType<Prisma.CourseCountArgs>;

export const CourseCountZodSchema = z.object({ orderBy: z.union([CourseOrderByWithRelationInputObjectSchema, CourseOrderByWithRelationInputObjectSchema.array()]).optional(), where: CourseWhereInputObjectSchema.optional(), cursor: CourseWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), select: z.union([ z.literal(true), CourseCountAggregateInputObjectSchema ]).optional() }).strict();

// File: createOneCourse.schema.ts

export const CourseCreateOneSchema: z.ZodType<Prisma.CourseCreateArgs> = z.object({ select: CourseSelectObjectSchema.optional(), include: CourseIncludeObjectSchema.optional(), data: z.union([CourseCreateInputObjectSchema, CourseUncheckedCreateInputObjectSchema]) }).strict() as unknown as z.ZodType<Prisma.CourseCreateArgs>;

export const CourseCreateOneZodSchema = z.object({ select: CourseSelectObjectSchema.optional(), include: CourseIncludeObjectSchema.optional(), data: z.union([CourseCreateInputObjectSchema, CourseUncheckedCreateInputObjectSchema]) }).strict();

// File: createManyCourse.schema.ts

export const CourseCreateManySchema: z.ZodType<Prisma.CourseCreateManyArgs> = z.object({ data: z.union([ CourseCreateManyInputObjectSchema, z.array(CourseCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict() as unknown as z.ZodType<Prisma.CourseCreateManyArgs>;

export const CourseCreateManyZodSchema = z.object({ data: z.union([ CourseCreateManyInputObjectSchema, z.array(CourseCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict();

// File: createManyAndReturnCourse.schema.ts

export const CourseCreateManyAndReturnSchema: z.ZodType<Prisma.CourseCreateManyAndReturnArgs> = z.object({ select: CourseSelectObjectSchema.optional(), data: z.union([ CourseCreateManyInputObjectSchema, z.array(CourseCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict() as unknown as z.ZodType<Prisma.CourseCreateManyAndReturnArgs>;

export const CourseCreateManyAndReturnZodSchema = z.object({ select: CourseSelectObjectSchema.optional(), data: z.union([ CourseCreateManyInputObjectSchema, z.array(CourseCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict();

// File: deleteOneCourse.schema.ts

export const CourseDeleteOneSchema: z.ZodType<Prisma.CourseDeleteArgs> = z.object({ select: CourseSelectObjectSchema.optional(), include: CourseIncludeObjectSchema.optional(), where: CourseWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.CourseDeleteArgs>;

export const CourseDeleteOneZodSchema = z.object({ select: CourseSelectObjectSchema.optional(), include: CourseIncludeObjectSchema.optional(), where: CourseWhereUniqueInputObjectSchema }).strict();

// File: deleteManyCourse.schema.ts

export const CourseDeleteManySchema: z.ZodType<Prisma.CourseDeleteManyArgs> = z.object({ where: CourseWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.CourseDeleteManyArgs>;

export const CourseDeleteManyZodSchema = z.object({ where: CourseWhereInputObjectSchema.optional() }).strict();

// File: updateOneCourse.schema.ts

export const CourseUpdateOneSchema: z.ZodType<Prisma.CourseUpdateArgs> = z.object({ select: CourseSelectObjectSchema.optional(), include: CourseIncludeObjectSchema.optional(), data: z.union([CourseUpdateInputObjectSchema, CourseUncheckedUpdateInputObjectSchema]), where: CourseWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.CourseUpdateArgs>;

export const CourseUpdateOneZodSchema = z.object({ select: CourseSelectObjectSchema.optional(), include: CourseIncludeObjectSchema.optional(), data: z.union([CourseUpdateInputObjectSchema, CourseUncheckedUpdateInputObjectSchema]), where: CourseWhereUniqueInputObjectSchema }).strict();

// File: updateManyCourse.schema.ts

export const CourseUpdateManySchema: z.ZodType<Prisma.CourseUpdateManyArgs> = z.object({ data: CourseUpdateManyMutationInputObjectSchema, where: CourseWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.CourseUpdateManyArgs>;

export const CourseUpdateManyZodSchema = z.object({ data: CourseUpdateManyMutationInputObjectSchema, where: CourseWhereInputObjectSchema.optional() }).strict();

// File: updateManyAndReturnCourse.schema.ts

export const CourseUpdateManyAndReturnSchema: z.ZodType<Prisma.CourseUpdateManyAndReturnArgs> = z.object({ select: CourseSelectObjectSchema.optional(), data: CourseUpdateManyMutationInputObjectSchema, where: CourseWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.CourseUpdateManyAndReturnArgs>;

export const CourseUpdateManyAndReturnZodSchema = z.object({ select: CourseSelectObjectSchema.optional(), data: CourseUpdateManyMutationInputObjectSchema, where: CourseWhereInputObjectSchema.optional() }).strict();

// File: upsertOneCourse.schema.ts

export const CourseUpsertOneSchema: z.ZodType<Prisma.CourseUpsertArgs> = z.object({ select: CourseSelectObjectSchema.optional(), include: CourseIncludeObjectSchema.optional(), where: CourseWhereUniqueInputObjectSchema, create: z.union([ CourseCreateInputObjectSchema, CourseUncheckedCreateInputObjectSchema ]), update: z.union([ CourseUpdateInputObjectSchema, CourseUncheckedUpdateInputObjectSchema ]) }).strict() as unknown as z.ZodType<Prisma.CourseUpsertArgs>;

export const CourseUpsertOneZodSchema = z.object({ select: CourseSelectObjectSchema.optional(), include: CourseIncludeObjectSchema.optional(), where: CourseWhereUniqueInputObjectSchema, create: z.union([ CourseCreateInputObjectSchema, CourseUncheckedCreateInputObjectSchema ]), update: z.union([ CourseUpdateInputObjectSchema, CourseUncheckedUpdateInputObjectSchema ]) }).strict();

// File: aggregateCourse.schema.ts

export const CourseAggregateSchema: z.ZodType<Prisma.CourseAggregateArgs> = z.object({ orderBy: z.union([CourseOrderByWithRelationInputObjectSchema, CourseOrderByWithRelationInputObjectSchema.array()]).optional(), where: CourseWhereInputObjectSchema.optional(), cursor: CourseWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), _count: z.union([ z.literal(true), CourseCountAggregateInputObjectSchema ]).optional(), _min: CourseMinAggregateInputObjectSchema.optional(), _max: CourseMaxAggregateInputObjectSchema.optional(), _avg: CourseAvgAggregateInputObjectSchema.optional(), _sum: CourseSumAggregateInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.CourseAggregateArgs>;

export const CourseAggregateZodSchema = z.object({ orderBy: z.union([CourseOrderByWithRelationInputObjectSchema, CourseOrderByWithRelationInputObjectSchema.array()]).optional(), where: CourseWhereInputObjectSchema.optional(), cursor: CourseWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), _count: z.union([ z.literal(true), CourseCountAggregateInputObjectSchema ]).optional(), _min: CourseMinAggregateInputObjectSchema.optional(), _max: CourseMaxAggregateInputObjectSchema.optional(), _avg: CourseAvgAggregateInputObjectSchema.optional(), _sum: CourseSumAggregateInputObjectSchema.optional() }).strict();

// File: groupByCourse.schema.ts

export const CourseGroupBySchema: z.ZodType<Prisma.CourseGroupByArgs> = z.object({ where: CourseWhereInputObjectSchema.optional(), orderBy: z.union([CourseOrderByWithAggregationInputObjectSchema, CourseOrderByWithAggregationInputObjectSchema.array()]).optional(), having: CourseScalarWhereWithAggregatesInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), by: z.array(CourseScalarFieldEnumSchema), _count: z.union([ z.literal(true), CourseCountAggregateInputObjectSchema ]).optional(), _min: CourseMinAggregateInputObjectSchema.optional(), _max: CourseMaxAggregateInputObjectSchema.optional(), _avg: CourseAvgAggregateInputObjectSchema.optional(), _sum: CourseSumAggregateInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.CourseGroupByArgs>;

export const CourseGroupByZodSchema = z.object({ where: CourseWhereInputObjectSchema.optional(), orderBy: z.union([CourseOrderByWithAggregationInputObjectSchema, CourseOrderByWithAggregationInputObjectSchema.array()]).optional(), having: CourseScalarWhereWithAggregatesInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), by: z.array(CourseScalarFieldEnumSchema), _count: z.union([ z.literal(true), CourseCountAggregateInputObjectSchema ]).optional(), _min: CourseMinAggregateInputObjectSchema.optional(), _max: CourseMaxAggregateInputObjectSchema.optional(), _avg: CourseAvgAggregateInputObjectSchema.optional(), _sum: CourseSumAggregateInputObjectSchema.optional() }).strict();

// File: findUniqueGrade.schema.ts

export const GradeFindUniqueSchema: z.ZodType<Prisma.GradeFindUniqueArgs> = z.object({ select: GradeSelectObjectSchema.optional(), include: GradeIncludeObjectSchema.optional(), where: GradeWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.GradeFindUniqueArgs>;

export const GradeFindUniqueZodSchema = z.object({ select: GradeSelectObjectSchema.optional(), include: GradeIncludeObjectSchema.optional(), where: GradeWhereUniqueInputObjectSchema }).strict();

// File: findUniqueOrThrowGrade.schema.ts

export const GradeFindUniqueOrThrowSchema: z.ZodType<Prisma.GradeFindUniqueOrThrowArgs> = z.object({ select: GradeSelectObjectSchema.optional(), include: GradeIncludeObjectSchema.optional(), where: GradeWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.GradeFindUniqueOrThrowArgs>;

export const GradeFindUniqueOrThrowZodSchema = z.object({ select: GradeSelectObjectSchema.optional(), include: GradeIncludeObjectSchema.optional(), where: GradeWhereUniqueInputObjectSchema }).strict();

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

export const GradeFindFirstSchema: z.ZodType<Prisma.GradeFindFirstArgs> = z.object({ select: GradeFindFirstSelectSchema__findFirstGrade_schema.optional(), include: z.lazy(() => GradeIncludeObjectSchema.optional()), orderBy: z.union([GradeOrderByWithRelationInputObjectSchema, GradeOrderByWithRelationInputObjectSchema.array()]).optional(), where: GradeWhereInputObjectSchema.optional(), cursor: GradeWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([GradeScalarFieldEnumSchema, GradeScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.GradeFindFirstArgs>;

export const GradeFindFirstZodSchema = z.object({ select: GradeFindFirstSelectSchema__findFirstGrade_schema.optional(), include: z.lazy(() => GradeIncludeObjectSchema.optional()), orderBy: z.union([GradeOrderByWithRelationInputObjectSchema, GradeOrderByWithRelationInputObjectSchema.array()]).optional(), where: GradeWhereInputObjectSchema.optional(), cursor: GradeWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([GradeScalarFieldEnumSchema, GradeScalarFieldEnumSchema.array()]).optional() }).strict();

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

export const GradeFindFirstOrThrowSchema: z.ZodType<Prisma.GradeFindFirstOrThrowArgs> = z.object({ select: GradeFindFirstOrThrowSelectSchema__findFirstOrThrowGrade_schema.optional(), include: z.lazy(() => GradeIncludeObjectSchema.optional()), orderBy: z.union([GradeOrderByWithRelationInputObjectSchema, GradeOrderByWithRelationInputObjectSchema.array()]).optional(), where: GradeWhereInputObjectSchema.optional(), cursor: GradeWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([GradeScalarFieldEnumSchema, GradeScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.GradeFindFirstOrThrowArgs>;

export const GradeFindFirstOrThrowZodSchema = z.object({ select: GradeFindFirstOrThrowSelectSchema__findFirstOrThrowGrade_schema.optional(), include: z.lazy(() => GradeIncludeObjectSchema.optional()), orderBy: z.union([GradeOrderByWithRelationInputObjectSchema, GradeOrderByWithRelationInputObjectSchema.array()]).optional(), where: GradeWhereInputObjectSchema.optional(), cursor: GradeWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([GradeScalarFieldEnumSchema, GradeScalarFieldEnumSchema.array()]).optional() }).strict();

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

export const GradeFindManySchema: z.ZodType<Prisma.GradeFindManyArgs> = z.object({ select: GradeFindManySelectSchema__findManyGrade_schema.optional(), include: z.lazy(() => GradeIncludeObjectSchema.optional()), orderBy: z.union([GradeOrderByWithRelationInputObjectSchema, GradeOrderByWithRelationInputObjectSchema.array()]).optional(), where: GradeWhereInputObjectSchema.optional(), cursor: GradeWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([GradeScalarFieldEnumSchema, GradeScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.GradeFindManyArgs>;

export const GradeFindManyZodSchema = z.object({ select: GradeFindManySelectSchema__findManyGrade_schema.optional(), include: z.lazy(() => GradeIncludeObjectSchema.optional()), orderBy: z.union([GradeOrderByWithRelationInputObjectSchema, GradeOrderByWithRelationInputObjectSchema.array()]).optional(), where: GradeWhereInputObjectSchema.optional(), cursor: GradeWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([GradeScalarFieldEnumSchema, GradeScalarFieldEnumSchema.array()]).optional() }).strict();

// File: countGrade.schema.ts

export const GradeCountSchema: z.ZodType<Prisma.GradeCountArgs> = z.object({ orderBy: z.union([GradeOrderByWithRelationInputObjectSchema, GradeOrderByWithRelationInputObjectSchema.array()]).optional(), where: GradeWhereInputObjectSchema.optional(), cursor: GradeWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), select: z.union([ z.literal(true), GradeCountAggregateInputObjectSchema ]).optional() }).strict() as unknown as z.ZodType<Prisma.GradeCountArgs>;

export const GradeCountZodSchema = z.object({ orderBy: z.union([GradeOrderByWithRelationInputObjectSchema, GradeOrderByWithRelationInputObjectSchema.array()]).optional(), where: GradeWhereInputObjectSchema.optional(), cursor: GradeWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), select: z.union([ z.literal(true), GradeCountAggregateInputObjectSchema ]).optional() }).strict();

// File: createOneGrade.schema.ts

export const GradeCreateOneSchema: z.ZodType<Prisma.GradeCreateArgs> = z.object({ select: GradeSelectObjectSchema.optional(), include: GradeIncludeObjectSchema.optional(), data: z.union([GradeCreateInputObjectSchema, GradeUncheckedCreateInputObjectSchema]) }).strict() as unknown as z.ZodType<Prisma.GradeCreateArgs>;

export const GradeCreateOneZodSchema = z.object({ select: GradeSelectObjectSchema.optional(), include: GradeIncludeObjectSchema.optional(), data: z.union([GradeCreateInputObjectSchema, GradeUncheckedCreateInputObjectSchema]) }).strict();

// File: createManyGrade.schema.ts

export const GradeCreateManySchema: z.ZodType<Prisma.GradeCreateManyArgs> = z.object({ data: z.union([ GradeCreateManyInputObjectSchema, z.array(GradeCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict() as unknown as z.ZodType<Prisma.GradeCreateManyArgs>;

export const GradeCreateManyZodSchema = z.object({ data: z.union([ GradeCreateManyInputObjectSchema, z.array(GradeCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict();

// File: createManyAndReturnGrade.schema.ts

export const GradeCreateManyAndReturnSchema: z.ZodType<Prisma.GradeCreateManyAndReturnArgs> = z.object({ select: GradeSelectObjectSchema.optional(), data: z.union([ GradeCreateManyInputObjectSchema, z.array(GradeCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict() as unknown as z.ZodType<Prisma.GradeCreateManyAndReturnArgs>;

export const GradeCreateManyAndReturnZodSchema = z.object({ select: GradeSelectObjectSchema.optional(), data: z.union([ GradeCreateManyInputObjectSchema, z.array(GradeCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict();

// File: deleteOneGrade.schema.ts

export const GradeDeleteOneSchema: z.ZodType<Prisma.GradeDeleteArgs> = z.object({ select: GradeSelectObjectSchema.optional(), include: GradeIncludeObjectSchema.optional(), where: GradeWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.GradeDeleteArgs>;

export const GradeDeleteOneZodSchema = z.object({ select: GradeSelectObjectSchema.optional(), include: GradeIncludeObjectSchema.optional(), where: GradeWhereUniqueInputObjectSchema }).strict();

// File: deleteManyGrade.schema.ts

export const GradeDeleteManySchema: z.ZodType<Prisma.GradeDeleteManyArgs> = z.object({ where: GradeWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.GradeDeleteManyArgs>;

export const GradeDeleteManyZodSchema = z.object({ where: GradeWhereInputObjectSchema.optional() }).strict();

// File: updateOneGrade.schema.ts

export const GradeUpdateOneSchema: z.ZodType<Prisma.GradeUpdateArgs> = z.object({ select: GradeSelectObjectSchema.optional(), include: GradeIncludeObjectSchema.optional(), data: z.union([GradeUpdateInputObjectSchema, GradeUncheckedUpdateInputObjectSchema]), where: GradeWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.GradeUpdateArgs>;

export const GradeUpdateOneZodSchema = z.object({ select: GradeSelectObjectSchema.optional(), include: GradeIncludeObjectSchema.optional(), data: z.union([GradeUpdateInputObjectSchema, GradeUncheckedUpdateInputObjectSchema]), where: GradeWhereUniqueInputObjectSchema }).strict();

// File: updateManyGrade.schema.ts

export const GradeUpdateManySchema: z.ZodType<Prisma.GradeUpdateManyArgs> = z.object({ data: GradeUpdateManyMutationInputObjectSchema, where: GradeWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.GradeUpdateManyArgs>;

export const GradeUpdateManyZodSchema = z.object({ data: GradeUpdateManyMutationInputObjectSchema, where: GradeWhereInputObjectSchema.optional() }).strict();

// File: updateManyAndReturnGrade.schema.ts

export const GradeUpdateManyAndReturnSchema: z.ZodType<Prisma.GradeUpdateManyAndReturnArgs> = z.object({ select: GradeSelectObjectSchema.optional(), data: GradeUpdateManyMutationInputObjectSchema, where: GradeWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.GradeUpdateManyAndReturnArgs>;

export const GradeUpdateManyAndReturnZodSchema = z.object({ select: GradeSelectObjectSchema.optional(), data: GradeUpdateManyMutationInputObjectSchema, where: GradeWhereInputObjectSchema.optional() }).strict();

// File: upsertOneGrade.schema.ts

export const GradeUpsertOneSchema: z.ZodType<Prisma.GradeUpsertArgs> = z.object({ select: GradeSelectObjectSchema.optional(), include: GradeIncludeObjectSchema.optional(), where: GradeWhereUniqueInputObjectSchema, create: z.union([ GradeCreateInputObjectSchema, GradeUncheckedCreateInputObjectSchema ]), update: z.union([ GradeUpdateInputObjectSchema, GradeUncheckedUpdateInputObjectSchema ]) }).strict() as unknown as z.ZodType<Prisma.GradeUpsertArgs>;

export const GradeUpsertOneZodSchema = z.object({ select: GradeSelectObjectSchema.optional(), include: GradeIncludeObjectSchema.optional(), where: GradeWhereUniqueInputObjectSchema, create: z.union([ GradeCreateInputObjectSchema, GradeUncheckedCreateInputObjectSchema ]), update: z.union([ GradeUpdateInputObjectSchema, GradeUncheckedUpdateInputObjectSchema ]) }).strict();

// File: aggregateGrade.schema.ts

export const GradeAggregateSchema: z.ZodType<Prisma.GradeAggregateArgs> = z.object({ orderBy: z.union([GradeOrderByWithRelationInputObjectSchema, GradeOrderByWithRelationInputObjectSchema.array()]).optional(), where: GradeWhereInputObjectSchema.optional(), cursor: GradeWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), _count: z.union([ z.literal(true), GradeCountAggregateInputObjectSchema ]).optional(), _min: GradeMinAggregateInputObjectSchema.optional(), _max: GradeMaxAggregateInputObjectSchema.optional(), _avg: GradeAvgAggregateInputObjectSchema.optional(), _sum: GradeSumAggregateInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.GradeAggregateArgs>;

export const GradeAggregateZodSchema = z.object({ orderBy: z.union([GradeOrderByWithRelationInputObjectSchema, GradeOrderByWithRelationInputObjectSchema.array()]).optional(), where: GradeWhereInputObjectSchema.optional(), cursor: GradeWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), _count: z.union([ z.literal(true), GradeCountAggregateInputObjectSchema ]).optional(), _min: GradeMinAggregateInputObjectSchema.optional(), _max: GradeMaxAggregateInputObjectSchema.optional(), _avg: GradeAvgAggregateInputObjectSchema.optional(), _sum: GradeSumAggregateInputObjectSchema.optional() }).strict();

// File: groupByGrade.schema.ts

export const GradeGroupBySchema: z.ZodType<Prisma.GradeGroupByArgs> = z.object({ where: GradeWhereInputObjectSchema.optional(), orderBy: z.union([GradeOrderByWithAggregationInputObjectSchema, GradeOrderByWithAggregationInputObjectSchema.array()]).optional(), having: GradeScalarWhereWithAggregatesInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), by: z.array(GradeScalarFieldEnumSchema), _count: z.union([ z.literal(true), GradeCountAggregateInputObjectSchema ]).optional(), _min: GradeMinAggregateInputObjectSchema.optional(), _max: GradeMaxAggregateInputObjectSchema.optional(), _avg: GradeAvgAggregateInputObjectSchema.optional(), _sum: GradeSumAggregateInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.GradeGroupByArgs>;

export const GradeGroupByZodSchema = z.object({ where: GradeWhereInputObjectSchema.optional(), orderBy: z.union([GradeOrderByWithAggregationInputObjectSchema, GradeOrderByWithAggregationInputObjectSchema.array()]).optional(), having: GradeScalarWhereWithAggregatesInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), by: z.array(GradeScalarFieldEnumSchema), _count: z.union([ z.literal(true), GradeCountAggregateInputObjectSchema ]).optional(), _min: GradeMinAggregateInputObjectSchema.optional(), _max: GradeMaxAggregateInputObjectSchema.optional(), _avg: GradeAvgAggregateInputObjectSchema.optional(), _sum: GradeSumAggregateInputObjectSchema.optional() }).strict();

// File: findUniqueFaculty.schema.ts

export const FacultyFindUniqueSchema: z.ZodType<Prisma.FacultyFindUniqueArgs> = z.object({ select: FacultySelectObjectSchema.optional(), include: FacultyIncludeObjectSchema.optional(), where: FacultyWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.FacultyFindUniqueArgs>;

export const FacultyFindUniqueZodSchema = z.object({ select: FacultySelectObjectSchema.optional(), include: FacultyIncludeObjectSchema.optional(), where: FacultyWhereUniqueInputObjectSchema }).strict();

// File: findUniqueOrThrowFaculty.schema.ts

export const FacultyFindUniqueOrThrowSchema: z.ZodType<Prisma.FacultyFindUniqueOrThrowArgs> = z.object({ select: FacultySelectObjectSchema.optional(), include: FacultyIncludeObjectSchema.optional(), where: FacultyWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.FacultyFindUniqueOrThrowArgs>;

export const FacultyFindUniqueOrThrowZodSchema = z.object({ select: FacultySelectObjectSchema.optional(), include: FacultyIncludeObjectSchema.optional(), where: FacultyWhereUniqueInputObjectSchema }).strict();

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

export const FacultyFindFirstSchema: z.ZodType<Prisma.FacultyFindFirstArgs> = z.object({ select: FacultyFindFirstSelectSchema__findFirstFaculty_schema.optional(), include: z.lazy(() => FacultyIncludeObjectSchema.optional()), orderBy: z.union([FacultyOrderByWithRelationInputObjectSchema, FacultyOrderByWithRelationInputObjectSchema.array()]).optional(), where: FacultyWhereInputObjectSchema.optional(), cursor: FacultyWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([FacultyScalarFieldEnumSchema, FacultyScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.FacultyFindFirstArgs>;

export const FacultyFindFirstZodSchema = z.object({ select: FacultyFindFirstSelectSchema__findFirstFaculty_schema.optional(), include: z.lazy(() => FacultyIncludeObjectSchema.optional()), orderBy: z.union([FacultyOrderByWithRelationInputObjectSchema, FacultyOrderByWithRelationInputObjectSchema.array()]).optional(), where: FacultyWhereInputObjectSchema.optional(), cursor: FacultyWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([FacultyScalarFieldEnumSchema, FacultyScalarFieldEnumSchema.array()]).optional() }).strict();

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

export const FacultyFindFirstOrThrowSchema: z.ZodType<Prisma.FacultyFindFirstOrThrowArgs> = z.object({ select: FacultyFindFirstOrThrowSelectSchema__findFirstOrThrowFaculty_schema.optional(), include: z.lazy(() => FacultyIncludeObjectSchema.optional()), orderBy: z.union([FacultyOrderByWithRelationInputObjectSchema, FacultyOrderByWithRelationInputObjectSchema.array()]).optional(), where: FacultyWhereInputObjectSchema.optional(), cursor: FacultyWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([FacultyScalarFieldEnumSchema, FacultyScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.FacultyFindFirstOrThrowArgs>;

export const FacultyFindFirstOrThrowZodSchema = z.object({ select: FacultyFindFirstOrThrowSelectSchema__findFirstOrThrowFaculty_schema.optional(), include: z.lazy(() => FacultyIncludeObjectSchema.optional()), orderBy: z.union([FacultyOrderByWithRelationInputObjectSchema, FacultyOrderByWithRelationInputObjectSchema.array()]).optional(), where: FacultyWhereInputObjectSchema.optional(), cursor: FacultyWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([FacultyScalarFieldEnumSchema, FacultyScalarFieldEnumSchema.array()]).optional() }).strict();

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

export const FacultyFindManySchema: z.ZodType<Prisma.FacultyFindManyArgs> = z.object({ select: FacultyFindManySelectSchema__findManyFaculty_schema.optional(), include: z.lazy(() => FacultyIncludeObjectSchema.optional()), orderBy: z.union([FacultyOrderByWithRelationInputObjectSchema, FacultyOrderByWithRelationInputObjectSchema.array()]).optional(), where: FacultyWhereInputObjectSchema.optional(), cursor: FacultyWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([FacultyScalarFieldEnumSchema, FacultyScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.FacultyFindManyArgs>;

export const FacultyFindManyZodSchema = z.object({ select: FacultyFindManySelectSchema__findManyFaculty_schema.optional(), include: z.lazy(() => FacultyIncludeObjectSchema.optional()), orderBy: z.union([FacultyOrderByWithRelationInputObjectSchema, FacultyOrderByWithRelationInputObjectSchema.array()]).optional(), where: FacultyWhereInputObjectSchema.optional(), cursor: FacultyWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([FacultyScalarFieldEnumSchema, FacultyScalarFieldEnumSchema.array()]).optional() }).strict();

// File: countFaculty.schema.ts

export const FacultyCountSchema: z.ZodType<Prisma.FacultyCountArgs> = z.object({ orderBy: z.union([FacultyOrderByWithRelationInputObjectSchema, FacultyOrderByWithRelationInputObjectSchema.array()]).optional(), where: FacultyWhereInputObjectSchema.optional(), cursor: FacultyWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), select: z.union([ z.literal(true), FacultyCountAggregateInputObjectSchema ]).optional() }).strict() as unknown as z.ZodType<Prisma.FacultyCountArgs>;

export const FacultyCountZodSchema = z.object({ orderBy: z.union([FacultyOrderByWithRelationInputObjectSchema, FacultyOrderByWithRelationInputObjectSchema.array()]).optional(), where: FacultyWhereInputObjectSchema.optional(), cursor: FacultyWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), select: z.union([ z.literal(true), FacultyCountAggregateInputObjectSchema ]).optional() }).strict();

// File: createOneFaculty.schema.ts

export const FacultyCreateOneSchema: z.ZodType<Prisma.FacultyCreateArgs> = z.object({ select: FacultySelectObjectSchema.optional(), include: FacultyIncludeObjectSchema.optional(), data: z.union([FacultyCreateInputObjectSchema, FacultyUncheckedCreateInputObjectSchema]) }).strict() as unknown as z.ZodType<Prisma.FacultyCreateArgs>;

export const FacultyCreateOneZodSchema = z.object({ select: FacultySelectObjectSchema.optional(), include: FacultyIncludeObjectSchema.optional(), data: z.union([FacultyCreateInputObjectSchema, FacultyUncheckedCreateInputObjectSchema]) }).strict();

// File: createManyFaculty.schema.ts

export const FacultyCreateManySchema: z.ZodType<Prisma.FacultyCreateManyArgs> = z.object({ data: z.union([ FacultyCreateManyInputObjectSchema, z.array(FacultyCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict() as unknown as z.ZodType<Prisma.FacultyCreateManyArgs>;

export const FacultyCreateManyZodSchema = z.object({ data: z.union([ FacultyCreateManyInputObjectSchema, z.array(FacultyCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict();

// File: createManyAndReturnFaculty.schema.ts

export const FacultyCreateManyAndReturnSchema: z.ZodType<Prisma.FacultyCreateManyAndReturnArgs> = z.object({ select: FacultySelectObjectSchema.optional(), data: z.union([ FacultyCreateManyInputObjectSchema, z.array(FacultyCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict() as unknown as z.ZodType<Prisma.FacultyCreateManyAndReturnArgs>;

export const FacultyCreateManyAndReturnZodSchema = z.object({ select: FacultySelectObjectSchema.optional(), data: z.union([ FacultyCreateManyInputObjectSchema, z.array(FacultyCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict();

// File: deleteOneFaculty.schema.ts

export const FacultyDeleteOneSchema: z.ZodType<Prisma.FacultyDeleteArgs> = z.object({ select: FacultySelectObjectSchema.optional(), include: FacultyIncludeObjectSchema.optional(), where: FacultyWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.FacultyDeleteArgs>;

export const FacultyDeleteOneZodSchema = z.object({ select: FacultySelectObjectSchema.optional(), include: FacultyIncludeObjectSchema.optional(), where: FacultyWhereUniqueInputObjectSchema }).strict();

// File: deleteManyFaculty.schema.ts

export const FacultyDeleteManySchema: z.ZodType<Prisma.FacultyDeleteManyArgs> = z.object({ where: FacultyWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.FacultyDeleteManyArgs>;

export const FacultyDeleteManyZodSchema = z.object({ where: FacultyWhereInputObjectSchema.optional() }).strict();

// File: updateOneFaculty.schema.ts

export const FacultyUpdateOneSchema: z.ZodType<Prisma.FacultyUpdateArgs> = z.object({ select: FacultySelectObjectSchema.optional(), include: FacultyIncludeObjectSchema.optional(), data: z.union([FacultyUpdateInputObjectSchema, FacultyUncheckedUpdateInputObjectSchema]), where: FacultyWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.FacultyUpdateArgs>;

export const FacultyUpdateOneZodSchema = z.object({ select: FacultySelectObjectSchema.optional(), include: FacultyIncludeObjectSchema.optional(), data: z.union([FacultyUpdateInputObjectSchema, FacultyUncheckedUpdateInputObjectSchema]), where: FacultyWhereUniqueInputObjectSchema }).strict();

// File: updateManyFaculty.schema.ts

export const FacultyUpdateManySchema: z.ZodType<Prisma.FacultyUpdateManyArgs> = z.object({ data: FacultyUpdateManyMutationInputObjectSchema, where: FacultyWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.FacultyUpdateManyArgs>;

export const FacultyUpdateManyZodSchema = z.object({ data: FacultyUpdateManyMutationInputObjectSchema, where: FacultyWhereInputObjectSchema.optional() }).strict();

// File: updateManyAndReturnFaculty.schema.ts

export const FacultyUpdateManyAndReturnSchema: z.ZodType<Prisma.FacultyUpdateManyAndReturnArgs> = z.object({ select: FacultySelectObjectSchema.optional(), data: FacultyUpdateManyMutationInputObjectSchema, where: FacultyWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.FacultyUpdateManyAndReturnArgs>;

export const FacultyUpdateManyAndReturnZodSchema = z.object({ select: FacultySelectObjectSchema.optional(), data: FacultyUpdateManyMutationInputObjectSchema, where: FacultyWhereInputObjectSchema.optional() }).strict();

// File: upsertOneFaculty.schema.ts

export const FacultyUpsertOneSchema: z.ZodType<Prisma.FacultyUpsertArgs> = z.object({ select: FacultySelectObjectSchema.optional(), include: FacultyIncludeObjectSchema.optional(), where: FacultyWhereUniqueInputObjectSchema, create: z.union([ FacultyCreateInputObjectSchema, FacultyUncheckedCreateInputObjectSchema ]), update: z.union([ FacultyUpdateInputObjectSchema, FacultyUncheckedUpdateInputObjectSchema ]) }).strict() as unknown as z.ZodType<Prisma.FacultyUpsertArgs>;

export const FacultyUpsertOneZodSchema = z.object({ select: FacultySelectObjectSchema.optional(), include: FacultyIncludeObjectSchema.optional(), where: FacultyWhereUniqueInputObjectSchema, create: z.union([ FacultyCreateInputObjectSchema, FacultyUncheckedCreateInputObjectSchema ]), update: z.union([ FacultyUpdateInputObjectSchema, FacultyUncheckedUpdateInputObjectSchema ]) }).strict();

// File: aggregateFaculty.schema.ts

export const FacultyAggregateSchema: z.ZodType<Prisma.FacultyAggregateArgs> = z.object({ orderBy: z.union([FacultyOrderByWithRelationInputObjectSchema, FacultyOrderByWithRelationInputObjectSchema.array()]).optional(), where: FacultyWhereInputObjectSchema.optional(), cursor: FacultyWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), _count: z.union([ z.literal(true), FacultyCountAggregateInputObjectSchema ]).optional(), _min: FacultyMinAggregateInputObjectSchema.optional(), _max: FacultyMaxAggregateInputObjectSchema.optional(), _avg: FacultyAvgAggregateInputObjectSchema.optional(), _sum: FacultySumAggregateInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.FacultyAggregateArgs>;

export const FacultyAggregateZodSchema = z.object({ orderBy: z.union([FacultyOrderByWithRelationInputObjectSchema, FacultyOrderByWithRelationInputObjectSchema.array()]).optional(), where: FacultyWhereInputObjectSchema.optional(), cursor: FacultyWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), _count: z.union([ z.literal(true), FacultyCountAggregateInputObjectSchema ]).optional(), _min: FacultyMinAggregateInputObjectSchema.optional(), _max: FacultyMaxAggregateInputObjectSchema.optional(), _avg: FacultyAvgAggregateInputObjectSchema.optional(), _sum: FacultySumAggregateInputObjectSchema.optional() }).strict();

// File: groupByFaculty.schema.ts

export const FacultyGroupBySchema: z.ZodType<Prisma.FacultyGroupByArgs> = z.object({ where: FacultyWhereInputObjectSchema.optional(), orderBy: z.union([FacultyOrderByWithAggregationInputObjectSchema, FacultyOrderByWithAggregationInputObjectSchema.array()]).optional(), having: FacultyScalarWhereWithAggregatesInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), by: z.array(FacultyScalarFieldEnumSchema), _count: z.union([ z.literal(true), FacultyCountAggregateInputObjectSchema ]).optional(), _min: FacultyMinAggregateInputObjectSchema.optional(), _max: FacultyMaxAggregateInputObjectSchema.optional(), _avg: FacultyAvgAggregateInputObjectSchema.optional(), _sum: FacultySumAggregateInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.FacultyGroupByArgs>;

export const FacultyGroupByZodSchema = z.object({ where: FacultyWhereInputObjectSchema.optional(), orderBy: z.union([FacultyOrderByWithAggregationInputObjectSchema, FacultyOrderByWithAggregationInputObjectSchema.array()]).optional(), having: FacultyScalarWhereWithAggregatesInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), by: z.array(FacultyScalarFieldEnumSchema), _count: z.union([ z.literal(true), FacultyCountAggregateInputObjectSchema ]).optional(), _min: FacultyMinAggregateInputObjectSchema.optional(), _max: FacultyMaxAggregateInputObjectSchema.optional(), _avg: FacultyAvgAggregateInputObjectSchema.optional(), _sum: FacultySumAggregateInputObjectSchema.optional() }).strict();

// File: findUniqueDepartment.schema.ts

export const DepartmentFindUniqueSchema: z.ZodType<Prisma.DepartmentFindUniqueArgs> = z.object({ select: DepartmentSelectObjectSchema.optional(), include: DepartmentIncludeObjectSchema.optional(), where: DepartmentWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.DepartmentFindUniqueArgs>;

export const DepartmentFindUniqueZodSchema = z.object({ select: DepartmentSelectObjectSchema.optional(), include: DepartmentIncludeObjectSchema.optional(), where: DepartmentWhereUniqueInputObjectSchema }).strict();

// File: findUniqueOrThrowDepartment.schema.ts

export const DepartmentFindUniqueOrThrowSchema: z.ZodType<Prisma.DepartmentFindUniqueOrThrowArgs> = z.object({ select: DepartmentSelectObjectSchema.optional(), include: DepartmentIncludeObjectSchema.optional(), where: DepartmentWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.DepartmentFindUniqueOrThrowArgs>;

export const DepartmentFindUniqueOrThrowZodSchema = z.object({ select: DepartmentSelectObjectSchema.optional(), include: DepartmentIncludeObjectSchema.optional(), where: DepartmentWhereUniqueInputObjectSchema }).strict();

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

export const DepartmentFindFirstSchema: z.ZodType<Prisma.DepartmentFindFirstArgs> = z.object({ select: DepartmentFindFirstSelectSchema__findFirstDepartment_schema.optional(), include: z.lazy(() => DepartmentIncludeObjectSchema.optional()), orderBy: z.union([DepartmentOrderByWithRelationInputObjectSchema, DepartmentOrderByWithRelationInputObjectSchema.array()]).optional(), where: DepartmentWhereInputObjectSchema.optional(), cursor: DepartmentWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([DepartmentScalarFieldEnumSchema, DepartmentScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.DepartmentFindFirstArgs>;

export const DepartmentFindFirstZodSchema = z.object({ select: DepartmentFindFirstSelectSchema__findFirstDepartment_schema.optional(), include: z.lazy(() => DepartmentIncludeObjectSchema.optional()), orderBy: z.union([DepartmentOrderByWithRelationInputObjectSchema, DepartmentOrderByWithRelationInputObjectSchema.array()]).optional(), where: DepartmentWhereInputObjectSchema.optional(), cursor: DepartmentWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([DepartmentScalarFieldEnumSchema, DepartmentScalarFieldEnumSchema.array()]).optional() }).strict();

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

export const DepartmentFindFirstOrThrowSchema: z.ZodType<Prisma.DepartmentFindFirstOrThrowArgs> = z.object({ select: DepartmentFindFirstOrThrowSelectSchema__findFirstOrThrowDepartment_schema.optional(), include: z.lazy(() => DepartmentIncludeObjectSchema.optional()), orderBy: z.union([DepartmentOrderByWithRelationInputObjectSchema, DepartmentOrderByWithRelationInputObjectSchema.array()]).optional(), where: DepartmentWhereInputObjectSchema.optional(), cursor: DepartmentWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([DepartmentScalarFieldEnumSchema, DepartmentScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.DepartmentFindFirstOrThrowArgs>;

export const DepartmentFindFirstOrThrowZodSchema = z.object({ select: DepartmentFindFirstOrThrowSelectSchema__findFirstOrThrowDepartment_schema.optional(), include: z.lazy(() => DepartmentIncludeObjectSchema.optional()), orderBy: z.union([DepartmentOrderByWithRelationInputObjectSchema, DepartmentOrderByWithRelationInputObjectSchema.array()]).optional(), where: DepartmentWhereInputObjectSchema.optional(), cursor: DepartmentWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([DepartmentScalarFieldEnumSchema, DepartmentScalarFieldEnumSchema.array()]).optional() }).strict();

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

export const DepartmentFindManySchema: z.ZodType<Prisma.DepartmentFindManyArgs> = z.object({ select: DepartmentFindManySelectSchema__findManyDepartment_schema.optional(), include: z.lazy(() => DepartmentIncludeObjectSchema.optional()), orderBy: z.union([DepartmentOrderByWithRelationInputObjectSchema, DepartmentOrderByWithRelationInputObjectSchema.array()]).optional(), where: DepartmentWhereInputObjectSchema.optional(), cursor: DepartmentWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([DepartmentScalarFieldEnumSchema, DepartmentScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.DepartmentFindManyArgs>;

export const DepartmentFindManyZodSchema = z.object({ select: DepartmentFindManySelectSchema__findManyDepartment_schema.optional(), include: z.lazy(() => DepartmentIncludeObjectSchema.optional()), orderBy: z.union([DepartmentOrderByWithRelationInputObjectSchema, DepartmentOrderByWithRelationInputObjectSchema.array()]).optional(), where: DepartmentWhereInputObjectSchema.optional(), cursor: DepartmentWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([DepartmentScalarFieldEnumSchema, DepartmentScalarFieldEnumSchema.array()]).optional() }).strict();

// File: countDepartment.schema.ts

export const DepartmentCountSchema: z.ZodType<Prisma.DepartmentCountArgs> = z.object({ orderBy: z.union([DepartmentOrderByWithRelationInputObjectSchema, DepartmentOrderByWithRelationInputObjectSchema.array()]).optional(), where: DepartmentWhereInputObjectSchema.optional(), cursor: DepartmentWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), select: z.union([ z.literal(true), DepartmentCountAggregateInputObjectSchema ]).optional() }).strict() as unknown as z.ZodType<Prisma.DepartmentCountArgs>;

export const DepartmentCountZodSchema = z.object({ orderBy: z.union([DepartmentOrderByWithRelationInputObjectSchema, DepartmentOrderByWithRelationInputObjectSchema.array()]).optional(), where: DepartmentWhereInputObjectSchema.optional(), cursor: DepartmentWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), select: z.union([ z.literal(true), DepartmentCountAggregateInputObjectSchema ]).optional() }).strict();

// File: createOneDepartment.schema.ts

export const DepartmentCreateOneSchema: z.ZodType<Prisma.DepartmentCreateArgs> = z.object({ select: DepartmentSelectObjectSchema.optional(), include: DepartmentIncludeObjectSchema.optional(), data: z.union([DepartmentCreateInputObjectSchema, DepartmentUncheckedCreateInputObjectSchema]) }).strict() as unknown as z.ZodType<Prisma.DepartmentCreateArgs>;

export const DepartmentCreateOneZodSchema = z.object({ select: DepartmentSelectObjectSchema.optional(), include: DepartmentIncludeObjectSchema.optional(), data: z.union([DepartmentCreateInputObjectSchema, DepartmentUncheckedCreateInputObjectSchema]) }).strict();

// File: createManyDepartment.schema.ts

export const DepartmentCreateManySchema: z.ZodType<Prisma.DepartmentCreateManyArgs> = z.object({ data: z.union([ DepartmentCreateManyInputObjectSchema, z.array(DepartmentCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict() as unknown as z.ZodType<Prisma.DepartmentCreateManyArgs>;

export const DepartmentCreateManyZodSchema = z.object({ data: z.union([ DepartmentCreateManyInputObjectSchema, z.array(DepartmentCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict();

// File: createManyAndReturnDepartment.schema.ts

export const DepartmentCreateManyAndReturnSchema: z.ZodType<Prisma.DepartmentCreateManyAndReturnArgs> = z.object({ select: DepartmentSelectObjectSchema.optional(), data: z.union([ DepartmentCreateManyInputObjectSchema, z.array(DepartmentCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict() as unknown as z.ZodType<Prisma.DepartmentCreateManyAndReturnArgs>;

export const DepartmentCreateManyAndReturnZodSchema = z.object({ select: DepartmentSelectObjectSchema.optional(), data: z.union([ DepartmentCreateManyInputObjectSchema, z.array(DepartmentCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict();

// File: deleteOneDepartment.schema.ts

export const DepartmentDeleteOneSchema: z.ZodType<Prisma.DepartmentDeleteArgs> = z.object({ select: DepartmentSelectObjectSchema.optional(), include: DepartmentIncludeObjectSchema.optional(), where: DepartmentWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.DepartmentDeleteArgs>;

export const DepartmentDeleteOneZodSchema = z.object({ select: DepartmentSelectObjectSchema.optional(), include: DepartmentIncludeObjectSchema.optional(), where: DepartmentWhereUniqueInputObjectSchema }).strict();

// File: deleteManyDepartment.schema.ts

export const DepartmentDeleteManySchema: z.ZodType<Prisma.DepartmentDeleteManyArgs> = z.object({ where: DepartmentWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.DepartmentDeleteManyArgs>;

export const DepartmentDeleteManyZodSchema = z.object({ where: DepartmentWhereInputObjectSchema.optional() }).strict();

// File: updateOneDepartment.schema.ts

export const DepartmentUpdateOneSchema: z.ZodType<Prisma.DepartmentUpdateArgs> = z.object({ select: DepartmentSelectObjectSchema.optional(), include: DepartmentIncludeObjectSchema.optional(), data: z.union([DepartmentUpdateInputObjectSchema, DepartmentUncheckedUpdateInputObjectSchema]), where: DepartmentWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.DepartmentUpdateArgs>;

export const DepartmentUpdateOneZodSchema = z.object({ select: DepartmentSelectObjectSchema.optional(), include: DepartmentIncludeObjectSchema.optional(), data: z.union([DepartmentUpdateInputObjectSchema, DepartmentUncheckedUpdateInputObjectSchema]), where: DepartmentWhereUniqueInputObjectSchema }).strict();

// File: updateManyDepartment.schema.ts

export const DepartmentUpdateManySchema: z.ZodType<Prisma.DepartmentUpdateManyArgs> = z.object({ data: DepartmentUpdateManyMutationInputObjectSchema, where: DepartmentWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.DepartmentUpdateManyArgs>;

export const DepartmentUpdateManyZodSchema = z.object({ data: DepartmentUpdateManyMutationInputObjectSchema, where: DepartmentWhereInputObjectSchema.optional() }).strict();

// File: updateManyAndReturnDepartment.schema.ts

export const DepartmentUpdateManyAndReturnSchema: z.ZodType<Prisma.DepartmentUpdateManyAndReturnArgs> = z.object({ select: DepartmentSelectObjectSchema.optional(), data: DepartmentUpdateManyMutationInputObjectSchema, where: DepartmentWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.DepartmentUpdateManyAndReturnArgs>;

export const DepartmentUpdateManyAndReturnZodSchema = z.object({ select: DepartmentSelectObjectSchema.optional(), data: DepartmentUpdateManyMutationInputObjectSchema, where: DepartmentWhereInputObjectSchema.optional() }).strict();

// File: upsertOneDepartment.schema.ts

export const DepartmentUpsertOneSchema: z.ZodType<Prisma.DepartmentUpsertArgs> = z.object({ select: DepartmentSelectObjectSchema.optional(), include: DepartmentIncludeObjectSchema.optional(), where: DepartmentWhereUniqueInputObjectSchema, create: z.union([ DepartmentCreateInputObjectSchema, DepartmentUncheckedCreateInputObjectSchema ]), update: z.union([ DepartmentUpdateInputObjectSchema, DepartmentUncheckedUpdateInputObjectSchema ]) }).strict() as unknown as z.ZodType<Prisma.DepartmentUpsertArgs>;

export const DepartmentUpsertOneZodSchema = z.object({ select: DepartmentSelectObjectSchema.optional(), include: DepartmentIncludeObjectSchema.optional(), where: DepartmentWhereUniqueInputObjectSchema, create: z.union([ DepartmentCreateInputObjectSchema, DepartmentUncheckedCreateInputObjectSchema ]), update: z.union([ DepartmentUpdateInputObjectSchema, DepartmentUncheckedUpdateInputObjectSchema ]) }).strict();

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
