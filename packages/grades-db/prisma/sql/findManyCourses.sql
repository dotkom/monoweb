-- @param {Int} $1:offset
-- @param {Int} $2:limit
-- @param {String} $3:search?
-- @param {String} $4:searchContains?
-- @param {Float} $8:minAverageGrade?
-- @param {String} $9:sortOrder
-- @param {String} $10:firstSortBy?
-- @param {String} $11:secondSortBy?
-- @param {String} $12:thirdSortBy?

-- DOCS: https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/typedsql

SELECT
  "id",
  "code",
  "name_no" AS "nameNo",
  "name_en" AS "nameEn",
  "credits",
  "study_level" AS "studyLevel",
  "grade_type" AS "gradeType",
  "first_year_taught" AS "firstYearTaught",
  "last_year_taught" AS "lastYearTaught",
  "content_no" AS "contentNo",
  "content_en" AS "contentEn",
  "teaching_methods_no" AS "teachingMethodsNo",
  "teaching_methods_en" AS "teachingMethodsEn",
  "learning_outcomes_no" AS "learningOutcomesNo",
  "learning_outcomes_en" AS "learningOutcomesEn",
  "exam_type_no" AS "examTypeNo",
  "exam_type_en" AS "examTypeEn",
  "candidate_count" AS "candidateCount",
  "average_grade" AS "averageGrade",
  "pass_rate" AS "passRate",
  "created_at" AS "createdAt",
  "updated_at" AS "updatedAt",
  to_jsonb("taught_semesters") AS "taughtSemesters",
  to_jsonb("teaching_languages") AS "teachingLanguages",
  to_jsonb("campuses") AS "campuses",
  "faculty_id" AS "facultyId",
  "department_id" AS "departmentId",
  "latest_year_checked_for_ntnu_data" AS "latestYearCheckedForNtnuData"
FROM "course"
WHERE
  (
    $4::text IS NULL
    OR "code" ILIKE $4
    OR "name_no" ILIKE $4
    OR "name_en" ILIKE $4
  )
  AND (
    cardinality($5::"semester"[]) = 0
    OR "taught_semesters" && $5::"semester"[]
  )
  AND (
    cardinality($6::"teaching_language"[]) = 0
    OR "teaching_languages" && $6::"teaching_language"[]
  )
  AND (
    cardinality($7::"campus"[]) = 0
    OR "campuses" && $7::"campus"[]
  )
  AND (
    $8::double precision IS NULL
    OR "average_grade" >= $8
  )
ORDER BY
  course_rank_score(code, name_no, name_en, last_year_taught, $3) DESC,

  CASE WHEN $9 = 'asc' AND $10 = 'AVERAGE_GRADE' THEN "average_grade" END ASC NULLS LAST,
  CASE WHEN $9 = 'desc' AND $10 = 'AVERAGE_GRADE' THEN "average_grade" END DESC NULLS LAST,
  CASE WHEN $9 = 'asc' AND $10 = 'PASS_RATE' THEN "pass_rate" END ASC NULLS LAST,
  CASE WHEN $9 = 'desc' AND $10 = 'PASS_RATE' THEN "pass_rate" END DESC NULLS LAST,
  CASE WHEN $9 = 'asc' AND $10 = 'CANDIDATE_COUNT' THEN "candidate_count" END ASC NULLS LAST,
  CASE WHEN $9 = 'desc' AND $10 = 'CANDIDATE_COUNT' THEN "candidate_count" END DESC NULLS LAST,

  CASE WHEN $9 = 'asc' AND $11 = 'AVERAGE_GRADE' THEN "average_grade" END ASC NULLS LAST,
  CASE WHEN $9 = 'desc' AND $11 = 'AVERAGE_GRADE' THEN "average_grade" END DESC NULLS LAST,
  CASE WHEN $9 = 'asc' AND $11 = 'PASS_RATE' THEN "pass_rate" END ASC NULLS LAST,
  CASE WHEN $9 = 'desc' AND $11 = 'PASS_RATE' THEN "pass_rate" END DESC NULLS LAST,
  CASE WHEN $9 = 'asc' AND $11 = 'CANDIDATE_COUNT' THEN "candidate_count" END ASC NULLS LAST,
  CASE WHEN $9 = 'desc' AND $11 = 'CANDIDATE_COUNT' THEN "candidate_count" END DESC NULLS LAST,

  CASE WHEN $9 = 'asc' AND $12 = 'AVERAGE_GRADE' THEN "average_grade" END ASC NULLS LAST,
  CASE WHEN $9 = 'desc' AND $12 = 'AVERAGE_GRADE' THEN "average_grade" END DESC NULLS LAST,
  CASE WHEN $9 = 'asc' AND $12 = 'PASS_RATE' THEN "pass_rate" END ASC NULLS LAST,
  CASE WHEN $9 = 'desc' AND $12 = 'PASS_RATE' THEN "pass_rate" END DESC NULLS LAST,
  CASE WHEN $9 = 'asc' AND $12 = 'CANDIDATE_COUNT' THEN "candidate_count" END ASC NULLS LAST,
  CASE WHEN $9 = 'desc' AND $12 = 'CANDIDATE_COUNT' THEN "candidate_count" END DESC NULLS LAST,

  "id" DESC
OFFSET $1
LIMIT $2;
